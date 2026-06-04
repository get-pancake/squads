---
tags: [meta-ads, paid-ads, performance-marketing, growth]
preview_image: https://squads.getpancake.ai/avatars/astronaut.png
---

## What this squad does

Deploys **Meta Ads agent** — a single focused agent that operates one Meta Ads account end to end. It runs a daily diagnostic + action sweep at 09:00, posts a daily digest at 17:00, and a weekly review every Monday — using a 13-skill playbook library to decide what to pause, what to consolidate, and what to brief for new creative. It executes the safe actions on its own and surfaces only what genuinely needs you. You get the dashboards-and-decisions of a senior media buyer without the daily two-hour Ads Manager grind.

The agent's autonomy is asymmetric on purpose: anything that holds total committed spend flat or reduces it (pausing fatigued ads, lowering Cost Caps, consolidating ad sets, switching bid strategies inside the envelope, refreshing audiences) runs without asking. Anything that would raise total spend — a bigger budget, a higher Cost Cap, a new campaign — is queued for your explicit approval in the daily digest.

## What you'll need

- **A Meta Developer App with Marketing API Standard Access.** The free Development tier is too tight for the agent's operating rhythm — get your app through Meta App Review for Standard Access (`ads_management`, `ads_read`, `business_management`) before onboarding. Typically 3–10 business days; required only once per Meta App.
- **A System User token from Business Manager** with the same permissions, scoped to the target ad account. System User tokens are long-lived and never expire — this is what the agent uses to operate the account unattended.
- The **ad account ID**, **Pixel ID**, currency, timezone, business model, and account maturity stage (you'll calibrate this with the onboarding agent if you're not sure).
- The **primary KPI** (CPA, ROAS, CPL, CPV, or CPM) and its numeric target.
- Optional: CAPI Gateway dataset ID, custom flag thresholds (override the defaults), naming convention templates (enables automated segmentation parsing).

The agent installs and runs a self-hosted Meta Marketing API MCP server at onboarding — there is no third-party SaaS in the middle of your API traffic. All calls go directly from your pod to `graph.facebook.com`.

## What you get

- **A daily optimization sweep** at 09:00 account-local that pauses fatigued ads, reduces wasteful spend, consolidates overlap, swaps creative, and tightens audiences — all logged with before/after state to a durable audit trail.
- **A daily digest** at 17:00 account-local: yesterday's headline metrics, top wins and losses, autonomous actions taken in the last 24 hours, items awaiting your approval, today's single focus, status line.
- **A weekly review** every Monday that adapts to monthly audits (audiences, structure, measurement, budget) on the first Monday of a month and quarterly audits (compliance + maturity reassessment) on the first Monday of a quarter.
- **A complete audit log** of every autonomous action — timestamp, before state, action taken, after state, the trigger that fired it — so you can reconstruct exactly what changed and why.
- **Creative briefs** handed back to you when refresh signals fire. The agent diagnoses fatigue and writes the brief; you (or your creative team) produce the asset.
- **A kill switch.** Ask the co-founder to put the agent in recommendation-only mode any time and every proposed action — even the autonomous-safe ones — queues for your approval until you `resume`.

## How it works

The agent runs on **three crons** in the account's timezone: a daily operations sweep at 09:00 (pull last 24h, run the eight-branch root-cause framework, execute autonomous actions, queue budget-commitment proposals), a daily digest at 17:00 (composed from today's audit log + approval queue and returned to the co-founder for relay), and a weekly review every Monday at 08:00 that adapts to monthly audits on the first Monday of a month and quarterly audits on the first Monday of a quarter. There is no heartbeat; ad-hoc work (approvals, investigations) reaches the agent as dispatched tasks from the co-founder.

The 13 skill files in the bundle — 10 methodology (account foundations, campaign architecture, budgets & bids, creative, targeting, placements, Advantage+ & catalog, attribution, policy, root-cause analysis) and 3 operations (guardian rules, review cadence, operational routines) — encode every threshold, decision rule, and playbook the agent runs. They're loaded on every wake.

The user never talks to the Meta Ads agent directly. Briefs, digest, approvals, and escalations all flow through the co-founder, which relays to you on whatever channel your pod uses (Slack, voice, in-app). The agent talks to Meta's API through a self-hosted MCP server installed at onboarding — your System User token never leaves your pod, and Meta is the only third party in the loop.
