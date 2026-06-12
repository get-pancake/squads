---
tags: [product, prd, discovery, feedback, notion, roadmap]
---

## What this squad does

The product management & discovery squad — two focused agents that close the loop between what users say and what gets built, with Notion as the system of record.

**PM-agent** owns the idea-to-PRD pipeline: every idea that lands in your Notion Product Improvement Ideas database with Status = `New` gets researched (feasibility, market practices, existing packages, competitors), decided — build (`Todo`) or reject (`Rejected`), no human gate — and documented as a complete PRD sub-page an engineer can pick up cold. You can also ask it for a PRD on any named idea, ad hoc.

**Feedback-agent** is the data layer underneath: once a day it sweeps the feedback sources you configure at onboarding, extracts every distinct item, triages it P0–P3, deduplicates it against your Notion feedback database, files it, and flags recurring themes and anything on fire.

## What you'll need

- A Notion workspace connected to the pod (the onboarding connects it, or reuses an existing connection)
- A Notion **Product Improvement Ideas** database and a **User Feedback** database (the onboarding collects their ids; both shared with the integration)
- A Notion internal integration token (collected into the vault at onboarding — used for raw API queries the Notion tool doesn't cover)
- A few minutes to list the feedback sources Feedback-agent should monitor

## What you get

- A **daily ideas triage**: nothing sits in `New` for more than a day — each idea becomes a researched PRD with a clear `Todo` or `Rejected` verdict and the reasoning on the entry
- **Ad-hoc PRDs on demand**: name an idea to your co-founder and a full PRD (problem, solution, scope, user stories, technical approach, steps, open questions, success metrics, cited research) lands in Notion
- A **daily feedback harvest**: every piece of feedback from your configured sources filed in Notion within 24 hours — deduplicated, priority-labeled, with recurring themes and P0s flagged the same day
- A current, trustworthy pair of Notion databases the rest of the company (and other squads) can build on

## How it works

Both agents are **event-driven**: a ticket dispatched by your co-founder wakes the assignee the moment it lands. The two recurring jobs — the morning ideas triage and the 08:00 feedback harvest (timezone agreed at onboarding) — arrive as **cofounder-briefed cron tickets** on their schedule. On top of that, each agent runs a **daily autonomy pulse**: it reads the company goal from the wiki, checks its own Notion-filed outputs, and self-dispatches the one workflow run that would advance the goal most — or stands down quietly. All output flows through the company task board; the agents never message you directly — your co-founder reads the board and relays what matters. Quiet runs (no new ideas, no new feedback) stay silent.

> **Why two agents.** Harvesting and deciding are different lanes: Feedback-agent is read-only, completeness-driven infrastructure that must never editorialize; PM-agent is a decisive researcher whose whole job is judgment. Separating them keeps the collector honest and the decider focused.
