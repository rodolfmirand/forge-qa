import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
import { MockAIPlanningResolver } from "../../src/ai/planning/planning-resolver.js";
import { MockAIResolver } from "../../src/ai/resolver/ai-resolver.js";
import { GeneratedScenarioExecutor } from "../../src/core/generation/scenario-executor.js";
import { TemplateTestGenerator } from "../../src/core/generation/test-generator.js";
import { PlaywrightDOMExtractor } from "../../src/core/healing/dom-extractor.js";
import { Healer } from "../../src/core/healing/healer.js";
import { InMemoryAuditLogger } from "../../src/core/reporting/audit-log.js";
import { PlaywrightPageActionRunner } from "../../src/integrations/playwright/playwright-action-runner.js";
import { InMemorySelectorMemory } from "../../src/memory/selector-memory.js";

test("generated flow can be executed end-to-end with healing", async ({ page }) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/login-flow.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const auditLogger = new InMemoryAuditLogger();
  const selectorMemory = new InMemorySelectorMemory();
  const generator = new TemplateTestGenerator(auditLogger);
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory,
    domExtractor: new PlaywrightDOMExtractor(page),
    auditLogger
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "Login flow",
    sourceType: "text",
    content: "Open the login page, submit the form and validate the dashboard state.",
    targetUrl: fixtureUrl
  });
  const clickStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("authentication form")
  );

  if (!clickStep || clickStep.kind !== "click") {
    throw new Error("Expected generated scenario to contain an authentication submit step.");
  }

  clickStep.selector = "#login-button";
  clickStep.fallbackSelectors = ["#submit-login"];

  await executor.execute(scenario);

  await expect(page.locator("#result")).toContainText("Dashboard");
  await expect(selectorMemory.find("#login-button")).resolves.toBe("#submit-login");
  expect(auditLogger.getEntries().some((entry) => entry.type === "generation")).toBeTruthy();
  expect(
    auditLogger.getEntries().some((entry) => {
      if (entry.type !== "healing" || !entry.payload || typeof entry.payload !== "object") {
        return false;
      }

      const payload = entry.payload as Record<string, unknown>;
      return payload.recoveredSelector === "#submit-login";
    })
  ).toBeTruthy();
});

test("generated flow can discover the login entry point before authenticating", async ({
  page
}) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/home-entry.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "Portal login flow",
    sourceType: "text",
    content:
      "Acesse o site e faca login com as credenciais abaixo. Valide que o usuario chegou ao Dashboard:\n- email: edoc@gmail.com\n- senha: abc123",
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);

  await expect(page.locator("#result")).toContainText("Dashboard");
});

test("generated flow can execute a search flow beyond authentication", async ({ page }) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/search-flow.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "Search flow",
    sourceType: "text",
    content: 'Pesquise por "Forge QA" e valide que o texto "Results for: Forge QA" apareca.',
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);

  await expect(page.locator("#search-result")).toContainText("Results for: Forge QA");
});

test("generated flow can execute a service crud flow beyond login and search", async ({ page }) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/service-crud.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "Service CRUD flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Organizacao > Servicos e cadastre um servico com:\n- nome: Consulta Premium\n- categoria: Telemedicina\n- valor: 150\nValide que o texto "Servico salvo com sucesso" apareca.',
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);

  await expect(page.locator("#service-result")).toContainText("Servico salvo com sucesso");
  await expect(page.locator("#service-list")).toContainText("Consulta Premium");
});

test("generated flow can execute a contact crud flow using entity-oriented planning", async ({
  page
}) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/contact-crud.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "Contact CRUD flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Organizacao > Contatos e cadastre um contato com:\n- nome: Ana Silva\n- cargo: Gestora\n- email: ana.silva@example.com\nValide que o texto "Contato salvo com sucesso" apareca.',
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);

  await expect(page.locator("#contact-result")).toContainText("Contato salvo com sucesso");
  await expect(page.locator("#contact-list")).toContainText("Ana Silva");
});

test("generated flow can execute a user crud flow with modal, checkbox and radio planning", async ({
  page
}) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/user-crud.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "User CRUD flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e cadastre um usuario com:\n- nome: Marina Costa\n- cargo: Gestora\n- notificacoes: sim\n- nivel de acesso: Admin\nValide que o texto "Usuario salvo com sucesso" apareca.',
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);

  await expect(page.locator("#user-result")).toContainText("Usuario salvo com sucesso");
  await expect(page.locator("#user-table")).toContainText("Marina Costa");
  await expect(page.locator("#user-table")).toContainText("Admin");
  await expect(page.locator("#user-table")).toContainText("Ativo");
});

test("generated flow can update an existing user with targeted planning", async ({ page }) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/user-crud.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "User update flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e edite um usuario com:\n- usuario alvo: Carlos Mendes\n- cargo: Financeiro\n- nivel de acesso: Editor\nValide que o texto "Usuario atualizado com sucesso" apareca.',
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);

  await expect(page.locator("#user-result")).toContainText("Usuario atualizado com sucesso");
  await expect(page.locator("#user-table")).toContainText("Carlos Mendes");
  await expect(page.locator("#user-table")).toContainText("Financeiro");
  await expect(page.locator("#user-table")).toContainText("Editor");
});

test("generated flow can remove an existing user with targeted planning", async ({ page }) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/user-crud.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "User delete flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e remova um usuario com:\n- usuario alvo: Carlos Mendes\nValide que o texto "Usuario removido com sucesso" apareca.',
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);

  await expect(page.locator("#user-result")).toContainText("Usuario removido com sucesso");
  await expect(page.locator("#user-table")).not.toContainText("Carlos Mendes");
});

test("generated flow can use ai planning fallback for ambiguous user update wording", async ({
  page
}) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/user-crud.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator(new InMemoryAuditLogger(), {
    planningMode: "hybrid",
    planningResolver: new MockAIPlanningResolver()
  });
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "Ambiguous user update flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e ajuste um usuario com:\n- usuario alvo: Carlos Mendes\n- cargo: Financeiro\n- nivel de acesso: Editor\nValide que o texto "Usuario atualizado com sucesso" apareca.',
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);

  await expect(page.locator("#user-result")).toContainText("Usuario atualizado com sucesso");
  await expect(page.locator("#user-table")).toContainText("Financeiro");
  await expect(page.locator("#user-table")).toContainText("Editor");
});

test("generated flow can execute endpoint-sourced user update planning", async ({ page }) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/user-crud.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new MockAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new PlaywrightDOMExtractor(page)
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "Endpoint user update flow",
    sourceType: "endpoint",
    content: "",
    targetUrl: fixtureUrl,
    sourcePayload: {
      operation: "update",
      entity: "user",
      navigationPath: ["Administracao", "Usuarios"],
      targetRecord: "Carlos Mendes",
      fields: {
        cargo: "Financeiro",
        "nivel de acesso": "Editor"
      },
      expectedText: "Usuario atualizado com sucesso"
    }
  });

  await executor.execute(scenario);

  await expect(page.locator("#user-result")).toContainText("Usuario atualizado com sucesso");
  await expect(page.locator("#user-table")).toContainText("Carlos Mendes");
  await expect(page.locator("#user-table")).toContainText("Financeiro");
  await expect(page.locator("#user-table")).toContainText("Editor");
});
