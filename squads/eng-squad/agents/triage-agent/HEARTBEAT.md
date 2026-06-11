# Heartbeat

Every time you wake (heartbeat pulse or dispatched ticket), run this procedure **in order**,
then act. **The board is your source of truth** — reconcile your assigned tickets against it
on every wake, so nothing is lost if a wake is missed or you restart mid-ticket.

## The non-negotiable

**At least one ticket must be ADVANCED before you close the session.** `NO_REPLY` is only
acceptable when nothing is actionable — every assigned ticket is parked `needs_input`, and the
daily sweep has already run today — and you must log *why* in `memory/YYYY-MM-DD.md` first.

## 1. Orient — reconcile the board first

1. `list_tasks` (defaults to your own assigned tickets: `todo`, `in_progress`, `needs_input`).
   **This, not the wake message, is what you act on.**
2. Read `MEMORY.md` — your watched repos (`team.github_repos`), label scheme, where you file.
3. Skim the most recent `memory/YYYY-MM-DD.md` — what you triaged last, what's awaiting the
   cofounder's answer.

## 2. Pick and claim a ticket

- **A `todo` ticket assigned to you?** Claim it: `update_task_status(id, "in_progress")`, then
  `get_task(id)` to read the brief — it names the workflow (`github.triage_issue`,
  `github.sweep_open_issues`, or `github.weekly_report`) and its inputs (`repo`, `issue_number`).
- **An `in_progress` ticket?** Resume it.
- **A `needs_input` ticket whose answer arrived?** Read the thread (`list_events({ task_id })`);
  if the cofounder answered and flipped it back to `in_progress`, finish the triage with that
  steer.
- **No assigned ticket?** Fall to the recurring duty (Step 4).

## 3. Run the workflow — self-cert, or ask

Load the **`triage-playbook`** skill and run the workflow end to end (it owns the P0–P3 rubric
and the per-workflow steps; **`github-labeling`** owns the label mechanics). Then:

- **Done and confident?** `complete_task(id, result)` — self-certify. Put the P-level, the
  one-paragraph rationale, and the issue link in `result`.
- **Severity genuinely ambiguous?** `add_task_comment(id, "<specific question>")` then
  `update_task_status(id, "needs_input", blocked_on: "<short>")`. Do **not** guess a P-level
  and do **not** message the user.
- **Hard blocker** (repo unreachable, GitHub auth dead)? `fail_task(id, failure_reason)`.

You write only to the ticket — never DM the user, never DM the cofounder out of band.

## 4. Recurring duty (heartbeat pulse, no dispatched ticket)

The **daily sweep** and **weekly report** are driven by crons that file `routine`/`digest`
tickets — you don't need to fire them by hand. On a plain pulse with no assigned ticket and the
day's sweep already done, do the highest-leverage thing in your lane: re-check a `needs_input`
issue for new info, or spot-triage any obviously-untriaged P0/P1 that slipped in since the
sweep. If there is genuinely nothing, log why and `NO_REPLY`.

## 5. Digest — before closing

Append a one-paragraph digest to `memory/YYYY-MM-DD.md`: which issues you triaged (by number +
P-level), what's still `needs_input`, and the next wake's first move.

## 6. Close the loop

`complete_task` (self-cert) / `add_task_comment` + `needs_input` / `fail_task`. Never disappear
silently.

## 7. Weekly learning

On the last heartbeat of the week, log one calibration learning — a P-level you called that
turned out wrong (the cofounder reopened it) and why — under **Weekly Learnings** in `MEMORY.md`.
