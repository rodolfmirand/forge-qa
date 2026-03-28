# Arquitetura: Forge QA

## 1. Objetivo

Este documento descreve a arquitetura alvo do `Forge QA` como uma API de orquestracao de testes E2E guiada por intencao, com geracao de fluxo, execucao, healing e observabilidade.

A arquitetura deixa de tratar `login` como centro do produto. `Login` permanece apenas como um cenario de validacao. O produto precisa ser capaz de receber uma intencao de teste, planejar um fluxo executavel, navegar por estados da aplicacao, executar acoes, se recuperar de mudancas de UI e devolver um resultado auditavel.

---

## 2. Direcao Arquitetural

O `Forge QA` e um servico local em `TypeScript` sobre `Node.js`, usando `Playwright` como motor de automacao e a `OpenAI API` como camada de raciocinio para healing e, progressivamente, para planejamento.

A direcao principal agora e `API-first`:

- a interface principal do produto e uma API local de execucao;
- o painel web e uma interface amigavel sobre essa API;
- CLI e desktop passam a ser consumidores opcionais do mesmo motor;
- o nucleo do produto e um motor de planejamento e execucao de fluxo E2E orientado a intencao.

### Direcao atual

- runtime local: `Node.js`
- linguagem principal: `TypeScript`
- motor de automacao: `Playwright`
- camada de IA: `OpenAI Node.js SDK`
- interface principal: `API local` com `painel web`
- persistencia inicial: memoria local de healing e historico de execucao
- foco tecnico atual: generalizar o motor para fluxos E2E alem de casos fixos de login

### Direcao futura

- ampliar o planner para multiplos dominios de fluxo
- suportar planejamento semantico de CRUD e fluxos de backoffice multi-etapa
- suportar mais tipos de acao e asserts
- enriquecer contexto para IA com DOM, estado e historico
- persistir execucoes, curas e artefatos de forma mais robusta
- expor o motor de forma recorrente em pipeline e ambientes compartilhados
- avaliar multimodalidade e contexto visual como camada complementar, nao como base obrigatoria

---

## 3. Estrutura de Pastas

```text
docs/
  forgeqa.context.md
  forgeqa.architecture.md
  forgeqa.tasks.md
src/
  index.ts
  app/
    api/
    web/
  ai/
    prompts/
    resolver/
  core/
    actions/
    execution/
    generation/
    healing/
    reporting/
  integrations/
    playwright/
  memory/
  types/
tests/
  fixtures/
  specs/
storage/
  selectors.json
.github/
  workflows/
```

### Responsabilidades

- `src/app/api/`
  expor contratos HTTP para criar, consultar e futuramente listar execucoes, artefatos e historico

- `src/app/web/`
  interface local para disparar fluxos, visualizar planejamento, logs, healing, resultado final e demos controladas

- `src/core/generation/`
  transformar entradas em cenarios planejados, sem depender de um caso fixo como login

- `src/core/execution/`
  coordenar o lifecycle da execucao, browser, auditoria e retorno final

- `src/core/actions/`
  definir o contrato interno das acoes automatizadas e metadados de execucao

- `src/core/healing/`
  interceptar falhas, decidir elegibilidade, montar contexto, consultar memoria/IA e reexecutar com seguranca

- `src/core/reporting/`
  consolidar auditoria, eventos, estatisticas, score e artefatos de evidencias

- `src/ai/resolver/`
  validar contratos de IA e traduzir respostas em comandos reutilizaveis pelo motor

- `src/integrations/playwright/`
  adaptar o contrato interno para a API concreta do Playwright

- `src/memory/`
  persistir healing reaproveitavel e, no futuro, historico contextual de decisao

- `src/types/`
  concentrar contratos compartilhados entre API, planner, executor, healer e relatorios

---

## 4. Componentes Principais

### 4.1 Intake API

Recebe requisicoes com `url`, `flow`, parametros e contexto adicional. Seu contrato deve ser estavel, auditavel e desacoplado da interface.

### 4.2 Flow Planner

Converte uma intencao textual em um `GeneratedTestScenario` com steps estruturados. O planner deve evoluir para suportar descoberta de navegacao, multiplos tipos de acao, asserts, checkpoints intermediarios e fluxos complexos de CRUD orientados a entidade.

### 4.3 Scenario Executor

Executa o plano passo a passo. Nao decide a intencao do fluxo; decide apenas como aplicar cada step com o runner e com o healer.

### 4.4 Action Layer

Define a gramatica interna do motor: `click`, `fill`, `press`, `select`, `waitForNavigation`, `assertText`, `assertUrl` e futuras extensoes. Essa camada preserva intencao, seletor original e metadados para healing.

### 4.5 Playwright Runner

Implementa a execucao concreta dos steps no navegador, mantendo o motor livre de acoplamento direto a detalhes do Playwright.

### 4.6 Healer

Camada de resiliencia. Usa memoria, fallbacks e IA para recuperar falhas de localizacao antes de declarar falha final.

### 4.7 DOM Extractor

Extrai contexto enxuto da pagina atual, priorizando elementos interativos e reduzindo custo de inferencia.

### 4.8 AI Resolver

Recebe um contrato fechado e devolve uma sugestao validada. Hoje atua no healing; no futuro, pode apoiar planejamento e classificacao.

### 4.9 Selector Memory

Reaproveita curas bem-sucedidas para reduzir custo, latencia e variabilidade.

### 4.10 Reporter

Consolida entrada, plano, execucao, healing, erro final e artefatos para API, painel e pipeline.

### 4.11 Demo Layer

O painel pode oferecer `fixtures` e presets controlados para demonstrar:

- geracao do plano a partir de texto;
- execucao ponta a ponta;
- falha inicial de seletor;
- recuperacao por `memory`, `fallback` ou `ai`;
- evidencias e score final.

Essa camada nao substitui a API nem altera o contrato do motor. Ela apenas monta cenarios reproduziveis para avaliacao tecnica.

---

## 5. Fluxo Arquitetural

1. O usuario ou sistema cliente envia `url` e `flow` para a `Intake API`.
2. O `Flow Planner` transforma essa intencao em um `GeneratedTestScenario`.
3. O `Scenario Executor` executa os steps planejados.
4. Cada step operacional passa pela `Action Layer` e pelo `Playwright Runner`.
5. Quando ha falha elegivel, o `Healer` tenta recuperar usando memoria e fallbacks.
6. Se memoria/fallback nao bastarem, o `DOM Extractor` monta contexto para o `AI Resolver`.
7. A resposta da IA e validada e, se segura, reaplicada na execucao.
8. O `Reporter` consolida tudo em payloads auditaveis para a API e para o painel.

---

## 6. Principios de Organizacao

- `login` nao deve dirigir a arquitetura; deve apenas validar um caso comum
- planejar e executar sao responsabilidades distintas
- o contrato de steps deve ser mais estavel que heuristicas de planning
- healing deve ser explicavel, limitado e auditavel
- a interface deve conseguir demonstrar healing real sem depender de manipulacao manual do codigo
- integracoes concretas devem ficar atras de adaptadores
- memoria e IA devem ser complementares, nao concorrentes
- painel e API nao podem conter segredo nem logar credenciais em claro

---

## 7. Contrato de Fluxo

O motor passa a trabalhar com um plano estruturado que pode conter, no minimo:

- `navigate`
- `click`
- `fill`
- `press`
- `waitForNavigation`
- `assertText`
- `assertUrl`

Esse contrato e o ponto de estabilidade da API. Heuristicas de planejamento podem evoluir sem quebrar o executor.

---

## 8. Sequencia de Evolucao

### Fase 0. Fundacao

- bootstrap do projeto
- TypeScript
- Playwright
- API local e painel

### Fase 1. Core de Execucao

- contrato de steps
- executor de cenarios
- acoes basicas
- auditoria inicial

### Fase 2. Healing

- classificacao de falha elegivel
- memoria local
- extracao de DOM
- consulta estruturada a IA
- reexecucao controlada

### Fase 3. Generalizacao da API

- planner desacoplado do caso de login
- descoberta de navegacao inicial
- asserts de URL e estado
- contrato de execucao mais rico
- exibicao do plano gerado no painel

### Fase 4. Operacao

- pipeline recorrente
- artefatos e traces
- parametros de execucao sem UI
- historico e relatorios mais robustos

### Fase 5. Planner de Fluxos Complexos

- decompor CRUD em etapas navegaveis
- entender modulos, entidades e formularios longos
- inserir checkpoints intermediarios de validacao
- suportar modais, grids, selects e confirmacoes de sucesso

---

## 9. Decisoes Arquiteturais

- nao reconstruir um runner concorrente ao Playwright
- nao acoplar o painel ao motor diretamente; usar a API como fronteira
- nao depender de analise de codigo-fonte do frontend/backend para a fase atual
- nao permitir que a IA execute comandos arbitrarios fora do contrato interno
- nao tratar qualquer falha como healing elegivel
- nao expor credenciais em logs, auditoria ou payloads do painel

---

## 10. Meta Tecnica Atual

A proxima meta tecnica critica e abrir o segundo bloco da `generalizacao da API`: o planner para fluxos complexos.

Esse bloco deve:

- decompor instrucoes de CRUD em etapas executaveis
- descobrir navegacao interna ate modulos e entidades de negocio
- planejar formularios com campos heterogeneos, modais e confirmacoes
- introduzir checkpoints intermediarios para reduzir ambiguidade em fluxos longos

Esse passo aproxima o Forge QA de uma API realmente util para sistemas de backoffice, como o exemplo de cadastro de servicos dentro da Sante, e nao apenas para demonstracoes de login ou busca.
