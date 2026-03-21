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
- The final merged deliverable must read like a finished editorial text, not like a workflow artifact
- Remove all references to process from the published output: batch or lote labels, compression targets, validation notes, merge status, next-step notes, target word counts, or similar pipeline metadata
- If chunked drafting is used internally, normalize headings and transitions before final merge so the result does not expose the intermediate batching process
- Prefer formal section titles in the published result; use headings such as `Seleção de Epigramas de Chesterton` instead of informal labels such as `Aperitivo`
- All packaged helper scripts live in `scripts/` inside this skill folder

## Workflow

1. Start from a local plain-text book file or a downloaded Project Gutenberg text.
2. Count the source words with `python scripts/book_tools.py count <original_file>`.
3. Compute the target summary length with `python scripts/book_tools.py target <original_file> --ratio 0.20`.
4. If the source is too large for one reply, split it with `python scripts/split_book.py <original_file> 3000`.
5. Draft summary batches in order, preserving chronology and section fidelity. Write some notes in your memory to better accomplish this task.
6. For each batch, write a summary that keeps the default target ratio. Check if it would be interesting to include a piece of the original text, or the translated original text, so the reader can get a feel for the author's style. If the ratio is not reached, iterate again on the text split and the output batch markdown, so that the target ratio is reached. Write the values in your memory so you can think if the text needs to be expanded or contracted.
7. Merge the batches with `python scripts/book_tools.py aggregate <summary_file> <batch_files...>`.
8. Validate the final ratio with `python scripts/verify_summary_ratio.py <original_file> <summary_file>`.

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


