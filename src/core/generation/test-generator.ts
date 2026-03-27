import type { GeneratedTestScenario, TestGenerationInput } from "../../types/generation.js";
import type { AuditLogger } from "../reporting/audit-log.js";
import { NoopAuditLogger } from "../reporting/audit-log.js";

export interface TestGenerator {
  generate(input: TestGenerationInput): Promise<GeneratedTestScenario>;
}

function parseCredential(content: string, label: string): string | null {
  const regex = new RegExp(`${label}\\s*:\\s*([^\\n\\r]+)`, "i");
  const match = content.match(regex);

  return match?.[1]?.trim() ?? null;
}

function inferExpectedText(content: string): string | null {
  const lower = content.toLowerCase();

  if (lower.includes("dashboard")) {
    return "Dashboard";
  }

  if (lower.includes("home")) {
    return "Home";
  }

  if (lower.includes("painel")) {
    return "Painel";
  }

  return null;
}

export class TemplateTestGenerator implements TestGenerator {
  constructor(private readonly auditLogger: AuditLogger = new NoopAuditLogger()) {}

  async generate(input: TestGenerationInput): Promise<GeneratedTestScenario> {
    const email = parseCredential(input.content, "email") ?? "qa@secondmind.dev";
    const password =
      parseCredential(input.content, "senha") ??
      parseCredential(input.content, "password") ??
      "super-secret";
    const expectedText = inferExpectedText(input.content);

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
          selector: 'input[type="email"]',
          fallbackSelectors: [
            'input[autocomplete="username"]',
            'input[name*="email" i]',
            'input[id*="email" i]',
            'input[name*="login" i]',
            'input[placeholder*="mail" i]',
            'input[placeholder*="e-mail" i]',
            'input[type="text"][name*="user" i]'
          ],
          value: email
        },
        {
          kind: "fill",
          description: "Fill the password field.",
          selector: 'input[type="password"]',
          fallbackSelectors: [
            'input[autocomplete="current-password"]',
            'input[name*="senha" i]',
            'input[id*="senha" i]',
            'input[name*="password" i]',
            'input[id*="password" i]'
          ],
          value: password
        },
        {
          kind: "click",
          description: "Click the sign in action.",
          selector: 'button[type="submit"]',
          fallbackSelectors: [
            'button:has-text("Entrar")',
            'button:has-text("Acessar")',
            'button:has-text("Login")',
            'button:has-text("Sign in")',
            'button:has-text("Continuar")',
            'input[type="submit"]',
            '[role="button"]:has-text("Entrar")',
            '[role="button"]:has-text("Acessar")'
          ]
        }
      ]
    };

    if (expectedText) {
      scenario.steps.push({
        kind: "assertText",
        description: `Validate that ${expectedText} is visible after login.`,
        selector: `text=${expectedText}`,
        text: expectedText
      });
    }

    await this.auditLogger.log("generation", {
      input,
      scenario
    });

    return scenario;
  }
}
