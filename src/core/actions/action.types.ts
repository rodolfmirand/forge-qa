export type ActionKind = "click" | "fill" | "select";

export interface ActionIntent {
  kind: ActionKind;
  selector: string;
  description: string;
  value?: string;
  fallbackSelectors?: string[];
}
