# Arquitetura, build e operação

[Voltar ao README](../README.md) · [Skills do projeto](SKILLS.md) · [Guia de conteúdo](CONTEUDO.md)

## Fluxo de dados

| Etapa | Entrada | Saída e comportamento |
| --- | --- | --- |
| Criação com `book-summarizer` | Fonte identificada, idioma e plano de extensão | Seções escritas do original, evidência e revisão de cobertura/fidelidade; padrão de 18–22%, salvo outro contrato de extensão. |
| Publicação com `PublishSummary` | Markdown validado, metadados e preferências da capa | Final em `summaries/published/`, capa, miniatura, cadastro e revisão do SEO global. |
| Design com `frontend-design`, quando necessário | Requisitos de apresentação e leitura | Componentes, estilos e interações no webapp. |
| Processamento | Catálogo e Markdown referenciado | JSON por livro, EPUB, PDF, catálogo ordenado e sitemap. |
| Vite | `webapp/src/`, `index.html` e `public/` | Aplicação e arquivos públicos em `webapp/dist/`. |
| `postbuild` | HTML e catálogo de `dist/` | Uma página `dist/book/<id>/index.html` por livro habilitado. |
| Leitura | Catálogo público e rota | O navegador busca o JSON completo do livro ao abri-lo. |

As skills são instruções para o agente durante a criação editorial e visual. Elas não são executadas por `npm run build`: a geração de texto e capa acontece antes do processamento Node. Consulte [SKILLS.md](SKILLS.md) para as fontes locais e diferenças verificadas entre instruções e implementação.

O [método editorial](METODO_RESUMOS.md) usa `editorial_plan.py` para verificar mapa, fonte, rascunhos e extensão. Mesmo com código de saída 0, a revisão semântica continua necessária; o relatório editorial fica em `books/<slug>/review.md`, fora do conteúdo público.

[process_summaries.cjs](../webapp/process_summaries.cjs) calcula tempo de leitura a 200 palavras/minuto e extrai uma descrição de até aproximadamente 400 caracteres a partir do primeiro parágrafo elegível. Ele remove arquivos órfãos das pastas de JSONs, EPUBs e PDFs comparando seus nomes com os IDs do catálogo, inclusive IDs desabilitados.

O catálogo e `public/sitemap.xml` são versionados e alterados pelo processamento. Os arquivos individuais e `dist/` são gerados e ignorados pelo Git. O processador não monitora mudanças de Markdown durante `npm run dev`.

## Interface e rotas

- [App.jsx](../webapp/src/App.jsx): catálogo, filtros, navegação com History API e metadados no navegador.
- [BookCard.jsx](../webapp/src/components/BookCard.jsx): cartões, autores e miniaturas.
- [SummaryViewer.jsx](../webapp/src/components/SummaryViewer.jsx): busca do conteúdo, Markdown, índice, vídeo e downloads.

A busca e os filtros por autor acontecem no navegador. O gerador estático cria somente páginas de livros; as rotas de busca e autor não recebem HTML próprio. O repositório não contém uma regra geral `_redirects` para fallback de SPA. O [404.html](../webapp/public/404.html) ainda usa uma lógica de GitHub Pages que trata o primeiro segmento da URL como base; valide acesso direto e recarga dessas rotas no ambiente de hospedagem.

## HTML estático e SEO

[generate-static-book-routes.cjs](../webapp/scripts/generate-static-book-routes.cjs) substitui os blocos delimitados por `SEO_DYNAMIC_START/END` e `SSG_CONTENT_START/END` em [index.html](../webapp/index.html). Preserve esses marcadores: a ausência deles interrompe o `postbuild`.

Cada página de livro contém title, description, canonical, Open Graph, Twitter e JSON-LD do tipo `Book`. O Markdown renderizado fica em `div#ssg-content` com o atributo `hidden`. Isso inclui conteúdo no HTML, mas não implementa leitura visível sem JavaScript nem garante indexação pelo buscador.

A origem canônica está definida em vários lugares. Ao migrar domínio, confira juntos:

- [webapp/index.html](../webapp/index.html), incluindo metadados da home;
- [webapp/src/App.jsx](../webapp/src/App.jsx), constante `SITE_ORIGIN`;
- [webapp/process_summaries.cjs](../webapp/process_summaries.cjs), `baseUrl` do sitemap;
- [gerador de rotas](../webapp/scripts/generate-static-book-routes.cjs), `siteBaseUrl`;
- [robots.txt](../webapp/public/robots.txt) e o sitemap regenerado;
- [netlify.toml](../netlify.toml) e as páginas legadas em [gh-pages-redirect/](../webapp/gh-pages-redirect/).

## Netlify

A configuração versionada em [netlify.toml](../netlify.toml) estabelece:

| Item | Valor |
| --- | --- |
| Base | `webapp` |
| Comando | `npm run build` |
| Diretório publicado | `dist`, relativo à base |
| Origem canônica | `https://summa.legatuschristi.org` |
| Redirecionamento | `https://summa-brevis.netlify.app/*` → domínio canônico, HTTP 301 |

A expressão `build.ignore` compara alterações em `webapp`, `summaries` e `books`. A conexão do repositório, a branch de produção e o domínio precisam estar configurados na Netlify; o arquivo local não confirma o estado dessas configurações remotas. Ele também não fixa uma versão de Node: use uma versão compatível com o requisito do README.

Antes de enviar uma mudança para a branch publicada, execute o build e confira a leitura no preview. Depois do deploy, valide a home, a rota direta de um livro, os downloads, o canonical e `/sitemap.xml`. Preserve uma única origem canônica ao manter redirecionamentos do site antigo.

`npm run deploy` executa `predeploy` (o build) e publica `dist` no GitHub Pages. `npm run deploy-redirect` publica somente `gh-pages-redirect`. Esses comandos não acionam a Netlify.

## Diagnóstico

| Sintoma | Verificação |
| --- | --- |
| Node incompatível com Vite | Confira `node --version` e use a versão indicada no README. |
| Catálogo carrega, mas o resumo não abre | Gere novamente os dados e confira `public/data/books/<id>.json`. |
| Livro desaparece após o build | Procure `Error processing` no log, confira o `path` relativo a `webapp/` e revise o diff do catálogo. Corrija a causa e recupere o registro antes de reprocessar. |
| Capa não aparece | Confira o WebP em `public/assets/covers/thumbs/`, a conversão de caminhos legados e a capitalização do nome. |
| Livro desabilitado ainda tem download acessível | `enabled: false` não remove necessariamente arquivos antigos; revise os artefatos públicos ao retirar conteúdo. |
| Falha no `postbuild` | Confira se o Vite gerou `dist/index.html`, se o catálogo existe e se os marcadores de SEO/SSG foram preservados. |
| PDF incompleto | Confira os elementos Markdown usados; o exportador trata títulos, parágrafos e listas, não todos os tipos de bloco. |
| Busca ou autor funciona por clique, mas falha ao recarregar | Confira o fallback de rotas no host; o SSG só gera rotas de livros. |
| `npm run lint` falha, mas o build passa | São verificações separadas. Inspecione as mensagens do ESLint; build bem-sucedido não implica lint limpo. |

Não há script `npm test` no `package.json`. Para alterações de conteúdo, confira os artefatos esperados e os logs; para alterações da interface, execute também o lint e teste a navegação e a leitura no navegador.

Os testes do planejador editorial são independentes do webapp. Execute da raiz:

```sh
python -B -m unittest discover -s .gemini/skills/book-summarizer/scripts/tests -v
```
