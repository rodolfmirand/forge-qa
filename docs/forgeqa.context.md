# Forge QA

## 1. Visao Geral
O `Forge QA` e uma proposta de framework de automacao de testes com apoio de IA voltado para um problema recorrente em times de produto: testes de interface que quebram com facilidade por mudancas pequenas no DOM, exigindo manutencao manual constante.

Mais do que "usar IA em testes", o desafio real e construir uma automacao que:

- continue confiavel mesmo quando a interface muda;
- reduza o custo de manutencao dos testes;
- gere evidencias claras de quando a IA ajudou, como ajudou e com qual resultado;
- seja simples o suficiente para ser demonstrada e validada rapidamente.

## 2. Abstracao do Desafio
O problema central nao e apenas executar testes automaticamente. Isso ja e resolvido por ferramentas como Playwright. O desafio real e aumentar a resiliencia da automacao sem sacrificar previsibilidade.

Em termos abstratos, o projeto precisa resolver quatro pontos:

1. Detectar quando uma falha foi causada por fragilidade de seletor, e nao por defeito real do produto.
2. Reconstruir a intencao da acao original a partir do contexto disponivel.
3. Encontrar uma alternativa segura para continuar o fluxo automatizado.
4. Registrar a "cura" de forma auditavel para reaproveitamento futuro.

A ideia, portanto, nao e substituir o framework de testes, mas adicionar uma camada de recuperacao inteligente entre a falha de automacao e a interrupcao definitiva do teste.

## 3. Necessidades do Projeto

### 3.1 Necessidades de negocio
- Demonstrar uso real de IA em um fluxo de engenharia, nao apenas um uso cosmetico.
- Entregar algo funcional dentro do prazo.
- Gerar uma narrativa forte para pitch, demo e avaliacao tecnica.

### 3.2 Necessidades tecnicas
- Executar testes web de forma confiavel.
- Interceptar falhas de localizacao de elementos.
- Extrair contexto suficiente da tela sem enviar ruido desnecessario para a IA.
- Solicitar uma resposta estruturada e deterministica da IA.
- Reexecutar a acao com fallback seguro.
- Persistir o aprendizado para reduzir chamadas futuras.
- Produzir logs e relatorios que mostrem valor objetivo.

### 3.3 Necessidades de produto
- Ter um MVP claro e demonstravel em poucos minutos.
- Explicar facilmente o diferencial em relacao a uma suite Playwright comum.
- Permitir evolucao posterior para mais tipos de acao, mais fontes de contexto e mais politicas de validacao.

## 4. Problema-Alvo
A dor principal esta na manutencao de testes UI. Em suites tradicionais, pequenas mudancas como:

- alteracao de `id`, `class` ou `data-testid`;
- reorganizacao de containers;
- troca de rotulo visivel;
- introducao de componentes novos;

podem quebrar testes validos do ponto de vista funcional.

Isso gera tres efeitos ruins:

- falso negativo: o produto funciona, mas o teste falha;
- retrabalho: o time perde tempo corrigindo seletores;
- perda de confianca: a automacao passa a ser vista como fragil.

## 5. Proposta de Solucao
O `Forge QA` propoe uma camada de `self-healing` orientada por IA.

Quando uma acao automatizada falhar por nao encontrar o elemento esperado, o fluxo sera:

1. Capturar a intencao da acao original.
2. Extrair um snapshot simplificado da pagina atual.
3. Enviar para a IA apenas o contexto relevante.
4. Solicitar um novo seletor ou estrategia de localizacao.
5. Validar a resposta recebida.
6. Tentar novamente a acao.
7. Registrar o evento e persistir a cura, se bem-sucedida.

O valor da IA aqui nao e "inventar testes", mas recuperar automaticamente a capacidade de execucao com base em contexto semantico.

## 6. Hipotese do MVP
Se o framework conseguir recuperar automaticamente falhas simples de seletor em cenarios web controlados, entao ele ja prova valor suficiente para:

- reduzir manutencao manual em casos comuns;
- demonstrar um diferencial real de IA aplicada em QA;
- justificar evolucoes futuras para cenarios mais complexos.

O MVP nao precisa resolver todos os tipos de falha. Ele precisa resolver bem um recorte pequeno, visivel e defendivel.

## 7. Escopo Recomendado do MVP

### Dentro do escopo
- Testes web em Playwright.
- Acoes basicas como `click`, `fill` e possivelmente `select`.
- Falhas relacionadas a seletor nao encontrado ou elemento nao localizavel.
- Extracao de DOM simplificado com foco em elementos interativos.
- Uso de IA para sugerir um novo seletor em JSON.
- Retentativa automatica.
- Persistencia local de seletores curados.
- Relatorio final com eventos de cura.

### Fora do escopo inicialmente
- Cura para regras de negocio quebradas.
- Correcao de asserts de conteudo.
- Interpretacao visual completa por screenshot multimodal.
- Suporte a aplicacoes nativas ou mobile.
- Aprendizado autonomo sem validacao.
- Edicao automatica permanente do codigo-fonte do teste.

## 8. Requisitos Funcionais
- O sistema deve executar testes Playwright normalmente quando nao houver falhas.
- O sistema deve interceptar falhas elegiveis de localizacao de elemento.
- O sistema deve montar um contexto compacto e relevante da pagina.
- A IA deve responder em formato estruturado, preferencialmente JSON.
- O framework deve validar o retorno antes de reutiliza-lo.
- O sistema deve reexecutar a acao com o novo seletor.
- O sistema deve registrar sucesso, falha, seletor original, seletor sugerido e motivo da intervencao.
- O sistema deve persistir curas reaproveitaveis para execucoes futuras.

## 9. Requisitos Nao Funcionais
- Baixo acoplamento com os testes: a camada de cura deve envolver a automacao, nao reescrever toda a suite.
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
- `Test Runner`: executa os testes.
- `Healer`: intercepta falhas e coordena o processo de cura.
- `DOM Extractor`: resume a pagina em contexto util.
- `AI Resolver`: consulta a IA e recebe sugestoes estruturadas.
- `Selector Memory`: armazena curas bem-sucedidas.
- `Reporter`: resume execucao, falhas e intervencoes.

## 11. Fluxo de Execucao Esperado
1. O teste tenta executar `click` ou `fill` com o seletor original.
2. A acao falha por timeout ou ausencia do elemento.
3. O `Healer` identifica que a falha e candidata a recuperacao.
4. O `DOM Extractor` coleta apenas elementos relevantes da pagina.
5. O `AI Resolver` recebe:
   - a intencao da acao;
   - o seletor original;
   - o DOM resumido;
   - metadados uteis como tipo de elemento e texto esperado.
6. A IA retorna um novo seletor ou estrategia equivalente.
7. O framework valida e reaplica a acao.
8. Se funcionar, registra a cura e atualiza a memoria.
9. Se falhar, encerra com erro explicito e evidencias.

## 12. Criterios de Sucesso
O projeto sera bem-sucedido se entregar:

- uma execucao funcional de teste automatizado;
- pelo menos um caso demonstravel de falha recuperada pela IA;
- persistencia da cura para reuso posterior;
- log claro mostrando antes, durante e depois da intervencao;
- documentacao suficiente para explicar a arquitetura em poucos minutos.

## 13. Riscos e Mitigacoes

### Risco: contexto demais ou de menos
Mitigacao: extrair apenas elementos interativos e metadados essenciais.

### Risco: resposta inconsistente da IA
Mitigacao: exigir JSON estrito, validar schema e limitar o contrato de saida.

### Risco: a IA sugerir seletor incorreto
Mitigacao: validar existencia, visibilidade e compatibilidade do elemento antes da acao final.

### Risco: custo e latencia altos
Mitigacao: usar memoria local de seletores e chamar a IA apenas em falhas elegiveis.

### Risco: escopo crescer demais
Mitigacao: restringir o MVP a poucos tipos de acao e poucos cenarios controlados.

## 14. Entregaveis
- Codigo funcional do framework e do exemplo de teste.
- Caso demonstrativo com falha e auto-recuperacao.
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
- Implementar wrapper inicial do `Healer`.
- Definir contrato de acao e captura de erro.

### Dias 3 e 4 - Contexto + IA
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
- Gravar video mostrando quebra, cura e reaproveitamento.

## 16. Mensagem Central do Projeto
O diferencial do `Forge QA` nao e apenas rodar testes com IA. E tornar a automacao menos fragil, mais reaproveitavel e mais proxima da intencao do usuario do que da rigidez do seletor original.

Em uma frase:

> Um framework de automacao que nao apenas falha, mas tenta entender, se adaptar e continuar de forma controlada.
