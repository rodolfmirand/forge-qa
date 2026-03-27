import { expect, test } from "@playwright/test";
import { createLocalServer, type LocalServerInstance } from "../../src/app/api/local-server.js";

test.describe("local app", () => {
  let server: LocalServerInstance;

  test.beforeAll(async () => {
    server = createLocalServer(0);
    await server.start();
  });

  test.afterAll(async () => {
    await server.stop();
  });

  test("api can run an execution and report completion", async ({ request }) => {
    const createResponse = await request.post(`${server.origin}/api/executions`, {
      data: {
        url: "/fixtures/login-flow",
        flow: "Abra a pagina e faca login usando as credenciais:\n- email: edoc@gmail.com\n- senha: abc123"
      }
    });

    expect(createResponse.status()).toBe(202);
    const created = (await createResponse.json()) as {
      id: string;
      request: { flow: string };
    };

    expect(created.request.flow).toContain("email: [REDACTED]");
    expect(created.request.flow).toContain("senha: [REDACTED]");

    await expect
      .poll(async () => {
        const statusResponse = await request.get(`${server.origin}/api/executions/${created.id}`);
        const record = (await statusResponse.json()) as { status: string };
        return record.status;
      })
      .toBe("passed");
  });

  test("web panel can trigger an execution", async ({ page }) => {
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
    await expect(page.locator("#execution-logs")).toContainText("Audit entries:");
    await expect(page.locator("#execution-logs")).toContainText("Click the sign in action.");
    await expect(page.locator("#execution-logs")).toContainText("[REDACTED]");
  });
});
