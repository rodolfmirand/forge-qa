import { TemplateTestGenerator } from "./core/generation/test-generator.js";
import { createEmptyExecutionSummary } from "./core/reporting/execution-report.js";

async function main(): Promise<void> {
  const summary = createEmptyExecutionSummary();
  const generator = new TemplateTestGenerator();
  const generatedScenario = await generator.generate({
    title: "Login flow",
    sourceType: "text",
    content: "Open the login page, submit the form and validate the dashboard state.",
    targetUrl: "about:blank"
  });

  console.log("Forge QA bootstrap ready.");
  console.log(`Generation bootstrap ready: ${generatedScenario.title}`);
  console.log(`Generated steps: ${generatedScenario.steps.length}`);
  console.log(`Execution summary template: ${JSON.stringify(summary)}`);
}

void main();
