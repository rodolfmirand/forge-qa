import { expect, test } from "@playwright/test";

test("bootstrap playwright smoke test", async ({ page }) => {
  await page.setContent(`
    <main>
      <h1>Forge QA</h1>
      <button id="run-smoke">Run smoke</button>
    </main>
  `);

  await page.getByRole("button", { name: "Run smoke" }).click();

  await expect(page.getByRole("heading", { name: "Forge QA" })).toBeVisible();
});
