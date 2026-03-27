import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
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

  await executor.execute(scenario);

  await expect(page.locator("#result")).toContainText("Dashboard");
  await expect(selectorMemory.find("#login-button")).resolves.toBe("#submit-login");
  expect(auditLogger.getEntries().some((entry) => entry.type === "generation")).toBeTruthy();
  expect(auditLogger.getEntries().some((entry) => entry.type === "healing")).toBeTruthy();
});
