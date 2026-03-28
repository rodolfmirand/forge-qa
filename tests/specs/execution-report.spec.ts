import { expect, test } from "@playwright/test";
import { createExecutionSummary } from "../../src/core/reporting/execution-report.js";

test("execution summary aggregates planned steps, healing and evidences", async () => {
  const summary = createExecutionSummary({
    plannedScenario: {
      title: "Scenario",
      sourceType: "text",
      preconditions: [],
      steps: [
        { kind: "navigate", description: "Open the page.", url: "https://example.com" },
        { kind: "click", description: "Click the CTA.", selector: "#cta" }
      ]
    },
    auditEntries: [
      {
        type: "generation",
        createdAt: new Date().toISOString(),
        payload: {}
      },
      {
        type: "healing",
        createdAt: new Date().toISOString(),
        payload: {
          strategy: "fallback",
          recoveredSelector: "#cta-new"
        }
      },
      {
        type: "healing",
        createdAt: new Date().toISOString(),
        payload: {
          strategy: "ai"
        }
      }
    ],
    status: "passed",
    artifacts: [
      {
        id: "completion-screenshot",
        name: "completion.png",
        kind: "screenshot",
        contentType: "image/png",
        path: "D:/artifacts/completion.png"
      }
    ]
  });

  expect(summary.totalSteps).toBe(2);
  expect(summary.healingAttempts).toBe(2);
  expect(summary.healedActions).toBe(1);
  expect(summary.fallbackRecoveries).toBe(1);
  expect(summary.aiRecoveries).toBe(0);
  expect(summary.evidenceArtifacts).toBe(1);
  expect(summary.qualityScore).toBe(85);
  expect(summary.qualityLabel).toBe("stable");
  expect(summary.finalStatus).toBe("passed");
});

test("execution summary degrades quality sharply on final failure", async () => {
  const summary = createExecutionSummary({
    auditEntries: [
      {
        type: "healing",
        createdAt: new Date().toISOString(),
        payload: {
          strategy: "ai",
          recoveredSelector: "#fallback"
        }
      }
    ],
    status: "failed"
  });

  expect(summary.failedActions).toBe(1);
  expect(summary.qualityScore).toBe(45);
  expect(summary.qualityLabel).toBe("critical");
});
