# Arquitetura Inicial: Forge QA

## 1. Objetivo

Este documento descreve a arquitetura inicial do Forge QA para as fases iniciais do MVP.

O foco desta arquitetura e:

- simplicidade de implementacao;
- clareza sobre o fluxo de geracao automatica;
- clareza sobre o fluxo de auto-cura;
- separacao basica entre geracao, execucao, contexto, IA e memoria;
- evolucao segura para demonstracao e iteracoes futuras.

---

## 2. Direcao Arquitetural

Nesta fase, o Forge QA e um projeto em `TypeScript` executando localmente em `Node.js`, usando `Playwright` como motor de automacao, uma camada de IA para gerar cenarios iniciais de teste e outra camada de IA para recuperar falhas elegiveis de seletor.

O projeto nao deve nascer como uma plataforma complexa de observabilidade ou orquestracao. A arquitetura inicial deve privilegiar um nucleo pequeno, testavel e demonstravel.

### Direcao atual

- runtime local: Node.js
- linguagem principal: TypeScript
- motor de automacao: Playwright
- camada de IA: OpenAI Node.js SDK
- persistencia inicial: arquivo JSON local para memoria de seletores curados
- prioridade funcional atual: provar geracao automatica inicial de testes e auto-cura de acoes UI em cenarios controlados

### Direcao futura

- ampliar suporte para mais tipos de fontes de entrada
- ampliar suporte para mais tipos de acoes automatizadas
- enriquecer o contexto enviado para a IA com heuristicas adicionais
- evoluir relatorios tecnicos e evidencias de execucao
- adicionar pipeline recorrente de execucao no GitHub Actions
- avaliar memoria mais robusta para historico de curas e analytics

---

## 3. Estrutura Inicial de Pastas

```text
docs/
  forgeqa.context.md
  forgeqa.architecture.md
  forgeqa.tasks.md
src/
  index.ts
  core/
    actions/
    generation/
    healing/
    reporting/
  ai/
    prompts/
    resolver/
  integrations/
    playwright/
  memory/
  types/
tests/
  specs/
  fixtures/
storage/
  selectors.json
.github/
  workflows/
```

### Responsabilidades

- `src/index.ts`
  ponto de entrada para bootstrap do projeto e inicializacao da execucao local

- `src/core/actions/`
  contrato das acoes automatizadas e primitivas usadas pelo fluxo de teste

- `src/core/generation/`
  contratos de entrada, geracao inicial de cenarios e transformacao em artefatos executaveis

- `src/core/healing/`
  logica de interceptacao de falhas, elegibilidade de cura, retentativa e controle do fluxo

- `src/core/reporting/`
  agregacao de eventos, estatisticas de geracao, execucao e cura

- `src/ai/prompts/`
  definicao dos prompts e contratos de instrucao enviados para a IA

- `src/ai/resolver/`
  cliente de IA, validacao da resposta estruturada e traducao para comandos internos

- `src/integrations/playwright/`
  adaptadores entre os contratos do Forge QA e a API do Playwright

- `src/memory/`
  leitura e escrita da memoria local de seletores curados

- `src/types/`
  tipos compartilhados entre geracao, execucao, IA, memoria e relatorio

- `tests/specs/`
  cenarios E2E e demonstracoes do MVP

- `tests/fixtures/`
  paginas, dados e ambientes controlados para reproducao de falhas

- `storage/selectors.json`
  persistencia inicial das curas aprovadas pelo fluxo automatizado

---

## 4. Componentes Principais

### 4.1 Test Generator

Camada responsavel por transformar uma fonte de entrada, inicialmente texto, em uma estrutura de cenario ou spec executavel.

### 4.2 Test Runner

Responsavel por iniciar e coordenar a execucao dos testes Playwright.

### 4.3 Action Layer

Camada que encapsula operacoes como `click`, `fill` e `select`, mantendo a intencao da acao e o seletor original disponiveis para recuperacao.

### 4.4 Healer

Componente central do diferencial tecnico. Decide se a falha pode ser tratada como fragilidade de automacao, monta o pedido de cura, aciona a IA, valida a resposta e tenta novamente.

### 4.5 DOM Extractor

Extrai uma representacao simplificada da pagina, priorizando elementos interativos e metadados relevantes. Seu papel e reduzir ruido e custo.

### 4.6 AI Resolver

Envia contratos objetivos para a IA, tanto para geracao quanto para cura, e recebe respostas estruturadas.

### 4.7 Selector Memory

Persiste curas bem-sucedidas para evitar chamadas repetidas a IA e tornar a automacao cumulativamente mais resiliente.

### 4.8 Reporter

Consolida resultados da execucao, numero de geracoes, curas, sucessos, falhas e evidencias para demo e analise tecnica.

---

## 5. Fluxo Arquitetural

1. O sistema recebe uma entrada de geracao, inicialmente texto.
2. O `Test Generator` cria um cenario ou spec inicial.
3. O teste chama uma acao do Forge QA, por exemplo `healer.click(...)`.
4. A camada de integracao tenta executar a acao via Playwright.
5. Se a acao falhar por seletor nao encontrado, o `Healer` verifica elegibilidade.
6. O `DOM Extractor` resume o estado atual da pagina.
7. O `AI Resolver` recebe:
   - a intencao da acao;
   - o seletor original;
   - o tipo de elemento esperado;
   - o DOM resumido.
8. A resposta da IA e validada contra um contrato estruturado.
9. O Forge QA tenta novamente a acao com o seletor sugerido.
10. Em caso de sucesso, a cura e registrada e persistida.
11. Em caso de falha, o teste termina com erro explicito e rastreavel.

---

## 6. Principios de Organizacao do Codigo

As proximas implementacoes devem seguir estes principios:

- a fonte de entrada do teste deve ser tratada como contrato explicito;
- a intencao da acao deve ser preservada alem do seletor cru;
- integracao com Playwright deve ficar separada da regra de cura;
- prompt e parsing de IA devem ser isolados da logica de execucao;
- respostas da IA devem passar por validacao antes de uso;
- toda intervencao automatica deve ser auditavel;
- o MVP deve crescer por camadas, nao por acoplamento improvisado.

---

## 7. Sequencia de Evolucao

### Fase 0

- bootstrap do projeto
- configuracao de TypeScript
- setup do Playwright
- estrutura inicial de pastas

### Fase 1

- criacao de teste feliz de referencia
- definicao do contrato de entrada para geracao
- implementacao do gerador inicial de cenarios
- definicao do contrato de acoes

### Fase 2

- transformacao da geracao em artefato executavel
- extracao de DOM simplificado
- contrato de prompt
- cliente inicial de IA com resposta JSON

### Fase 3

- retentativa automatica com novo seletor
- validacao de resposta
- persistencia de curas em memoria local

### Fase 4

- relatorio de execucao
- score basico de qualidade
- pipeline inicial no GitHub Actions

---

## 8. Decisoes Arquiteturais Iniciais

- nao usar banco de dados no MVP inicial;
- nao editar automaticamente o codigo-fonte dos testes;
- nao tentar cobrir todas as fontes de entrada do desafio no primeiro corte;
- nao usar multimodalidade como dependencia principal do primeiro corte;
- nao tratar qualquer falha como curavel, apenas falhas elegiveis de localizacao;
- nao transformar o projeto em plataforma fullstack antes de provar o nucleo.

---

## 9. Observacoes Importantes

- o valor do Forge QA depende de combinar geracao automatica, execucao e recuperacao;
- a arquitetura deve favorecer demo reproduzivel, nao sofisticacao prematura;
- a memoria de curas deve ser simples no inicio, mas o contrato precisa permitir evolucao;
- a proxima meta concreta e construir um fluxo ponta a ponta em que um cenario seja gerado, executado e, se necessario, curado automaticamente.
