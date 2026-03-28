export type TestSourceType = "text" | "endpoint" | "interface";
export type GeneratedStepKind =
  | "navigate"
  | "click"
  | "fill"
  | "press"
  | "waitForNavigation"
  | "assertText"
  | "assertUrl";

export interface TestGenerationInput {
  title: string;
  sourceType: TestSourceType;
  content: string;
  targetUrl?: string;
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
