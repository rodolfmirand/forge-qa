import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { FileSelectorMemory, resolveSelectorMemoryPath } from "../../src/memory/selector-memory.js";

test("file selector memory persists healed selectors on disk", async ({
  page: _page
}, testInfo) => {
  void _page;

  const selectorMemoryPath = testInfo.outputPath("selectors.json");
  const memory = new FileSelectorMemory(selectorMemoryPath);

  await memory.save("#login-button", "#submit-login");

  const persistedContent = await readFile(selectorMemoryPath, "utf8");
  expect(JSON.parse(persistedContent)).toEqual({
    "#login-button": "#submit-login"
  });

  const reloadedMemory = new FileSelectorMemory(selectorMemoryPath);
  await expect(reloadedMemory.find("#login-button")).resolves.toBe("#submit-login");
});

test("selector memory path is resolved relative to the workspace", async () => {
  const resolvedPath = resolveSelectorMemoryPath("storage/selectors.json");

  expect(resolvedPath).toContain("storage");
  expect(resolvedPath).toContain("selectors.json");
});
