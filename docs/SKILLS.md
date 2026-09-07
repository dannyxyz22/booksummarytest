# Skills de criação, publicação e design

[Voltar ao README](../README.md) · [Guia de conteúdo](CONTEUDO.md) · [Operação](OPERACAO.md)

As três skills estão versionadas em [.gemini/skills/](../.gemini/skills/). Elas orientam o agente que cria os resumos e prepara sua apresentação no Summa Brevis. Os scripts Python auxiliam na contagem, divisão e validação; o processamento Node transforma o conteúdo aprovado em arquivos servidos pelo site.

## Localização e papéis

| Nome usado | Fonte local | Responsabilidade |
| --- | --- | --- |
| `book-summarizer` | [SKILL.md](../.gemini/skills/book-summarizer/SKILL.md) | Escrita assistida por IA, trabalho por lotes, revisão editorial e validação da proporção de palavras. |
| `PublishSummary` / `Publish-summary` | [SKILL.md](../.gemini/skills/PublishSummary/SKILL.md) | Preparação do volume para o catálogo, geração da capa, miniatura, processamento e SEO global. O nome declarado no arquivo é `Publicar Novo Resumo`. |
| `frontend-design` | [SKILL.md](../.gemini/skills/frontend-design/SKILL.md) | Criação e refinamento da interface de leitura: tipografia, cores, composição, movimento e detalhes visuais. |

Para usar uma delas, peça ao agente para ler o `SKILL.md` correspondente e aplicar o fluxo à tarefa. Os exemplos abaixo são pedidos em linguagem natural; a descoberta automática dessa pasta depende do ambiente do agente. Não são comandos de terminal nem scripts npm.

## 1. Criar o texto com book-summarizer

A skill foi ampliada para resumos substanciais de obras de 100–500 páginas. A [pesquisa e a justificativa do método](METODO_RESUMOS.md) explicam a escolha de planejamento global, escrita por seções diretamente do original e revisão em duas direções.

**Entrada:** fonte local, idioma, slug e extensão desejada. Para PDF/EPUB, faça antes a [extração do texto](CONTEUDO.md). O padrão do projeto continua sendo alvo de **20%**, com faixa de **18–22%**, mas uma meta explícita em palavras ou outra proporção prevalece. A extensão é calculada sobre a fonte limpa e identificada, não pelo número de páginas.

Exemplo de pedido:

> Leia `.gemini/skills/book-summarizer/SKILL.md` e produza uma síntese extensa de `books/minha-obra.txt` em pt-BR. Mapeie os capítulos, distribua o alvo de 20%, escreva diretamente do original e revise cobertura, fidelidade e distinções teológicas. Preserve os intermediários e entregue o Markdown com um relatório de revisão separado.

O fluxo preferencial é:

1. Identificar edição e escopo; preservar a fonte original e registrar a limpeza em `source-map.md`.
2. Mapear a obra inteira em `sections.json` e distribuir palavras por unidade em `plan.json`.
3. Ler cada unidade integralmente, registrar núcleos e localizadores em `evidence.md` e manter glossário e continuidade.
4. Redigir as seções em `books/<slug>/summaries/<id>.md`, voltando ao original para desenvolver argumentos, exemplos e distinções.
5. Montar o texto por edição de continuidade, preservando a extensão; não resumir outra vez os resumos.
6. Verificar o arquivo final mecanicamente e revisar fonte → cobertura e resumo → evidência. Registrar a revisão em `review.md`, vinculada ao hash do arquivo.
7. Entregar o final em `summaries/published/<slug>.md` quando os critérios forem satisfeitos. Capa, cadastro e publicação seguem a `PublishSummary` quando incluídos no pedido.

**Preservação e retomada:** mantenha lotes, sínteses e revisões em `books/<slug>/`. Registre unidades concluídas, pendências e próxima ação em `progress.md`. A revisão de um resumo longo pode exigir várias rodadas; não reduza a entrega a uma resposta curta no chat.

### Novo planejador editorial

Crie primeiro o mapa de linhas reais em `sections.json`, conforme o [contrato do plano](../.gemini/skills/book-summarizer/references/planning.md). Depois, execute da raiz:

```sh
python .gemini/skills/book-summarizer/scripts/editorial_plan.py plan books/minha-obra/source.txt --sections books/minha-obra/sections.json --output books/minha-obra/plan.json
python .gemini/skills/book-summarizer/scripts/editorial_plan.py check books/minha-obra/plan.json --drafts books/minha-obra/summaries --final books/minha-obra/summaries/resumo-final.md
```

Execute `check` depois de redigir e montar o final. O planejador recusa mapas incompletos e sobrescrita do plano. O verificador detecta fonte alterada, seções ausentes/vazias, extensão fora do contrato e rótulos técnicos; também sinaliza desvios locais e repetições para revisão.

Um resultado `mechanical_checks_passed: true` não certifica conteúdo. Siga os [critérios editoriais e de fidelidade católica](../.gemini/skills/book-summarizer/references/method.md) para conferir o original, as atribuições e as omissões. Nenhum desses scripts chama um modelo ou publica conteúdo.

### Auxiliares legados dos scripts empacotados

Estes comandos continuam disponíveis para trabalhos antigos. Para o fluxo novo, use o plano acima; os auxiliares legados não mantêm mapa de cobertura nem evidência. Execute da raiz do repositório. Os scripts usam somente a biblioteca padrão do Python:

```sh
python .gemini/skills/book-summarizer/scripts/book_tools.py count books/minha-obra.txt
python .gemini/skills/book-summarizer/scripts/book_tools.py target books/minha-obra.txt --ratio 0.20
python .gemini/skills/book-summarizer/scripts/split_book.py books/minha-obra.txt 3000 --output-dir books/minha-obra/batches
```

Depois de escrever os resumos dos lotes, forneça todos os arquivos à agregação na ordem correta. Exemplo com dois lotes:

```sh
python .gemini/skills/book-summarizer/scripts/book_tools.py aggregate books/minha-obra/summaries/minha-obra_Resumo.md books/minha-obra/summaries/batch_1_resumo.md books/minha-obra/summaries/batch_2_resumo.md
```

Esse agregador insere cabeçalhos `## Batch N` e separadores. A agregação ainda é um rascunho: remova os rótulos de processo na revisão e valide o arquivo efetivamente destinado à publicação:

```sh
python .gemini/skills/book-summarizer/scripts/verify_summary_ratio.py books/minha-obra.txt books/minha-obra/summaries/minha-obra_Resumo.md --target-ratio 0.20 --tolerance 0.02
```

O verificador retorna 0 para a faixa aceita e 1 para reprovação, arquivo ausente ou original vazio. O build web não executa essa validação.

### Scripts da skill e scripts da raiz

Os arquivos têm nomes semelhantes, mas não são cópias equivalentes. Não misture suas opções:

| Operação | `.gemini/skills/book-summarizer/scripts/` | `scripts/` na raiz |
| --- | --- | --- |
| Dividir em diretório escolhido | `split_book.py <arquivo> 3000 --output-dir <pasta>` | `split_book.py <arquivo> 3000 <pasta>` |
| Estimar lotes | `book_tools.py estimate <palavras> --batch-size 3000` | `book_tools.py estimate <palavras> 3000` |
| Agregar | `book_tools.py aggregate <saida> <arquivos...>` adiciona `## Batch N`; aceita `--header`. | `book_tools.py aggregate <saida> <arquivos...>` não adiciona rótulos de lote; o CLI não oferece `--header`. |
| Validar proporção | `verify_summary_ratio.py` aceita `--target-ratio` e `--tolerance`. | `verify_summary_ratio.py` usa a faixa fixa de 18% a 22%. |

Ambos os agregadores `book_tools.py` ignoram entradas inexistentes; confira a lista completa de lotes antes de agregar. O utilitário adicional [concat_batch_summaries.py](../scripts/concat_batch_summaries.py) reconhece `batch_<numero>_resumo.md`, ordena numericamente e permite `--strip-headings`. Sua utilização está no [guia de conteúdo](CONTEUDO.md).

## 2. Preparar o volume com PublishSummary

**Entradas previstas:** caminho do Markdown final, título, autor, slug, cor do couro e símbolo da capa. O modelo de registro também contém o ano de publicação, quando conhecido.

Exemplo de pedido:

> Leia `.gemini/skills/PublishSummary/SKILL.md` e prepare `summaries/published/minha-obra.md` para o catálogo. Título: Minha Obra; autor: Nome do Autor; slug: minha-obra; capa verde-oliva com uma cruz dourada. Gere os arquivos e apresente a prévia local.

A skill especifica a sequência:

1. Gerar por IA uma capa com encadernação de couro na cor escolhida, gravação dourada, título, autor e símbolo central. O prompt obrigatório completo está no [SKILL.md](../.gemini/skills/PublishSummary/SKILL.md).
2. Salvar a capa original em `webapp/source-covers/<slug>.png`.
3. Gerar a miniatura `webapp/public/assets/covers/thumbs/<slug>.webp` com `generate_thumbs.py`.
4. Registrar a obra em `webapp/public/data/summaries.json`.
5. Processar o conteúdo; a implementação atual gera JSON, EPUB, PDF e sitemap, além de reescrever o catálogo.
6. Atualizar o SEO global em `webapp/index.html` e `DEFAULT_DESCRIPTION` em `webapp/src/App.jsx`.
7. Apresentar a capa e orientar a conferência local, preservando os intermediários.

Os detalhes de [cadastro, miniaturas e metadados](CONTEUDO.md) refletem a implementação atual. Execute também `npm run build` para gerar as páginas estáticas de livros. A preparação local não confirma um deploy remoto: o fluxo de hospedagem está documentado em [operação](OPERACAO.md).

## 3. Apresentar a biblioteca com frontend-design

**Entrada:** requisitos de uma página, componente ou interface, com público, propósito e restrições técnicas. **Saída:** código funcional e uma apresentação visual coerente. Essa skill participa da experiência de publicação e leitura; ela não define o conteúdo literário nem a proporção do resumo.

Exemplo de pedido:

> Leia `.gemini/skills/frontend-design/SKILL.md` e refine o índice e os controles do leitor em `webapp/src/components/SummaryViewer.jsx`, respeitando a identidade editorial do Summa Brevis, a legibilidade e a acessibilidade.

A skill orienta escolher uma direção visual explícita antes de implementar: tipografia, paleta com variáveis CSS, composição, espaçamento, fundos e movimento devem servir ao propósito da interface. No projeto, os pontos principais são [index.css](../webapp/src/index.css), [App.jsx](../webapp/src/App.jsx), [BookCard.jsx](../webapp/src/components/BookCard.jsx) e [SummaryViewer.jsx](../webapp/src/components/SummaryViewer.jsx).

A interface atual usa Cormorant Garamond nos títulos, Lora no texto, Inter nos elementos auxiliares, fundo de papel, carmesim e dourado. A skill orienta evitar Inter e outras escolhas genéricas; portanto, a implementação não segue literalmente todas as preferências da skill. Essa diferença deve ser considerada em tarefas de design, sem tratar uma alteração de conteúdo como pedido para redesenhar o site.

## Divergências verificadas nas fontes locais

| Ponto | O que foi encontrado e como interpretar |
| --- | --- |
| Destino do Markdown final | As duas skills agora usam `summaries/published/`; a referência antiga de publicação a `books/<slug>/summaries/` foi corrigida. |
| Agregação e acabamento editorial | O agregador empacotado adiciona rótulos `Batch`, enquanto a skill exige removê-los do resultado publicado. A revisão entre agregação e validação final é necessária. |
| Ferramenta de imagem | A `PublishSummary` cita `generate_image`; o nome concreto da ferramenta depende do ambiente. `generate_thumbs.py` só transforma uma imagem existente. |
| Formatos gerados | A `PublishSummary` foi atualizada para descrever JSON, EPUB, PDF e sitemap, além de exigir a conferência dos logs. |
| SEO global | A skill agora distingue a descrição principal curta das listas de títulos nos outros metadados. Revise cada campo conforme seu formato. |
| Licença da frontend-design | O frontmatter aponta para `LICENSE.txt`, mas esse arquivo não acompanha a cópia local. Não é possível verificar os termos completos por essa referência no repositório. |

O arquivo [CathSummary.md](../.gemini/skills/CathSummary.md) agora encaminha ao método da `book-summarizer`, evitando duas regras concorrentes de extensão. A antiga meta de 25% pode ser usada quando explicitamente solicitada, com a faixa correspondente registrada no plano.
