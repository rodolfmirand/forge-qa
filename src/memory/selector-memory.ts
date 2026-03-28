import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface SelectorMemory {
  find(selector: string): Promise<string | null>;
  save(originalSelector: string, healedSelector: string): Promise<void>;
}

export class InMemorySelectorMemory implements SelectorMemory {
  protected readonly selectors = new Map<string, string>();

  constructor(initialSelectors?: Record<string, string>) {
    if (!initialSelectors) {
      return;
    }

    for (const [originalSelector, healedSelector] of Object.entries(initialSelectors)) {
      this.selectors.set(originalSelector, healedSelector);
    }
  }

  async find(selector: string): Promise<string | null> {
    return this.selectors.get(selector) ?? null;
  }

  async save(originalSelector: string, healedSelector: string): Promise<void> {
    this.selectors.set(originalSelector, healedSelector);
  }

  toJSON(): Record<string, string> {
    return Object.fromEntries(this.selectors.entries());
  }
}

export class FileSelectorMemory extends InMemorySelectorMemory {
  private loaded = false;

  constructor(private readonly filePath: string) {
    super();
  }

  override async find(selector: string): Promise<string | null> {
    await this.load();
    return super.find(selector);
  }

  override async save(originalSelector: string, healedSelector: string): Promise<void> {
    await this.load();
    await super.save(originalSelector, healedSelector);
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

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return;
      }

      for (const [originalSelector, healedSelector] of Object.entries(
        parsed as Record<string, unknown>
      )) {
        if (typeof healedSelector === "string") {
          this.selectors.set(originalSelector, healedSelector);
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
