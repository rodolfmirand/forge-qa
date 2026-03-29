import { expect, test } from "@playwright/test";
import {
  getPlanningEscalationDecision,
  MockAIPlanningResolver,
  parsePlanningScenario,
  resolvePlanningMode
} from "../../src/ai/planning/planning-resolver.js";
import {
  isGeneratedTestScenario,
  isHealingSuggestion,
  MockAIResolver,
  parseGeneratedTestScenario,
  parseHealingSuggestion
} from "../../src/ai/resolver/ai-resolver.js";
import { HeuristicFlowPlanner } from "../../src/core/generation/flow-planner.js";

test("ai schemas validate expected payloads", async () => {
  expect(
    isHealingSuggestion({
      selector: "#submit-login",
      confidence: 0.9,
      rationale: "Matched by text"
    })
  ).toBeTruthy();

  expect(
    isGeneratedTestScenario({
      title: "Login flow",
      sourceType: "text",
      preconditions: ["App available"],
      steps: [{ kind: "click", description: "Click button", selector: "#submit" }]
    })
  ).toBeTruthy();

  expect(isHealingSuggestion({ selector: 123 })).toBeFalsy();
  expect(isGeneratedTestScenario({ title: "Broken" })).toBeFalsy();
});

test("ai response parsers reject malformed or invalid content", async () => {
  expect(parseHealingSuggestion("not-json")).toBeNull();
  expect(
    parseHealingSuggestion(
      JSON.stringify({
        selector: "#submit-login",
        confidence: 1.4,
        rationale: "invalid confidence"
      })
    )
  ).toBeNull();

  expect(parseGeneratedTestScenario("{invalid")).toBeNull();
  expect(
    parseGeneratedTestScenario(
      JSON.stringify({
        title: "Broken scenario",
        sourceType: "text",
        preconditions: [],
        steps: [{ kind: "unsupported", description: "nope" }]
      })
    )
  ).toBeNull();

  expect(parsePlanningScenario(JSON.stringify({ title: "Broken" }))).toBeNull();
});

test("ai response parsers accept valid structured content", async () => {
  expect(
    parseHealingSuggestion(
      JSON.stringify({
        selector: "#submit-login",
        confidence: 0.82,
        rationale: "Matched by button text"
      })
    )
  ).toEqual({
    selector: "#submit-login",
    confidence: 0.82,
    rationale: "Matched by button text"
  });

  expect(
    parsePlanningScenario(
      JSON.stringify({
        title: "Search flow",
        sourceType: "text",
        preconditions: ["App available"],
        steps: [{ kind: "click", description: "Click the search action." }]
      })
    )
  ).toMatchObject({
    title: "Search flow",
    sourceType: "text"
  });
});

test("mock ai resolver returns null for unrelated snapshots", async () => {
  const resolver = new MockAIResolver();
  const suggestion = await resolver.resolve({
    action: "click",
    originalSelector: "#missing-button",
    actionDescription: "Click the Sign in button.",
    domSnapshot: JSON.stringify([{ tag: "input", id: "email" }]),
    errorMessage: "waiting for locator('#missing-button')"
  });

  expect(suggestion).toBeNull();
});

test("mock planning resolver normalizes ambiguous CRUD phrasing", async () => {
  const resolver = new MockAIPlanningResolver();
  const scenario = await resolver.resolve({
    title: "Ambiguous user update",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e ajuste um usuario com:\n- usuario alvo: Carlos Mendes\n- cargo: Financeiro\n- nivel de acesso: Editor\nValide que o texto "Usuario atualizado com sucesso" apareca.',
    targetUrl: "https://example.com/app"
  });

  expect(scenario).not.toBeNull();
  expect(scenario?.steps.some((step) => step.description.includes("for editing"))).toBeTruthy();
});

test("planning escalation detects ambiguous language and resolves mode", async () => {
  const heuristicScenario = new HeuristicFlowPlanner().plan({
    title: "Ambiguous user update",
    sourceType: "text",
    content:
      "Acesse a area autenticada, abra Administracao > Usuarios e ajuste um usuario com:\n- usuario alvo: Carlos Mendes",
    targetUrl: "https://example.com/app"
  });
  const escalation = getPlanningEscalationDecision(
    {
      title: "Ambiguous user update",
      sourceType: "text",
      content:
        "Acesse a area autenticada, abra Administracao > Usuarios e ajuste um usuario com:\n- usuario alvo: Carlos Mendes",
      targetUrl: "https://example.com/app"
    },
    heuristicScenario
  );

  expect(escalation).toEqual({
    shouldEscalate: true,
    reason: "ambiguous-crud-language"
  });
  expect(resolvePlanningMode("hybrid")).toBe("hybrid");
});
