import { ExecutionEngine } from "../../core/execution/execution-engine.js";
import {
  formatExecutionResult,
  parseExecutionCLIArgs,
  printExecutionUsage
} from "./execution-cli.js";

async function main(): Promise<void> {
  try {
    const config = parseExecutionCLIArgs(process.argv.slice(2));
    const engine = new ExecutionEngine();
    const result = await engine.execute(config.request);

    console.log(formatExecutionResult(result, config.output));

    if (result.status === "failed") {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isUsageError = message.includes("Forge QA execution CLI") || message.includes("required");

    console.error(message);

    if (!isUsageError) {
      console.error("\n" + printExecutionUsage());
    }

    process.exitCode = 1;
  }
}

void main();
