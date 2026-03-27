import { expect, type Page } from "@playwright/test";
import type { Healer } from "../healing/healer.js";
import type { GeneratedTestScenario, GeneratedTestStep } from "../../types/generation.js";

export class GeneratedScenarioExecutor {
  constructor(
    private readonly page: Page,
    private readonly healer: Healer
  ) {}

  async execute(scenario: GeneratedTestScenario): Promise<void> {
    for (const step of scenario.steps) {
      await this.executeStep(step);
    }
  }

  private async executeStep(step: GeneratedTestStep): Promise<void> {
    switch (step.kind) {
      case "navigate": {
        if (!step.url) {
          throw new Error(`Navigate step is missing a URL: ${step.description}`);
        }

        await this.page.goto(step.url);
        return;
      }
      case "fill": {
        if (!step.selector || !step.value) {
          throw new Error(`Fill step is incomplete: ${step.description}`);
        }

        await this.healer.execute({
          kind: "fill",
          selector: step.selector,
          description: step.description,
          value: step.value
        });
        return;
      }
      case "click": {
        if (!step.selector) {
          throw new Error(`Click step is missing a selector: ${step.description}`);
        }

        await this.healer.execute({
          kind: "click",
          selector: step.selector,
          description: step.description
        });
        return;
      }
      case "assertText": {
        if (!step.selector || !step.text) {
          throw new Error(`Assert step is incomplete: ${step.description}`);
        }

        await expect(this.page.locator(step.selector)).toContainText(step.text);
        return;
      }
      default: {
        const exhaustiveCheck: never = step.kind;
        throw new Error(`Unsupported step kind: ${exhaustiveCheck}`);
      }
    }
  }
}
