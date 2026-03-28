import { expect, test } from "@playwright/test";
import { TemplateTestGenerator } from "../../src/core/generation/test-generator.js";

test("generator parses login credentials from flow text", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "Login flow",
    sourceType: "text",
    content:
      "Abra a pagina e faca login usando as credenciais:\n- email: edoc@gmail.com\n- senha: abc123",
    targetUrl: "https://example.com/login"
  });

  const emailStep = scenario.steps.find(
    (step) => step.kind === "fill" && step.description.includes("email")
  );
  const passwordStep = scenario.steps.find(
    (step) => step.kind === "fill" && step.description.includes("password")
  );
  const clickStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("authentication form")
  );

  expect(emailStep?.value).toBe("edoc@gmail.com");
  expect(passwordStep?.value).toBe("abc123");
  expect(clickStep?.fallbackSelectors?.length).toBeGreaterThan(0);
});

test("generator inserts entry discovery when the target URL is not a login page", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "Portal login flow",
    sourceType: "text",
    content:
      "Acesse o site, faca login com as credenciais abaixo e valide que o usuario chegou ao Dashboard:\n- email: edoc@gmail.com\n- senha: abc123",
    targetUrl: "https://example.com"
  });

  const entryStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("authentication entry point")
  );
  const assertTextStep = scenario.steps.find((step) => step.kind === "assertText");

  expect(entryStep).toBeDefined();
  expect(entryStep?.waitForNavigation).toBeTruthy();
  expect(entryStep?.fallbackSelectors).toContain('button:has-text("Entrar")');
  expect(assertTextStep?.text).toBe("Dashboard");
});
