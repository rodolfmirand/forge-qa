import type { Page } from "@playwright/test";

export interface ExtractedElement {
  tag: string;
  id?: string;
  name?: string;
  role?: string;
  type?: string;
  text?: string;
  placeholder?: string;
  testId?: string;
}

export interface DOMExtractor {
  extract(): Promise<string>;
}

export class PlaywrightDOMExtractor implements DOMExtractor {
  constructor(private readonly page: Page) {}

  async extract(): Promise<string> {
    const elements = await this.page.evaluate(() => {
      const selector = [
        "button",
        "a[href]",
        "input",
        "select",
        "textarea",
        "[role='button']",
        "[data-testid]"
      ].join(",");

      return Array.from(document.querySelectorAll(selector)).map((element) => {
        const htmlElement = element as HTMLElement;
        const inputElement = element as HTMLInputElement;

        return {
          tag: element.tagName.toLowerCase(),
          id: htmlElement.id || undefined,
          name: htmlElement.getAttribute("name") || undefined,
          role: htmlElement.getAttribute("role") || undefined,
          type: inputElement.type || undefined,
          text: htmlElement.innerText?.trim() || undefined,
          placeholder: inputElement.placeholder || undefined,
          testId: htmlElement.getAttribute("data-testid") || undefined
        };
      });
    });

    return JSON.stringify(elements);
  }
}
