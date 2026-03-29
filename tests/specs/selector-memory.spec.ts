import { readFile, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { FileSelectorMemory, resolveSelectorMemoryPath } from "../../src/memory/selector-memory.js";

test("file selector memory persists healed selectors on disk with contextual entries", async ({
  page: _page
}, testInfo) => {
  void _page;

  const selectorMemoryPath = testInfo.outputPath("selectors.json");
  const memory = new FileSelectorMemory(selectorMemoryPath);

  await memory.save("#login-button", "#submit-login", {
    actionKind: "click",
    actionDescription: "Submit the authentication form."
  });

  const persistedContent = await readFile(selectorMemoryPath, "utf8");
  expect(JSON.parse(persistedContent)).toMatchObject({
    version: 2,
    entries: {
      "#login-button": [
        {
          healedSelector: "#submit-login",
          actionKind: "click",
          actionDescription: "Submit the authentication form.",
          successCount: 1
        }
      ]
    }
  });

  const reloadedMemory = new FileSelectorMemory(selectorMemoryPath);
  await expect(
    reloadedMemory.find("#login-button", {
      actionKind: "click",
      actionDescription: "Submit the authentication form."
    })
  ).resolves.toBe("#submit-login");
});

test("selector memory prefers contextual match over a generic historical entry", async ({
  page: _page
}, testInfo) => {
  void _page;

  const selectorMemoryPath = testInfo.outputPath("contextual-selectors.json");
  const memory = new FileSelectorMemory(selectorMemoryPath);

  await memory.save("#shared-selector", "#fill-fallback", {
    actionKind: "fill",
    actionDescription: "Fill the email field."
  });
  await memory.save("#shared-selector", "#click-fallback", {
    actionKind: "click",
    actionDescription: "Click the submit action."
  });

  await expect(
    memory.find("#shared-selector", {
      actionKind: "click",
      actionDescription: "Click the submit action."
    })
  ).resolves.toBe("#click-fallback");
  await expect(
    memory.find("#shared-selector", {
      actionKind: "fill",
      actionDescription: "Fill the email field."
    })
  ).resolves.toBe("#fill-fallback");
});

test("file selector memory loads legacy plain object format", async ({ page: _page }, testInfo) => {
  void _page;

  const selectorMemoryPath = testInfo.outputPath("legacy-selectors.json");
  await writeFile(
    selectorMemoryPath,
    JSON.stringify({
      "#legacy-login": "#legacy-submit"
    }),
    "utf8"
  );

  const memory = new FileSelectorMemory(selectorMemoryPath);
  await expect(memory.find("#legacy-login")).resolves.toBe("#legacy-submit");
});

test("selector memory path is resolved relative to the workspace", async () => {
  const resolvedPath = resolveSelectorMemoryPath("storage/selectors.json");

  expect(resolvedPath).toContain("storage");
  expect(resolvedPath).toContain("selectors.json");
});
