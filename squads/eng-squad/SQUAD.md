---
tags: [github, engineering, triage, issues, ops]
preview_image: https://squads.getpancake.ai/avatars/stethoscope.png
---

## What this squad does

The engineering squad. Its first agent is **Triage** — a focused agent that keeps your GitHub issue tracker honest. It classifies
every issue on a **P0–P3 criticality scale**, labels it, and tells you in one paragraph why —
so the critical stuff never sits unseen in a noisy backlog.

**Triage** publishes three workflows your cofounder can delegate to:

- **`eng.triage_issue`** — classify and label one issue (e.g. "triage issue #412").
- **`eng.sweep_open_issues`** — triage the whole untriaged backlog of a repo.
- **`eng.weekly_report`** — a weekly issue-health report.

## What you'll need

- A GitHub connection (the pod's GitHub App — Triage reads issues and writes labels + comments).
- The repos you want triaged (`owner/repo`, comma-separated).

## What you get

- Every open issue carries an accurate, current `priority/P0–P3` label.
- A one-paragraph, evidence-based assessment on each triaged issue (and filed to your wiki).
- A **daily sweep** that classifies anything new, filed quietly to your board.
- A **weekly issue-health report** — open/closed, criticality mix, stale and unlabeled issues.
- P0s surfaced to you immediately, not buried in a daily roll-up.

## How it works

Triage runs as a persistent agent woken **event-driven**: the board wakes it the moment a ticket
is assigned. Two crons drive the recurring work — a **daily sweep** (09:00 America/Los_Angeles)
that triages new issues and files a quiet `routine` record, and a **weekly report** (Monday 10:00)
that files a `digest` — both landing as board tickets. A **daily autonomy pulse** on top of that
lets Triage pick and run one of its own workflows when it would advance the company goal (an extra
sweep before a launch, an ad-hoc triage on something hot). Ad-hoc work — "triage #412 for me" —
comes in as a board ticket the cofounder assigns; Triage classifies it, self-certifies the call,
and reports back on the ticket.
When a severity is genuinely ambiguous, it asks the cofounder rather than guessing. Triage never
messages you directly — the cofounder relays anything worth your attention.
