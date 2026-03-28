# Forge QA

Framework de automacao de testes E2E com `Playwright` e IA para geracao, execucao e auto-recuperacao de fluxos.

O objetivo do projeto e atender ao desafio da Second Mind com uma solucao que:

- gera testes automaticamente a partir de intencao textual;
- executa testes automaticamente em navegador real;
- usa IA em pontos relevantes do fluxo;
- reduz fragilidade de testes UI com `self-healing`;
- devolve plano, resumo, quality score e evidencias.

## Stack

- `TypeScript`
- `Node.js`
- `Playwright`
- `OpenAI Node.js SDK`

## Interfaces de uso

O `Forge QA` pode ser usado de tres formas:

- `painel web local`
- `API local`
- `execucao headless` por CLI para jobs e automacao recorrente

## Scripts

- `npm run dev`: sobe a aplicacao local em modo watch
- `npm run build`: compila o projeto para `dist/`
- `npm run start`: executa a aplicacao compilada
- `npm run execute -- --url <url> --flow <descricao>`: executa um fluxo sem painel, com saida no terminal
- `npm run test`: roda a suite Playwright
- `npm run test:headed`: roda a suite Playwright com browser visivel
- `npm run test:ui`: abre a interface do Playwright
- `npm run typecheck`: valida tipos sem gerar build
- `npm run lint`: roda ESLint
- `npm run format`: aplica Prettier
- `npm run format:check`: valida formatacao

## Primeiros passos

1. Instale as dependencias:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Ajuste ao menos:

- `FORGEQA_AI_MODE`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `FORGEQA_SELECTOR_MEMORY_PATH`
- `FORGEQA_ARTIFACTS_PATH`
- `FORGEQA_PORT`

4. Instale os navegadores do Playwright:

```bash
npx playwright install
```

## Modos de IA

- `FORGEQA_AI_MODE=mock`: usa o resolver local sem custo de API
- `FORGEQA_AI_MODE=openai`: usa a API real da OpenAI quando `OPENAI_API_KEY` estiver configurada

## Como usar

### Painel web

1. Suba a aplicacao local:

```bash
npm run dev
```

2. Abra no navegador:

```text
http://127.0.0.1:3000
```

3. Informe a URL alvo ou use um fixture local.
4. Descreva o fluxo em texto.
5. Acompanhe status, plano, quality score, healing, logs e evidencias no painel.

### Demos recomendadas

- `Demo base`
  URL: `/fixtures/login-flow`
  Fluxo: login simples para validar geracao, execucao e evidencias

- `Demo de healing`
  URL: `/fixtures/healing-login`
  Fluxo: login simples em fixture com CTA fora do padrao
  Resultado esperado: o painel mostra a estrategia `ai` e o seletor recuperado `#submit-authentication-form`

### Execucao recorrente

Use o modo headless para CI, jobs locais ou automacao externa:

```bash
npm run execute -- --url https://example.com --flow "Pesquise por 'Forge QA'" --output pretty
```

Argumentos suportados:

- `--url`
- `--flow`
- `--source-type`
- `--max-healing-attempts`
- `--requested-by`
- `--labels`
- `--output pretty|json`

## Estado atual

A base agora cobre:

- planner heuristico para autenticacao e busca
- executor com `navigate`, `click`, `fill`, `press`, `assertText`, `assertUrl` e `waitForNavigation`
- healing com memoria, fallback e IA
- memoria persistida em disco
- API local com `options` e `metadata`
- painel web com plano, resumo, quality score e links de evidencia
- painel web com destaque explicito para recuperacoes por `memory`, `fallback` e `ai`
- execucao headless para uso recorrente
- workflow inicial de CI no GitHub Actions

## Estrutura

```text
docs/
src/
  ai/
  app/
  core/
  integrations/
  memory/
  types/
tests/
  fixtures/
  specs/
storage/
.github/
  workflows/
```

## Documentacao

- [Contexto](./docs/forgeqa.context.md)
- [Arquitetura](./docs/forgeqa.architecture.md)
- [Tarefas](./docs/forgeqa.tasks.md)
