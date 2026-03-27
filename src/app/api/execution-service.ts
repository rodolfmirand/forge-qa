import { randomUUID } from "node:crypto";
import { ExecutionEngine } from "../../core/execution/execution-engine.js";
import type {
  ExecutionRecord,
  ExecutionRequest,
  ExecutionResult
} from "../../core/execution/execution.types.js";

export class ExecutionService {
  private readonly executions = new Map<string, ExecutionRecord>();

  constructor(
    private readonly engine: ExecutionEngine,
    private readonly baseUrl: string
  ) {}

  create(request: ExecutionRequest): ExecutionRecord {
    const id = randomUUID();
    const now = new Date().toISOString();
    const record: ExecutionRecord = {
      id,
      request: {
        ...request,
        url: this.normalizeUrl(request.url)
      },
      status: "queued",
      createdAt: now,
      updatedAt: now
    };

    this.executions.set(id, record);
    void this.run(id);

    return record;
  }

  get(id: string): ExecutionRecord | null {
    return this.executions.get(id) ?? null;
  }

  list(): ExecutionRecord[] {
    return [...this.executions.values()];
  }

  private normalizeUrl(url: string): string {
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://")) {
      return url;
    }

    if (url.startsWith("/")) {
      return `${this.baseUrl}${url}`;
    }

    return `${this.baseUrl}/${url}`;
  }

  private async run(id: string): Promise<void> {
    const record = this.executions.get(id);

    if (!record) {
      return;
    }

    this.executions.set(id, {
      ...record,
      status: "running",
      updatedAt: new Date().toISOString()
    });

    const result = await this.engine.execute(record.request);
    this.finish(id, result);
  }

  private finish(id: string, result: ExecutionResult): void {
    const record = this.executions.get(id);

    if (!record) {
      return;
    }

    this.executions.set(id, {
      ...record,
      status: result.status,
      updatedAt: new Date().toISOString(),
      result
    });
  }
}
