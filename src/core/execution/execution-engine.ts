import { chromium } from "@playwright/test";
import { createAIResolverFromEnv } from "../../ai/resolver/ai-resolver.js";
import { GeneratedScenarioExecutor } from "../generation/scenario-executor.js";
import { TemplateTestGenerator } from "../generation/test-generator.js";
import { PlaywrightDOMExtractor } from "../healing/dom-extractor.js";
import { Healer } from "../healing/healer.js";
import { InMemoryAuditLogger } from "../reporting/audit-log.js";
import { PlaywrightPageActionRunner } from "../../integrations/playwright/playwright-action-runner.js";
import { InMemorySelectorMemory } from "../../memory/selector-memory.js";
import type { ExecutionRequest, ExecutionResult } from "./execution.types.js";

export class ExecutionEngine {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const auditLogger = new InMemoryAuditLogger();
    const generator = new TemplateTestGenerator(auditLogger);
    const healer = new Healer({
      actionRunner: new PlaywrightPageActionRunner(page),
      aiResolver: createAIResolverFromEnv(),
      selectorMemory: new InMemorySelectorMemory(),
      domExtractor: new PlaywrightDOMExtractor(page),
      auditLogger
    });
    const executor = new GeneratedScenarioExecutor(page, healer);

    try {
      const scenario = await generator.generate({
        title: "User provided flow",
        sourceType: "text",
        content: request.flow,
        targetUrl: request.url
      });

      await executor.execute(scenario);

      return {
        scenarioTitle: scenario.title,
        status: "passed",
        auditEntries: auditLogger.getEntries()
      };
    } catch (error) {
      return {
        scenarioTitle: "Execution failed",
        status: "failed",
        auditEntries: auditLogger.getEntries(),
        errorMessage: error instanceof Error ? error.message : String(error)
      };
    } finally {
      await page.close();
      await browser.close();
    }
  }
}
