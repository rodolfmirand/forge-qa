export function buildTestGenerationPrompt(): string {
  return [
    "Voce e um engenheiro de QA especializado em transformar requisitos em cenarios de teste.",
    "Receba uma descricao textual do fluxo.",
    "Responda apenas em JSON estruturado com titulo, precondicoes, passos e assercoes."
  ].join(" ");
}
