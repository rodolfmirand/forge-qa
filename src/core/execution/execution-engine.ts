import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { createAIResolverFromEnv } from "../../ai/resolver/ai-resolver.js";
import { PlaywrightPageActionRunner } from "../../integrations/playwright/playwright-action-runner.js";
import { FileSelectorMemory, resolveSelectorMemoryPath } from "../../memory/selector-memory.js";
import type { GeneratedTestScenario } from "../../types/generation.js";
import { GeneratedScenarioExecutor } from "../generation/scenario-executor.js";
import { TemplateTestGenerator } from "../generation/test-generator.js";
import { PlaywrightDOMExtractor } from "../healing/dom-extractor.js";
import { Healer } from "../healing/healer.js";
import { InMemoryAuditLogger } from "../reporting/audit-log.js";
import { createExecutionSummary } from "../reporting/execution-report.js";
import type {
  ExecutionArtifact,
  ExecutionEvidenceOptions,
  ExecutionRequest,
  ExecutionResult
} from "./execution.types.js";

const DEFAULT_ARTIFACTS_ROOT = "storage/artifacts";

function normalizeEvidenceOptions(
  options?: ExecutionEvidenceOptions
): Required<ExecutionEvidenceOptions> {
  return {
    captureScreenshotOnSuccess: options?.captureScreenshotOnSuccess ?? true,
    captureScreenshotOnFailure: options?.captureScreenshotOnFailure ?? true
  };
}

function resolveArtifactsDirectory(executionId: string): string {
  const configuredRoot = process.env.FORGEQA_ARTIFACTS_PATH ?? DEFAULT_ARTIFACTS_ROOT;
  const absoluteRoot = path.isAbsolute(configuredRoot)
    ? configuredRoot
    : path.resolve(process.cwd(), configuredRoot);

  return path.join(absoluteRoot, executionId);
}

async function captureArtifacts(
  page: Page,
  request: ExecutionRequest,
  status: "passed" | "failed"
): Promise<ExecutionArtifact[]> {
  const executionId = request.executionId ?? "ad-hoc";
  const evidenceOptions = normalizeEvidenceOptions(request.options?.evidence);
  const shouldCapture =
    (status === "passed" && evidenceOptions.captureScreenshotOnSuccess) ||
    (status === "failed" && evidenceOptions.captureScreenshotOnFailure);

  if (!shouldCapture) {
    return [];
  }

  try {
    const artifactsDirectory = resolveArtifactsDirectory(executionId);
    const screenshotName = status === "passed" ? "completion.png" : "failure.png";
    const screenshotPath = path.join(artifactsDirectory, screenshotName);

    await mkdir(artifactsDirectory, { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return [
      {
        id: status === "passed" ? "completion-screenshot" : "failure-screenshot",
        name: screenshotName,
        kind: "screenshot",
        contentType: "image/png",
        path: screenshotPath
      }
    ];
  } catch {
    return [];
  }
}

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
      auditLogger,
      ...(request.options?.maxHealingAttempts
        ? { maxRecoveryAttempts: request.options.maxHealingAttempts }
        : {})
    });
    const executor = new GeneratedScenarioExecutor(page, healer);
    let scenarioTitle = "Execution failed";
    let plannedScenario: GeneratedTestScenario | undefined;

    try {
      plannedScenario = await generator.generate({
        title: "User provided flow",
        sourceType: request.sourceType ?? "text",
        content: request.flow,
        targetUrl: request.url
      });

      scenarioTitle = plannedScenario.title;
      await executor.execute(plannedScenario);

      const artifacts = await captureArtifacts(page, request, "passed");
      const summary = createExecutionSummary({
        plannedScenario,
        auditEntries: auditLogger.getEntries(),
        status: "passed",
        artifacts
      });

      return {
        scenarioTitle,
        status: "passed",
        auditEntries: auditLogger.getEntries(),
        plannedScenario,
        summary,
        ...(artifacts.length > 0 ? { artifacts } : {})
      };
    } catch (error) {
      const artifacts = await captureArtifacts(page, request, "failed");
      const summary = createExecutionSummary({
        auditEntries: auditLogger.getEntries(),
        status: "failed",
        artifacts,
        ...(plannedScenario ? { plannedScenario } : {})
      });

      return {
        scenarioTitle,
        status: "failed",
        auditEntries: auditLogger.getEntries(),
        ...(plannedScenario ? { plannedScenario } : {}),
        summary,
        ...(artifacts.length > 0 ? { artifacts } : {}),
        errorMessage: error instanceof Error ? error.message : String(error)
      };
    } finally {
      await page.close();
      await browser.close();
    }
  }
}
