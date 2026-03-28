import type { GeneratedTestScenario, TestGenerationInput } from "../../types/generation.js";
import type { AuditLogger } from "../reporting/audit-log.js";
import { NoopAuditLogger } from "../reporting/audit-log.js";
import { HeuristicFlowPlanner } from "./flow-planner.js";

export interface TestGenerator {
  generate(input: TestGenerationInput): Promise<GeneratedTestScenario>;
}

export class TemplateTestGenerator implements TestGenerator {
  private readonly planner = new HeuristicFlowPlanner();

  constructor(private readonly auditLogger: AuditLogger = new NoopAuditLogger()) {}

  async generate(input: TestGenerationInput): Promise<GeneratedTestScenario> {
    const scenario = this.planner.plan(input);

    await this.auditLogger.log("generation", {
      input,
      scenario
    });

    return scenario;
  }
}
