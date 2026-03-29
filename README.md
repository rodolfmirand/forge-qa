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
- `npm run execute -- --url <url> --flow <descricao>` ou `--source-payload <json>`: executa um fluxo sem painel, com saida no terminal
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
- `FORGEQA_PLANNING_MODE`
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

## Modos de planejamento

- `FORGEQA_PLANNING_MODE=heuristic`: usa apenas o planner local
- `FORGEQA_PLANNING_MODE=hybrid`: usa heuristica primeiro e aciona IA quando a linguagem de entrada e ambigua ou insuficiente
- `FORGEQA_PLANNING_MODE=ai`: prioriza planejamento por IA com fallback para heuristica se necessario

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

- `Demo de CRUD de servico`
  URL: `/fixtures/service-crud`
  Fluxo: `Acesse a area autenticada, abra Organizacao > Servicos e cadastre um servico com nome, categoria e valor`
  Resultado esperado: o planner monta navegacao interna, insere checkpoints intermediarios, preenche formulario com `select` e valida o cadastro salvo

- `Demo de CRUD de contato`
  URL: `/fixtures/contact-crud`
  Fluxo: `Acesse a area autenticada, abra Organizacao > Contatos e cadastre um contato com nome, cargo e email`
  Resultado esperado: o planner reutiliza o mesmo modelo orientado a entidade/campos para outra entidade de backoffice

- `Demo de CRUD de usuario complexo`
  URL: `/fixtures/user-crud`
  Fluxo: `Acesse a area autenticada, abra Administracao > Usuarios e cadastre um usuario com nome, cargo, notificacoes e nivel de acesso`
  Resultado esperado: o planner navega por outra area do backoffice, abre modal, executa `select` e `check` para checkbox/radio e valida o registro na tabela

- `Demo de edicao e remocao de usuario`
  URL: `/fixtures/user-crud`
  Fluxo de edicao: `Acesse a area autenticada, abra Administracao > Usuarios e edite um usuario com usuario alvo, cargo e nivel de acesso`
  Fluxo de remocao: `Acesse a area autenticada, abra Administracao > Usuarios e remova um usuario com usuario alvo`
  Resultado esperado: o planner reutiliza a mesma navegacao interna, escolhe a acao de linha correta (`Editar ...` ou `Remover ...`) e valida a operacao

- `Demo de planejamento hibrido`
  URL: `/fixtures/user-crud`
  Fluxo: `Acesse a area autenticada, abra Administracao > Usuarios e ajuste um usuario com usuario alvo, cargo e nivel de acesso`
  Resultado esperado: a heuristica identifica linguagem ambigua, o resolver de planejamento entra como complemento e devolve um plano valido para edicao

### API local

A API aceita tanto fluxo textual quanto payload estruturado.

Exemplo textual:

```json
{
  "url": "/fixtures/login-flow",
  "flow": "Abra a pagina e faca login usando as credenciais:\n- email: qa@example.com\n- senha: 123456"
}
```

Exemplo estruturado para CRUD:

```json
{
  "url": "/fixtures/user-crud",
  "sourceType": "endpoint",
  "sourcePayload": {
    "operation": "update",
    "entity": "user",
    "navigationPath": ["Administracao", "Usuarios"],
    "targetRecord": "Carlos Mendes",
    "fields": {
      "cargo": "Financeiro",
      "nivel de acesso": "Editor"
    },
    "expectedText": "Usuario atualizado com sucesso"
  }
}
```

### Execucao recorrente

Use o modo headless para CI, jobs locais ou automacao externa:

```bash
npm run execute -- --url https://example.com --flow "Pesquise por 'Forge QA'" --planning-mode hybrid --output pretty
```

Ou com payload estruturado:

```bash
npm run execute -- --url https://example.com/app --source-type endpoint --source-payload '{"operation":"update","entity":"user","navigationPath":["Administracao","Usuarios"],"targetRecord":"Carlos Mendes","fields":{"cargo":"Financeiro","nivel de acesso":"Editor"},"expectedText":"Usuario atualizado com sucesso"}' --output pretty
```

Argumentos suportados:

- `--url`
- `--flow`
- `--source-type`
- `--source-payload <json>`
- `--planning-mode <heuristic|hybrid|ai>`
- `--max-healing-attempts`
- `--requested-by`
- `--labels`
- `--output pretty|json`

## Estado atual

A base agora cobre:

- planner heuristico para autenticacao, busca e CRUD orientado a entidade para servicos, contatos e usuarios, incluindo `create/update/delete`
- escalonamento objetivo entre heuristica e IA para linguagem ambigua no planejamento
- checkpoints intermediarios em fluxos longos de CRUD e validacao de registros em tabela/lista
- normalizacao de entrada para `flow` textual e `sourcePayload` estruturado (`sourceType=endpoint`) antes do planejamento
- executor com `navigate`, `click`, `fill`, `select`, `check`, `press`, `assertText`, `assertUrl` e `waitForNavigation`
- healing com memoria, fallback e IA
- memoria persistida em disco
- API local com `options`, `metadata`, `planning.mode` e payload estruturado sem necessidade de `flow` textual
- painel web com plano, resumo, quality score e links de evidencia
- painel web com destaque explicito para recuperacoes por `memory`, `fallback` e `ai`
- execucao headless para uso recorrente com `flow` ou `sourcePayload`
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
- [Roteiro Tecnico da Demo](./docs/forgeqa.demo-script.md)
- [Analise de Contexto Visual](./docs/forgeqa.visual-context.md)
