import type { ActionIntent } from "../../core/actions/action.types.js";

export interface PlaywrightActionRunner {
  run(intent: ActionIntent): Promise<void>;
}

export class StubPlaywrightActionRunner implements PlaywrightActionRunner {
  async run(intent: ActionIntent): Promise<void> {
    void intent;
  }
}
