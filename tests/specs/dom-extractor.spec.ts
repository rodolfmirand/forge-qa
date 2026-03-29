import { expect, test } from "@playwright/test";
import { PlaywrightDOMExtractor } from "../../src/core/healing/dom-extractor.js";

test("dom extractor keeps visible interactive elements with useful metadata", async ({ page }) => {
  await page.setContent(`
    <button id="primary-action">  Entrar agora  </button>
    <input type="email" name="email" placeholder="  Seu email corporativo  " />
    <a href="/dashboard" aria-label="Abrir dashboard">Painel principal</a>
    <div role="button" data-testid="open-modal">Abrir modal</div>
  `);

  const extractor = new PlaywrightDOMExtractor(page);
  const snapshot = JSON.parse(await extractor.extract()) as Array<Record<string, string>>;

  expect(snapshot).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        tag: "button",
        id: "primary-action",
        text: "Entrar agora"
      }),
      expect.objectContaining({
        tag: "input",
        name: "email",
        placeholder: "Seu email corporativo"
      }),
      expect.objectContaining({
        tag: "a",
        text: "Painel principal",
        ariaLabel: "Abrir dashboard"
      }),
      expect.objectContaining({
        role: "button",
        testId: "open-modal"
      })
    ])
  );
});

test("dom extractor ignores hidden or metadata-free noise", async ({ page }) => {
  await page.setContent(`
    <button id="visible-button">Salvar</button>
    <button id="hidden-button" style="display:none">Oculto</button>
    <a href="/hidden" aria-hidden="true">Invisivel</a>
    <textarea></textarea>
  `);

  const extractor = new PlaywrightDOMExtractor(page);
  const snapshot = JSON.parse(await extractor.extract()) as Array<Record<string, string>>;
  const ids = snapshot.map((element) => element.id).filter(Boolean);

  expect(ids).toContain("visible-button");
  expect(ids).not.toContain("hidden-button");
  expect(snapshot.some((element) => element.href === "http://127.0.0.1:3000/hidden")).toBeFalsy();
  expect(snapshot.some((element) => element.tag === "textarea")).toBeFalsy();
});
