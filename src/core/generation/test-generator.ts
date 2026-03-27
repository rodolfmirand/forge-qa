import type { GeneratedTestScenario, TestGenerationInput } from "../../types/generation.js";

export interface TestGenerator {
  generate(input: TestGenerationInput): Promise<GeneratedTestScenario>;
}

export class TemplateTestGenerator implements TestGenerator {
  async generate(input: TestGenerationInput): Promise<GeneratedTestScenario> {
    return {
      title: `Scenario for: ${input.title}`,
      sourceType: input.sourceType,
      preconditions: ["The application is available for test execution."],
      steps: [
        {
          action: "navigate",
          description: input.content
        }
      ],
      assertions: ["The generated scenario should be executable by the runner."]
    };
  }
}
