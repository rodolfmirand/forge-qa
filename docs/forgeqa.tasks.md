# Tarefas Tecnicas: Forge QA

Este documento transforma o contexto e o roadmap do projeto em um backlog tecnico executavel.

## Convencoes

- **Tipo:** Epic, Story, Task ou Spike
- **Status:** Todo, Doing, Done, Blocked
- **Dependencia:** item que precisa existir antes

---

## Epic 0. Fundacao do Projeto

### FQA-000

- **Tipo:** Epic
- **Titulo:** Estruturar a base tecnica do Forge QA
- **Status:** Done
- **Objetivo:** preparar o repositorio para desenvolvimento incremental do MVP

### FQA-001

- **Tipo:** Task
- **Titulo:** Criar `package.json` com scripts de desenvolvimento
- **Status:** Done
- **Dependencia:** FQA-000
- **Criterio de aceite:** o projeto possui scripts para `dev`, `build`, `test`, `lint`, `typecheck` e `format`

### FQA-002

- **Tipo:** Task
- **Titulo:** Configurar TypeScript para execucao local
- **Status:** Done
- **Dependencia:** FQA-001
- **Criterio de aceite:** o projeto compila corretamente e possui verificacao de tipos isolada

### FQA-003

- **Tipo:** Task
- **Titulo:** Instalar e configurar Playwright
- **Status:** Done
- **Dependencia:** FQA-001
- **Criterio de aceite:** existe uma suite executavel localmente com pelo menos um teste de referencia

### FQA-004

- **Tipo:** Task
- **Titulo:** Definir estrutura inicial de pastas do projeto
- **Status:** Done
- **Dependencia:** FQA-001
- **Criterio de aceite:** diretorios base existem para `src`, `tests`, `storage` e `docs`

### FQA-005

- **Tipo:** Task
- **Titulo:** Criar `.env.example` com configuracoes da IA
- **Status:** Done
- **Dependencia:** FQA-001
- **Criterio de aceite:** variaveis essenciais para execucao local e integracao com a IA estao documentadas

### FQA-006

- **Tipo:** Task
- **Titulo:** Configurar lint e formatacao
- **Status:** Done
- **Dependencia:** FQA-001
- **Criterio de aceite:** o repositorio possui configuracao funcional de lint e formatacao automatica

### FQA-007

- **Tipo:** Task
- **Titulo:** Atualizar `README.md` com instrucoes operacionais
- **Status:** Done
- **Dependencia:** FQA-001
- **Criterio de aceite:** um colaborador consegue instalar, configurar e rodar o projeto localmente

### FQA-008

- **Tipo:** Task
- **Titulo:** Formalizar documento de contexto do projeto
- **Status:** Done
- **Dependencia:** FQA-000
- **Criterio de aceite:** o desafio, escopo, hipotese do MVP e criterios de sucesso estao documentados

### FQA-009

- **Tipo:** Task
- **Titulo:** Formalizar documento de arquitetura inicial
- **Status:** Done
- **Dependencia:** FQA-000
- **Criterio de aceite:** a arquitetura descreve componentes, responsabilidades e direcao tecnica

### FQA-010

- **Tipo:** Task
- **Titulo:** Formalizar backlog tecnico inicial
- **Status:** Done
- **Dependencia:** FQA-000
- **Criterio de aceite:** o projeto possui tarefas organizadas por epicos, dependencias e criterios de aceite

---

## Epic 1. Fluxo Base de Geracao e Execucao

### FQA-100

- **Tipo:** Epic
- **Titulo:** Criar o fluxo minimo de geracao e execucao dos testes
- **Status:** Done
- **Objetivo:** garantir uma base funcional de geracao e execucao antes da camada de cura

### FQA-101

- **Tipo:** Task
- **Titulo:** Criar teste feliz de referencia com Playwright
- **Status:** Done
- **Dependencia:** FQA-003
- **Criterio de aceite:** existe pelo menos um fluxo UI simples executando com sucesso sem intervencao da IA

### FQA-102

- **Tipo:** Task
- **Titulo:** Definir contrato de entrada para geracao automatica de testes
- **Status:** Done
- **Dependencia:** FQA-003
- **Criterio de aceite:** o sistema aceita pelo menos uma fonte de entrada, inicialmente texto, com estrutura clara e validavel

### FQA-103

- **Tipo:** Task
- **Titulo:** Implementar servico inicial de geracao de cenarios
- **Status:** Done
- **Dependencia:** FQA-102
- **Criterio de aceite:** uma entrada textual simples e transformada em um cenario estruturado consumivel internamente

### FQA-104

- **Tipo:** Task
- **Titulo:** Transformar o cenario gerado em fluxo executavel
- **Status:** Done
- **Dependencia:** FQA-103
- **Criterio de aceite:** o sistema consegue converter o cenario gerado em execucao Playwright ou spec equivalente

### FQA-105

- **Tipo:** Task
- **Titulo:** Definir contrato interno das acoes automatizadas
- **Status:** Done
- **Dependencia:** FQA-104
- **Criterio de aceite:** acoes como `click` e `fill` possuem interface clara com seletor, intencao e metadados

### FQA-106

- **Tipo:** Task
- **Titulo:** Implementar wrapper inicial do `Healer`
- **Status:** Done
- **Dependencia:** FQA-105
- **Criterio de aceite:** a execucao passa por uma camada centralizada capaz de interceptar falhas de acao

### FQA-107

- **Tipo:** Task
- **Titulo:** Classificar falhas elegiveis para auto-cura
- **Status:** Done
- **Dependencia:** FQA-106
- **Criterio de aceite:** o sistema diferencia erros de seletor de falhas que nao devem disparar cura

---

## Epic 2. Contexto e Contrato com IA

### FQA-200

- **Tipo:** Epic
- **Titulo:** Montar o pipeline de contexto e consulta a IA
- **Status:** Todo
- **Objetivo:** permitir que a IA receba um pedido minimamente util e devolva uma resposta reaproveitavel

### FQA-201

- **Tipo:** Task
- **Titulo:** Definir prompt de sistema para geracao automatica de testes
- **Status:** Done
- **Dependencia:** FQA-102
- **Criterio de aceite:** o prompt deixa explicitos o objetivo, o formato de resposta e as restricoes da geracao

### FQA-202

- **Tipo:** Task
- **Titulo:** Implementar extracao simplificada do DOM
- **Status:** Todo
- **Dependencia:** FQA-107
- **Criterio de aceite:** o sistema coleta apenas elementos interativos e metadados relevantes para a cura

### FQA-203

- **Tipo:** Task
- **Titulo:** Definir schema JSON das respostas da IA
- **Status:** Todo
- **Dependencia:** FQA-201
- **Criterio de aceite:** o retorno esperado possui campos claros para cenarios gerados, seletor sugerido, confianca e justificativa curta

### FQA-204

- **Tipo:** Task
- **Titulo:** Implementar cliente de IA com validacao de resposta
- **Status:** Todo
- **Dependencia:** FQA-203
- **Criterio de aceite:** o sistema consulta a IA e rejeita respostas malformadas ou fora do contrato

### FQA-205

- **Tipo:** Task
- **Titulo:** Registrar o payload de geracao e cura para auditoria
- **Status:** Todo
- **Dependencia:** FQA-204
- **Criterio de aceite:** cada tentativa de geracao ou cura guarda contexto minimo para diagnostico posterior

---

## Epic 3. Loop de Self-Healing

### FQA-300

- **Tipo:** Epic
- **Titulo:** Implementar a recuperacao automatica de falhas de seletor
- **Status:** Todo
- **Objetivo:** fechar o fluxo ponta a ponta do MVP

### FQA-301

- **Tipo:** Task
- **Titulo:** Reexecutar a acao com o seletor sugerido pela IA
- **Status:** Todo
- **Dependencia:** FQA-204
- **Criterio de aceite:** o sistema tenta novamente a acao com fallback controlado apos resposta valida

### FQA-302

- **Tipo:** Task
- **Titulo:** Validar existencia e adequacao do elemento sugerido
- **Status:** Todo
- **Dependencia:** FQA-301
- **Criterio de aceite:** o framework verifica se o elemento encontrado e compativel com a intencao da acao

### FQA-303

- **Tipo:** Task
- **Titulo:** Evitar loops infinitos de retentativa
- **Status:** Todo
- **Dependencia:** FQA-301
- **Criterio de aceite:** a cura possui limite explicito de tentativas e falha de modo previsivel

### FQA-304

- **Tipo:** Task
- **Titulo:** Persistir curas bem-sucedidas em memoria local
- **Status:** Todo
- **Dependencia:** FQA-302
- **Criterio de aceite:** uma cura bem-sucedida pode ser reaproveitada em execucoes futuras sem nova consulta a IA

### FQA-305

- **Tipo:** Task
- **Titulo:** Reusar memoria antes de consultar a IA
- **Status:** Todo
- **Dependencia:** FQA-304
- **Criterio de aceite:** o sistema consulta primeiro a memoria local antes de acionar a IA para o mesmo contexto

---

## Epic 4. Observabilidade e Relatorios

### FQA-400

- **Tipo:** Epic
- **Titulo:** Tornar o comportamento do MVP explicavel e demonstravel
- **Status:** Todo
- **Objetivo:** produzir evidencias claras do valor gerado pela automacao e pela auto-cura

### FQA-401

- **Tipo:** Task
- **Titulo:** Gerar logs estruturados por tentativa de geracao, execucao e cura
- **Status:** Todo
- **Dependencia:** FQA-301
- **Criterio de aceite:** o terminal ou artefato final mostra entrada, seletor original, seletor sugerido e resultado da retentativa

### FQA-402

- **Tipo:** Task
- **Titulo:** Implementar relatorio resumido de execucao
- **Status:** Todo
- **Dependencia:** FQA-401
- **Criterio de aceite:** o relatorio exibe total de testes, curas tentadas, curas concluidas e falhas finais

### FQA-403

- **Tipo:** Task
- **Titulo:** Definir score basico de qualidade do teste
- **Status:** Todo
- **Dependencia:** FQA-402
- **Criterio de aceite:** existe uma formula simples e explicita para refletir o impacto das curas na qualidade percebida

### FQA-404

- **Tipo:** Task
- **Titulo:** Salvar evidencias uteis para demo
- **Status:** Todo
- **Dependencia:** FQA-401
- **Criterio de aceite:** a execucao consegue preservar logs, traces ou snapshots suficientes para demonstracao

---

## Epic 5. Pipeline e Demonstracao

### FQA-500

- **Tipo:** Epic
- **Titulo:** Preparar o MVP para execucao recorrente e apresentacao
- **Status:** Todo
- **Objetivo:** tornar o projeto apresentavel tecnicamente e operacionalmente

### FQA-501

- **Tipo:** Task
- **Titulo:** Configurar workflow inicial no GitHub Actions
- **Status:** Todo
- **Dependencia:** FQA-101
- **Criterio de aceite:** o projeto executa a suite automatizada em pipeline de forma previsivel

### FQA-502

- **Tipo:** Task
- **Titulo:** Criar fixture ou pagina controlada para demonstrar a quebra
- **Status:** Todo
- **Dependencia:** FQA-101
- **Criterio de aceite:** existe um cenario reproduzivel em que uma mudanca de seletor quebra o teste original

### FQA-503

- **Tipo:** Task
- **Titulo:** Demonstrar a auto-cura no mesmo cenario controlado
- **Status:** Todo
- **Dependencia:** FQA-304
- **Criterio de aceite:** o fluxo mostra falha inicial, intervencao da IA e sucesso posterior da execucao

### FQA-504

- **Tipo:** Task
- **Titulo:** Demonstrar a geracao automatica no mesmo cenario controlado
- **Status:** Todo
- **Dependencia:** FQA-104
- **Criterio de aceite:** o fluxo mostra entrada textual, cenario gerado e execucao do teste resultante

### FQA-505

- **Tipo:** Task
- **Titulo:** Refinar documentacao da arquitetura e da demo
- **Status:** Todo
- **Dependencia:** FQA-503
- **Criterio de aceite:** um avaliador consegue entender a proposta, rodar o projeto e seguir a demonstracao

### FQA-506

- **Tipo:** Task
- **Titulo:** Preparar roteiro tecnico do video de apresentacao
- **Status:** Todo
- **Dependencia:** FQA-504
- **Criterio de aceite:** existe uma sequencia objetiva para mostrar geracao, execucao, falha, cura e reaproveitamento

---

## Epic 6. Qualidade e Evolucao

### FQA-600

- **Tipo:** Epic
- **Titulo:** Endurecer o MVP apos o fluxo principal funcionar
- **Status:** Todo
- **Objetivo:** reduzir risco tecnico e abrir caminho para evolucao do projeto

### FQA-601

- **Tipo:** Task
- **Titulo:** Criar testes para o gerador de cenarios
- **Status:** Todo
- **Dependencia:** FQA-103
- **Criterio de aceite:** a geracao cobre casos simples e produz saida previsivel

### FQA-602

- **Tipo:** Task
- **Titulo:** Criar testes para o extrator de DOM
- **Status:** Todo
- **Dependencia:** FQA-202
- **Criterio de aceite:** o extrator cobre cenarios comuns e ignora ruido irrelevante

### FQA-603

- **Tipo:** Task
- **Titulo:** Criar testes para validacao do retorno da IA
- **Status:** Todo
- **Dependencia:** FQA-204
- **Criterio de aceite:** respostas validas e invalidas sao tratadas de forma previsivel

### FQA-604

- **Tipo:** Story
- **Titulo:** Ampliar suporte para novas acoes alem de `click` e `fill`
- **Status:** Todo
- **Dependencia:** FQA-300
- **Criterio de aceite:** o framework suporta pelo menos um novo tipo de acao mantendo o mesmo fluxo de cura

### FQA-605

- **Tipo:** Story
- **Titulo:** Ampliar suporte para novas fontes de entrada alem de texto
- **Status:** Todo
- **Dependencia:** FQA-100
- **Criterio de aceite:** o framework suporta pelo menos uma nova fonte de entrada mantendo o mesmo fluxo geral

### FQA-606

- **Tipo:** Story
- **Titulo:** Enriquecer a memoria com historico e heuristicas
- **Status:** Todo
- **Dependencia:** FQA-304
- **Criterio de aceite:** curas armazenadas passam a considerar mais contexto do que apenas seletor bruto

### FQA-607

- **Tipo:** Story
- **Titulo:** Avaliar suporte futuro a contexto visual
- **Status:** Todo
- **Dependencia:** FQA-500
- **Criterio de aceite:** existe uma analise objetiva de custo, beneficio e limites do uso multimodal

---

## Sprint Atual Recomendada

Os itens que devem receber foco imediato agora sao:

- FQA-202
- FQA-203
- FQA-204
- FQA-205
- FQA-301
- FQA-302
- FQA-303
- FQA-304
