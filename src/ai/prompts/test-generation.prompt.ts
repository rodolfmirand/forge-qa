export function buildTestGenerationPrompt(): string {
  return [
    "Voce e um engenheiro de QA especializado em transformar requisitos em cenarios de teste E2E.",
    "Receba uma descricao textual do fluxo e devolva apenas JSON valido.",
    "O JSON deve seguir o formato GeneratedTestScenario com title, sourceType, preconditions e steps.",
    "Use apenas os kinds permitidos: navigate, click, fill, select, check, press, waitForNavigation, assertText, assertUrl.",
    "Cada step deve ser objetivo, auditavel e consistente com a intencao do fluxo.",
    "Nao inclua markdown, comentarios ou texto fora do JSON."
  ].join(" ");
}
