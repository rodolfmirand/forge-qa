import { TemplateTestGenerator } from "./core/generation/test-generator.js";
import { createEmptyExecutionSummary } from "./core/reporting/execution-report.js";

async function main(): Promise<void> {
  const summary = createEmptyExecutionSummary();
  const generator = new TemplateTestGenerator();
  const generatedScenario = await generator.generate({
    title: "Login flow",
    sourceType: "text",
    content: "Open the login page and validate that the main heading is visible."
  });

  console.log("Forge QA bootstrap ready.");
  console.log(`Generation bootstrap ready: ${generatedScenario.title}`);
  console.log(`Execution summary template: ${JSON.stringify(summary)}`);
}

void main();
