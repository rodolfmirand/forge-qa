import type { ActionIntent } from "../actions/action.types.js";
import type { AIResolver } from "../../ai/resolver/ai-resolver.js";
import type { PlaywrightActionRunner } from "../../integrations/playwright/playwright-action-runner.js";
import type { SelectorMemory } from "../../memory/selector-memory.js";

export interface HealerDependencies {
  actionRunner: PlaywrightActionRunner;
  aiResolver: AIResolver;
  selectorMemory: SelectorMemory;
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
  constructor(private readonly dependencies: HealerDependencies) {}

  async execute(intent: ActionIntent): Promise<void> {
    const { actionRunner, aiResolver, selectorMemory } = this.dependencies;
    const memorizedSelector = await selectorMemory.find(intent.selector);
    const effectiveIntent = {
      ...intent,
      selector: memorizedSelector ?? intent.selector
    };

    try {
      await actionRunner.run(effectiveIntent);
    } catch (error) {
      void aiResolver;

      if (!isHealingCandidate(error)) {
        throw error;
      }

      if (memorizedSelector && memorizedSelector !== intent.selector) {
        await actionRunner.run(intent);
        return;
      }

      throw error;
    }
  }
}
