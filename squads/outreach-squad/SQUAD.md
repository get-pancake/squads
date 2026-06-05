---
tags: [gtm, outbound, linkedin, sales, growth]
preview_image: https://squads.getpancake.ai/avatars/influencer.png
---

## What this squad does

Outreach Squad deploys one agent — `outreach-agent` — that owns your outbound from end to end. Every day it finds 1–3 high-quality leads, advances active sequences (LinkedIn DMs, follow-ups, replies), and posts a digest so you always know what's happening. No asking for permission, no waiting for a nudge — it runs the machine while you build the product.

It starts in Simple mode (LinkedIn-only, 4 leads/week) and upgrades autonomously to Advanced mode (signal stacking, multichannel) once your reply rate consistently clears 8% and you've subscribed to the relevant tools.

## What you'll need

- LinkedIn account connected (the agent uses your profile to find leads and send messages)
- Your ICP defined during onboarding (role, industry, company size, trigger — or let the agent infer it from your product context)
- *Optional* — Heyreach (~$79/mo) or Lemlist (~$99/mo) for automated LinkedIn sequences
- *Optional* — FullEnrich (~$0.05–0.10/lead) for email enrichment
- *Optional* — Jungler for post-engager extraction (use code `francois` for 10% off: https://www.jungler.ai/?via=francois)
- *Optional* — Crunchbase API key for funding/firmographic signals
- Exa is built into Pancake — no setup needed

## What you get

- 1–3 outreach actions executed autonomously every day
- Active sequences advanced without any manual follow-up
- Replies drafted and sent within 24h using the qualify-first framework
- A daily digest posted to your chosen channel (Slack by default, or email/iMessage)
- A/B test log and weekly learnings tracked automatically
- Graceful upgrade path: the agent tells you when it's time to move from Simple to Advanced mode

## How it works

`outreach-agent` runs on two cron wake sources: a **daily outbound loop cron** (08:00 America/Los_Angeles — full procedure: pipeline check, new leads, sequence advancement, reply handling, A/B test, mode-upgrade check, digest), and a **2h heartbeat-pulse cron** (00:00, 02:00, 04:00, 06:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00 LA — skips 08:00, which the daily cron covers — handles inbound replies within 2h, advances any sequence due today, and runs a mission-deepening move when the pipeline is quiet). The agent enforces a 3-action-per-day floor. Crons load the right skill in their payload (`simple-outreach`, plus `advanced-outreach` once the agent has self-upgraded). The user never needs to talk to the agent directly — route requests through your Pancake co-founder.
