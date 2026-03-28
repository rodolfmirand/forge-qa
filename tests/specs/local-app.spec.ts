import path from "node:path";
import { expect, test } from "@playwright/test";
import { createLocalServer, type LocalServerInstance } from "../../src/app/api/local-server.js";

test.describe("local app", () => {
  let server: LocalServerInstance;
  let previousSelectorMemoryPath: string | undefined;
  let previousArtifactsPath: string | undefined;
  const selectorMemoryPath = path.resolve(
    process.cwd(),
    "storage",
    "selectors.local-app.spec.json"
  );
  const artifactsPath = path.resolve(process.cwd(), "storage", "artifacts.local-app.spec");

  test.beforeAll(async () => {
    previousSelectorMemoryPath = process.env.FORGEQA_SELECTOR_MEMORY_PATH;
    previousArtifactsPath = process.env.FORGEQA_ARTIFACTS_PATH;
    process.env.FORGEQA_SELECTOR_MEMORY_PATH = selectorMemoryPath;
    process.env.FORGEQA_ARTIFACTS_PATH = artifactsPath;

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
        flow: string;
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
    await expect(page.locator("#execution-logs")).toContainText("Planned steps:");
    await expect(page.locator("#execution-logs")).toContainText("Submit the authentication form.");
    await expect(page.locator("#execution-logs")).toContainText("Audit entries:");
    await expect(page.locator("#execution-logs")).toContainText("[REDACTED]");
  });
});
