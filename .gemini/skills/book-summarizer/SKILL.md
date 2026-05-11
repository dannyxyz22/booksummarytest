---
name: book-summarizer
description: Use this skill when the user wants a long-form book summarized in the user's preferred language at an explicitly verified 20 percent compression ratio, with the result rejected if it falls outside the allowed range. Warning: this skill may consume many tokens because it can run multiple times until it reaches the requested compression rate.
---

# Book Summarizer

Use this skill for requests like:

- "Summarize this book at a 20% compression ratio"
- "Generate a substantial summary and verify the ratio"
- "Produce the summary in batches and validate the final total"

## Rules

- Default target ratio: `0.20`
- Default tolerance: `0.02`
- Accept only summaries between `18%` and `22%` of the original word count
- Output must be in user's language of choice (e.g., pt-BR)
- If the ratio is outside the allowed range, do not import the summary
- In chat-only mode, if the source is very large, generate the summary in multiple batches and merge them before validation
- Never delete intermediate batch/synthesis files automatically
- Keep each book isolated in its own workspace tree:
	- `books/<book-name>/batches` for text chunks/splits
	- `books/<book-name>/summaries` for intermediate and merged summary drafts
- **Central Storage**:
    - Final publication-ready summaries go to `summaries/published/<slug>.md`.
    - Generic intermediate artifacts and old drafts go to `summaries/workspace/`.
- If extra content is needed to reach target ratio, edit the correlated local section/chapter/batch file, then re-aggregate; never add a detached "extra expansion" section unrelated to the original sequence
- The final merged deliverable must read like a finished editorial text, not like a workflow artifact
- Remove all references to process from the published output: batch or lote labels, compression targets, validation notes, merge status, next-step notes, target word counts, or similar pipeline metadata
- Move the final validated `.md` to `summaries/published/` before updating the webapp configuration.
- Prefer formal section titles in the published result; use headings such as `Seleção de Epigramas de Chesterton` instead of informal labels such as `Aperitivo`
- All packaged helper scripts live in `scripts/` inside this skill folder

## Workflow

1. Start from a local plain-text book file or a downloaded Project Gutenberg text.
2. Define a slug for the book and create isolated directories:
	- `books/<book-name>/batches`
	- `books/<book-name>/summaries`
3. Count the source words with `python scripts/book_tools.py count <original_file>`.
4. Compute the target summary length with `python scripts/book_tools.py target <original_file> --ratio 0.20`.
5. If the source is too large for one reply, split it with `python scripts/split_book.py <original_file> 3000` and keep the generated chunk files in `books/<book-name>/batches`.
6. Draft summary batches in order, preserving chronology and section fidelity, and save each intermediate batch summary to `books/<book-name>/summaries`.
7. For each batch, keep the default target ratio. If the total ratio is low/high, adjust the relevant local files in `books/<book-name>/summaries` (the corresponding chapter/batch), then re-aggregate. Do not append disconnected sections.
8. Merge the batches with `python scripts/book_tools.py aggregate books/<book-name>/summaries/<book-name>_Resumo.md <batch_files...>`.
9. Validate the final ratio with `python scripts/verify_summary_ratio.py <original_file> books/<book-name>/summaries/<book-name>_Resumo.md`.
10. Once approved, move the final file to `summaries/published/<book-slug>.md`.
11. Update `webapp/public/data/summaries.json` to point to the new published path.
12. Keep all intermediate files in `books/<book-name>/` or move them to `summaries/workspace/` if the book workspace is to be cleared.

## Key Files

- `scripts/book_tools.py`
- `scripts/split_book.py`
- `scripts/verify_summary_ratio.py`
- `SKILL.md`

## Notes

- The packaged scripts use only the Python standard library.
- Run the commands from the skill folder, or use explicit paths if you call them from elsewhere.
- For very large books, prefer the automated pipeline over single-turn chat drafting.
- In chat-only mode, books above roughly 80k words should be summarized over multiple turns; do not pretend a single short draft satisfies the 20% rule.
- If cleanup is explicitly requested, remove only redundant artifacts and preserve at least one full recoverable chain of intermediates per book.
- **Cross-Linking Requirement**: After generating the summary, always look for opportunities to cross-link other published books in the library (`summaries/published/`). If an author or related concept is mentioned, wrap it in an internal link using the format `[Anchor text](book:slug-of-the-book)` (e.g., `[São Tomás de Aquino](book:lagrange-sintese-tomista)`) to build a semantic network between the summaries.


