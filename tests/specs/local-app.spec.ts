import { rm } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { createLocalServer, type LocalServerInstance } from "../../src/app/api/local-server.js";

test.describe("local app", () => {
  let server: LocalServerInstance;
  let previousSelectorMemoryPath: string | undefined;
  let previousArtifactsPath: string | undefined;
  let previousAiMode: string | undefined;
  const selectorMemoryPath = path.resolve(
    process.cwd(),
    "storage",
    "selectors.local-app.spec.json"
  );
  const artifactsPath = path.resolve(process.cwd(), "storage", "artifacts.local-app.spec");

  test.beforeAll(async () => {
    previousSelectorMemoryPath = process.env.FORGEQA_SELECTOR_MEMORY_PATH;
    previousArtifactsPath = process.env.FORGEQA_ARTIFACTS_PATH;
    previousAiMode = process.env.FORGEQA_AI_MODE;

    await rm(selectorMemoryPath, { force: true });
    await rm(artifactsPath, { force: true, recursive: true });

    process.env.FORGEQA_SELECTOR_MEMORY_PATH = selectorMemoryPath;
    process.env.FORGEQA_ARTIFACTS_PATH = artifactsPath;
    process.env.FORGEQA_AI_MODE = "mock";

    server = createLocalServer(0);
    await server.start();
  });

  test.afterAll(async () => {
    await server.stop();

    if (previousSelectorMemoryPath) {
      process.env.FORGEQA_SELECTOR_MEMORY_PATH = previousSelectorMemoryPath;
    } else {
      delete process.env.FORGEQA_SELECTOR_MEMORY_PATH;
    }

    if (previousArtifactsPath) {
      process.env.FORGEQA_ARTIFACTS_PATH = previousArtifactsPath;
    } else {
      delete process.env.FORGEQA_ARTIFACTS_PATH;
    }

    if (previousAiMode) {
      process.env.FORGEQA_AI_MODE = previousAiMode;
    } else {
      delete process.env.FORGEQA_AI_MODE;
    }
  });

  test("api can run an execution with extensible options and report completion", async ({
    request
  }) => {
    const createResponse = await request.post(`${server.origin}/api/executions`, {
      data: {
        url: "/fixtures/login-flow",
        flow: "Abra a pagina e faca login usando as credenciais:\n- email: edoc@gmail.com\n- senha: abc123",
        metadata: {
          requestedBy: "integration-test",
          labels: ["smoke", "api"]
        },
        options: {
          maxHealingAttempts: 5,
          evidence: {
            captureScreenshotOnSuccess: true,
            captureScreenshotOnFailure: true
          }
        }
      }
    });

    expect(createResponse.status()).toBe(202);
    const created = (await createResponse.json()) as {
      id: string;
      request: {
        flow?: string;
        metadata?: { requestedBy?: string };
        options?: { maxHealingAttempts?: number };
      };
    };

    expect(created.request.flow).toContain("email: [REDACTED]");
    expect(created.request.flow).toContain("senha: [REDACTED]");
    expect(created.request.metadata?.requestedBy).toBe("integration-test");
    expect(created.request.options?.maxHealingAttempts).toBe(5);

    await expect
      .poll(async () => {
        const statusResponse = await request.get(`${server.origin}/api/executions/${created.id}`);
        const record = (await statusResponse.json()) as { status: string };
        return record.status;
      })
      .toBe("passed");
  });

  test("api can execute endpoint source payload without textual flow", async ({ request }) => {
    const createResponse = await request.post(`${server.origin}/api/executions`, {
      data: {
        url: "/fixtures/user-crud",
        sourceType: "endpoint",
        sourcePayload: {
          operation: "update",
          entity: "user",
          navigationPath: ["Administracao", "Usuarios"],
          targetRecord: "Carlos Mendes",
          fields: {
            cargo: "Financeiro",
            "nivel de acesso": "Editor"
          },
          expectedText: "Usuario atualizado com sucesso"
        },
        metadata: {
          requestedBy: "endpoint-test"
        }
      }
    });

    expect(createResponse.status()).toBe(202);
    const created = (await createResponse.json()) as {
      id: string;
      request: {
        sourceType?: string;
        sourcePayload?: {
          operation?: string;
          targetRecord?: string;
          fields?: { cargo?: string };
        };
      };
    };

    expect(created.request.sourceType).toBe("endpoint");
    expect(created.request.sourcePayload?.operation).toBe("update");
    expect(created.request.sourcePayload?.targetRecord).toBe("Carlos Mendes");
    expect(created.request.sourcePayload?.fields?.cargo).toBe("Financeiro");

    await expect
      .poll(
        async () => {
          const statusResponse = await request.get(`${server.origin}/api/executions/${created.id}`);
          const record = (await statusResponse.json()) as {
            status: string;
            result?: {
              summary?: { finalStatus?: string };
            };
          };
          return record.status + ":" + (record.result?.summary?.finalStatus ?? "pending");
        },
        {
          timeout: 20000
        }
      )
      .toBe("passed:passed");
  });

  test("web panel can trigger an execution and display plan, summary and artifacts", async ({
    page
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(server.origin);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Boolean((window as Window & { __forgeQaLoaded?: boolean }).__forgeQaLoaded)
        )
      )
      .toBeTruthy();
    await page.getByRole("button", { name: "Executar fluxo" }).click();

    await expect(page.locator("#execution-status")).toHaveText("passed", {
      timeout: 20000
    });
    expect(pageErrors).toEqual([]);
    await expect(page.locator("#execution-summary")).toContainText("Steps planejados:");
    await expect(page.locator("#execution-summary")).toContainText("Quality score:");
    await expect(page.locator("#execution-summary")).toContainText("Status final: passed");
    await expect(page.locator("#execution-artifacts a")).toHaveCount(1);
    await expect(page.locator("#execution-healing")).toContainText(
      "Nenhuma recuperacao registrada."
    );
    await expect(page.locator("#execution-logs")).toContainText("Planned steps:");
    await expect(page.locator("#execution-logs")).toContainText("Submit the authentication form.");
    await expect(page.locator("#execution-logs")).toContainText("Audit entries:");
    await expect(page.locator("#execution-logs")).toContainText("[REDACTED]");
  });

  test("web panel can demonstrate explicit ai healing details", async ({ page }) => {
    await rm(selectorMemoryPath, { force: true });

    await page.goto(server.origin);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Boolean((window as Window & { __forgeQaLoaded?: boolean }).__forgeQaLoaded)
        )
      )
      .toBeTruthy();

    await page.getByRole("button", { name: "Usar demo de healing" }).click();
    await expect(page.locator("#url")).toHaveValue("/fixtures/healing-login");
    await page.getByRole("button", { name: "Executar fluxo" }).click();

    await expect(page.locator("#execution-status")).toHaveText("passed", {
      timeout: 20000
    });
    await expect(page.locator("#execution-summary")).toContainText("Memory/Fallback/AI: 0/0/1");
    await expect(page.locator("#execution-healing")).toContainText("Estrategia: ai");
    await expect(page.locator("#execution-healing")).toContainText(
      'Selector original: button[type="submit"]'
    );
    await expect(page.locator("#execution-healing")).toContainText(
      "Selector recuperado: #submit-authentication-form"
    );
    await expect(page.locator("#execution-logs")).toContainText("#submit-authentication-form");
  });
});
