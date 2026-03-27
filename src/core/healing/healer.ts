import type { ActionIntent } from "../actions/action.types.js";
import type { AIResolver } from "../../ai/resolver/ai-resolver.js";
import type { PlaywrightActionRunner } from "../../integrations/playwright/playwright-action-runner.js";
import type { SelectorMemory } from "../../memory/selector-memory.js";
import type { DOMExtractor } from "./dom-extractor.js";
import type { AuditLogger } from "../reporting/audit-log.js";
import { NoopAuditLogger } from "../reporting/audit-log.js";

export interface HealerDependencies {
  actionRunner: PlaywrightActionRunner;
  aiResolver: AIResolver;
  selectorMemory: SelectorMemory;
  domExtractor: DOMExtractor;
  auditLogger?: AuditLogger;
}

export function isHealingCandidate(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("locator") ||
    message.includes("element") ||
    message.includes("timeout") ||
    message.includes("waiting for")
  );
}

export class Healer {
  private readonly auditLogger: AuditLogger;

  constructor(private readonly dependencies: HealerDependencies) {
    this.auditLogger = dependencies.auditLogger ?? new NoopAuditLogger();
  }

  async execute(intent: ActionIntent): Promise<void> {
    const { actionRunner, aiResolver, selectorMemory, domExtractor } = this.dependencies;
    const memorizedSelector = await selectorMemory.find(intent.selector);
    const effectiveIntent = {
      ...intent,
      selector: memorizedSelector ?? intent.selector
    };

    try {
      await actionRunner.run(effectiveIntent);
    } catch (error) {
      if (!isHealingCandidate(error)) {
        throw error;
      }

      const domSnapshot = await domExtractor.extract();
      const errorMessage = error instanceof Error ? error.message : String(error);
      const suggestion = await aiResolver.resolve({
        action: intent.kind,
        originalSelector: effectiveIntent.selector,
        actionDescription: intent.description,
        domSnapshot,
        errorMessage
      });

      await this.auditLogger.log("healing", {
        intent,
        effectiveIntent,
        errorMessage,
        suggestion
      });

      if (!suggestion) {
        throw error;
      }

      await actionRunner.run({
        ...intent,
        selector: suggestion.selector
      });
      await selectorMemory.save(intent.selector, suggestion.selector);
    }
  }
}
