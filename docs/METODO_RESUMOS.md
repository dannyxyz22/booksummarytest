# Como produzir resumos extensos e fiéis

[README](../README.md) · [Skills](SKILLS.md) · [Conteúdo](CONTEUDO.md)

## Recomendação para o Summa Brevis

O método adotado é **planejar a obra inteira, escrever por seções diretamente do original e revisar a cobertura e a fidelidade do arquivo final**. A extensão é distribuída antes da escrita; a montagem final recebe edição de continuidade, sem uma nova rodada de compressão.

A [book-summarizer](../.gemini/skills/book-summarizer/SKILL.md) foi evoluída no próprio local para preservar seu nome e o fluxo existente. O padrão de 20% continua, com faixa de 18–22%, mas agora funciona junto de um mapa de conteúdo, orçamento por seção, evidência e revisão. Uma meta explícita do usuário em palavras ou proporção tem precedência.

Não há evidência suficiente para chamar uma técnica de universalmente superior para todos os livros católicos ou modelos. Esta é uma proposta fundamentada e ajustada ao projeto, com ferramentas verificáveis; a superioridade editorial ainda precisa ser medida em livros completos.

## O que a pesquisa sustenta

| Fonte primária | Resultado ou orientação relevante | Aplicação e limite |
| --- | --- | --- |
| [OpenAI, Summarizing Long Documents (2024)](https://developers.openai.com/cookbook/examples/summarizing_long_documents) | O tamanho de uma resposta de resumo não cresce necessariamente com o documento; produzir partes permite controlar o detalhe. | Planejar palavras e escrever em partes. O exemplo está arquivado e não constitui comparação atual de modelos nem teste de livros católicos. |
| [FABLES, COLM 2024](https://arxiv.org/abs/2404.01261) | Analisa fidelidade e omissões em resumos de livros; os avaliadores automáticos estudados têm dificuldade para detectar afirmações infiéis. | Manter evidência e conferir afirmações no original. As obras e modelos estudados não demonstram desempenho em teologia. |
| [Wan et al., NAACL 2025](https://aclanthology.org/2025.naacl-long.442/) | Tanto a geração quanto a avaliação de fidelidade podem sofrer viés de posição em entradas longas. Técnicas mais complexas oferecem ganhos limitados nos experimentos. | Conferir deliberadamente o meio da obra. Dividir ou agregar não é garantia de fidelidade. |
| [HAMLET, EMNLP 2025](https://aclanthology.org/2025.emnlp-main.1241/) | Avalia compreensão em níveis global, intermediário e detalhado e encontra dificuldades sobretudo nos detalhes e efeitos de posição. | Revisar tese global, desenvolvimento dos capítulos e distinções locais. O checklist do projeto é uma adaptação, não uma reprodução do benchmark. |
| [Anthropic, orientações de contexto longo](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#long-context-prompting) | Recomenda identificar fontes e fundamentar respostas em passagens relevantes. | Guardar localizadores e evidência antes de redigir. As orientações de fornecedor não substituem avaliação da obra produzida. |

Essas fontes foram consultadas para esta revisão. As decisões de usar 20%, unidades geralmente de 3–6 mil palavras, pesos por densidade e os critérios editoriais abaixo são **adaptações do projeto**, não parâmetros validados por esses estudos.

## Quanto deve ter o resumo?

Conte as palavras do corpo da edição efetivamente usada. Páginas variam com fonte, margens, notas e ilustrações; não são uma medida estável para controlar a geração.

Exemplos aritméticos, supondo **300 palavras por página original** apenas para planejamento:

| Obra | Palavras estimadas | Alvo de 20% | Faixa de 18–22% |
| --- | --- | --- | --- |
| 100 páginas | 30.000 | 6.000 | 5.400–6.600 |
| 250 páginas | 75.000 | 15.000 | 13.500–16.500 |
| 500 páginas | 150.000 | 30.000 | 27.000–33.000 |

Substitua a estimativa pela contagem real antes de começar. O número de páginas do PDF resultante depende da diagramação; no webapp, capa, índice e quebras por H1 também influenciam.

O estilo publicado já comporta resumos extensos: na leitura por espaços usada durante a inspeção, *A Noite Escura* tinha cerca de 6,4 mil palavras, *A Síntese Tomista* 22,1 mil e o *Diário de Santa Faustina* 48,4 mil. São referências de extensão e voz, não provas de fidelidade nem metas para toda nova obra.

## Decisões que evitam resumos curtos ou artificiais

1. **Orçamento antes da redação.** Cada parte recebe espaço e perguntas de cobertura. Um tratado denso pode precisar de maior proporção que uma passagem repetitiva.
2. **Leitura integral por unidade.** Um índice ou uma busca por palavras-chave orienta a navegação, mas não substitui ler os capítulos. Truncamentos de ferramentas devem ser resolvidos antes de resumir.
3. **Redação extensa salva em arquivos.** A saída final pode ultrapassar o que cabe confortavelmente numa resposta. Salve porções e retome de um registro de progresso.
4. **Montagem com edição.** Reescrever o conjunto como “um resumo final” pode voltar a encurtá-lo. Preserve os trechos bons e ajuste transições e redundâncias localmente.
5. **Correções guiadas por lacunas.** Se faltar tamanho, recupere razões, exemplos e distinções omitidos; não acrescente reflexões religiosas genéricas para alcançar uma porcentagem.
6. **Auditoria em duas direções.** A fonte mostra o que foi omitido; o resumo mostra o que precisa de comprovação. Contagem é apenas uma parte do aceite.

## Particularidades de livros católicos

O resumo deve manter a voz espiritual e as distinções do autor, com atribuição correta. Um tratado exige preservar argumentos; um diário, experiências e discernimento; uma biografia, sequência e causalidade sustentada; cartas e aforismos podem exigir agrupamento temático com identificação das peças.

Não transforme uma experiência mística em promessa universal ou uma tese de escola em definição da Igreja. A distinção entre revelação pública e privada, por exemplo, é explicitada no [Catecismo, §§66–67](https://www.vatican.va/archive/cathechism_po/index_new/p1s1c2_50-141_po.html). A aplicação editorial é manter o estatuto e a atribuição do relato, sem acrescentar um tratado doutrinal ao resumo.

Não complete informações históricas, citações, milagres ou aprovações eclesiásticas de memória. Se houver contextualização externa necessária, identifique-a como editorial e cite a fonte. Preserve o pensamento do autor antes de tentar harmonizá-lo com outros livros da biblioteca.

Combine a paráfrase com citações breves entre aspas quando a formulação original preservar melhor uma definição, imagem ou exortação. Não há quota de citações: elas devem contribuir para o desenvolvimento, dentro do orçamento total. Confira todas na edição usada e registre os localizadores; se forem traduções próprias, identifique isso em nota editorial breve. O [método da skill](../.gemini/skills/book-summarizer/references/method.md#citações-na-síntese) detalha seleção e revisão.

## Uso prático e arquivos

Exemplo de pedido:

> Use a book-summarizer em `.gemini/skills/book-summarizer/SKILL.md` para produzir uma síntese extensa em pt-BR desta obra, no estilo do Summa Brevis. Planeje a cobertura de todos os capítulos, distribua o alvo de 20%, escreva diretamente do original e revise fidelidade e distinções teológicas. Preserve os intermediários e entregue o Markdown final com o relatório de revisão separado.

O [guia do planejador](../.gemini/skills/book-summarizer/references/planning.md) documenta `sections.json`, `plan.json` e os comandos `plan` e `check`. O [método editorial](../.gemini/skills/book-summarizer/references/method.md) contém a adaptação por gênero, o registro de evidência e os critérios de aceite.

O planejamento e a checagem não chamam APIs nem geram resumos. A tarefa de redação continua sendo executada pelo agente. Depois da revisão, a `PublishSummary` cuida de capa e integração se isso fizer parte do pedido; a `frontend-design` é usada para mudanças na apresentação.

## Validação e próxima avaliação editorial

As verificações automatizadas cobrem orçamento conservado, mapa completo, fonte imutável, arquivos de seções presentes, faixa final e sinais mecânicos de problemas. Elas não medem compreensão, fidelidade nem qualidade teológica. Mesmo um texto desconexo com a extensão correta pode passar nessa parte e deve reprovar na revisão editorial.

Para comparar o método antigo e o novo, use primeiro capítulos equivalentes de um tratado, uma obra espiritual e uma narrativa. Mantenha fonte, idioma, modelo e alvo iguais; alterne a ordem de apresentação ao revisor. Compare núcleos essenciais preservados, distorções verificadas, correções necessárias, fluidez, palavras e custo/tempo. Depois, teste obras completas para verificar continuidade e omissões no meio e no fim. Não use somente uma nota de outro LLM como resultado.

Esta implementação inclui testes dos auxiliares; não foi realizada uma comparação de resumos integrais de 100–500 páginas. As recomendações devem ser refinadas com essa avaliação, sem prometer que uma porcentagem ou um checklist eliminam erros.

Uma [amostra completa de *A Prática da Presença de Deus*](../books/pratica-presenca-deus/avaliacao-metodo/summaries/pratica-presenca-deus-avaliacao.md) aplica o fluxo à edição local: 10.979 palavras de fonte e 2.351 de resumo (21,41%), cobrindo quatro conversas e quinze cartas. Após avaliação do usuário, a segunda versão incorporou 12 citações breves em tradução própria identificada, todas conferidas na fonte; a primeira versão foi preservada para comparação. O [relatório de revisão](../books/pratica-presenca-deus/avaliacao-metodo/review.md) documenta cobertura, correções e limites. A amostra foi preparada para avaliação, preservando a versão publicada; por ser uma obra curta, não substitui os testes com livros extensos descritos acima.
