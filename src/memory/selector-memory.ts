import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ActionKind } from "../core/actions/action.types.js";

export interface SelectorMemoryContext {
  actionKind?: ActionKind;
  actionDescription?: string;
}

export interface SelectorMemoryEntry {
  healedSelector: string;
  actionKind?: ActionKind;
  actionDescription?: string;
  successCount: number;
  lastUsedAt: string;
}

interface PersistedSelectorMemoryV2 {
  version: 2;
  entries: Record<string, SelectorMemoryEntry[]>;
}

export interface SelectorMemory {
  find(selector: string, context?: SelectorMemoryContext): Promise<string | null>;
  save(
    originalSelector: string,
    healedSelector: string,
    context?: SelectorMemoryContext
  ): Promise<void>;
}

function tokenize(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

function scoreEntry(entry: SelectorMemoryEntry, context?: SelectorMemoryContext): number {
  let score = entry.successCount;

  if (!context) {
    return score;
  }

  if (context.actionKind && entry.actionKind === context.actionKind) {
    score += 50;
  }

  const requestedTokens = tokenize(context.actionDescription);
  const storedTokens = new Set(tokenize(entry.actionDescription));
  score += requestedTokens.reduce(
    (total, token) => (storedTokens.has(token) ? total + 5 : total),
    0
  );

  return score;
}

function compareEntries(
  left: SelectorMemoryEntry,
  right: SelectorMemoryEntry,
  context?: SelectorMemoryContext
): number {
  const scoreDifference = scoreEntry(right, context) - scoreEntry(left, context);

  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  return right.lastUsedAt.localeCompare(left.lastUsedAt);
}

function isActionKind(value: unknown): value is ActionKind {
  return (
    value === "click" ||
    value === "fill" ||
    value === "select" ||
    value === "check" ||
    value === "press"
  );
}

function isSelectorMemoryEntry(value: unknown): value is SelectorMemoryEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.healedSelector === "string" &&
    candidate.healedSelector.length > 0 &&
    typeof candidate.successCount === "number" &&
    candidate.successCount > 0 &&
    typeof candidate.lastUsedAt === "string" &&
    (!candidate.actionKind || isActionKind(candidate.actionKind)) &&
    (!candidate.actionDescription || typeof candidate.actionDescription === "string")
  );
}

function isPersistedSelectorMemoryV2(value: unknown): value is PersistedSelectorMemoryV2 {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.version === 2 &&
    candidate.entries !== null &&
    typeof candidate.entries === "object" &&
    !Array.isArray(candidate.entries)
  );
}

export class InMemorySelectorMemory implements SelectorMemory {
  protected readonly selectors = new Map<string, SelectorMemoryEntry[]>();

  constructor(initialSelectors?: Record<string, string>) {
    if (!initialSelectors) {
      return;
    }

    for (const [originalSelector, healedSelector] of Object.entries(initialSelectors)) {
      this.selectors.set(originalSelector, [
        {
          healedSelector,
          successCount: 1,
          lastUsedAt: new Date(0).toISOString()
        }
      ]);
    }
  }

  async find(selector: string, context?: SelectorMemoryContext): Promise<string | null> {
    const entries = this.selectors.get(selector);

    if (!entries?.length) {
      return null;
    }

    const [bestMatch] = [...entries].sort((left, right) => compareEntries(left, right, context));
    return bestMatch?.healedSelector ?? null;
  }

  async save(
    originalSelector: string,
    healedSelector: string,
    context?: SelectorMemoryContext
  ): Promise<void> {
    const now = new Date().toISOString();
    const entries = this.selectors.get(originalSelector) ?? [];
    const existingEntry = entries.find(
      (entry) =>
        entry.healedSelector === healedSelector &&
        entry.actionKind === context?.actionKind &&
        entry.actionDescription === context?.actionDescription
    );

    if (existingEntry) {
      existingEntry.successCount += 1;
      existingEntry.lastUsedAt = now;
    } else {
      entries.push({
        healedSelector,
        ...(context?.actionKind ? { actionKind: context.actionKind } : {}),
        ...(context?.actionDescription ? { actionDescription: context.actionDescription } : {}),
        successCount: 1,
        lastUsedAt: now
      });
    }

    entries.sort((left, right) => compareEntries(left, right, context));
    this.selectors.set(originalSelector, entries);
  }

  getEntries(selector: string): SelectorMemoryEntry[] {
    return [...(this.selectors.get(selector) ?? [])];
  }

  toJSON(): PersistedSelectorMemoryV2 {
    return {
      version: 2,
      entries: Object.fromEntries(this.selectors.entries())
    };
  }
}

export class FileSelectorMemory extends InMemorySelectorMemory {
  private loaded = false;

  constructor(private readonly filePath: string) {
    super();
  }

  override async find(selector: string, context?: SelectorMemoryContext): Promise<string | null> {
    await this.load();
    return super.find(selector, context);
  }

  override async save(
    originalSelector: string,
    healedSelector: string,
    context?: SelectorMemoryContext
  ): Promise<void> {
    await this.load();
    await super.save(originalSelector, healedSelector, context);
    await this.persist();
  }

  private async load(): Promise<void> {
    if (this.loaded) {
      return;
    }

    this.loaded = true;

    try {
      const content = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(content) as unknown;

      if (isPersistedSelectorMemoryV2(parsed)) {
        for (const [originalSelector, entries] of Object.entries(parsed.entries)) {
          const validEntries = entries.filter(isSelectorMemoryEntry);

          if (validEntries.length > 0) {
            this.selectors.set(originalSelector, validEntries);
          }
        }

        return;
      }

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return;
      }

      for (const [originalSelector, healedSelector] of Object.entries(
        parsed as Record<string, unknown>
      )) {
        if (typeof healedSelector === "string") {
          this.selectors.set(originalSelector, [
            {
              healedSelector,
              successCount: 1,
              lastUsedAt: new Date(0).toISOString()
            }
          ]);
        }
      }
    } catch (error) {
      const candidate = error as NodeJS.ErrnoException;

      if (candidate.code !== "ENOENT") {
        throw error;
      }
    }
  }

  private async persist(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(this.toJSON(), null, 2), "utf8");
  }
}

export function resolveSelectorMemoryPath(rawPath?: string): string {
  const configuredPath =
    rawPath?.trim() || process.env.FORGEQA_SELECTOR_MEMORY_PATH || "storage/selectors.json";

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);
}
