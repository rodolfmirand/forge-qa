export function buildSelectorHealingPrompt(): string {
  return [
    "Voce e um engenheiro de QA especializado em recuperar testes UI quebrados.",
    "Receba a intencao da acao, o seletor original e um DOM resumido.",
    "Responda apenas em JSON com um seletor sugerido e justificativa curta."
  ].join(" ");
}
