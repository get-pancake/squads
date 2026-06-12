---
tags: [seo, content, growth, geo, ai-visibility]
preview_image: https://squads.getpancake.ai/avatars/detective.png
---

## What this squad does

Deploys GEO-agent — a focused agent that grows your product's AI-engine visibility through daily audits, content, and technical GEO fixes.

**GEO-agent** runs the GEO strategy. Every day it audits whether your product is cited by ChatGPT, Gemini, and Perplexity for your target keywords. When citation share is weak, it writes a GEO-optimized blog post, opens a PR, and self-merges it. It also maintains your `llms.txt`, JSON-LD schema, and content metadata.

## What you'll need

- A GitHub repo for your content/blog (optional but recommended — GEO-agent can also file drafts to the wiki)
- Your top 5 target keywords

## What you get

- Daily citation audit posted to Slack
- Blog posts and GEO engineering fixes shipped as self-merged PRs
- `llms.txt` and JSON-LD schema kept up to date automatically
- Keyword monitoring across ChatGPT, Gemini, and Perplexity

## How it works

GEO-agent runs on a **daily citation-audit cron** (09:00 America/Los_Angeles) — the cron files a cofounder-briefed ticket and the board wakes GEO-agent the moment it lands; dispatched tasks wake it the same way, event-driven. On top of that, a **daily autonomy pulse** (24h heartbeat) lets GEO-agent pick the one of its own workflows that best advances the company's wiki-recorded goal — off-cycle citation spot-checks, a comparison-page draft, a schema or llms.txt fix — self-dispatch it on the board, and run it. Blog posts and technical GEO PRs are self-merged — no human review needed.
