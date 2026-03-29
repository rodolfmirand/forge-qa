export type ActionKind = "click" | "fill" | "select" | "check" | "press";

export interface ActionIntent {
  kind: ActionKind;
  selector: string;
  description: string;
  value?: string;
  key?: string;
  fallbackSelectors?: string[];
  waitForNavigation?: boolean;
}
