# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Web Application (in `webapp/` directory)
- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Run linting: `npm run lint`
- Preview production build: `npm run preview`
- Deploy to GitHub Pages: `npm run deploy`

### Summary Processing Scripts
- Aggregate diary batch summaries: `python scripts/aggregate_diary.py`
- Build publication-ready summary: `python scripts/build_publication.py`
- Check word count ratios per batch: `python scripts/check_ratios.py`
- Verify total summary compression ratio: `python scripts/verify_total.py`

## Architecture & Structure

The project is a system for summarizing long books and publishing those summaries via a web interface.

### High-Level Flow
`books/` (Source Text) $\rightarrow$ `summaries/` (Batch Summaries) $\rightarrow$ `scripts/` (Aggregation & Validation) $\rightarrow$ `webapp/public/data/summaries.json` (Web Data) $\rightarrow$ `webapp/` (Frontend)

### Key Directories
- `books/`: Contains raw source texts and batch-split versions of books.
- `summaries/`: Stores markdown summaries, both in batch form and final aggregated versions.
- `scripts/`: Python utilities for aggregating summaries, formatting them for publication, and validating compression ratios.
- `webapp/`: A React application built with Vite that renders the summaries.
  - `public/data/summaries.json`: The central catalog of book summaries.
  - `process_summaries.cjs`: A script used during `predeploy` to prepare data for the build.

### Data Model
The webapp relies on `webapp/public/data/summaries.json` as its database, containing metadata and paths to the summaries.
