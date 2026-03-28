import { expect, test } from "@playwright/test";
import type { AIResolver } from "../../src/ai/resolver/ai-resolver.js";
import type { ActionIntent } from "../../src/core/actions/action.types.js";
import type { DOMExtractor } from "../../src/core/healing/dom-extractor.js";
import { Healer } from "../../src/core/healing/healer.js";
import { InMemoryAuditLogger } from "../../src/core/reporting/audit-log.js";
import type { PlaywrightActionRunner } from "../../src/integrations/playwright/playwright-action-runner.js";
import { InMemorySelectorMemory } from "../../src/memory/selector-memory.js";
import type { HealingContext, HealingSuggestion } from "../../src/types/healing.js";

class StubAIResolver implements AIResolver {
  constructor(private readonly suggestion: HealingSuggestion | null = null) {}

  async resolve(context: HealingContext): Promise<HealingSuggestion | null> {
    void context;
    return this.suggestion;
  }
}

class StubDOMExtractor implements DOMExtractor {
  async extract(): Promise<string> {
    return JSON.stringify([]);
  }
}

class StubActionRunner implements PlaywrightActionRunner {
  readonly validateCalls: string[] = [];
  readonly runCalls: string[] = [];

  constructor(
    private readonly validateBySelector: Record<string, Error | null>,
    private readonly runBySelector: Record<string, Error | null>
  ) {}

  async validate(intent: ActionIntent): Promise<void> {
    this.validateCalls.push(intent.selector);
    const candidateError = this.validateBySelector[intent.selector];

    if (candidateError) {
      throw candidateError;
    }
  }

  async run(intent: ActionIntent): Promise<void> {
    this.runCalls.push(intent.selector);
    const candidateError = this.runBySelector[intent.selector];

    if (candidateError) {
      throw candidateError;
    }
  }
}

test("healer skips unsuitable fallback selectors and saves the successful recovery", async () => {
  const auditLogger = new InMemoryAuditLogger();
  const selectorMemory = new InMemorySelectorMemory();
  const actionRunner = new StubActionRunner(
    {
      "#bad-fallback": new Error(
        "Recovered selector is not suitable for fill: #bad-fallback (button)."
      ),
      "#good-fallback": null
    },
    {
      "#missing": new Error("locator.fill: Timeout 2000ms exceeded."),
      "#good-fallback": null
    }
  );
  const healer = new Healer({
    actionRunner,
    aiResolver: new StubAIResolver(),
    selectorMemory,
    domExtractor: new StubDOMExtractor(),
    auditLogger
  });

  await healer.execute({
    kind: "fill",
    selector: "#missing",
    description: "Fill the email field.",
    value: "user@example.com",
    fallbackSelectors: ["#bad-fallback", "#good-fallback"]
  });

  expect(actionRunner.runCalls).toEqual(["#missing", "#good-fallback"]);
  expect(actionRunner.validateCalls).toEqual(["#bad-fallback", "#good-fallback"]);
  await expect(selectorMemory.find("#missing")).resolves.toBe("#good-fallback");
  expect(
    auditLogger.getEntries().some((entry) => {
      if (entry.type !== "healing" || !entry.payload || typeof entry.payload !== "object") {
        return false;
      }

      const payload = entry.payload as Record<string, unknown>;
      return payload.recoveredSelector === "#good-fallback";
    })
  ).toBeTruthy();
});

test("healer enforces an explicit recovery attempt limit", async () => {
  const actionRunner = new StubActionRunner(
    {
      "#first-fallback": null,
      "#second-fallback": null
    },
    {
      "#missing": new Error("locator.click: Timeout 2000ms exceeded."),
      "#first-fallback": new Error("locator.click: Timeout 2000ms exceeded."),
      "#second-fallback": new Error("locator.click: Timeout 2000ms exceeded.")
    }
  );
  const healer = new Healer({
    actionRunner,
    aiResolver: new StubAIResolver(),
    selectorMemory: new InMemorySelectorMemory(),
    domExtractor: new StubDOMExtractor(),
    maxRecoveryAttempts: 2
  });

  await expect(
    healer.execute({
      kind: "click",
      selector: "#missing",
      description: "Click the submit action.",
      fallbackSelectors: ["#first-fallback", "#second-fallback"]
    })
  ).rejects.toThrow("Healing attempt limit exceeded");

  expect(actionRunner.runCalls).toEqual(["#missing", "#first-fallback"]);
});
