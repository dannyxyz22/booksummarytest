# Preparação e publicação de conteúdo

[Voltar ao README](../README.md) · [Skills do projeto](SKILLS.md) · [Operação](OPERACAO.md)

## Criar e validar o resumo com as skills

O fluxo editorial começa com a [book-summarizer](../.gemini/skills/book-summarizer/SKILL.md): o agente fixa a fonte, mapeia os capítulos, distribui o orçamento de palavras e escreve diretamente do original. O padrão é 20%, com faixa de 18–22%; uma extensão explicitamente solicitada prevalece. Os textos divididos ficam em `books/<slug>/batches/` e os resumos intermediários em `books/<slug>/summaries/`. Preserve esses materiais após publicar.

Use o [método de resumo](METODO_RESUMOS.md) e o [planejador](../.gemini/skills/book-summarizer/references/planning.md) para preparar `source-map.md`, `sections.json` e `plan.json`. Registre os núcleos e localizadores em `evidence.md`; a revisão final em `review.md` deve verificar cobertura, fidelidade e precisão teológica, além da contagem. O build não faz essa revisão.

Antes de promover o texto a `summaries/published/`, retire rótulos de lote, metas de compressão e notas de processo; revise a continuidade e procure relações relevantes com livros já publicados usando links `book:<slug>`. Ajustes de extensão devem ocorrer na seção ou lote correspondente, seguidos de nova agregação e validação.

A [PublishSummary](../.gemini/skills/PublishSummary/SKILL.md), chamada **Publicar Novo Resumo** no arquivo, recebe o Markdown validado, título, autor, slug, cor e símbolo da capa. Ela orienta a geração da capa, miniatura, catálogo e SEO. A [frontend-design](../.gemini/skills/frontend-design/SKILL.md) complementa esse trabalho quando há criação ou ajuste da interface de leitura.

O [guia das skills](SKILLS.md) detalha os papéis, exemplos de pedidos e comandos próprios da `book-summarizer`. As seções abaixo descrevem a integração com a estrutura atual do site.

## Cadastrar um resumo

Salve o texto final em UTF-8 em `summaries/published/<id>.md`. Use um identificador estável, preferencialmente em minúsculas e com hífens. O `id` determina a URL `/book/<id>/` e os nomes dos downloads; não o altere apenas para corrigir o título.

As skills de resumo e publicação usam o armazenamento central: finais em `summaries/published/`, intermediários e registros de revisão na árvore da obra.

Adicione um objeto ao array de [summaries.json](../webapp/public/data/summaries.json). Exemplo para um livro novo (substitua os valores e crie os arquivos correspondentes):

```json
{
  "id": "meu-livro",
  "path": "../summaries/published/meu-livro.md",
  "title": "Meu Livro",
  "author": "Nome do Autor",
  "year": 1900,
  "cover": "assets/covers/thumbs/meu-livro.webp"
}
```

| Campo | Regra |
| --- | --- |
| `id` | Obrigatório; deve ser único e seguro como nome de arquivo e segmento de URL. A unicidade não é validada pelo processador. |
| `path` | Obrigatório; caminho do Markdown relativo a `webapp/`. |
| `title`, `author` | Obrigatórios; usados no catálogo, leitura e exportações. |
| `cover` | Obrigatório; caminho público sem `/` inicial. Prefira a miniatura WebP. |
| `year` | Opcional; os registros existentes usam número ou texto. |
| `enabled` | Opcional; somente o booleano `false` desabilita o livro. |
| `description`, `readingTime`, `epubPath`, `pdfPath` | Calculados pelo processador para livros habilitados; não são ajustes manuais persistentes. |

O catálogo é simultaneamente entrada editorial e saída do processamento. O script preserva apenas os campos que reconhece, ordena por título e substitui os metadados calculados.

> [!IMPORTANT]
> Se a leitura do Markdown ou a exportação de um livro falhar, o processador registra `Error processing` e pode remover esse livro do catálogo regravado. Confira os caminhos e revise o diff antes de aceitar o resultado.

`enabled: false` mantém o registro, mas o exclui da interface, do sitemap e das novas rotas estáticas. Arquivos gerados anteriormente podem continuar em `public/data/`; desabilitar não é um mecanismo de controle de acesso ou de remoção completa.

## Markdown, índice e vídeo

Use um H1 para o título e H2/H3 para organizar a leitura. O processador extrai esses três níveis, remove um índice anterior no formato reconhecido por `stripToc` e insere um novo `## Índice`. Evite títulos repetidos: os identificadores derivados dos títulos não recebem sufixos para resolver duplicatas.

Para exibir um vídeo no cabeçalho, coloque uma URL `https://www.youtube.com/watch?v=...` ou `https://youtu.be/...` com ID válido na primeira linha, seguida de uma linha em branco e do texto. O vídeo é retirado das exportações e preservado no início de `content` no JSON para o leitor.

Links entre livros podem usar `[A Noite Escura](book:noite-escura)`. Nas exportações EPUB/PDF, o processador converte esse formato em texto simples.

O PDF tem renderização própria para títulos, parágrafos e listas. Outros elementos Markdown, como tabelas e blocos de código, podem não aparecer; confira visualmente o arquivo quando usar formatação além desses elementos.

## Capas

A `PublishSummary` define uma capa gerada por IA com encadernação de couro na cor escolhida, gravação dourada, título, autor e símbolo central, em estética clássica de biblioteca católica. O prompt está no [SKILL.md de publicação](../.gemini/skills/PublishSummary/SKILL.md); o gerador de miniaturas abaixo apenas converte a imagem já criada.

Salve a imagem original em `webapp/source-covers/meu-livro.png` (também são aceitos JPG, JPEG e WebP). O gerador produz a miniatura com o mesmo nome-base, largura máxima de **600 px**, proporção preservada e qualidade WebP **90**.

Na raiz do repositório, com Pillow instalado no Python utilizado:

```sh
python -m pip install Pillow
python webapp/scripts/generate_thumbs.py
```

Esse comando percorre todas as capas originais e grava em `webapp/public/assets/covers/thumbs/`. Revise os arquivos alterados. O comentário inicial do script ainda menciona 400 px e outro diretório; as constantes e o código executado usam os valores acima.

Há registros legados como `assets/covers/noite-escura.png`. A interface e o SSG convertem esse padrão para `assets/covers/thumbs/noite-escura.webp`. Para novos registros, use diretamente o caminho WebP e respeite maiúsculas e minúsculas.

## Atualizar o SEO global

A etapa 6 da `PublishSummary` pede revisar, em [webapp/index.html](../webapp/index.html), `meta description`, `og:description`, `twitter:description` e a descrição do JSON-LD `WebSite`; em [App.jsx](../webapp/src/App.jsx), revise `DEFAULT_DESCRIPTION`. Inclua a nova obra nas listas editoriais pertinentes e mantenha as descrições coerentes.

No código atual, a `meta description` principal da home é uma síntese curta; as outras descrições citadas contêm listas de títulos. Essa atualização é editorial, não é feita automaticamente pelo processador. O SEO individual das páginas de livros é gerado no `postbuild`.

## Processar e conferir

Na raiz do repositório:

```sh
cd webapp
npm run build
npm run preview
```

Confirme que o livro aparece no catálogo, abre pela rota direta e possui índice e downloads funcionais. Verifique `dist/data/books/<id>.json`, `dist/data/epubs/<id>.epub`, `dist/data/pdfs/<id>.pdf` e `dist/book/<id>/index.html`. Confira a entrada do livro em `dist/sitemap.xml` e revise o diff do catálogo.

## Utilitários editoriais

Execute os comandos desta seção na raiz, com Python 3.10 ou superior. São utilitários do repositório, distintos dos [scripts empacotados na skill](SKILLS.md). Os nomes `meu-livro` são exemplos: substitua pelos caminhos da obra em preparação.

Extração de PDF com camada de texto (não faz OCR):

```sh
python -m pip install pypdf
python scripts/extract_pdf.py books/meu-livro.pdf books/meu-livro.txt
```

Extração de EPUB, usando apenas a biblioteca padrão:

```sh
python epub_to_txt.py books/meu-livro.epub books/meu-livro.txt
```

Divisão do texto e cálculo de uma meta editorial de 20% das palavras:

```sh
python scripts/split_book.py books/meu-livro.txt 3000 books/meu-livro/batches
python scripts/book_tools.py count books/meu-livro.txt
python scripts/book_tools.py target books/meu-livro.txt --ratio 0.20
```

Para lotes legados, os nomes `batch_1_resumo.md`, `batch_2_resumo.md` etc. permitem usar o comando abaixo, que reconhece especificamente `batch_<numero>_resumo.md`, ordena numericamente e preserva os títulos. No novo plano, os rascunhos têm o nome do ID de cada seção, como `cap-01.md`; monte-os na ordem de `plan.json`, pois esse concatenador não reconhece tais nomes.

```sh
python scripts/concat_batch_summaries.py books/meu-livro/summaries --output books/meu-livro/summaries/meu-livro_Resumo.md --title "Meu Livro"
python scripts/verify_summary_ratio.py books/meu-livro.txt books/meu-livro/summaries/meu-livro_Resumo.md
```

Use `--strip-headings` na concatenação apenas quando quiser remover o primeiro cabeçalho de cada lote. Faça a revisão editorial e valide novamente antes de colocar o final em `summaries/published/`. Esse verificador legado aceita a faixa fixa de **18% a 22%** e retorna código 1 fora dela ou em caso de erro. No fluxo novo, `editorial_plan.py check` usa a faixa registrada no plano; não aplique a faixa fixa a um pedido com outra extensão. O build web não executa esses verificadores.

`aggregate_diary.py`, `build_publication.py`, `check_ratios.py` e `verify_total.py`, em `scripts/`, são utilitários históricos específicos do Diário de Santa Faustina. Eles contêm caminhos fixos, diretórios antigos ou pressupostos sobre a quantidade de lotes. Não são o fluxo genérico para cadastrar novos livros.
