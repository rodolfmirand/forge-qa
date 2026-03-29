import { expect, test } from "@playwright/test";
import {
  formatExecutionResult,
  parseExecutionCLIArgs,
  printExecutionUsage
} from "../../src/app/cli/execution-cli.js";

test("execution CLI parses minimal recurring execution parameters", async () => {
  const config = parseExecutionCLIArgs([
    "--url",
    "https://example.com",
    "--flow",
    'Pesquise por "Forge QA"'
  ]);

  expect(config.request.url).toBe("https://example.com");
  expect(config.request.flow).toBe('Pesquise por "Forge QA"');
  expect(config.output).toBe("pretty");
});

test("execution CLI parses endpoint payload as an alternate input source", async () => {
  const config = parseExecutionCLIArgs([
    "--url",
    "https://example.com/app",
    "--source-type",
    "endpoint",
    "--source-payload",
    '{"operation":"update","entity":"user","navigationPath":["Administracao","Usuarios"],"targetRecord":"Carlos Mendes","fields":{"cargo":"Financeiro"}}'
  ]);

  expect(config.request.sourceType).toBe("endpoint");
  expect(config.request.sourcePayload).toMatchObject({
    operation: "update",
    entity: "user",
    targetRecord: "Carlos Mendes"
  });
});

test("execution CLI parses extensible options and metadata", async () => {
  const config = parseExecutionCLIArgs([
    "--url",
    "https://example.com",
    "--flow",
    "Open the page and login",
    "--source-type",
    "text",
    "--planning-mode",
    "hybrid",
    "--max-healing-attempts",
    "7",
    "--requested-by",
    "ci-runner",
    "--labels",
    "nightly,smoke",
    "--output",
    "json"
  ]);

  expect(config.request.sourceType).toBe("text");
  expect(config.request.options?.planning?.mode).toBe("hybrid");
  expect(config.request.options?.maxHealingAttempts).toBe(7);
  expect(config.request.metadata?.requestedBy).toBe("ci-runner");
  expect(config.request.metadata?.labels).toEqual(["nightly", "smoke"]);
  expect(config.output).toBe("json");
});

test("execution CLI reports usage for missing required params", async () => {
  expect(() => parseExecutionCLIArgs(["--url", "https://example.com"])).toThrow(
    /either --flow or --source-payload/
  );
  expect(printExecutionUsage()).toContain("Forge QA execution CLI");
  expect(printExecutionUsage()).toContain("--planning-mode <heuristic|hybrid|ai>");
  expect(printExecutionUsage()).toContain("--source-payload <json>");
});

test("execution CLI formats pretty output with summary and artifacts", async () => {
  const formatted = formatExecutionResult(
    {
      scenarioTitle: "Scenario for: Search flow",
      status: "passed",
      summary: {
        totalSteps: 4,
        qualityScore: 92,
        qualityLabel: "strong",
        finalStatus: "passed"
      },
      artifacts: [
        {
          name: "completion.png",
          kind: "screenshot",
          path: "D:/artifacts/completion.png"
        }
      ]
    },
    "pretty"
  );

  expect(formatted).toContain("Scenario: Scenario for: Search flow");
  expect(formatted).toContain("Quality: 92 (strong)");
  expect(formatted).toContain("completion.png");
});
