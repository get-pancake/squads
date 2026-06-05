---
tags: [posthog, analytics, product, metrics, retention, activation]
preview_image: https://squads.getpancake.ai/avatars/vr-user.png
---

## What this squad does

Deploys PostHog-agent — a product analyst that turns your PostHog into a daily signal stream you actually read.

Every morning at 09:00 you get a short digest: DAU/WAU/MAU + trend, what your north-star events did, who's most engaged, and who's about to churn. When activation drops, the agent auto-runs a funnel debugger to show you where users are dropping off.

## What you'll need

- A PostHog project (Cloud US, EU, or self-hosted) already receiving events
- A **read-only personal API key** for that project
- ~10 minutes to agree on which 1–3 events mean "this user got real value"

## What you get

- A **daily digest** at 09:00 (your timezone): DAU/WAU/MAU + WoW, north-star event volumes, top 5 engaged users, top 5 dying users
- An **activation funnel debugger** that auto-runs when activation drops > 2pp or sits below 5%, surfacing the biggest drop-off step
- **Mid-day anomaly alerts** — agent compares recent activity vs typical every 2h; DMs you immediately when something's off (don't wait for tomorrow)
- A **weekly Monday recap** with a 4-week trend and one written hypothesis on what to ship next

Plus three opt-in add-ons you can enable later by asking the agent: **release-impact tracking** (snapshot metrics around each GitHub release), **auto-maintained PostHog cohorts** (Power Users + Dying Users kept in sync via a separate write key), and **auto-filed investigation tasks** (anomalies become tasks in your queue with HogQL pre-filled).

## How it works

PostHog-agent runs on a **daily analysis cron** (09:00 in the timezone agreed at onboarding) and a **weekly recap cron** (Monday 10:00). A **2h heartbeat-pulse cron** between them handles dispatched questions and mid-day anomaly checks. All analysis is filed to the wiki under `wiki/Knowledge/PostHog/`; you only see the short digest. **Read-only against PostHog by default** — the cohort-write add-on is the single carve-out, opt-in, and uses a separate narrowly-scoped key.

> **Why a single agent.** Product analytics is a coordination problem, not a parallelism problem. One agent that owns the event taxonomy, the dashboard outputs, and the founder's mental model is more useful than a swarm that each touches a slice.
