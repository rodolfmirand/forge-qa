import {
  createPlanningResolverFromEnv,
  getPlanningEscalationDecision,
  type PlanningResolver,
  resolvePlanningMode
} from "../../ai/planning/planning-resolver.js";
import type { GeneratedTestScenario, TestGenerationInput } from "../../types/generation.js";
import type { PlanningMode } from "./planning.types.js";
import type { AuditLogger } from "../reporting/audit-log.js";
import { NoopAuditLogger } from "../reporting/audit-log.js";
import { HeuristicFlowPlanner } from "./flow-planner.js";
import { normalizeGenerationInput } from "./source-input.js";

export interface TestGenerator {
  generate(input: TestGenerationInput): Promise<GeneratedTestScenario>;
}

export interface TestGeneratorOptions {
  planningMode?: PlanningMode;
  planningResolver?: PlanningResolver;
}

export class TemplateTestGenerator implements TestGenerator {
  private readonly planner = new HeuristicFlowPlanner();
  private readonly planningResolver: PlanningResolver;
  private readonly planningMode: PlanningMode | undefined;

  constructor(
    private readonly auditLogger: AuditLogger = new NoopAuditLogger(),
    options: TestGeneratorOptions = {}
  ) {
    this.planningResolver = options.planningResolver ?? createPlanningResolverFromEnv();
    this.planningMode = options.planningMode;
  }

  async generate(input: TestGenerationInput): Promise<GeneratedTestScenario> {
    const normalizedInput = normalizeGenerationInput(input);
    const planningMode = resolvePlanningMode(this.planningMode);
    const heuristicScenario = this.planner.plan(normalizedInput);
    const escalation = getPlanningEscalationDecision(normalizedInput, heuristicScenario);
    let scenario = heuristicScenario;
    let strategy: "heuristic" | "ai" | "heuristic-fallback" = "heuristic";

    if (planningMode === "ai" || (planningMode === "hybrid" && escalation.shouldEscalate)) {
      const aiScenario = await this.planningResolver.resolve(normalizedInput);

      if (aiScenario) {
        scenario = aiScenario;
        strategy = "ai";
      } else {
        strategy = "heuristic-fallback";
      }
    }

    await this.auditLogger.log("generation", {
      input,
      normalizedInput,
      scenario,
      planning: {
        mode: planningMode,
        strategy,
        heuristicSteps: heuristicScenario.steps.length,
        ...(escalation.reason ? { escalationReason: escalation.reason } : {})
      }
    });

    return scenario;
  }
}
