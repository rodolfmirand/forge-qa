import type { ActionIntent } from "../actions/action.types.js";
import type { AIResolver } from "../../ai/resolver/ai-resolver.js";
import type { PlaywrightActionRunner } from "../../integrations/playwright/playwright-action-runner.js";
import type { SelectorMemory } from "../../memory/selector-memory.js";

export interface HealerDependencies {
  actionRunner: PlaywrightActionRunner;
  aiResolver: AIResolver;
  selectorMemory: SelectorMemory;
}

export class Healer {
  constructor(private readonly dependencies: HealerDependencies) {}

  async execute(intent: ActionIntent): Promise<void> {
    const { actionRunner, selectorMemory } = this.dependencies;
    const memorizedSelector = await selectorMemory.find(intent.selector);

    await actionRunner.run({
      ...intent,
      selector: memorizedSelector ?? intent.selector
    });
  }
}
