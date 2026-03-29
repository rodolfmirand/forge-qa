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
  ariaLabel?: string;
  href?: string;
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

      const normalizeText = (value?: string | null): string | undefined => {
        const normalized = value?.replace(/\s+/g, " ").trim();
        return normalized ? normalized.slice(0, 120) : undefined;
      };

      const isVisible = (element: Element): boolean => {
        const htmlElement = element as HTMLElement;
        const style = window.getComputedStyle(htmlElement);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          htmlElement.getAttribute("aria-hidden") !== "true" &&
          htmlElement.getClientRects().length > 0
        );
      };

      const elements = Array.from(document.querySelectorAll(selector))
        .filter((element) => isVisible(element))
        .map((element) => {
          const htmlElement = element as HTMLElement;
          const inputElement = element as HTMLInputElement;
          const anchorElement = element as HTMLAnchorElement;

          return {
            tag: element.tagName.toLowerCase(),
            id: htmlElement.id || undefined,
            name: htmlElement.getAttribute("name") || undefined,
            role: htmlElement.getAttribute("role") || undefined,
            type: inputElement.type || undefined,
            text: normalizeText(htmlElement.innerText || htmlElement.textContent),
            placeholder: normalizeText(inputElement.placeholder),
            testId: htmlElement.getAttribute("data-testid") || undefined,
            ariaLabel: normalizeText(htmlElement.getAttribute("aria-label")),
            href: anchorElement.href || undefined
          };
        })
        .filter(
          (element) =>
            element.id ||
            element.name ||
            element.role ||
            element.text ||
            element.placeholder ||
            element.testId ||
            element.ariaLabel ||
            element.href
        );

      const seen = new Set<string>();
      return elements.filter((element) => {
        const key = JSON.stringify(element);

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });
    });

    return JSON.stringify(elements);
  }
}
