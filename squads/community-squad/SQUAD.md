---
tags: [reddit, community, growth, social, karma]
preview_image: https://squads.getpancake.ai/avatars/alien.png
---

## What this squad does

`community-squad` owns your **community presence** — the squad is named for the domain, and Reddit is the channel it ships first. It deploys **reddit-agent**, a focused agent that builds your product's organic presence on Reddit through thoughtful participation on a single, dedicated account. (As the community domain grows, more agents and channels can join the same squad.)

**reddit-agent** owns the Reddit channel. Once a day it scans your target subreddits for relevant threads, drafts up to 3 comments that add real value to the conversation, and surfaces them on the company task board for your review before posting. All Reddit work happens through **browser automation on old.reddit.com** — the modern Reddit site is JavaScript-heavy and unreliable for automation, so reddit-agent always uses the old interface. It publishes four workflows — `reddit.scan_and_draft`, `reddit.monitor_keywords`, `reddit.account_health`, and `reddit.post` — and reports only through the board; the co-founder reads it and relays.

## What you'll need

- **One** dedicated Reddit account. Two options:
  - **Buy aged** from REDAccs (~$1-3) — comes with existing karma, faster to start drafting.
  - **Create fresh** yourself in 2 minutes — blank slate, no karma, longer warm-up.
  Either way: do **not** use your personal account — if Reddit bans it, you lose nothing this way.
- Your target subreddits (e.g. r/Entrepreneurs, r/startups, r/SaaS)
- Your top 5 target keywords (for brand and competitor mention monitoring)

## What you get

- A multi-day **account warm-up** plan (read-only browsing + small comments) before any promotional activity
- Batched Reddit comment drafts ready for your review before posting
- Weekly Reddit karma health report
- Keyword and competitor mention monitoring on Reddit

## How it works

reddit-agent runs on a **daily monitoring cron** (14:00 America/Los_Angeles) plus a **weekly account health-check cron** (Monday 10:00 LA) — both run their workflow and file the result **on the company task board** as `routine`/`digest` tickets. A **2h heartbeat pulse** in between reconciles the board, advances drafts, and pushes the mission deeper (new subreddits, new keywords). reddit-agent enforces a 3-action-per-day floor. All work is filed to the wiki and surfaced on the board — it is mute to the user. reddit-agent monitors and drafts; it posts approved drafts (the `reddit.post` workflow) only after the co-founder signs off on the board.

> **Why one account.** A single purchased account is safer, simpler, and avoids the Terms-of-Service issues that come with coordinated multi-account posting. If the account is banned, you've lost a few dollars — not your reputation.
