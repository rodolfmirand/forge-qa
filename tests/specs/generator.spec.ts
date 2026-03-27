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
  const clickStep = scenario.steps.find((step) => step.kind === "click");

  expect(emailStep?.value).toBe("edoc@gmail.com");
  expect(passwordStep?.value).toBe("abc123");
  expect(clickStep?.fallbackSelectors?.length).toBeGreaterThan(0);
});
