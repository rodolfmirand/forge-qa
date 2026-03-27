import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "@playwright/test";
import { StubAIResolver } from "../../src/ai/resolver/ai-resolver.js";
import { GeneratedScenarioExecutor } from "../../src/core/generation/scenario-executor.js";
import { TemplateTestGenerator } from "../../src/core/generation/test-generator.js";
import { Healer } from "../../src/core/healing/healer.js";
import { PlaywrightPageActionRunner } from "../../src/integrations/playwright/playwright-action-runner.js";
import { InMemorySelectorMemory } from "../../src/memory/selector-memory.js";

test("generated flow can be executed end-to-end", async ({ page }) => {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/login-flow.html");
  const fixtureUrl = pathToFileURL(fixturePath).href;
  const generator = new TemplateTestGenerator();
  const healer = new Healer({
    actionRunner: new PlaywrightPageActionRunner(page),
    aiResolver: new StubAIResolver(),
    selectorMemory: new InMemorySelectorMemory()
  });
  const executor = new GeneratedScenarioExecutor(page, healer);
  const scenario = await generator.generate({
    title: "Login flow",
    sourceType: "text",
    content: "Open the login page, submit the form and validate the dashboard state.",
    targetUrl: fixtureUrl
  });

  await executor.execute(scenario);
});
