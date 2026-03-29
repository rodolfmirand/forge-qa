import type { TestGenerationInput } from "../../types/generation.js";

type EndpointOperation = "create" | "update" | "delete" | "search" | "login";

interface EndpointSourceInput {
  entity?: string;
  operation: EndpointOperation;
  navigationPath?: string[];
  targetRecord?: string;
  fields?: Record<string, string | number | boolean>;
  expectedText?: string;
  expectedUrlIncludes?: string;
  prompt?: string;
}

function isEndpointOperation(value: unknown): value is EndpointOperation {
  return (
    value === "create" ||
    value === "update" ||
    value === "delete" ||
    value === "search" ||
    value === "login"
  );
}

function isEndpointSourceInput(value: unknown): value is EndpointSourceInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return isEndpointOperation(candidate.operation);
}

function parseEndpointSourceInput(input: TestGenerationInput): EndpointSourceInput | null {
  if (isEndpointSourceInput(input.sourcePayload)) {
    return input.sourcePayload;
  }

  if (!input.content) {
    return null;
  }

  try {
    const parsed = JSON.parse(input.content) as unknown;
    return isEndpointSourceInput(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function formatFieldValue(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "sim" : "nao";
  }

  return String(value);
}

function buildNavigationClause(input: EndpointSourceInput): string {
  if (!input.navigationPath?.length) {
    return "Acesse a area autenticada";
  }

  return `Acesse a area autenticada, abra ${input.navigationPath.join(" > ")}`;
}

function buildFieldsBlock(
  fields?: Record<string, string | number | boolean>,
  targetRecord?: string,
  entity?: string
): string {
  const lines: string[] = [];

  if (targetRecord) {
    lines.push(`- ${entity ?? "registro"} alvo: ${targetRecord}`);
  }

  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      lines.push(`- ${key}: ${formatFieldValue(value)}`);
    }
  }

  return lines.join("\n");
}

function buildCrudNarrative(input: EndpointSourceInput): string {
  const entity = input.entity ?? "registro";
  const navigationClause = buildNavigationClause(input);
  const fieldsBlock = buildFieldsBlock(input.fields, input.targetRecord, entity);
  const expectedText =
    input.expectedText ??
    (input.operation === "update"
      ? `${entity[0]?.toUpperCase() ?? "R"}${entity.slice(1)} atualizado com sucesso`
      : input.operation === "delete"
        ? `${entity[0]?.toUpperCase() ?? "R"}${entity.slice(1)} removido com sucesso`
        : `${entity[0]?.toUpperCase() ?? "R"}${entity.slice(1)} salvo com sucesso`);

  const actionVerb =
    input.operation === "update"
      ? `edite um ${entity}`
      : input.operation === "delete"
        ? `remova um ${entity}`
        : `cadastre um ${entity}`;

  return [
    `${navigationClause} e ${actionVerb} com:`,
    fieldsBlock,
    `Valide que o texto "${expectedText}" apareca.`
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSearchNarrative(input: EndpointSourceInput): string {
  const query = input.fields?.query ?? input.fields?.busca ?? input.fields?.pesquisa ?? "forge qa";
  const expectedText = input.expectedText ?? `Results for: ${formatFieldValue(query)}`;

  return `Pesquise por "${formatFieldValue(query)}" e valide que o texto "${expectedText}" apareca.`;
}

function buildLoginNarrative(input: EndpointSourceInput): string {
  const fieldsBlock = buildFieldsBlock(input.fields);
  const expectedText = input.expectedText ?? "Dashboard";

  return [
    "Abra a pagina e faca login usando as credenciais:",
    fieldsBlock,
    `Valide que o texto "${expectedText}" apareca.`
  ]
    .filter(Boolean)
    .join("\n");
}

export function normalizeGenerationInput(input: TestGenerationInput): TestGenerationInput {
  if (input.sourceType !== "endpoint") {
    return input;
  }

  const endpointInput = parseEndpointSourceInput(input);

  if (!endpointInput) {
    return input;
  }

  const content =
    endpointInput.prompt ??
    (endpointInput.operation === "search"
      ? buildSearchNarrative(endpointInput)
      : endpointInput.operation === "login"
        ? buildLoginNarrative(endpointInput)
        : buildCrudNarrative(endpointInput));

  return {
    ...input,
    content,
    sourcePayload: endpointInput
  };
}
