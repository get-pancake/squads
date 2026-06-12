---
tags: [github, engineering, triage, issues, implementation, ops]
preview_image: https://squads.getpancake.ai/avatars/stethoscope.png
---

## What this squad does

The engineering squad — two lanes over your GitHub repos.

**Triage** (the read lane) keeps your issue tracker honest. It classifies every issue on a
**P0–P3 criticality scale**, labels it, and tells you in one paragraph why — so the critical
stuff never sits unseen in a noisy backlog.

**Build** (the write lane) ships specified work. Give it a GitHub issue, a PRD, or an idea
written out, and it implements end to end — branch, code, tests, and an open PR. It merges
on its own **only** when the change is reversible and CI is green; everything else waits for
your review.

The squad publishes four workflows your cofounder can delegate to:

- **`eng.triage_issue`** — classify and label one issue (e.g. "triage issue #412").
- **`eng.sweep_open_issues`** — triage the whole untriaged backlog of a repo.
- **`eng.weekly_report`** — a weekly issue-health report.
- **`eng.implement_idea`** — implement a specified idea/issue/PRD as a tested, reviewable PR.

## What you'll need

- A GitHub connection (the pod's GitHub App — Triage reads issues and writes labels +
  comments; Build pushes branches and opens PRs).
- The repos you want worked (`owner/repo`, comma-separated).

## What you get

- Every open issue carries an accurate, current `priority/P0–P3` label, with a one-paragraph
  evidence-based assessment on each (and filed to your wiki).
- A **daily sweep** that classifies anything new, and a **weekly issue-health report** —
  open/closed, criticality mix, stale and unlabeled issues. P0s surfaced immediately.
- Specified ideas turned into PRs: lint + build verified before the PR opens, tests
  included, the source referenced — merged for you when safe, parked for review when not.
- Everything reported on your board; nothing irreversible ships without a human.

## How it works

Both agents run as persistent agents woken **event-driven**: the board wakes them the moment
a ticket is assigned.

**The read lane** is cron-driven: a **daily sweep** (09:00 America/Los_Angeles) and a
**weekly report** (Monday 10:00) land as quiet board tickets, plus a daily autonomy pulse
where Triage may run an extra sweep or ad-hoc triage when that advances the company goal.
Ad-hoc asks ("triage #412 for me") come in as board tickets from the cofounder.

**The write lane** is dispatch-driven: the cofounder sends Build an `eng.implement_idea`
ticket with a concrete source whenever there's something specified to ship. There is no
implementation cron — Build's daily autonomy pulse picks up work on its own **only** when a
grounded source already exists (a PRD filed on the board or wiki); it never invents scope.
Self-merge is reserved for reversible, CI-green changes — migrations, API breaks, and
anything hard to roll back stay open for your review.

When anything is genuinely ambiguous — a severity call, an under-specified idea — the agents
ask the cofounder rather than guessing. Neither agent ever messages you directly — the
cofounder relays anything worth your attention.
