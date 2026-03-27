# Forge QA

Framework de automacao de testes com `Playwright` e IA para geracao, execucao e auto-recuperacao de testes.

O objetivo do projeto e atender ao desafio da Second Mind com uma solucao que:

- gera testes automaticamente a partir de entradas como texto, endpoints ou interface;
- executa os testes automaticamente;
- usa IA de forma util no fluxo;
- reduz fragilidade de testes UI com uma camada de `self-healing`.

## Stack inicial

- `TypeScript`
- `Node.js`
- `Playwright`
- `OpenAI Node.js SDK`

## Direcao do produto

O `Forge QA` nao e apenas uma suite Playwright. O produto passa a ter tres capacidades centrais:

- `test generation`: transformar uma fonte de entrada em cenarios/specs executaveis;
- `test execution`: rodar os testes e coletar evidencias;
- `self-healing`: recuperar falhas elegiveis de seletor com apoio de IA.

Para o MVP, a interface principal planejada passa a ser:

- `API local`: para iniciar execucoes e consultar resultados
- `painel web local`: para uso amigavel em demo e operacao local

## Scripts

- `npm run dev`: executa o bootstrap local em modo watch
- `npm run build`: compila o projeto para `dist/`
- `npm run start`: executa o bootstrap compilado
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

4. Instale os navegadores do Playwright:

```bash
npx playwright install
```

5. Valide o bootstrap:

```bash
npm run typecheck
npm run lint
npm run test
```

## Modos de IA

- `FORGEQA_AI_MODE=mock`: usa o resolver local sem custo de API
- `FORGEQA_AI_MODE=openai`: usa a API real da OpenAI quando `OPENAI_API_KEY` estiver configurada

## Estrutura inicial

```text
docs/
src/
  ai/
  core/
  integrations/
  memory/
  types/
tests/
  fixtures/
  specs/
storage/
```

## Documentacao

- [Contexto](./docs/forgeqa.context.md)
- [Arquitetura](./docs/forgeqa.architecture.md)
- [Tarefas](./docs/forgeqa.tasks.md)

## Estado atual

A base agora cobre:

- bootstrap do repositório
- configuracao TypeScript
- configuracao Playwright
- configuracao de lint e formatacao
- estrutura inicial para geracao automatica de testes
- estrutura inicial para execucao e `self-healing`
- modo `mock` e modo `openai` para a camada de resolucao
