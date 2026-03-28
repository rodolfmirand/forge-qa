import type { Locator, Page } from "@playwright/test";
import type { ActionIntent } from "../../core/actions/action.types.js";

const ACTION_TIMEOUT_MS = 2_000;

export interface PlaywrightActionRunner {
  run(intent: ActionIntent): Promise<void>;
  validate(intent: ActionIntent): Promise<void>;
}

async function assertSupportedElement(intent: ActionIntent, locator: Locator): Promise<void> {
  const elementInfo = await locator.evaluate((element) => ({
    tagName: element.tagName.toLowerCase(),
    role: element.getAttribute("role"),
    type: element.getAttribute("type"),
    isContentEditable: element instanceof HTMLElement ? element.isContentEditable : false
  }));

  switch (intent.kind) {
    case "fill": {
      const isTextInput =
        elementInfo.tagName === "textarea" ||
        elementInfo.tagName === "input" ||
        elementInfo.isContentEditable;

      if (!isTextInput) {
        throw new Error(
          `Recovered selector is not suitable for fill: ${intent.selector} (${elementInfo.tagName}).`
        );
      }
      return;
    }
    case "select": {
      if (elementInfo.tagName !== "select") {
        throw new Error(
          `Recovered selector is not suitable for select: ${intent.selector} (${elementInfo.tagName}).`
        );
      }
      return;
    }
    case "press": {
      const isPressable =
        elementInfo.tagName === "input" ||
        elementInfo.tagName === "textarea" ||
        elementInfo.isContentEditable;

      if (!isPressable) {
        throw new Error(
          `Recovered selector is not suitable for press: ${intent.selector} (${elementInfo.tagName}).`
        );
      }
      return;
    }
    case "click":
      return;
    default: {
      const exhaustiveCheck: never = intent.kind;
      throw new Error(`Unsupported action kind: ${exhaustiveCheck}`);
    }
  }
}

export class PlaywrightPageActionRunner implements PlaywrightActionRunner {
  constructor(private readonly page: Page) {}

  async validate(intent: ActionIntent): Promise<void> {
    const locator = this.page.locator(intent.selector).first();

    await locator.waitFor({ state: "visible", timeout: ACTION_TIMEOUT_MS });
    await assertSupportedElement(intent, locator);
  }

  async run(intent: ActionIntent): Promise<void> {
    const locator = this.page.locator(intent.selector).first();

    switch (intent.kind) {
      case "click": {
        if (!intent.waitForNavigation) {
          await locator.click({ timeout: ACTION_TIMEOUT_MS });
          return;
        }

        const currentUrl = this.page.url();
        await Promise.all([
          this.page.waitForURL((url) => url.toString() !== currentUrl, {
            timeout: ACTION_TIMEOUT_MS
          }),
          locator.click({ timeout: ACTION_TIMEOUT_MS })
        ]);
        return;
      }
      case "fill": {
        if (!intent.value) {
          throw new Error(`Fill action is missing a value: ${intent.description}`);
        }

        await locator.fill(intent.value, { timeout: ACTION_TIMEOUT_MS });
        return;
      }
      case "select": {
        if (!intent.value) {
          throw new Error(`Select action is missing a value: ${intent.description}`);
        }

        await locator.selectOption(intent.value, { timeout: ACTION_TIMEOUT_MS });
        return;
      }
      case "press": {
        if (!intent.key) {
          throw new Error(`Press action is missing a key: ${intent.description}`);
        }

        await locator.press(intent.key, { timeout: ACTION_TIMEOUT_MS });
        return;
      }
      default: {
        const exhaustiveCheck: never = intent.kind;
        throw new Error(`Unsupported action kind: ${exhaustiveCheck}`);
      }
    }
  }
}

export class StubPlaywrightActionRunner implements PlaywrightActionRunner {
  async validate(intent: ActionIntent): Promise<void> {
    void intent;
  }

  async run(intent: ActionIntent): Promise<void> {
    void intent;
  }
}
