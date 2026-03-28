import type { GeneratedTestScenario, TestSourceType } from "../../types/generation.js";
import type { AuditEntry } from "../reporting/audit-log.js";
import type { ExecutionSummary } from "../reporting/execution-report.js";

export type ExecutionStatus = "queued" | "running" | "passed" | "failed";
export type ArtifactKind = "screenshot" | "json" | "html";

export interface ExecutionEvidenceOptions {
  captureScreenshotOnSuccess?: boolean;
  captureScreenshotOnFailure?: boolean;
}

export interface ExecutionOptions {
  maxHealingAttempts?: number;
  evidence?: ExecutionEvidenceOptions;
}

export interface ExecutionMetadata {
  labels?: string[];
  requestedBy?: string;
  sourceHint?: string;
}

export interface ExecutionRequest {
  url: string;
  flow: string;
  sourceType?: TestSourceType;
  options?: ExecutionOptions;
  metadata?: ExecutionMetadata;
  executionId?: string;
}

export interface ExecutionArtifact {
  id: string;
  name: string;
  kind: ArtifactKind;
  contentType: string;
  path: string;
  url?: string;
}

export interface ExecutionResult {
  scenarioTitle: string;
  status: Exclude<ExecutionStatus, "queued" | "running">;
  auditEntries: AuditEntry[];
  plannedScenario?: GeneratedTestScenario;
  summary?: ExecutionSummary;
  artifacts?: ExecutionArtifact[];
  errorMessage?: string;
}

export interface ExecutionRecord {
  id: string;
  request: ExecutionRequest;
  status: ExecutionStatus;
  createdAt: string;
  updatedAt: string;
  result?: ExecutionResult;
}
