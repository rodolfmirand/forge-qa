import OpenAI from "openai";
import { HeuristicFlowPlanner } from "../../core/generation/flow-planner.js";
import type { PlanningMode } from "../../core/generation/planning.types.js";
import type { GeneratedTestScenario, TestGenerationInput } from "../../types/generation.js";
import { parseGeneratedTestScenario } from "../resolver/ai-resolver.js";
import { buildTestGenerationPrompt } from "../prompts/test-generation.prompt.js";

export interface PlanningResolver {
  resolve(input: TestGenerationInput): Promise<GeneratedTestScenario | null>;
}

export interface PlanningEscalationDecision {
  shouldEscalate: boolean;
  reason?: string;
}

const AMBIGUOUS_PLANNING_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bajuste\b/gi, replacement: "edite" },
  { pattern: /\breconfigure\b/gi, replacement: "edite" },
  { pattern: /\brevise\b/gi, replacement: "edite" },
  { pattern: /\bapague\b/gi, replacement: "remova" },
  { pattern: /\bapagar\b/gi, replacement: "remover" },
  { pattern: /\bdesative\b/gi, replacement: "remova" }
];

export function parsePlanningScenario(content: string): GeneratedTestScenario | null {
  return parseGeneratedTestScenario(content);
}

function normalizeAmbiguousFlow(content: string): string | null {
  let normalized = content;
  let changed = false;

  for (const rule of AMBIGUOUS_PLANNING_PATTERNS) {
    if (!rule.pattern.test(normalized)) {
      continue;
    }

    normalized = normalized.replace(rule.pattern, rule.replacement);
    changed = true;
  }

  return changed ? normalized : null;
}

export function getPlanningEscalationDecision(
  input: TestGenerationInput,
  heuristicScenario: GeneratedTestScenario
): PlanningEscalationDecision {
  const normalizedContent = normalizeAmbiguousFlow(input.content);

  if (normalizedContent) {
    return {
      shouldEscalate: true,
      reason: "ambiguous-crud-language"
    };
  }

  if (heuristicScenario.steps.length <= 1) {
    return {
      shouldEscalate: true,
      reason: "insufficient-heuristic-coverage"
    };
  }

  return {
    shouldEscalate: false
  };
}

export class MockAIPlanningResolver implements PlanningResolver {
  private readonly planner = new HeuristicFlowPlanner();

  async resolve(input: TestGenerationInput): Promise<GeneratedTestScenario | null> {
    const normalizedContent = normalizeAmbiguousFlow(input.content);

    if (!normalizedContent) {
      return null;
    }

    return this.planner.plan({
      ...input,
      content: normalizedContent
    });
  }
}

export class OpenAIPlanningResolver implements PlanningResolver {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string = "gpt-4o-mini"
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async resolve(input: TestGenerationInput): Promise<GeneratedTestScenario | null> {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        {
          role: "system",
          content: buildTestGenerationPrompt()
        },
        {
          role: "user",
          content: JSON.stringify(input)
        }
      ]
    });

    return parsePlanningScenario(response.output_text);
  }
}

export function resolvePlanningMode(mode?: PlanningMode): PlanningMode {
  if (mode) {
    return mode;
  }

  const configured = process.env.FORGEQA_PLANNING_MODE;

  if (configured === "heuristic" || configured === "hybrid" || configured === "ai") {
    return configured;
  }

  return process.env.FORGEQA_AI_MODE === "openai" && process.env.OPENAI_API_KEY
    ? "hybrid"
    : "heuristic";
}

export function createPlanningResolverFromEnv(): PlanningResolver {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (process.env.FORGEQA_AI_MODE === "openai" && apiKey) {
    return new OpenAIPlanningResolver(apiKey, model);
  }

  return new MockAIPlanningResolver();
}
