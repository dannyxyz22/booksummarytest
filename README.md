<img src="webapp/public/favicon.svg" alt="Summa Brevis" width="72" />

# Summa Brevis — Book Summarizer & Library

Biblioteca de resumos de livros, com foco em obras católicas, filosofia e literatura. Publica textos revisados em Markdown para leitura na web e download em EPUB e PDF.

[Site](https://summa.legatuschristi.org) · [Método de resumo](docs/METODO_RESUMOS.md) · [Skills do projeto](docs/SKILLS.md) · [Publicar um livro](docs/CONTEUDO.md) · [Arquitetura e operação](docs/OPERACAO.md)

Os resumos são criados com assistência de IA orientada pelas skills versionadas em `.gemini/skills/`. A `book-summarizer` conduz a escrita e validação; a `PublishSummary` prepara a capa e a publicação; a `frontend-design` orienta a apresentação na interface. Depois dessa etapa, o build transforma o Markdown final em arquivos públicos, sem executar as skills automaticamente.

## Skills do projeto

| Skill | Papel no fluxo |
| --- | --- |
| [book-summarizer](.gemini/skills/book-summarizer/SKILL.md) | Planeja palavras por seção, escreve do original e revisa cobertura, fidelidade e precisão católica. Usa 20% como alvo padrão, com faixa de 18–22%, salvo outra extensão solicitada. |
| [PublishSummary — Publicar Novo Resumo](.gemini/skills/PublishSummary/SKILL.md) | Usa o resumo final para gerar capa clássica, miniatura, registro no catálogo, arquivos de leitura e atualização do SEO global. |
| [frontend-design](.gemini/skills/frontend-design/SKILL.md) | Orienta tipografia, cores, composição e interações das páginas e componentes de leitura. |

Consulte o [guia das skills](docs/SKILLS.md) para exemplos de pedidos, comandos dos scripts empacotados e diferenças entre as instruções e o código atual. `Publish-summary` corresponde à pasta `PublishSummary`, cujo nome declarado é **Publicar Novo Resumo**.

Para obras de 100 a 500 páginas, o [método de resumo](docs/METODO_RESUMOS.md) explica a pesquisa, as metas de extensão e a revisão. O novo `editorial_plan.py` distribui o orçamento e verifica fonte, rascunhos e tamanho final; a avaliação do conteúdo continua sendo uma etapa editorial.

## Início rápido

Requisitos: Git, Node.js **22.12 ou superior** e npm. O Vite fixado no lockfile também aceita Node 20 a partir de 20.19. Python **3.10 ou superior** é opcional, para os utilitários editoriais.

A partir da raiz do repositório:

```sh
cd webapp
npm ci
node process_summaries.cjs
npm run dev
```

Abra a URL exibida pelo Vite no terminal (normalmente `http://localhost:5173`). Não há banco de dados, backend ou chave de API exigidos para esse fluxo local.

> [!IMPORTANT]
> O processamento reescreve `webapp/public/data/summaries.json` e `webapp/public/sitemap.xml`. Revise o diff após executá-lo. Erros em livros individuais podem ser registrados no terminal sem interromper o processo; confira se todos os livros esperados foram gerados.

## Comandos do webapp

Execute em `webapp/`. Os scripts são definidos em [package.json](webapp/package.json).

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instala as dependências conforme o lockfile. |
| `node process_summaries.cjs` | Gera JSONs de leitura, EPUBs, PDFs, catálogo e sitemap. |
| `npm run dev` | Inicia o Vite; não processa os resumos automaticamente. |
| `npm run build` | Processa os resumos, compila o app e executa o `postbuild` para gerar páginas de livros. |
| `npm run preview` | Serve o último build localmente, normalmente na porta 4173. |
| `npm run lint` | Executa o ESLint; não é executado pelo build. |

Após editar um resumo ou o catálogo durante o desenvolvimento, execute novamente o processamento e recarregue a página.

## Como o projeto funciona

1. A `book-summarizer` orienta o agente a mapear a obra, distribuir a extensão, redigir seções em `books/<slug>/` e revisar o texto consolidado contra o original.
2. O resumo validado vai para `summaries/published/`; a `PublishSummary` orienta capa, cadastro em `webapp/public/data/summaries.json` e SEO global. A `frontend-design` é aplicada quando a interface precisa ser criada ou ajustada.
3. O processador lê o catálogo, insere um índice de títulos e gera conteúdo, downloads e metadados.
4. O React carrega o catálogo e busca o JSON completo quando o leitor abre um livro.
5. O build cria `dist/book/<id>/index.html` com metadados próprios e um bloco de conteúdo estático para cada livro habilitado.

O leitor oferece busca por título/autor, navegação por autor, índice, ajuste de fonte, vídeo do YouTube no início do resumo e downloads. A interface usa React 19, Vite 7, React Markdown, Framer Motion e Lucide.

## Organização dos arquivos

| Caminho | Uso |
| --- | --- |
| [.gemini/skills/](.gemini/skills/) | Instruções editoriais, de publicação e design, com scripts próprios da `book-summarizer`. |
| [books/](books/) | Textos de origem, divisões e materiais editoriais por livro. |
| [summaries/published/](summaries/published/) | Markdown final destinado à publicação. |
| [summaries/workspace/](summaries/workspace/) | Rascunhos e versões intermediárias; há também lotes históricos em `books/`. |
| [scripts/](scripts/) | Extração, divisão, concatenação e contagem de palavras. |
| [webapp/public/data/summaries.json](webapp/public/data/summaries.json) | Catálogo editável, também atualizado pelo processador. |
| [webapp/process_summaries.cjs](webapp/process_summaries.cjs) | Geração de dados, EPUB, PDF e sitemap. |
| [webapp/src/](webapp/src/) | Interface e navegação no navegador. |
| [webapp/scripts/](webapp/scripts/) | Geração de miniaturas e páginas estáticas. |
| [webapp/source-covers/](webapp/source-covers/) | Capas originais; ficam fora do build público. |
| [webapp/public/assets/covers/thumbs/](webapp/public/assets/covers/thumbs/) | Miniaturas WebP servidas no site. |
| [archive/](archive/) | Material histórico. |

Os diretórios `webapp/public/data/books/`, `epubs/`, `pdfs/`, além de `webapp/dist/`, são gerados e ignorados pelo Git. Edite o Markdown de origem, não os JSONs individuais.

## Adicionar ou atualizar um livro

1. Use a `book-summarizer` para preparar e validar o resumo, preservando os lotes, e salve o final em `summaries/published/<id>.md`.
2. Siga a `PublishSummary` para criar a capa e a miniatura e cadastrar `id`, `path`, `title`, `author` e `cover`.
3. Revise os metadados globais em `webapp/index.html` e `webapp/src/App.jsx` para incluir a nova obra.
4. Execute `npm run build` em `webapp/` e revise catálogo, leitura, downloads e rota do livro. Use a `frontend-design` se houver mudanças de interface.

O [guia de conteúdo](docs/CONTEUDO.md) contém um exemplo de registro, regras de caminhos, vídeos, capas e comandos editoriais.

## Build e publicação

```sh
cd webapp
npm run build
npm run preview
```

A configuração de produção está em [netlify.toml](netlify.toml): diretório base `webapp`, comando `npm run build` e saída `dist`. A origem canônica configurada é `https://summa.legatuschristi.org`.

Os comandos `npm run deploy` e `npm run deploy-redirect` ainda existem para GitHub Pages e são legados. O fluxo atual de publicação é pela Netlify. Consulte [operação e diagnóstico](docs/OPERACAO.md) para validar rotas, SEO e falhas de processamento.
