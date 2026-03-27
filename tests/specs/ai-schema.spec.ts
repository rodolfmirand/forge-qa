import { expect, test } from "@playwright/test";
import {
  isGeneratedTestScenario,
  isHealingSuggestion,
  MockAIResolver
} from "../../src/ai/resolver/ai-resolver.js";

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
