# Tarefas Tecnicas: Forge QA

Este documento organiza o backlog tecnico do `Forge QA` como uma API de orquestracao de testes E2E guiada por intencao.

## Convencoes

- **Tipo:** Epic, Story, Task ou Spike
- **Status:** Todo, Doing, Done, Blocked
- **Dependencia:** item necessario antes da implementacao

---

## Epic 0. Fundacao do Projeto

### FQA-000

- **Tipo:** Epic
- **Titulo:** Estruturar a base tecnica do Forge QA
- **Status:** Done
- **Objetivo:** preparar o repositorio para desenvolvimento incremental

### FQA-001 a FQA-010

- **Tipo:** Tasks
- **Status:** Done
- **Objetivo consolidado:** bootstrap do repositorio, TypeScript, Playwright, `.env.example`, lint, README e documentacao base

---

## Epic 1. Fluxo Base de Geracao e Execucao

### FQA-100

- **Tipo:** Epic
- **Titulo:** Criar o fluxo base de geracao e execucao
- **Status:** Done
- **Objetivo:** garantir uma base funcional de geracao e execucao antes de endurecer healing e planejamento

### FQA-101 a FQA-107

- **Tipo:** Tasks
- **Status:** Done
- **Objetivo consolidado:** teste feliz, contrato de entrada, geracao inicial, executor e camada centralizada de healing

---

## Epic 2. Contexto e Contrato com IA

### FQA-200

- **Tipo:** Epic
- **Titulo:** Montar o pipeline de contexto e consulta a IA
- **Status:** Done
- **Objetivo:** permitir uso real de IA com contrato validado e auditoria minima

### FQA-201 a FQA-205

- **Tipo:** Tasks
- **Status:** Done
- **Objetivo consolidado:** prompt, extracao de DOM, schema, cliente de IA e auditoria

---

## Epic 3. Loop de Self-Healing

### FQA-300

- **Tipo:** Epic
- **Titulo:** Endurecer a recuperacao automatica de falhas de seletor
- **Status:** Doing
- **Objetivo:** tornar o healing previsivel, seguro e reaproveitavel

### FQA-301

- **Tipo:** Task
- **Titulo:** Reexecutar a acao com o seletor sugerido pela IA
- **Status:** Done
- **Dependencia:** FQA-204
- **Criterio de aceite:** o sistema tenta novamente a acao com fallback controlado apos resposta valida

### FQA-302

- **Tipo:** Task
- **Titulo:** Validar existencia e adequacao do elemento sugerido
- **Status:** Done
- **Dependencia:** FQA-301
- **Criterio de aceite:** o framework verifica se o elemento encontrado e compativel com a intencao da acao

### FQA-303

- **Tipo:** Task
- **Titulo:** Evitar loops infinitos de retentativa
- **Status:** Done
- **Dependencia:** FQA-301
- **Criterio de aceite:** a cura possui limite explicito de tentativas e falha de modo previsivel

### FQA-304

- **Tipo:** Task
- **Titulo:** Persistir curas bem-sucedidas em memoria local
- **Status:** Done
- **Dependencia:** FQA-302
- **Criterio de aceite:** uma cura bem-sucedida pode ser reaproveitada em execucoes futuras sem nova consulta a IA

### FQA-305

- **Tipo:** Task
- **Titulo:** Reusar memoria antes de consultar a IA
- **Status:** Done
- **Dependencia:** FQA-304
- **Criterio de aceite:** o sistema consulta primeiro a memoria local antes de acionar a IA para o mesmo contexto

---

## Epic 4. Observabilidade e Relatorios

### FQA-400

- **Tipo:** Epic
- **Titulo:** Tornar o comportamento da API explicavel e demonstravel
- **Status:** Doing
- **Objetivo:** produzir evidencias claras de planejamento, execucao e healing

### FQA-401

- **Tipo:** Task
- **Titulo:** Gerar logs estruturados por tentativa de geracao, execucao e cura
- **Status:** Done
- **Dependencia:** FQA-301
- **Criterio de aceite:** o artefato final mostra entrada, seletor original, seletor sugerido, estrategia usada e resultado

### FQA-402

- **Tipo:** Task
- **Titulo:** Implementar relatorio resumido de execucao
- **Status:** Done
- **Dependencia:** FQA-401
- **Criterio de aceite:** o relatorio exibe total de steps, curas tentadas, curas concluidas e falhas finais

### FQA-403

- **Tipo:** Task
- **Titulo:** Definir score basico de qualidade do teste
- **Status:** Done
- **Dependencia:** FQA-402
- **Criterio de aceite:** existe uma formula simples para refletir estabilidade do fluxo planejado

### FQA-404

- **Tipo:** Task
- **Titulo:** Salvar evidencias uteis para demo e diagnostico
- **Status:** Done
- **Dependencia:** FQA-401
- **Criterio de aceite:** a execucao preserva logs, traces ou snapshots suficientes para demonstracao

---

## Epic 5. API Local e Painel Web

### FQA-500

- **Tipo:** Epic
- **Titulo:** Expor o motor por API local e painel web
- **Status:** Doing
- **Objetivo:** tornar o produto utilizavel sem acoplamento a CLI

### FQA-501 a FQA-504

- **Tipo:** Tasks
- **Status:** Done
- **Objetivo consolidado:** endpoints de execucao/status e painel web local com logs e resultado

### FQA-505

- **Tipo:** Task
- **Titulo:** Criar fixture ou pagina controlada para demonstrar quebra de seletor
- **Status:** Done
- **Dependencia:** FQA-101
- **Criterio de aceite:** existe um cenario reproduzivel em que uma mudanca de seletor quebra o teste original

### FQA-506

- **Tipo:** Task
- **Titulo:** Demonstrar auto-cura em cenario controlado
- **Status:** Doing
- **Dependencia:** FQA-304
- **Criterio de aceite:** o fluxo mostra falha inicial, estrategia de healing e sucesso posterior

### FQA-507

- **Tipo:** Task
- **Titulo:** Demonstrar geracao automatica em cenario controlado
- **Status:** Doing
- **Dependencia:** FQA-104
- **Criterio de aceite:** o fluxo mostra entrada textual, cenario gerado e execucao resultante

### FQA-508

- **Tipo:** Task
- **Titulo:** Refinar documentacao da arquitetura e da demo
- **Status:** Todo
- **Dependencia:** FQA-504
- **Criterio de aceite:** um avaliador consegue entender a proposta, rodar o projeto e seguir a demonstracao

### FQA-509

- **Tipo:** Task
- **Titulo:** Preparar roteiro tecnico do video de apresentacao
- **Status:** Todo
- **Dependencia:** FQA-507
- **Criterio de aceite:** existe uma sequencia objetiva para mostrar painel, planejamento, execucao, falha, cura e reaproveitamento

---

## Epic 6. Pipeline e Operacao Recorrente

### FQA-600

- **Tipo:** Epic
- **Titulo:** Preparar o projeto para execucao recorrente fora da demo manual
- **Status:** Todo
- **Objetivo:** tornar o produto operavel em pipeline e ambientes repetiveis

### FQA-601

- **Tipo:** Task
- **Titulo:** Configurar workflow inicial no GitHub Actions
- **Status:** Done
- **Dependencia:** FQA-100
- **Criterio de aceite:** o projeto executa a suite automatizada em pipeline de forma previsivel

### FQA-602

- **Tipo:** Task
- **Titulo:** Definir parametros minimos para execucao automatizada
- **Status:** Done
- **Dependencia:** FQA-501
- **Criterio de aceite:** existe uma forma clara de disparar o motor sem interface grafica em ambiente automatizado

---

## Epic 7. Qualidade e Evolucao

### FQA-700

- **Tipo:** Epic
- **Titulo:** Endurecer o nucleo apos o fluxo principal funcionar
- **Status:** Doing
- **Objetivo:** reduzir risco tecnico e abrir caminho para evolucao

### FQA-701

- **Tipo:** Task
- **Titulo:** Criar testes para o planner de cenarios
- **Status:** Doing
- **Dependencia:** FQA-103
- **Criterio de aceite:** o planner cobre casos simples e produz saida previsivel

### FQA-702

- **Tipo:** Task
- **Titulo:** Criar testes para o extrator de DOM
- **Status:** Todo
- **Dependencia:** FQA-202
- **Criterio de aceite:** o extrator cobre cenarios comuns e ignora ruido irrelevante

### FQA-703

- **Tipo:** Task
- **Titulo:** Criar testes para validacao do retorno da IA
- **Status:** Doing
- **Dependencia:** FQA-204
- **Criterio de aceite:** respostas validas e invalidas sao tratadas de forma previsivel

### FQA-704

- **Tipo:** Story
- **Titulo:** Ampliar suporte para novas acoes alem de `click` e `fill`
- **Status:** Doing
- **Dependencia:** FQA-300
- **Criterio de aceite:** o framework suporta novas acoes mantendo o mesmo fluxo de healing

### FQA-705

- **Tipo:** Story
- **Titulo:** Ampliar suporte para novas fontes de entrada alem de texto
- **Status:** Todo
- **Dependencia:** FQA-100
- **Criterio de aceite:** o framework suporta ao menos uma nova fonte de entrada mantendo o fluxo geral

### FQA-706

- **Tipo:** Story
- **Titulo:** Enriquecer a memoria com historico e heuristicas
- **Status:** Todo
- **Dependencia:** FQA-304
- **Criterio de aceite:** curas armazenadas passam a considerar mais contexto do que apenas seletor bruto

### FQA-707

- **Tipo:** Story
- **Titulo:** Avaliar suporte futuro a contexto visual
- **Status:** Todo
- **Dependencia:** FQA-500
- **Criterio de aceite:** existe uma analise objetiva de custo, beneficio e limites do uso multimodal

---

## Epic 8. Generalizacao da API E2E

### FQA-800

- **Tipo:** Epic
- **Titulo:** Generalizar o Forge QA como API E2E orientada a intencao
- **Status:** Doing
- **Objetivo:** sair do fluxo fixture-specific e construir um motor reutilizavel para multiplos cenarios web

### FQA-801

- **Tipo:** Task
- **Titulo:** Enriquecer o contrato de steps e actions do motor
- **Status:** Done
- **Dependencia:** FQA-105
- **Criterio de aceite:** o motor suporta steps como `press`, `assertUrl`, `waitForNavigation` e metadados de navegacao

### FQA-802

- **Tipo:** Task
- **Titulo:** Separar o planner heuristico do gerador antigo
- **Status:** Done
- **Dependencia:** FQA-103
- **Criterio de aceite:** a geracao passa a depender de um planner dedicado e nao de um fluxo fixo codificado no gerador

### FQA-803

- **Tipo:** Task
- **Titulo:** Adaptar o executor para novos tipos de step
- **Status:** Done
- **Dependencia:** FQA-801
- **Criterio de aceite:** o executor entende novos steps sem quebrar a suite existente

### FQA-804

- **Tipo:** Task
- **Titulo:** Implementar descoberta inicial de navegacao para autenticacao
- **Status:** Done
- **Dependencia:** FQA-802
- **Criterio de aceite:** quando a URL inicial nao e uma tela de login, o planner tenta descobrir a entrada de autenticacao por heuristica

### FQA-805

- **Tipo:** Task
- **Titulo:** Exibir o plano gerado pela API no painel web
- **Status:** Done
- **Dependencia:** FQA-802
- **Criterio de aceite:** o usuario consegue ver o cenario planejado antes ou durante a execucao

### FQA-806

- **Tipo:** Task
- **Titulo:** Preparar contrato da API para fontes futuras e configuracoes de execucao
- **Status:** Done
- **Dependencia:** FQA-501
- **Criterio de aceite:** a API aceita um payload extensivel sem quebrar compatibilidade com o formato atual

### FQA-807

- **Tipo:** Story
- **Titulo:** Generalizar heuristicas para fluxos alem de autenticacao
- **Status:** Done
- **Dependencia:** FQA-802
- **Criterio de aceite:** o planner passa a suportar ao menos mais uma classe de fluxo alem de autenticacao

---

## Sprint Atual Recomendada

Os itens com maior valor imediato agora sao:

- FQA-506
- FQA-508
- FQA-705
- FQA-706
- FQA-707
