export interface ExecutionSummary {
  totalTests: number;
  healedActions: number;
  failedActions: number;
}

export function createEmptyExecutionSummary(): ExecutionSummary {
  return {
    totalTests: 0,
    healedActions: 0,
    failedActions: 0
  };
}
