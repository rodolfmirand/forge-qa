# Forge QA

## 1. Visao Geral

O `Forge QA` e uma proposta de framework de automacao de testes com apoio de IA alinhado ao desafio oficial da Second Mind, com prazo final em 02/04/2026.

O desafio oficial exige uma solucao que:

- gere testes automaticamente;
- execute os testes automaticamente;
- use IA em pelo menos um ponto relevante do fluxo;
- entregue resultados claros com logs, evidencias e, idealmente, score de qualidade.

Dentro desse contexto, o `Forge QA` foca em um problema recorrente em times de produto: testes que sao caros para criar, frageis para manter e pouco resilientes a mudancas pequenas na interface.

## 2. Abstracao do Desafio

O problema central nao e apenas executar testes automaticamente. Isso ja e resolvido por ferramentas como Playwright. O desafio real e criar um fluxo que gere testes com menos esforco manual, execute esses testes com previsibilidade e aumente a resiliencia da automacao sem perder controle.

Em termos abstratos, o projeto precisa resolver cinco pontos:

1. Transformar uma fonte de entrada util em cenarios ou testes executaveis.
2. Executar automaticamente esses testes em um motor confiavel.
3. Detectar quando uma falha foi causada por fragilidade de seletor, e nao por defeito real do produto.
4. Reconstruir a intencao da acao original a partir do contexto disponivel.
5. Registrar geracao, execucao e cura de forma auditavel para reaproveitamento futuro.

A ideia, portanto, nao e apenas envolver o framework de testes com uma camada de cura. O produto precisa unir geracao automatica, execucao automatica e recuperacao inteligente em um fluxo coeso.

## 3. Necessidades do Projeto

### 3.1 Necessidades de negocio

- Demonstrar uso real de IA em um fluxo de engenharia, nao apenas um uso cosmetico.
- Entregar algo funcional dentro do prazo de 02/04/2026.
- Gerar uma narrativa forte para pitch, demo e avaliacao tecnica.

### 3.2 Necessidades tecnicas

- Gerar testes ou cenarios automaticamente a partir de uma fonte de entrada.
- Executar testes web de forma confiavel.
- Interceptar falhas de localizacao de elementos.
- Extrair contexto suficiente da tela sem enviar ruido desnecessario para a IA.
- Solicitar respostas estruturadas e deterministicas da IA.
- Reexecutar a acao com fallback seguro.
- Persistir o aprendizado para reduzir chamadas futuras.
- Produzir logs e relatorios que mostrem valor objetivo.

### 3.3 Necessidades de produto

- Ter um MVP claro e demonstravel em poucos minutos.
- Explicar facilmente o diferencial em relacao a uma suite Playwright comum.
- Permitir evolucao posterior para mais tipos de acao, mais fontes de entrada e mais politicas de validacao.

## 4. Problema-Alvo

A dor principal esta em dois pontos acumulados:

- o custo de transformar requisitos ou fluxos em testes executaveis;
- a manutencao de testes UI depois que eles ja existem.

Em suites tradicionais, pequenas mudancas como:

- alteracao de `id`, `class` ou `data-testid`;
- reorganizacao de containers;
- troca de rotulo visivel;
- introducao de componentes novos;

podem quebrar testes validos do ponto de vista funcional.

Isso gera tres efeitos ruins:

- falso negativo: o produto funciona, mas o teste falha;
- retrabalho: o time perde tempo criando ou corrigindo testes;
- perda de confianca: a automacao passa a ser vista como fragil.

## 5. Proposta de Solucao

O `Forge QA` propoe um fluxo em duas camadas:

1. `AI-assisted test generation`
2. `AI-assisted self-healing`

O primeiro passo atende a exigencia de gerar testes automaticamente. O segundo passo entrega o principal diferencial tecnico do projeto.

Em alto nivel, o fluxo sera:

1. Receber uma fonte de entrada, inicialmente texto descritivo de fluxo ou cenario.
2. Gerar um cenario ou spec executavel.
3. Executar o teste automaticamente com Playwright.
4. Se uma acao falhar por seletor quebrado, capturar a intencao da acao original.
5. Extrair um snapshot simplificado da pagina atual.
6. Enviar para a IA apenas o contexto relevante.
7. Solicitar um novo seletor ou estrategia de localizacao.
8. Validar a resposta recebida.
9. Tentar novamente a acao.
10. Registrar a geracao, a execucao e a cura, se houver.

O valor da IA aqui nao e apenas inventar testes. E reduzir o gap entre intencao, execucao e manutencao da automacao.

## 6. Hipotese do MVP

Se o framework conseguir gerar cenarios iniciais de teste a partir de entradas simples e recuperar automaticamente falhas comuns de seletor em cenarios web controlados, entao ele ja prova valor suficiente para:

- reduzir esforco manual na criacao inicial de testes;
- reduzir manutencao manual em casos comuns;
- demonstrar um diferencial real de IA aplicada em QA;
- justificar evolucoes futuras para cenarios mais complexos.

O MVP nao precisa resolver todos os tipos de fonte nem todos os tipos de falha. Ele precisa resolver bem um recorte pequeno, visivel e defendivel.

## 7. Escopo Recomendado do MVP

### Dentro do escopo

- Testes web em Playwright.
- Geracao automatica inicial a partir de texto descritivo.
- Acoes basicas como `click`, `fill` e possivelmente `select`.
- Falhas relacionadas a seletor nao encontrado ou elemento nao localizavel.
- Extracao de DOM simplificado com foco em elementos interativos.
- Uso de IA para sugerir um novo seletor em JSON.
- Retentativa automatica.
- Persistencia local de seletores curados.
- Relatorio final com eventos de geracao, execucao e cura.

### Fora do escopo inicialmente

- Suporte completo e generico para todas as fontes de entrada do desafio.
- Cura para regras de negocio quebradas.
- Correcao de asserts de conteudo.
- Interpretacao visual completa por screenshot multimodal.
- Suporte a aplicacoes nativas ou mobile.
- Aprendizado autonomo sem validacao.
- Edicao automatica permanente do codigo-fonte do teste.

## 8. Requisitos Funcionais

- O sistema deve aceitar ao menos uma fonte de entrada para geracao automatica de testes.
- O sistema deve transformar essa entrada em um cenario ou estrutura executavel.
- O sistema deve executar testes Playwright normalmente quando nao houver falhas.
- O sistema deve interceptar falhas elegiveis de localizacao de elemento.
- O sistema deve montar um contexto compacto e relevante da pagina.
- A IA deve responder em formato estruturado, preferencialmente JSON.
- O framework deve validar o retorno antes de reutiliza-lo.
- O sistema deve reexecutar a acao com o novo seletor.
- O sistema deve registrar sucesso, falha, seletor original, seletor sugerido e motivo da intervencao.
- O sistema deve persistir curas reaproveitaveis para execucoes futuras.

## 9. Requisitos Nao Funcionais

- Baixo acoplamento com os testes: a camada de geracao e a camada de cura devem envolver a automacao, nao poluir toda a suite.
- Auditabilidade: toda intervencao da IA deve ser rastreavel.
- Seguranca de execucao: a IA nao pode executar acoes arbitrarias fora do contrato esperado.
- Custo controlado: o contexto enviado para a IA deve ser enxuto.
- Determinismo razoavel: o prompt e a estrutura de resposta devem minimizar variacao inutil.
- Facilidade de demo: o fluxo precisa ser reproduzivel em video curto.

## 10. Arquitetura Inicial Sugerida

- Linguagem: TypeScript
- Framework de automacao: Playwright
- Camada de IA: OpenAI Node.js SDK
- Execucao automatizada: GitHub Actions
- Persistencia simples: arquivo JSON local para memoria de curas

### Componentes principais

- `Test Generator`: transforma entrada em cenarios ou specs executaveis.
- `Test Runner`: executa os testes.
- `Healer`: intercepta falhas e coordena o processo de cura.
- `DOM Extractor`: resume a pagina em contexto util.
- `AI Resolver`: consulta a IA e recebe sugestoes estruturadas.
- `Selector Memory`: armazena curas bem-sucedidas.
- `Reporter`: resume execucao, falhas e intervencoes.

## 11. Fluxo de Execucao Esperado

1. O sistema recebe uma entrada de geracao, inicialmente texto.
2. O `Test Generator` transforma essa entrada em um cenario ou spec executavel.
3. O `Test Runner` tenta executar `click` ou `fill` com o seletor original.
4. A acao falha por timeout ou ausencia do elemento.
5. O `Healer` identifica que a falha e candidata a recuperacao.
6. O `DOM Extractor` coleta apenas elementos relevantes da pagina.
7. O `AI Resolver` recebe:
   - a intencao da acao;
   - o seletor original;
   - o DOM resumido;
   - metadados uteis como tipo de elemento e texto esperado.
8. A IA retorna um novo seletor ou estrategia equivalente.
9. O framework valida e reaplica a acao.
10. Se funcionar, registra a cura e atualiza a memoria.
11. Se falhar, encerra com erro explicito e evidencias.

## 12. Criterios de Sucesso

O projeto sera bem-sucedido se entregar:

- uma execucao funcional de teste automatizado;
- pelo menos um fluxo demonstravel de geracao automatica de teste;
- pelo menos um caso demonstravel de falha recuperada pela IA;
- persistencia da cura para reuso posterior;
- log claro mostrando antes, durante e depois da intervencao;
- documentacao suficiente para explicar a arquitetura em poucos minutos.

## 13. Riscos e Mitigacoes

### Risco: contexto demais ou de menos

Mitigacao: extrair apenas elementos interativos e metadados essenciais.

### Risco: resposta inconsistente da IA

Mitigacao: exigir JSON estrito, validar schema e limitar o contrato de saida.

### Risco: geracao produzir teste superficial ou pouco util

Mitigacao: restringir o MVP a entradas simples, contrato de saida objetivo e fixture demonstravel.

### Risco: a IA sugerir seletor incorreto

Mitigacao: validar existencia, visibilidade e compatibilidade do elemento antes da acao final.

### Risco: custo e latencia altos

Mitigacao: usar memoria local de seletores e chamar a IA apenas em falhas elegiveis.

### Risco: escopo crescer demais

Mitigacao: restringir o MVP a poucas fontes de entrada, poucos tipos de acao e poucos cenarios controlados.

## 14. Entregaveis

- Codigo funcional do framework, do fluxo de geracao e do exemplo de teste.
- Caso demonstrativo com geracao, execucao e auto-recuperacao.
- README com arquitetura e instrucoes de execucao.
- Video de demonstracao de ate 5 minutos.

## 15. Roadmap de 7 Dias

### Dia 1 - Fundacao

- Inicializar projeto Node.js.
- Configurar TypeScript.
- Instalar Playwright.
- Instalar SDK da OpenAI.
- Estruturar pastas base.

### Dia 2 - Fluxo base

- Criar teste feliz de referencia.
- Definir contrato de entrada para geracao de testes.
- Implementar gerador inicial de cenario.

### Dias 3 e 4 - Contexto + IA

- Transformar geracao em spec ou fluxo executavel.
- Construir extrator de DOM simplificado.
- Definir prompt de sistema e formato JSON de resposta.
- Implementar cliente de IA com validacao.

### Dia 5 - Auto-cura

- Reexecutar acoes com seletor sugerido.
- Persistir curas bem-sucedidas.
- Evitar loops de retentativa.

### Dia 6 - Observabilidade

- Gerar relatorio final.
- Exibir total de testes, curas e taxa de recuperacao.
- Configurar pipeline basico no GitHub Actions.

### Dia 7 - Fechamento

- Refinar README.
- Preparar demo reproduzivel.
- Gravar video mostrando geracao, quebra, cura e reaproveitamento.

## 16. Mensagem Central do Projeto

O diferencial do `Forge QA` nao e apenas rodar testes com IA. E gerar testes a partir de intencao, executa-los automaticamente e tornar a automacao menos fragil, mais reaproveitavel e mais proxima do comportamento esperado do que da rigidez do seletor original.

Em uma frase:

> Um framework que transforma intencao em teste executavel e, quando a interface muda, tenta entender, se adaptar e continuar de forma controlada.
