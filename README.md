# daily-arXiv

Daily arXiv crawler and static website for reading AI-enhanced paper summaries.

This repository uses GitHub Actions to crawl new arXiv papers, summarize them with an OpenAI-compatible LLM API, publish generated data to the `data` branch, and serve the reader UI with GitHub Pages.

## Features

- Scheduled arXiv crawling with configurable categories.
- AI-generated structured summaries.
- Static GitHub Pages frontend.
- Date, category, keyword, and author filtering.
- Optional password protection.
- Separate `data` branch for generated JSONL and Markdown files.

## Configuration

Repository secrets:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `ACCESS_PASSWORD` optional

Repository variables:

- `CATEGORIES`, for example `cs.RO, cs.CV`
- `LANGUAGE`, for example `Chinese` or `English`
- `MODEL_NAME`, for example `mimo-v2.5-pro`
- `EMAIL`, used for workflow git commits
- `NAME`, used for workflow git commits

For DeepSeek official API, `OPENAI_BASE_URL` is usually:

```text
https://api.deepseek.com
```

## GitHub Pages

In repository settings, configure Pages as:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

The frontend reads generated data from:

```text
https://raw.githubusercontent.com/YeTianwei/daily-arXiv/data/
```

If the repository name casing differs on GitHub, update `js/data-config.js`.

## Workflow

The main workflow is:

```text
.github/workflows/run.yml
```

It runs on schedule and can also be triggered manually from the GitHub Actions tab.

High-level flow:

1. Crawl configured arXiv categories.
2. Remove duplicates against recent history.
3. Generate AI summaries.
4. Convert data to Markdown.
5. Update the file list.
6. Commit generated data to the `data` branch.

## Local Run

Install dependencies with `uv`:

```bash
uv sync
```

Then run:

```bash
bash run.sh
```

Required environment variables for full local processing:

```bash
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.deepseek.com"
export LANGUAGE="Chinese"
export CATEGORIES="cs.RO, cs.CV"
export MODEL_NAME="mimo-v2.5-pro"
```
