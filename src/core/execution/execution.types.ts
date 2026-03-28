import type { GeneratedTestScenario } from "../../types/generation.js";
import type { AuditEntry } from "../reporting/audit-log.js";

export type ExecutionStatus = "queued" | "running" | "passed" | "failed";

export interface ExecutionRequest {
  url: string;
  flow: string;
}

export interface ExecutionResult {
  scenarioTitle: string;
  status: Exclude<ExecutionStatus, "queued" | "running">;
  auditEntries: AuditEntry[];
  plannedScenario?: GeneratedTestScenario;
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
