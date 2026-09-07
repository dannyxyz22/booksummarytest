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

**Entrada:** texto local da obra (ou texto obtido do Project Gutenberg), idioma desejado e slug. Para PDF/EPUB, faça antes a [extração do texto](CONTEUDO.md). A skill aceita a proporção padrão de **20%**, com tolerância de **2 pontos percentuais**: o resumo precisa ter de **18% a 22%** das palavras do original.

Exemplo de pedido:

> Leia `.gemini/skills/book-summarizer/SKILL.md` e resuma `books/minha-obra.txt` em pt-BR, com slug `minha-obra`. Preserve os lotes e valide o texto final na faixa de 18% a 22% antes de incorporá-lo ao catálogo.

O fluxo prescrito é:

1. Contar as palavras do original e calcular a meta do resumo.
2. Dividir obras extensas em lotes, normalmente de 3.000 palavras, em `books/<slug>/batches/`.
3. Escrever os resumos em ordem em `books/<slug>/summaries/`, preservando cronologia e conteúdo das seções.
4. Agregar os lotes e ajustar a extensão no trecho correspondente da obra. Se faltar conteúdo, expandir a seção pertinente e agregar novamente.
5. Revisar o texto consolidado: retirar rótulos de lote, metas, notas de validação e comentários de processo; usar títulos editoriais formais e narrativa contínua.
6. Procurar relações relevantes com livros já publicados e inserir links internos no formato `[Texto](book:slug)`.
7. Validar o texto final; se estiver fora da faixa, revisá-lo antes de importar. Colocar o resultado aprovado em `summaries/published/<slug>.md` e atualizar o catálogo.

**Preservação:** a skill proíbe apagar automaticamente lotes e sínteses. Mantenha os intermediários na árvore da obra; `summaries/workspace/` pode receber rascunhos genéricos ou antigos. Para livros muito extensos, o fluxo pode exigir várias rodadas de escrita e revisão; a própria skill alerta para o consumo de tokens.

### Comandos dos scripts empacotados

Execute da raiz do repositório. Substitua os caminhos de exemplo pelos arquivos da obra. Os scripts desta skill usam somente a biblioteca padrão do Python:

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
| Destino do Markdown final | A `PublishSummary` sugere `../books/<slug>/summaries/...`; a `book-summarizer` define `summaries/published/`, destino usado pelo catálogo atual. Este guia adota o armazenamento central para publicação. |
| Agregação e acabamento editorial | O agregador empacotado adiciona rótulos `Batch`, enquanto a skill exige removê-los do resultado publicado. A revisão entre agregação e validação final é necessária. |
| Ferramenta de imagem | A `PublishSummary` cita `generate_image`; o nome concreto da ferramenta depende do ambiente. `generate_thumbs.py` só transforma uma imagem existente. |
| Formatos gerados | A etapa 5 da `PublishSummary` destaca EPUB; o processador também gera PDF, JSON e sitemap. |
| SEO global | A skill descreve quatro listas em `index.html`; a `meta description` principal atual é curta, enquanto Open Graph, Twitter e JSON-LD listam títulos. Revise cada campo conforme seu formato. |
| Licença da frontend-design | O frontmatter aponta para `LICENSE.txt`, mas esse arquivo não acompanha a cópia local. Não é possível verificar os termos completos por essa referência no repositório. |

Existe ainda [CathSummary.md](../.gemini/skills/CathSummary.md), uma instrução editorial adicional. Ela declara 10–20% na descrição e 20–30% nas regras, com meta de 25%; não a confunda com a faixa de 18–22% da `book-summarizer`. Este guia documenta as três skills indicadas para o fluxo atual, mantendo explícitas essas diferenças.
