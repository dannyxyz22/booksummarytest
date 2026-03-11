---
name: cath-blink-20pct-summarizer
description: Use this skill when the user wants a Catholic book from Project Gutenberg summarized at an explicitly verified 20 percent compression ratio in pt-BR, with the result saved into Cath Blink and rejected if it falls outside the allowed range.
---

# Cath Blink 20% Summarizer

Use this skill for requests like:

- "Resuma este livro católico com compressão de 20%"
- "Gere um resumo substancial e verifique a razão"
- "Salve o resumo no webapp, mas só aceite se estiver perto de 20%"

## Rules

- Default target ratio: `0.20`
- Default tolerance: `0.02`
- Accept only summaries between `18%` and `22%` of the original word count
- Output must be in pt-BR with acentuação normal
- If the ratio is outside the allowed range, do not import the summary
- In chat-only mode, if the source is very large, generate the summary in multiple batches and merge them before validation

## Workflow

1. Download or reuse the Gutenberg text in `data/downloads/`.
2. Compute the target word count from the original size and the requested ratio.
3. If running without API and the target is too large for one reply, split the output into multiple summary batches, each preserving chronology and section fidelity.
4. Merge the batches into `summaries/<gutenberg_id>.md`.
5. Validate the ratio with `scripts/verify_summary_ratio.py`.
6. Import only validated summaries with `scripts/import_chat_summary.py`.

## Key Files

- `app/compression.py`
- `app/summarizer.py`
- `scripts/verify_summary_ratio.py`
- `scripts/import_chat_summary.py`

## Notes

- The regeneration script now fails if the model output does not meet the requested ratio.
- Manual imports also fail if the summary falls outside the configured tolerance.
- For very large books, prefer the automated pipeline over single-turn chat drafting.
- In chat-only mode, books above roughly 80k words should be summarized over multiple turns; do not pretend a single short draft satisfies the 20% rule.


