---
name: CathSummary
description: A robust workflow for summarizing large Catholic books (100k+ words) with 10-20% compression ratio using batching and master summary aggregation.
---

# CathSummary Skill

Use this skill for summarizing large books (>100,000 words) where a single-pass summary would lose too much detail.

## Rules
- **Compression Ratio**: 20% to 30% (Target 25%).
- **Batch Input**: ~2,500 to 3,000 words per iteration.
- **Batch Output**: 20% to 30% of the input batch (e.g., 500 - 900 words).
- **Format**: Portuguese (pt-BR) with standard accents.
- **Orthography**: 
    - Faça o resumo e depois revise a ortografia cuidadosamente.
    - Não invente termos.
    - Use ortografia padrão do português brasileiro.
- **Continuity**: Process all batches without asking for user confirmation until the final result is ready.
- **Fluidity**: Remove all technical references to the process. No mentions of "Batch", "Lote", "Compression", or "Ratio". The final text must be a cohesive, flowing narrative.
- **Structure**:
    1. **Master Summary**: A high-level overview (no technical titles like "Master Summary"). Use a narrative title related to the book.
    2. **Body**: The combined summaries from all segments, merged seamlessly without segment headers.

## Workflow
1. **Estimate**: Use `scripts/book_tools.py estimate` to find the number of 3,000-word batches.
2. **Process**: Iterate through the book. For each batch:
    - Extract text.
    - Summarize in pt-BR (targeting 20-30% length).
    - Save to `summaries/batch_N.md`.
3. **Aggregate**: Use `scripts/book_tools.py aggregate` to combine all batch summaries.
4. **Refine**: Carefully remove all technical headers (e.g., "# Resumo de Lote X") and merge the text into a fluid narrative.
5. **Master Summary**: Generate a high-level overview and prepend it.
6. **Finalize**: Ensure the final document is titled appropriately and lacks any process meta-commentary.

## Tools
- `scripts/book_tools.py`: count, estimate, aggregate.
