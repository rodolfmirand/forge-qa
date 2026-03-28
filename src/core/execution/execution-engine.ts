import { chromium } from "@playwright/test";
import { createAIResolverFromEnv } from "../../ai/resolver/ai-resolver.js";
import { FileSelectorMemory, resolveSelectorMemoryPath } from "../../memory/selector-memory.js";
import type { GeneratedTestScenario } from "../../types/generation.js";
import { GeneratedScenarioExecutor } from "../generation/scenario-executor.js";
import { TemplateTestGenerator } from "../generation/test-generator.js";
import { PlaywrightDOMExtractor } from "../healing/dom-extractor.js";
import { Healer } from "../healing/healer.js";
import { InMemoryAuditLogger } from "../reporting/audit-log.js";
import { PlaywrightPageActionRunner } from "../../integrations/playwright/playwright-action-runner.js";
import type { ExecutionRequest, ExecutionResult } from "./execution.types.js";

export class ExecutionEngine {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const auditLogger = new InMemoryAuditLogger();
    const generator = new TemplateTestGenerator(auditLogger);
    const selectorMemory = new FileSelectorMemory(resolveSelectorMemoryPath());
    const healer = new Healer({
      actionRunner: new PlaywrightPageActionRunner(page),
      aiResolver: createAIResolverFromEnv(),
      selectorMemory,
      domExtractor: new PlaywrightDOMExtractor(page),
      auditLogger
    });
    const executor = new GeneratedScenarioExecutor(page, healer);
    let scenarioTitle = "Execution failed";
    let plannedScenario: GeneratedTestScenario | undefined;

    try {
      plannedScenario = await generator.generate({
        title: "User provided flow",
        sourceType: "text",
        content: request.flow,
        targetUrl: request.url
      });

      scenarioTitle = plannedScenario.title;
      await executor.execute(plannedScenario);

      return {
        scenarioTitle,
        status: "passed",
        auditEntries: auditLogger.getEntries(),
        plannedScenario
      };
    } catch (error) {
      return {
        scenarioTitle,
        status: "failed",
        auditEntries: auditLogger.getEntries(),
        ...(plannedScenario ? { plannedScenario } : {}),
        errorMessage: error instanceof Error ? error.message : String(error)
      };
    } finally {
      await page.close();
      await browser.close();
    }
  }
}
