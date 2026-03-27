import type { GeneratedTestScenario, TestGenerationInput } from "../../types/generation.js";
import type { AuditLogger } from "../reporting/audit-log.js";
import { NoopAuditLogger } from "../reporting/audit-log.js";

export interface TestGenerator {
  generate(input: TestGenerationInput): Promise<GeneratedTestScenario>;
}

export class TemplateTestGenerator implements TestGenerator {
  constructor(private readonly auditLogger: AuditLogger = new NoopAuditLogger()) {}

  async generate(input: TestGenerationInput): Promise<GeneratedTestScenario> {
    const scenario: GeneratedTestScenario = {
      title: `Scenario for: ${input.title}`,
      sourceType: input.sourceType,
      preconditions: ["The application is available for test execution."],
      steps: [
        {
          kind: "navigate",
          description: "Open the target page.",
          url: input.targetUrl ?? "about:blank"
        },
        {
          kind: "fill",
          description: "Fill the email field.",
          selector: "#email",
          value: "qa@secondmind.dev"
        },
        {
          kind: "fill",
          description: "Fill the password field.",
          selector: "#password",
          value: "super-secret"
        },
        {
          kind: "click",
          description: "Click the Sign in button.",
          selector: "#login-button"
        },
        {
          kind: "assertText",
          description: input.content,
          selector: "#result",
          text: "Dashboard"
        }
      ]
    };

    await this.auditLogger.log("generation", {
      input,
      scenario
    });

    return scenario;
  }
}
