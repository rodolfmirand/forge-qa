export type ActionKind = "click" | "fill" | "select" | "press";

export interface ActionIntent {
  kind: ActionKind;
  selector: string;
  description: string;
  value?: string;
  key?: string;
  fallbackSelectors?: string[];
  waitForNavigation?: boolean;
}
