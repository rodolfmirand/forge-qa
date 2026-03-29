# Roteiro Tecnico: Forge QA

Este roteiro organiza uma apresentacao tecnica curta do `Forge QA`, focada em mostrar valor real de produto e solidez de implementacao.

## 1. Objetivo da apresentacao

Demonstrar que o `Forge QA`:

- transforma intencao em plano executavel;
- executa fluxos E2E reais em navegador;
- explica o que planejou e executou;
- se recupera de falhas de seletor com memoria, fallback e IA;
- suporta entrada textual e payload estruturado.

## 2. Setup recomendado

Antes da gravacao:

- subir o projeto com `npm run dev`;
- garantir `FORGEQA_AI_MODE=mock` para demo previsivel ou `openai` se quiser mostrar integracao real;
- limpar memoria local de healing se quiser evidenciar a primeira cura;
- deixar o painel aberto em `http://127.0.0.1:3000`.

## 3. Sequencia sugerida

### Bloco 1. Visao rapida do produto

Tempo sugerido: 30 a 45 segundos.

Mostrar:

- o painel web;
- os campos de URL e fluxo;
- o fato de que a API tambem pode ser usada por CLI e HTTP.

Mensagem principal:

O produto nao e um script fixo de login. Ele e uma API local de orquestracao E2E guiada por intencao.

### Bloco 2. Geracao e execucao a partir de texto

Tempo sugerido: 60 a 90 segundos.

Cenario sugerido:

- URL: `/fixtures/user-crud`
- fluxo: `Acesse a area autenticada, abra Administracao > Usuarios e cadastre um usuario com nome, cargo, notificacoes e nivel de acesso`

Mostrar:

- o plano gerado no painel;
- os checkpoints intermediarios;
- o status final `passed`;
- o `quality score` e as evidencias.

Mensagem principal:

O planner gera steps estruturados e o executor percorre o fluxo real com `Playwright`.

### Bloco 3. Auto-cura explicavel

Tempo sugerido: 60 a 90 segundos.

Cenario sugerido:

- usar o preset `Usar demo de healing`

Mostrar:

- a execucao falharia com o seletor antigo;
- o painel exibe estrategia `ai`;
- aparecem seletor original, seletor recuperado e rationale;
- a execucao termina com sucesso.

Mensagem principal:

O healing nao e opaco. Ele e auditavel, limitado e reaproveitavel.

### Bloco 4. Reaproveitamento de memoria

Tempo sugerido: 30 a 45 segundos.

Mostrar:

- nova execucao do mesmo fluxo apos a cura inicial;
- destaque para o uso de memoria no resumo/logs quando aplicavel.

Mensagem principal:

A ferramenta aprende com recuperacoes bem-sucedidas e reduz custo de novas consultas.

### Bloco 5. Entrada estruturada alem de texto

Tempo sugerido: 45 a 60 segundos.

Mostrar:

- chamada pela CLI ou API com `sourceType=endpoint` e `sourcePayload`;
- exemplo de `update` de usuario em `/fixtures/user-crud`;
- resultado final `passed`.

Mensagem principal:

O motor nao depende apenas de linguagem natural; ele aceita payload estruturado sem duplicar a pipeline de planejamento.

## 4. Encerramento tecnico

Fechar com quatro pontos:

- o runner usa `Playwright`, nao reinventa automacao de browser;
- a inteligencia esta no planejamento, healing e observabilidade;
- a API local ja suporta texto, endpoint estruturado, painel e CLI;
- a proxima evolucao natural esta em memoria mais rica, validacao adicional de IA e expansao para fluxos ainda mais reais.

## 5. Riscos na demo e mitigacao

### Risco: variabilidade de IA

Mitigacao:

- usar `mock` quando o foco for previsibilidade;
- usar `openai` apenas quando quiser demonstrar integracao real.

### Risco: tempo de execucao visualmente longo

Mitigacao:

- preferir fixtures locais controladas;
- deixar os fluxos de CRUD e healing ja selecionados.

### Risco: expor segredos na tela

Mitigacao:

- usar credenciais ficticias;
- confiar na sanitizacao do painel, mas nao depender dela como unica barreira.
