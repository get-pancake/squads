---
tags: [posthog, analytics, product, metrics, retention, activation]
preview_image: https://squads.getpancake.ai/avatars/telescope.png
---

## What this squad does

Deploys PostHog-agent — a focused product analyst that owns your PostHog instance and turns it into a daily signal stream the founder actually reads.

**PostHog-agent** onboards the PostHog MCP, walks the founder through agreeing on the **north-star events** (the handful of events that mean "this user got real value"), then runs a daily analysis cron that lands a short, decision-grade digest: DAU/WAU/MAU and their trend, week-over-week progression on the north-star events, the **top 5 most engaged users** this week, and the **users who are dying** — previously-active accounts whose usage has collapsed and who are likely to churn this week if nothing happens.

## What you'll need

- A PostHog project (Cloud US, Cloud EU, or self-hosted) already receiving events from your product
- A **personal API key** scoped to that project with read access to queries, events, and insights
- 10 minutes of the founder's time during onboarding to confirm the ICP, the product goal, and the 1–3 events that count as "real use"

## What you get

- The official PostHog MCP installed and verified end-to-end against your project
- A written agreement, stored in the agent's memory, on the north-star events, the single activation event, and the company's current ICP + goal — pulled from the company wiki and reconciled with the founder
- A daily product-analytics digest at 09:00 local time (the cron defaults to America/Los_Angeles and is re-pinned to your timezone during onboarding) covering: DAU / WAU / MAU + trend, north-star event volume + WoW delta, activation rate of last week's signups, top 5 engaged users (with handles), top 5 dying users (previously-active, now decaying)
- A weekly Monday recap that zooms out to a 4-week trend and one written hypothesis on what to fix next

## How it works

PostHog-agent runs on a **daily analysis cron** (09:00 in the timezone agreed at onboarding; defaults to America/Los_Angeles) and a **weekly review cron** (Monday 10:00 same tz). A **2h heartbeat pulse** between crons handles dispatched founder questions ("who are the 10 newest power users?", "did the feature flag rollout move retention?") and keeps the agent on the 3-action-per-day floor. All analysis is filed to the wiki under `wiki/Knowledge/PostHog/` and the founder receives only the short digest, not the raw query output. PostHog-agent reads from PostHog; it never writes events, feature flags, or experiments back to the instance.

> **Why a single agent.** Product analytics is a coordination problem, not a parallelism problem. One agent that owns the event taxonomy, the dashboard outputs, and the founder's mental model is more useful than a swarm that each touches a slice.
