# Book Summarizer & Library

Projeto de curadoria de livros e publicação de resumos com foco em leitura web e SEO.

## Visao geral

- Frontend em React + Vite em `webapp/`.
- Pipeline de dados em `webapp/process_summaries.cjs` (gera JSON, EPUB e sitemap).
- SSG de rotas de livro em `webapp/scripts/generate-static-book-routes.cjs`.
- Conteudo fonte de resumos em `summaries/` e arquivos relacionados na raiz.

## Stack e arquitetura

- App: React 19 + Vite.
- Conteudo: arquivos Markdown processados para `public/data/books/*.json`.
- SSG: apos `vite build`, o script de rotas gera `dist/book/<id>/index.html` com:
  - meta tags por pagina (title, description, canonical, Open Graph, Twitter)
  - JSON-LD por livro
  - bloco de conteudo estatico renderizado no HTML para crawler

## SEO e migracao para Netlify

Motivo da migracao:

- manter uma unica origem publica para evitar conteudo duplicado
- padronizar canonical e metadados no dominio final
- reduzir risco de indexacao inconsistente

Dominio canônico atual:

- `https://summa-brevis.netlify.app`

Ajustes aplicados:

- canonical, Open Graph, Twitter e JSON-LD da home atualizados para Netlify
- `baseUrl` de sitemap atualizado para Netlify
- paginas de livro com conteudo estatico no HTML (SSG)
- capas grandes removidas do build publico

## Imagens

- Imagens servidas no site: `webapp/public/assets/covers/thumbs/*.webp`
- Fontes originais (PNG/JPG grandes): `webapp/source-covers/` (fora de `public`, nao entram no build)

## Como adicionar um novo livro

1. Adicione o resumo em Markdown em `summaries/` (ou caminho equivalente usado no catalogo).
2. Adicione o registro do livro em `webapp/process_summaries.cjs` (id, path, title, author, cover).
3. Garanta um thumb WebP em `webapp/public/assets/covers/thumbs/` com nome compativel com o campo `cover`.
4. Execute o processamento e build.

## Desenvolvimento local

Todos os comandos abaixo devem ser executados em `webapp/`.

1. Instalar dependencias:

```bash
npm install
```

2. Processar dados:

```bash
node process_summaries.cjs
```

3. Subir ambiente local:

```bash
npm run dev
```

## Build de producao

```bash
npm run build
```

O build executa o Vite e, em seguida, gera as rotas estaticas de livros via `postbuild`.

## Deploy

Deploy principal em Netlify.

Fluxo recomendado:

1. Commit/push no repositório.
2. Netlify executa build e publica.
3. Validar canonical e sitemap publicados.
4. Solicitar reindexacao no Google Search Console quando houver mudancas de SEO.

## Estrutura importante

- `webapp/process_summaries.cjs`: processamento de dados e sitemap
- `webapp/scripts/generate-static-book-routes.cjs`: SSG das paginas de livro
- `webapp/src/components/SummaryViewer.jsx`: visualizador de leitura
- `webapp/public/data/`: JSONs e arquivos publicos processados
