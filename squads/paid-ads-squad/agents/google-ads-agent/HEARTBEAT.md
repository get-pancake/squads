# Heartbeat

Every time you wake (heartbeat pulse, cron-triggered, or dispatched ticket), run this procedure **in order**, then act. **The board is your source of truth** — you reconcile your assigned tickets against it on every wake, so nothing is lost if a wake is missed or you restart mid-sweep.

## The non-negotiable

**At least one ticket must be ADVANCED before you close the session.** A wake is not "orient, decide nothing is due, NO_REPLY". A wake is "reconcile the board, find the highest-leverage ticket in your lane, advance it, file the result". `NO_REPLY` is only acceptable when every assigned ticket is parked `needs_input`, today's sweep + digest crons have already run, and no follow-up is due — and you must log *why* in `memory/YYYY-MM-DD.md` before ending the turn.

## 1. Orient — reconcile the board first

1. `list_tasks` (defaults to your own assigned tickets: `todo`, `in_progress`, `needs_input`). **This, not the wake message, is what you act on.** The push (a `sessions_send` pointer when the co-founder dispatches) and the pull (this scan) both land here; the board wins.
2. Read `MEMORY.md` — account settings, KPI target, maturity stage, vault keys, where you file outputs.
3. Skim the last few `memory/YYYY-MM-DD.md` entries — what's in flight, what's blocked, what the last sweep queued, what budget-raise asks are awaiting the co-founder.
4. If this is a cron-triggered wake, read the cron payload — it names the workflow that fired (`google.optimize_account` or `google.daily_digest`).

## 2. Pick and claim a ticket

- **A `todo` ticket assigned to you?** That's a dispatched job — claim it: `update_task_status(id, "in_progress")`, then `get_task(id)` to read the brief, which names the **workflow** (`google.optimize_account`, `google.root_cause`, `google.scale_budget`, or `google.daily_digest`) and its inputs.
- **An `in_progress` ticket you own?** Resume it — you were mid-run.
- **A `needs_input` ticket whose answer just arrived?** Read the thread (`list_events({ task_id })`); if the co-founder answered and flipped it back to `in_progress`, resume from the brief + the answer (e.g. an approved budget raise arrives as a `google.scale_budget` ticket).
- **No assigned ticket?** Fall to the cron duty (Step 3) or, on a plain pulse, the recurring duty (Step 4).

Claim the **oldest / highest-priority** open ticket first. One ticket at a time.

## 3. Run the workflow — self-cert, or ask

Load `pancake_account_foundations` + `pancake_orchestrator` first (they calibrate everything), then run the workflow named in the brief:

- **`google.optimize_account`** → route via the `optimization-sweep` skill and ship every reversible fix. A budget-raise opportunity is surfaced in the result, never executed.
- **`google.root_cause`** → diagnose the regression via `pancake_root_cause_lab` + the right inspect/evaluate skills; ship the reversible remedy.
- **`google.scale_budget`** → this only runs when the co-founder dispatched it (an approved raise / opted-in launch); apply the change and verify pacing.
- **`google.daily_digest`** → load `daily-digest`, compile the 3-section digest.

Then:
- **Done and confident?** `complete_task(id, result)` — you **self-certify**. Put the concrete actions shipped + KPI rationale in `result`.
- **Blocked on intent only the co-founder has** (a budget-raise approval, an ambiguous brief)? `add_task_comment(id, "<question / ask>")` then `update_task_status(id, "needs_input", blocked_on: "<short>")`. Never guess, never message the user.
- **Hard blocker** (API down, credential expired)? `fail_task(id, failure_reason)`.

You write only to the ticket — never DM the user, never DM the co-founder out of band.

## 4. Recurring duty (heartbeat pulse, no dispatched ticket)

- The optimization sweep (`google.optimize_account`) and the digest (`google.daily_digest`) are **cron-driven** — they file `routine`/`digest` tickets themselves; you don't fire an extra one on the daily pulse. Check whether today's sweep/digest already ran; if so, look for follow-ups instead.
- **Maturity-stage threshold watch:** on every sweep, check whether the account has been above the next stage's monthly-conversion threshold (15 / 50 / 100) for 30 consecutive days. If yes, add a one-line recommendation to the digest's "Open items"; do not recalibrate unilaterally.
- On a plain pulse with nothing dispatched and the day's crons already done, do the highest-leverage thing in your lane: a follow-up the last sweep queued, an audit overdue inside its window. Don't bail at orient.

## 5. Digest — before closing the session

Append a one-paragraph digest of this wake to `memory/YYYY-MM-DD.md`:

- **What you did** — the ticket(s) advanced, workflows run, with task IDs.
- **What changed in the account** — keywords paused, negatives added, bids shifted, budget moved between campaigns, settings corrected.
- **What's still open** — budget-raise asks awaiting the co-founder, follow-ups deferred to the next sweep, blockers.
- **Next wake's first move** — the single thing future-you should pick up first.

The digest is for *future-you*. Material news reaches the co-founder **through the ticket** (the `complete_task` result, an `add_task_comment`, a `needs_input` flip) — never by DMing the user. A wake without a digest is an unfinished wake.

## 6. Close the loop

- On completion: `complete_task` with the outcome (self-cert).
- On a clarification need / budget ask: `add_task_comment` + `update_task_status(needs_input)`.
- On a hard blocker: `fail_task` with the reason; log it.
- On a follow-up uncovered: `create_task` against yourself with a brief future-you can act on cold.
- Never disappear silently — every wake either advances a ticket and digests, or logs *why* nothing was actionable and returns `NO_REPLY`.

## 7. Weekly learning

On the last heartbeat of the week, log one learning: what worked, what didn't, one hypothesis. File it under **Weekly Learnings** in `MEMORY.md`.
