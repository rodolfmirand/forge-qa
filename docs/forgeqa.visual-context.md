# Analise: Suporte Futuro a Contexto Visual

Este documento registra uma analise objetiva sobre o uso futuro de contexto visual no `Forge QA`.

## 1. Pergunta

Vale adicionar contexto visual ou multimodal ao `Forge QA`?

Resposta curta:

Sim, como camada complementar. Nao como base principal do produto.

## 2. Onde contexto visual ajuda de verdade

### Healing de UI altamente dinamica

Quando o DOM e pouco semantico ou os seletores sao ruins, uma imagem da tela pode ajudar a localizar:

- botoes com texto estilizado;
- cards clicaveis;
- menus visuais;
- estados em que a hierarquia do DOM nao descreve bem a interface.

### Validacao de layout e estado visual

Pode ajudar a verificar:

- banners e alertas importantes;
- estados vazios;
- presenca de componentes-chave;
- regressao visual de alto nivel.

### Classificacao de pagina ou etapa

A imagem pode complementar a identificacao de:

- tela de login;
- dashboard;
- modal aberto;
- etapa de formulario.

## 3. Onde contexto visual nao deve substituir o fluxo atual

Nao deve substituir:

- planejamento principal de steps;
- execucao de acoes;
- validacao funcional baseada em DOM, URL e texto.

Motivo:

- custo maior;
- latencia maior;
- menor determinismo;
- mais dificuldade de auditar precisamente por que uma acao foi escolhida.

## 4. Estrategia recomendada

Usar contexto visual apenas como fallback adicional, nesta ordem:

1. memoria local
2. heuristicas/fallbacks de seletor
3. DOM resumido
4. IA textual/estruturada
5. contexto visual, apenas quando os passos anteriores falharem

Essa ordem preserva previsibilidade e custo.

## 5. Custos e tradeoffs

### Beneficios

- aumenta robustez em interfaces pouco semanticas;
- melhora capacidade de entender telas mais ricas visualmente;
- abre caminho para validacoes visuais guiadas por intencao.

### Custos

- maior consumo de tokens/recursos;
- tempo maior de resposta;
- mais variabilidade entre execucoes;
- necessidade de politicas claras para screenshots e dados sensiveis.

## 6. Riscos especificos

### Vazamento de informacao sensivel em screenshot

Mitigacao:

- mascarar ou limitar capturas;
- evitar enviar contexto visual de areas com dados reais sem filtro.

### Falsa confianca em matching visual

Mitigacao:

- nunca executar acao apenas por similaridade visual sem validacao de DOM/compatibilidade.

### Aumento de complexidade de produto cedo demais

Mitigacao:

- manter a multimodalidade fora do caminho critico do MVP funcional e da API principal.

## 7. Recomendacao final

A recomendacao para o `Forge QA` e:

- manter o DOM e a estrutura de steps como fonte principal de verdade;
- adicionar contexto visual apenas como camada opcional de enriquecimento;
- introduzir primeiro em healing e classificacao de etapa, nao em planejamento completo.

## 8. Criterio para iniciar implementacao

So vale iniciar implementacao multimodal quando estas condicoes estiverem satisfeitas:

- planner textual/estruturado estiver estavel;
- healing atual estiver bem auditado;
- memoria contextual estiver madura;
- houver casos reais onde o DOM sozinho falha de forma recorrente.
