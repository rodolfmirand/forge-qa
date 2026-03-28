import type { Page } from "@playwright/test";
import type { ActionIntent } from "../../core/actions/action.types.js";

const ACTION_TIMEOUT_MS = 2_000;

export interface PlaywrightActionRunner {
  run(intent: ActionIntent): Promise<void>;
}

export class PlaywrightPageActionRunner implements PlaywrightActionRunner {
  constructor(private readonly page: Page) {}

  async run(intent: ActionIntent): Promise<void> {
    const locator = this.page.locator(intent.selector);

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
  async run(intent: ActionIntent): Promise<void> {
    void intent;
  }
}
