---
name: triage-playbook
description: The P0–P3 GitHub-issue criticality rubric and the step-by-step procedure for each triage workflow (triage_issue, sweep_open_issues, weekly_report). Load it whenever you run any triage workflow.
---

# Triage playbook

This is how Triage classifies a GitHub issue's criticality and runs each published workflow.
The label mechanics (which label, how to swap it) live in the `github-labeling` skill — this
skill owns the *judgement*.

## The criticality rubric (P0–P3)

Classify on **impact × reach × urgency**, not on how loud the reporter is. Pick the highest
band any one dimension justifies.

| Level | Means | Signals |
|---|---|---|
| **P0 — Critical** | Production is broken or unsafe right now. | Outage, data loss/corruption, security vulnerability, auth broken, payment broken, a crash hitting most users, a regression with no workaround. |
| **P1 — High** | Major function broken or degraded; a workaround may exist but it hurts. | A core feature unusable for a segment, severe perf regression, a broken upgrade path, frequent error affecting many users. |
| **P2 — Medium** | Real bug, limited blast radius, tolerable workaround. | Edge-case bug, minor feature broken, cosmetic issue with functional impact, a well-scoped enhancement with clear demand. |
| **P3 — Low** | Minor, cosmetic, or speculative. | Typo, nice-to-have, vague idea, cleanup, docs gap, a question, an unreproducible one-off. |

**Calibration rules**

- **Security or data-loss → P0**, even if only one user is affected. Surface it on the ticket immediately, don't wait for the daily roll-up.
- **No reproduction + no clear impact → cap at P2** and note the gap. If even the *type* of impact is unclear, that's a `needs_input` candidate, not a guess.
- **Reach matters:** the same bug is P1 if it hits everyone and P2 if it hits one narrow config.
- **A feature request is at most P2** (P3 if speculative) — criticality measures harm, not desirability. Roadmap value is the cofounder's call.
- When two bands are defensible, pick the **lower** and say why in the assessment — over-escalation erodes trust as fast as under-triage.

## The assessment (what you write)

Every triage produces a tight paragraph:

```
**P<n> — <one-line why>.**
Impact: <what breaks, for whom>. Reach: <how many / which config>. Repro: <yes/no/partial>.
Evidence: <the line(s) in the issue that drove the call>. Confidence: <high/med/low>.
```

Post it as an issue comment (via `github-labeling` → comment step) **and** file it to
`wiki/Knowledge/GitHub-Triage/<repo>/issue-<n>.md`.

## Workflow: `eng.triage_issue`

Inputs: `repo`, `issue_number`.

1. Fetch the issue (title, body, labels, reactions, linked PRs) via the GitHub API/`gh`.
2. Score it against the rubric. If severity is genuinely ambiguous (missing repro AND unclear
   impact, or a judgement call about user importance), **stop**: `add_task_comment` the specific
   question and set the ticket `needs_input`. Don't invent a P-level.
3. Apply the matching `priority/P*` label (see `github-labeling`).
4. Post the assessment as an issue comment and file it to the wiki.
5. `complete_task` with the P-level, the one-paragraph rationale, and the issue URL in `result`.
   If P0, also make the P0 explicit at the top of the result so the cofounder raises it now.

## Workflow: `eng.sweep_open_issues`

Inputs: `repo`, optional `since`.

1. List open issues lacking a `priority/P*` label (and updated since `since` if given).
2. For each, run the `triage_issue` procedure above. Park genuinely-ambiguous ones as a list to
   raise once (don't open a `needs_input` per issue — batch them in the digest).
3. **File the sweep as a routine record on the board:** `create_task({ kind: "routine",
   assigned_to: "triage-agent", title: "Triage sweep — <repo> <date>", context: <digest>,
   priority: "later" })` with **no** `notify_channel`, then `complete_task` it with the summary
   (N triaged, the P0/P1 list, and any ambiguous issues needing a human). This lands on the board
   without paging the user; the cofounder's daily report rolls it up.
4. `complete_task` the dispatched sweep ticket with the same summary.

## Workflow: `eng.weekly_report`

Inputs: `repo`.

1. Gather: open vs closed this week, current criticality mix (P0–P3 counts), issues stale >30d,
   still-unlabeled count, oldest untriaged.
2. Write the report to `wiki/Knowledge/GitHub-Triage/<repo>/weekly-<date>.md`.
3. File it as a **`digest`** ticket on the board (same pattern as the sweep, `kind: "digest"`,
   no `notify_channel`) and `complete_task` it with the headline numbers.
