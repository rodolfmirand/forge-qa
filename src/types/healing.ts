import type { ActionKind } from "../core/actions/action.types.js";

export interface HealingContext {
  action: ActionKind;
  originalSelector: string;
  actionDescription: string;
  domSnapshot: string;
}

export interface HealingSuggestion {
  selector: string;
  confidence: number;
  rationale: string;
}
