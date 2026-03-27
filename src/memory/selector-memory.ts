export interface SelectorMemory {
  find(selector: string): Promise<string | null>;
  save(originalSelector: string, healedSelector: string): Promise<void>;
}

export class InMemorySelectorMemory implements SelectorMemory {
  private readonly selectors = new Map<string, string>();

  async find(selector: string): Promise<string | null> {
    return this.selectors.get(selector) ?? null;
  }

  async save(originalSelector: string, healedSelector: string): Promise<void> {
    this.selectors.set(originalSelector, healedSelector);
  }
}
