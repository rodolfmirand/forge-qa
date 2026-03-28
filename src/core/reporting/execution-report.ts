import type { GeneratedTestScenario } from "../../types/generation.js";
import type { ExecutionArtifact } from "../execution/execution.types.js";
import type { AuditEntry } from "./audit-log.js";

export interface ExecutionSummary {
  totalSteps: number;
  healingAttempts: number;
  healedActions: number;
  memoryRecoveries: number;
  fallbackRecoveries: number;
  aiRecoveries: number;
  failedActions: number;
  evidenceArtifacts: number;
  finalStatus: "passed" | "failed";
}

interface SummaryInput {
  plannedScenario?: GeneratedTestScenario;
  auditEntries: AuditEntry[];
  status: "passed" | "failed";
  artifacts?: ExecutionArtifact[];
}

export function createExecutionSummary(input: SummaryInput): ExecutionSummary {
  let healingAttempts = 0;
  let healedActions = 0;
  let memoryRecoveries = 0;
  let fallbackRecoveries = 0;
  let aiRecoveries = 0;

  for (const entry of input.auditEntries) {
    if (entry.type !== "healing" || !entry.payload || typeof entry.payload !== "object") {
      continue;
    }

    const payload = entry.payload as Record<string, unknown>;

    healingAttempts += 1;

    if (typeof payload.recoveredSelector === "string") {
      healedActions += 1;

      if (payload.strategy === "memory") {
        memoryRecoveries += 1;
      }

      if (payload.strategy === "fallback") {
        fallbackRecoveries += 1;
      }

      if (payload.strategy === "ai") {
        aiRecoveries += 1;
      }
    }
  }

  return {
    totalSteps: input.plannedScenario?.steps.length ?? 0,
    healingAttempts,
    healedActions,
    memoryRecoveries,
    fallbackRecoveries,
    aiRecoveries,
    failedActions: input.status === "failed" ? 1 : 0,
    evidenceArtifacts: input.artifacts?.length ?? 0,
    finalStatus: input.status
  };
}
