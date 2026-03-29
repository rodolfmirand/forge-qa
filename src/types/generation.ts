export type TestSourceType = "text" | "endpoint" | "interface";
export type GeneratedStepKind =
  | "navigate"
  | "click"
  | "fill"
  | "select"
  | "check"
  | "press"
  | "waitForNavigation"
  | "assertText"
  | "assertUrl";

export interface TestGenerationInput {
  title: string;
  sourceType: TestSourceType;
  content: string;
  targetUrl?: string;
  sourcePayload?: unknown;
}

export interface GeneratedTestStep {
  kind: GeneratedStepKind;
  description: string;
  selector?: string;
  fallbackSelectors?: string[];
  value?: string;
  url?: string;
  text?: string;
  key?: string;
  urlIncludes?: string;
  waitForNavigation?: boolean;
}

export interface GeneratedTestScenario {
  title: string;
  sourceType: TestSourceType;
  preconditions: string[];
  steps: GeneratedTestStep[];
}
