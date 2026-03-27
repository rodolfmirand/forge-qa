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

interface CandidateSelector {
  selector: string;
  strategy: "memory" | "original" | "fallback";
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

function buildCandidateSelectors(
  memorizedSelector: string | null,
  intent: ActionIntent
): CandidateSelector[] {
  const seen = new Set<string>();
  const candidates: CandidateSelector[] = [];
  const rawCandidates: CandidateSelector[] = [
    ...(memorizedSelector ? [{ selector: memorizedSelector, strategy: "memory" as const }] : []),
    { selector: intent.selector, strategy: "original" as const },
    ...(intent.fallbackSelectors ?? []).map((selector) => ({
      selector,
      strategy: "fallback" as const
    }))
  ];

  for (const candidate of rawCandidates) {
    if (seen.has(candidate.selector)) {
      continue;
    }

    seen.add(candidate.selector);
    candidates.push(candidate);
  }

  return candidates;
}

export class Healer {
  private readonly auditLogger: AuditLogger;

  constructor(private readonly dependencies: HealerDependencies) {
    this.auditLogger = dependencies.auditLogger ?? new NoopAuditLogger();
  }

  async execute(intent: ActionIntent): Promise<void> {
    const { actionRunner, aiResolver, selectorMemory, domExtractor } = this.dependencies;
    const memorizedSelector = await selectorMemory.find(intent.selector);
    const candidateSelectors = buildCandidateSelectors(memorizedSelector, intent);

    let lastError: unknown = null;

    for (const candidate of candidateSelectors) {
      try {
        await actionRunner.run({
          ...intent,
          selector: candidate.selector
        });

        if (candidate.selector !== intent.selector) {
          await selectorMemory.save(intent.selector, candidate.selector);
          await this.auditLogger.log("healing", {
            intent,
            memorizedSelector,
            strategy: candidate.strategy,
            originalSelector: intent.selector,
            recoveredSelector: candidate.selector,
            candidateSelectors
          });
        }

        return;
      } catch (error) {
        lastError = error;

        if (!isHealingCandidate(error)) {
          throw error;
        }
      }
    }

    const domSnapshot = await domExtractor.extract();
    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    const suggestion = await aiResolver.resolve({
      action: intent.kind,
      originalSelector: intent.selector,
      actionDescription: intent.description,
      domSnapshot,
      errorMessage
    });

    await this.auditLogger.log("healing", {
      intent,
      memorizedSelector,
      candidateSelectors,
      errorMessage,
      strategy: "ai",
      suggestion
    });

    if (!suggestion) {
      throw lastError;
    }

    await actionRunner.run({
      ...intent,
      selector: suggestion.selector
    });
    await selectorMemory.save(intent.selector, suggestion.selector);
  }
}
