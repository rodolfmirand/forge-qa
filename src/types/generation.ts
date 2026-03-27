export type TestSourceType = "text" | "endpoint" | "interface";

export interface TestGenerationInput {
  title: string;
  sourceType: TestSourceType;
  content: string;
}

export interface GeneratedTestStep {
  action: string;
  description: string;
}

export interface GeneratedTestScenario {
  title: string;
  sourceType: TestSourceType;
  preconditions: string[];
  steps: GeneratedTestStep[];
  assertions: string[];
}
