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
  qualityScore: number;
  qualityLabel: "strong" | "stable" | "degraded" | "critical";
  finalStatus: "passed" | "failed";
}

interface SummaryInput {
  plannedScenario?: GeneratedTestScenario;
  auditEntries: AuditEntry[];
  status: "passed" | "failed";
  artifacts?: ExecutionArtifact[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateQualityScore(params: {
  healingAttempts: number;
  memoryRecoveries: number;
  fallbackRecoveries: number;
  aiRecoveries: number;
  failedActions: number;
}): number {
  const baseScore = 100;
  const penalty =
    params.healingAttempts * 5 +
    params.memoryRecoveries * 2 +
    params.fallbackRecoveries * 5 +
    params.aiRecoveries * 10 +
    params.failedActions * 40;

  return clamp(baseScore - penalty, 0, 100);
}

function classifyQuality(score: number): ExecutionSummary["qualityLabel"] {
  if (score >= 90) {
    return "strong";
  }

  if (score >= 75) {
    return "stable";
  }

  if (score >= 50) {
    return "degraded";
  }

  return "critical";
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

  const failedActions = input.status === "failed" ? 1 : 0;
  const qualityScore = calculateQualityScore({
    healingAttempts,
    memoryRecoveries,
    fallbackRecoveries,
    aiRecoveries,
    failedActions
  });

  return {
    totalSteps: input.plannedScenario?.steps.length ?? 0,
    healingAttempts,
    healedActions,
    memoryRecoveries,
    fallbackRecoveries,
    aiRecoveries,
    failedActions,
    evidenceArtifacts: input.artifacts?.length ?? 0,
    qualityScore,
    qualityLabel: classifyQuality(qualityScore),
    finalStatus: input.status
  };
}
