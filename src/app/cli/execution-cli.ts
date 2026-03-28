import type { ExecutionRequest, ExecutionStatus } from "../../core/execution/execution.types.js";

export interface CLIExecutionConfig {
  request: ExecutionRequest;
  output: "json" | "pretty";
}

function readOption(args: string[], index: number): string {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${args[index]}.`);
  }

  return value;
}

function splitLabels(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function printExecutionUsage(): string {
  return [
    "Forge QA execution CLI",
    "",
    "Required:",
    "  --url <target-url>",
    "  --flow <flow-description>",
    "",
    "Optional:",
    "  --source-type <text|endpoint|interface>",
    "  --max-healing-attempts <number>",
    "  --requested-by <name>",
    "  --labels <comma-separated>",
    "  --output <pretty|json>",
    "",
    "Example:",
    "  npm run execute -- --url https://example.com --flow \"Pesquise por 'Forge QA'\" --output json"
  ].join("\n");
}

export function parseExecutionCLIArgs(args: string[]): CLIExecutionConfig {
  const config: CLIExecutionConfig = {
    request: {
      url: "",
      flow: ""
    },
    output: "pretty"
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    switch (argument) {
      case "--url": {
        config.request.url = readOption(args, index);
        index += 1;
        break;
      }
      case "--flow": {
        config.request.flow = readOption(args, index);
        index += 1;
        break;
      }
      case "--source-type": {
        const sourceType = readOption(args, index) as NonNullable<ExecutionRequest["sourceType"]>;
        config.request = {
          ...config.request,
          sourceType
        };
        index += 1;
        break;
      }
      case "--max-healing-attempts": {
        const rawValue = readOption(args, index);
        const parsedValue = Number.parseInt(rawValue, 10);

        if (Number.isNaN(parsedValue) || parsedValue <= 0) {
          throw new Error("--max-healing-attempts must be a positive integer.");
        }

        config.request.options = {
          ...(config.request.options ?? {}),
          maxHealingAttempts: parsedValue
        };
        index += 1;
        break;
      }
      case "--requested-by": {
        const requestedBy = readOption(args, index);
        config.request.metadata = {
          ...(config.request.metadata ?? {}),
          requestedBy
        };
        index += 1;
        break;
      }
      case "--labels": {
        const labels = splitLabels(readOption(args, index));
        config.request.metadata = {
          ...(config.request.metadata ?? {}),
          ...(labels.length > 0 ? { labels } : {})
        };
        index += 1;
        break;
      }
      case "--output": {
        const output = readOption(args, index);

        if (output !== "json" && output !== "pretty") {
          throw new Error("--output must be either 'json' or 'pretty'.");
        }

        config.output = output;
        index += 1;
        break;
      }
      case "--help": {
        throw new Error(printExecutionUsage());
      }
      default: {
        throw new Error(`Unknown argument: ${argument}`);
      }
    }
  }

  if (!config.request.url || !config.request.flow) {
    throw new Error("Both --url and --flow are required.\n\n" + printExecutionUsage());
  }

  return config;
}

export function formatExecutionResult(
  result: {
    scenarioTitle: string;
    status: ExecutionStatus;
    errorMessage?: string;
    summary?: {
      totalSteps: number;
      qualityScore: number;
      qualityLabel: string;
      finalStatus: string;
    };
    artifacts?: Array<{ name: string; kind: string; path: string }>;
  },
  output: "json" | "pretty"
): string {
  if (output === "json") {
    return JSON.stringify(result, null, 2);
  }

  const lines = [`Scenario: ${result.scenarioTitle}`, `Status: ${result.status}`];

  if (result.summary) {
    lines.push(
      `Quality: ${result.summary.qualityScore} (${result.summary.qualityLabel})`,
      `Steps: ${result.summary.totalSteps}`
    );
  }

  if (result.errorMessage) {
    lines.push(`Error: ${result.errorMessage}`);
  }

  if (result.artifacts?.length) {
    lines.push("Artifacts:");

    for (const artifact of result.artifacts) {
      lines.push(`- ${artifact.name} [${artifact.kind}] ${artifact.path}`);
    }
  }

  return lines.join("\n");
}
