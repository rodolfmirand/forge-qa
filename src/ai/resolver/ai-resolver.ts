import type { HealingContext, HealingSuggestion } from "../../types/healing.js";
import { buildSelectorHealingPrompt } from "../prompts/selector-healing.prompt.js";

export interface AIResolver {
  resolve(context: HealingContext): Promise<HealingSuggestion | null>;
}

export class StubAIResolver implements AIResolver {
  async resolve(context: HealingContext): Promise<HealingSuggestion | null> {
    void context;
    void buildSelectorHealingPrompt();

    return null;
  }
}
