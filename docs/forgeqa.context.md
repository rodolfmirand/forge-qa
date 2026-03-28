# Forge QA

## 1. Visao Geral

O `Forge QA` e uma API de orquestracao de testes E2E com IA, alinhada ao desafio oficial da Second Mind.

O desafio pede uma solucao que:

- gere testes automaticamente;
- execute testes automaticamente;
- use IA em um ponto relevante do fluxo;
- entregue logs, evidencias e um resultado defensavel.

A direcao atual do projeto deixa de tratar `login` como finalidade. `Login` passa a ser apenas um cenario inicial de validacao. O produto precisa ser capaz de receber uma intencao, planejar um fluxo executavel, navegar pela aplicacao, executar acoes, aplicar healing quando necessario e devolver um resultado auditavel por API.

## 2. Abstracao do Desafio

O problema real nao e apenas rodar testes com Playwright. Isso ja existe. O desafio e reduzir o custo entre `intencao -> teste executavel -> manutencao`.

Em termos abstratos, o projeto precisa resolver:

1. transformar uma entrada util em um plano de teste estruturado;
2. executar esse plano com previsibilidade;
3. reconhecer quando uma falha e fragilidade de automacao, nao bug real;
4. recuperar a execucao com memoria, heuristica e IA;
5. registrar todas as decisoes de forma auditavel.

O valor do produto esta em combinar `planejamento`, `execucao` e `healing` dentro do mesmo motor.

## 3. Necessidades do Projeto

### 3.1 Negocio

- demonstrar IA aplicada em um fluxo real de engenharia;
- entregar algo funcional e convincente dentro do prazo;
- sustentar uma narrativa forte para pitch, avaliacao tecnica e demo.

### 3.2 Tecnicas

- gerar cenarios a partir de texto e evoluir para novas fontes;
- executar fluxos web com multiplas etapas;
- descobrir caminhos iniciais de navegacao quando a URL nao e a tela final desejada;
- aplicar healing com contexto compacto e resposta estruturada;
- manter memoria local e observabilidade suficiente para explicar decisoes.

### 3.3 Produto

- expor uma API local clara e utilizavel;
- oferecer uma interface amigavel sobre essa API;
- suportar extensao para novos tipos de acao, asserts e fontes de entrada;
- evitar que o produto fique preso a um caso unico como login.

## 4. Problema-Alvo

As dores principais sao:

- custo para transformar requisitos em automacao executavel;
- fragilidade de suites UI frente a pequenas mudancas da interface;
- baixa confianca em automacao quando os testes falham por razoes erradas.

Em suites tradicionais, pequenas alteracoes de `id`, texto, ordem de containers ou rotulo de CTA quebram testes validos. O resultado e retrabalho, falso negativo e perda de confianca.

## 5. Proposta de Solucao

O `Forge QA` propoe uma API com quatro camadas principais:

1. `flow intake`
2. `flow planning`
3. `execution + healing`
4. `reporting`

Fluxo de alto nivel:

1. receber `url` e `flow` por API;
2. transformar a intencao em um `GeneratedTestScenario`;
3. executar o plano no navegador;
4. recuperar falhas elegiveis com memoria, heuristicas e IA;
5. devolver status, auditoria, healing e evidencias.

O diferencial da IA nao e apenas "inventar teste". E ajudar o sistema a manter a execucao coerente quando a interface muda e, progressivamente, enriquecer o planejamento.

## 6. Hipotese da Fase Atual

Se o sistema conseguir planejar e executar fluxos E2E a partir de intencao textual, com descoberta inicial de navegacao, healing controlado e retorno auditavel por API, entao ele ja se torna uma base funcional e escalavel para o desafio.

A fase atual nao deve ser tratada como um prototipo descartavel. Ela deve estabelecer contratos tecnicos corretos para evolucao da API.

## 7. Escopo Atual Recomendado

### Dentro do escopo

- API local para receber execucoes e retornar resultados
- painel web local consumindo a API
- planner heuristico de fluxo
- steps como `navigate`, `click`, `fill`, `press`, `assertText`, `assertUrl` e `waitForNavigation`
- healing com memoria, fallbacks e IA
- extracao de DOM simplificada
- auditoria de geracao, execucao e healing
- casos controlados que provem descoberta de navegacao e auto-cura

### Fora do escopo atual

- analise direta de codigo-fonte frontend/backend como dependencia principal
- suporte completo a toda classe de aplicacoes web
- multimodalidade como obrigatoria
- autoedicao de codigo-fonte de testes
- suporte nativo a desktop ou mobile

## 8. Requisitos Funcionais

- aceitar ao menos entrada textual para planejar um fluxo
- transformar a entrada em um plano estruturado de steps
- executar o plano em Playwright
- suportar multiplos tipos de step, nao apenas `click` e `fill`
- descobrir o caminho inicial quando a URL fornecida nao e a tela final desejada
- interceptar falhas elegiveis de localizacao de elemento
- consultar memoria antes de acionar a IA
- validar respostas da IA antes de reuso
- expor status, resultado e auditoria pela API
- preservar logs sem expor segredos em claro

## 9. Requisitos Nao Funcionais

- `API-first`: o painel e outras interfaces devem consumir o mesmo motor
- auditabilidade: toda decisao automatica precisa ser rastreavel
- seguranca: a IA nao pode produzir acoes fora do contrato interno
- custo controlado: contexto para IA precisa ser enxuto
- extensibilidade: novos tipos de step nao devem quebrar o executor
- demonstrabilidade: o valor precisa aparecer em uma demo curta

## 10. Componentes Principais

- `Intake API`
- `Flow Planner`
- `Scenario Executor`
- `Action Layer`
- `Playwright Runner`
- `Healer`
- `DOM Extractor`
- `AI Resolver`
- `Selector Memory`
- `Reporter`

## 11. Fluxo de Execucao Esperado

1. o cliente envia `url` e `flow`;
2. o planner gera um cenario estruturado;
3. o executor aplica os steps no navegador;
4. se houver falha elegivel, o healer tenta memoria e fallback;
5. se necessario, a IA recebe contexto resumido da pagina;
6. a sugestao e validada e reexecutada;
7. a API devolve resultado, auditoria e artefatos relevantes.

## 12. Criterios de Sucesso

O projeto sera bem-sucedido se entregar:

- execucao funcional de fluxos E2E por API;
- planejamento automatizado a partir de texto;
- pelo menos um caso de descoberta inicial de navegacao;
- pelo menos um caso de healing demonstravel;
- memoria reaproveitavel;
- logs claros do plano e da execucao.

## 13. Riscos e Mitigacoes

### Risco: planner excessivamente heuristico

Mitigacao: separar contrato de steps das heuristicas de planning e expandir por classes de fluxo.

### Risco: IA sugerir seletor inadequado

Mitigacao: validar existencia, compatibilidade e limitar retentativas.

### Risco: produto ficar preso a login

Mitigacao: tratar login apenas como fixture de validacao e planejar novas classes de fluxo.

### Risco: vazamento de segredos em auditoria

Mitigacao: sanitizar payloads e nunca expor credenciais no painel.

## 14. Entregaveis

- codigo funcional da API local e do motor de execucao;
- planner inicial de fluxo;
- healing com IA e memoria;
- casos demonstrativos controlados;
- documentacao e roteiro tecnico suficientes para avaliacao.

## 15. Roadmap Atual

### Etapa 1. Base pronta

- bootstrap, TypeScript, Playwright, API local e painel

### Etapa 2. Core de execucao pronto

- gerador inicial, executor, healing base e cliente de IA

### Etapa 3. Generalizacao em andamento

- contrato de actions e steps mais rico
- planner heuristico separado
- descoberta inicial de navegacao para autenticacao
- suporte a `assertUrl`, `press` e `waitForNavigation`

### Etapa 4. Proximos blocos

- validacao forte de healing
- limite de retentativa
- persistencia real da memoria
- exibicao do plano no painel
- generalizacao para fluxos alem de autenticacao
- pipeline recorrente

## 16. Mensagem Central

O `Forge QA` nao deve ser uma automacao de login com IA. Deve ser uma API que transforma intencao em fluxo E2E executavel, tenta manter esse fluxo operante quando a UI muda e devolve um resultado explicavel para engenharia e negocio.
