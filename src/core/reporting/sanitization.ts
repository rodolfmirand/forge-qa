const SENSITIVE_INLINE_LABELS = ["email", "senha", "password", "token", "api key", "apikey"];
const SENSITIVE_KEY_PATTERN = /(password|senha|secret|token|api[-_ ]?key|authorization)/i;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function redactSensitiveText(value: string): string {
  let result = value;

  for (const label of SENSITIVE_INLINE_LABELS) {
    const regex = new RegExp(`(${escapeRegex(label)}\\s*:\\s*)([^\\n\\r]+)`, "gi");
    result = result.replace(regex, "$1[REDACTED]");
  }

  return result;
}

export function sanitizeForDisplay(value: unknown): unknown {
  if (typeof value === "string") {
    return redactSensitiveText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForDisplay(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const candidate = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(candidate)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      sanitized[key] = "[REDACTED]";
      continue;
    }

    sanitized[key] = sanitizeForDisplay(entry);
  }

  if (candidate.kind === "fill" && typeof candidate.value === "string") {
    sanitized.value = "[REDACTED]";
  }

  return sanitized;
}
