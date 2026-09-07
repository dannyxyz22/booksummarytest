# Repository guidance

This repository maintains the Summa Brevis book-summary library. Read [README.md](README.md) for setup, [docs/CONTEUDO.md](docs/CONTEUDO.md) for editorial workflows, and [docs/OPERACAO.md](docs/OPERACAO.md) for build and deployment behavior. Keep user-facing project documentation in Portuguese.

## Project skills

The editorial workflow uses the versioned skills in `.gemini/skills/`. Read the relevant local file before performing its workflow; these are instructions for the agent, not npm scripts. See [docs/SKILLS.md](docs/SKILLS.md) for the verified workflow and discrepancies.

- [book-summarizer](.gemini/skills/book-summarizer/SKILL.md): freeze and map the source, budget words by section, draft directly from the source, and review coverage and fidelity in both directions. Default to 20% (18–22% accepted) unless the user specifies another length. Preserve Catholic distinctions and attribution, intermediate files, and a separate evidence/review trail. See [docs/METODO_RESUMOS.md](docs/METODO_RESUMOS.md).
- [PublishSummary](.gemini/skills/PublishSummary/SKILL.md), declared name `Publicar Novo Resumo` (also called `Publish-summary`): prepare the classical leather-style cover, thumbnail, catalog entry, generated files, and global SEO. Use final Markdown in `summaries/published/` and retain the source/review files in the book workspace.
- [frontend-design](.gemini/skills/frontend-design/SKILL.md): guide interface composition, typography, colors, motion, and visual refinement when changing the reading experience. It does not define summary compression or write book content.

Use the new `.gemini/skills/book-summarizer/scripts/editorial_plan.py` to create a section budget and check the final artifact. A passing mechanical check does not certify semantic coverage or theological accuracy; document the separate review against the final file hash. Merge by editing continuity, not by summarizing the summaries again.

The legacy packaged Python scripts differ from the root `scripts/` tools. Use explicit paths and the corresponding CLI syntax. The legacy packaged aggregator adds `## Batch N` headings: remove workflow labels in the final editorial pass and revalidate the exact final text. Never automatically delete intermediate batches or syntheses.

## Commands

Run web commands from `webapp/`:

- `npm ci` — install locked dependencies.
- `node process_summaries.cjs` — regenerate content before local development and after Markdown changes.
- `npm run dev` — start Vite; it does not regenerate content.
- `npm run build` — process content, build with Vite, then generate static book routes through `postbuild`.
- `npm run preview` — inspect the production build locally.
- `npm run lint` — run ESLint separately from the build.

Production uses the root `netlify.toml`, with base `webapp` and publish directory `dist`. `deploy` and `deploy-redirect` target legacy GitHub Pages, not Netlify.

## Sources and generated files

- Edit final Markdown in `summaries/published/`; keep drafts in `summaries/workspace/` or the existing per-book workspace.
- Register books in `webapp/public/data/summaries.json`. `path` resolves relative to `webapp/`, not to the JSON directory.
- Required catalog fields: `id`, `path`, `title`, `author`, `cover`. Preserve existing IDs because they identify routes and downloads.
- The processor rewrites the catalog, sorts it by title, and recomputes descriptions, reading time and download paths. Review that diff and `webapp/public/sitemap.xml` after processing.
- Do not edit generated files in `webapp/public/data/books/`, `epubs/`, `pdfs/`, or `webapp/dist/`.
- Individual processing failures are caught and logged; the resulting catalog can omit failed books even when the command exits successfully. Compare enabled input books with generated outputs.
- `enabled: false` hides a catalog entry and skips generation. It does not guarantee removal of previously generated files.
- Originals belong in `webapp/source-covers/`; public thumbnails belong in `webapp/public/assets/covers/thumbs/`.

## Reading and SEO

`App.jsx` loads the catalog and handles browser history. `SummaryViewer.jsx` fetches each book JSON on demand. Put an optional YouTube watch or short URL on the first line of the source Markdown, followed by a blank line; the processor preserves it at the start of the generated `content` field for the viewer.

Preserve the `SEO_DYNAMIC` and `SSG_CONTENT` marker pairs in `webapp/index.html`: the static-route generator relies on them. The SSG content block is hidden; it is not a JavaScript-free reader. Keep the canonical origin consistent across the files listed in the operations guide.

## Editorial utilities

Run Python scripts from the repository root using explicit paths. The skill's helpers and the root tools are documented separately in [docs/SKILLS.md](docs/SKILLS.md) and [docs/CONTEUDO.md](docs/CONTEUDO.md). The Faustina-specific aggregation and verification scripts contain fixed paths and assumptions; inspect them before use. AI-assisted summary creation happens through the skills before the web build, which only processes the resulting Markdown.
