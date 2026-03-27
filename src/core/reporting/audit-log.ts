import { sanitizeForDisplay } from "./sanitization.js";

export type AuditEventType = "generation" | "healing";

export interface AuditEntry {
  type: AuditEventType;
  payload: unknown;
  createdAt: string;
}

export interface AuditLogger {
  log(type: AuditEventType, payload: unknown): Promise<void>;
}

export class InMemoryAuditLogger implements AuditLogger {
  private readonly entries: AuditEntry[] = [];

  async log(type: AuditEventType, payload: unknown): Promise<void> {
    this.entries.push({
      type,
      payload: sanitizeForDisplay(payload),
      createdAt: new Date().toISOString()
    });
  }

  getEntries(): AuditEntry[] {
    return [...this.entries];
  }
}

export class NoopAuditLogger implements AuditLogger {
  async log(type: AuditEventType, payload: unknown): Promise<void> {
    void type;
    void payload;
  }
}
