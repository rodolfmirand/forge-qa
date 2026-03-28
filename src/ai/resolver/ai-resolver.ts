import OpenAI from "openai";
import type { GeneratedTestScenario, GeneratedTestStep } from "../../types/generation.js";
import type { HealingContext, HealingSuggestion } from "../../types/healing.js";
import { buildSelectorHealingPrompt } from "../prompts/selector-healing.prompt.js";

interface SnapshotElement {
  tag: string;
  id?: string;
  name?: string;
  role?: string;
  type?: string;
  text?: string;
  placeholder?: string;
  testId?: string;
}

export interface AIResolver {
  resolve(context: HealingContext): Promise<HealingSuggestion | null>;
}

export function isHealingSuggestion(value: unknown): value is HealingSuggestion {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.selector === "string" &&
    candidate.selector.length > 0 &&
    typeof candidate.confidence === "number" &&
    candidate.confidence >= 0 &&
    candidate.confidence <= 1 &&
    typeof candidate.rationale === "string" &&
    candidate.rationale.length > 0
  );
}

function isGeneratedTestStep(value: unknown): value is GeneratedTestStep {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const allowedKinds = new Set([
    "navigate",
    "click",
    "fill",
    "press",
    "waitForNavigation",
    "assertText",
    "assertUrl"
  ]);

  return (
    typeof candidate.kind === "string" &&
    allowedKinds.has(candidate.kind) &&
    typeof candidate.description === "string"
  );
}

export function isGeneratedTestScenario(value: unknown): value is GeneratedTestScenario {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const allowedSources = new Set(["text", "endpoint", "interface"]);

  return (
    typeof candidate.title === "string" &&
    typeof candidate.sourceType === "string" &&
    allowedSources.has(candidate.sourceType) &&
    Array.isArray(candidate.preconditions) &&
    candidate.preconditions.every((item) => typeof item === "string") &&
    Array.isArray(candidate.steps) &&
    candidate.steps.every((item) => isGeneratedTestStep(item))
  );
}

function parseHealingSuggestion(content: string): HealingSuggestion | null {
  try {
    const parsed = JSON.parse(content) as unknown;
    return isHealingSuggestion(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

function buildCandidateSelector(element: SnapshotElement): string | null {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.testId) {
    return `[data-testid="${element.testId}"]`;
  }

  if (element.name) {
    return `[name="${element.name}"]`;
  }

  return null;
}

function scoreElement(element: SnapshotElement, context: HealingContext): number {
  const haystack = [
    element.id,
    element.name,
    element.role,
    element.type,
    element.text,
    element.placeholder,
    element.testId
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const needles = tokenize(`${context.originalSelector} ${context.actionDescription}`);

  return needles.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

export class MockAIResolver implements AIResolver {
  async resolve(context: HealingContext): Promise<HealingSuggestion | null> {
    void buildSelectorHealingPrompt();

    let elements: SnapshotElement[] = [];

    try {
      elements = JSON.parse(context.domSnapshot) as SnapshotElement[];
    } catch {
      return null;
    }

    const bestMatch = elements
      .map((element) => ({
        element,
        score: scoreElement(element, context),
        selector: buildCandidateSelector(element)
      }))
      .filter((candidate) => candidate.selector)
      .sort((left, right) => right.score - left.score)[0];

    if (!bestMatch || bestMatch.score <= 0 || !bestMatch.selector) {
      return null;
    }

    const payload = JSON.stringify({
      selector: bestMatch.selector,
      confidence: Math.min(0.99, 0.5 + bestMatch.score * 0.1),
      rationale: `Selected candidate based on DOM token overlap for ${context.actionDescription}.`
    });

    return parseHealingSuggestion(payload);
  }
}

export class OpenAIHealingResolver implements AIResolver {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string = "gpt-4o-mini"
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async resolve(context: HealingContext): Promise<HealingSuggestion | null> {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        {
          role: "system",
          content: buildSelectorHealingPrompt()
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ]
    });

    return parseHealingSuggestion(response.output_text);
  }
}

export function createAIResolverFromEnv(): AIResolver {
  const apiKey = process.env.OPENAI_API_KEY;
  const mode = process.env.FORGEQA_AI_MODE ?? (apiKey ? "openai" : "mock");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (mode === "openai" && apiKey) {
    return new OpenAIHealingResolver(apiKey, model);
  }

  return new MockAIResolver();
}
