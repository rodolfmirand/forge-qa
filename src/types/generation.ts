export type TestSourceType = "text" | "endpoint" | "interface";
export type GeneratedStepKind = "navigate" | "click" | "fill" | "assertText";

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
  value?: string;
  url?: string;
  text?: string;
}

export interface GeneratedTestScenario {
  title: string;
  sourceType: TestSourceType;
  preconditions: string[];
  steps: GeneratedTestStep[];
}
