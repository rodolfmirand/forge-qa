import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ExecutionEngine } from "../../core/execution/execution-engine.js";
import type { ExecutionRequest } from "../../core/execution/execution.types.js";
import { sanitizeForDisplay } from "../../core/reporting/sanitization.js";
import { ExecutionService } from "./execution-service.js";
import { renderWebPanelHtml } from "../web/panel.js";
import { renderWebPanelScript } from "../web/panel-script.js";

export interface LocalServerInstance {
  origin: string;
  port: number;
  start(): Promise<void>;
  stop(): Promise<void>;
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return null;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(sanitizeForDisplay(payload)));
}

function sendHtml(response: ServerResponse, html: string): void {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8"
  });
  response.end(html);
}

function sendJavascript(response: ServerResponse, source: string): void {
  response.writeHead(200, {
    "Content-Type": "application/javascript; charset=utf-8"
  });
  response.end(source);
}

export function createLocalServer(
  initialPort = Number(process.env.FORGEQA_PORT ?? 3000)
): LocalServerInstance {
  let server: Server | null = null;
  let executionService: ExecutionService | null = null;
  let currentPort = initialPort;
  let currentOrigin = `http://127.0.0.1:${currentPort}`;

  const instance: LocalServerInstance = {
    get origin() {
      return currentOrigin;
    },
    get port() {
      return currentPort;
    },
    async start(): Promise<void> {
      await new Promise<void>((resolve) => {
        server = createServer(async (request, response) => {
          const url = new URL(request.url ?? "/", currentOrigin);

          if (!executionService) {
            executionService = new ExecutionService(new ExecutionEngine(), currentOrigin);
          }

          if (request.method === "GET" && url.pathname === "/") {
            sendHtml(response, renderWebPanelHtml());
            return;
          }

          if (request.method === "GET" && url.pathname === "/app.js") {
            sendJavascript(response, renderWebPanelScript());
            return;
          }

          if (request.method === "GET" && url.pathname === "/api/health") {
            sendJson(response, 200, { status: "ok" });
            return;
          }

          if (request.method === "GET" && url.pathname === "/api/executions") {
            sendJson(response, 200, executionService.list());
            return;
          }

          if (request.method === "POST" && url.pathname === "/api/executions") {
            const payload = (await readJsonBody(request)) as Partial<ExecutionRequest> | null;

            if (!payload?.url || !payload.flow) {
              sendJson(response, 400, {
                error: "Both url and flow are required."
              });
              return;
            }

            const record = executionService.create({
              url: payload.url,
              flow: payload.flow,
              ...(payload.sourceType ? { sourceType: payload.sourceType } : {}),
              ...(payload.options ? { options: payload.options } : {}),
              ...(payload.metadata ? { metadata: payload.metadata } : {})
            });

            sendJson(response, 202, record);
            return;
          }

          if (
            request.method === "GET" &&
            /\/api\/executions\/[^/]+\/artifacts\/[^/]+$/.test(url.pathname)
          ) {
            const segments = url.pathname.split("/");
            const executionId = segments.at(-3) ?? "";
            const artifactId = segments.at(-1) ?? "";
            const artifact = executionService.getArtifact(executionId, artifactId);

            if (!artifact) {
              sendJson(response, 404, { error: "Artifact not found." });
              return;
            }

            const content = await readFile(artifact.path);
            response.writeHead(200, {
              "Content-Type": artifact.contentType
            });
            response.end(content);
            return;
          }

          if (request.method === "GET" && url.pathname.startsWith("/api/executions/")) {
            const id = url.pathname.split("/").at(-1) ?? "";
            const record = executionService.get(id);

            if (!record) {
              sendJson(response, 404, { error: "Execution not found." });
              return;
            }

            sendJson(response, 200, record);
            return;
          }

          if (request.method === "GET" && url.pathname === "/fixtures/login-flow") {
            const fixturePath = path.resolve(process.cwd(), "tests/fixtures/login-flow.html");
            const content = await readFile(fixturePath, "utf8");

            response.writeHead(200, {
              "Content-Type": "text/html; charset=utf-8"
            });
            response.end(content);
            return;
          }

          if (request.method === "GET" && url.pathname === "/fixtures/home-entry") {
            const fixturePath = path.resolve(process.cwd(), "tests/fixtures/home-entry.html");
            const content = await readFile(fixturePath, "utf8");

            response.writeHead(200, {
              "Content-Type": "text/html; charset=utf-8"
            });
            response.end(content);
            return;
          }

          sendJson(response, 404, { error: "Not found." });
        });

        server.listen(currentPort, "127.0.0.1", () => {
          const address = server?.address();

          if (address && typeof address !== "string") {
            currentPort = address.port;
            currentOrigin = `http://127.0.0.1:${currentPort}`;
          }

          resolve();
        });
      });
    },
    async stop(): Promise<void> {
      if (!server) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
      server = null;
    }
  };

  return instance;
}
