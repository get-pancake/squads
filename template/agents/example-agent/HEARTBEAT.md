# Heartbeat

<!-- TODO: HEARTBEAT.md is the procedure this agent runs every time it wakes —
     either on its scheduled heartbeat pulse or when dispatched a ticket. OpenClaw
     loads this file on every wake. Keep it imperative, in order, and short
     enough that the agent finishes the procedure before doing real work.
     Strip every TODO before publishing. -->

Every time you wake (heartbeat pulse or dispatched ticket), run this procedure
**in order**, then act. **The board is your source of truth** — you reconcile
your assigned tickets against it on every wake, so nothing is lost if a wake is
missed or you restart mid-ticket.

## The non-negotiable

**At least one ticket must be ADVANCED before you close the session.** A wake is
not "orient, decide nothing is due, NO_REPLY". A wake is "reconcile the board,
find the highest-leverage ticket in your lane, advance it, file the result". If
there is truly nothing actionable — every assigned ticket is parked
`needs_input` waiting on the cofounder, no recurring duty is due, and no open
output is awaiting your hand — only then is `NO_REPLY` acceptable, and you must
log *why* in `memory/YYYY-MM-DD.md` before ending the turn.

## 1. Orient — reconcile the board first

1. `list_tasks` (defaults to `assigned_to` = you) — your open tickets: `todo`,
   `in_progress`, and `needs_input`. **This, not the wake message, is what you
   act on.** The push (a `sessions_send` pointer) and the pull (this scan) both
   land here; the board wins.
2. Read `MEMORY.md` — your settings, vault keys, where you file outputs.
3. Skim the most recent `memory/YYYY-MM-DD.md` entries — what's in flight, what
   you're waiting on the cofounder for.

## 2. Pick and claim a ticket

- **A `todo` ticket assigned to you?** That's a dispatched job — claim it:
  `update_task_status(id, "in_progress")`, then `get_task(id)` to read the full
  brief from `context` (it names the **workflow** to run + its inputs).
- **An `in_progress` ticket you own?** Resume it — you were mid-run.
- **A `needs_input` ticket whose answer just arrived?** Read the thread with
  `list_events({ task_id })`; if the cofounder answered (a new `comment` and a
  flip back to `in_progress`), resume from the brief + the answer.
- **No assigned ticket?** Fall to your recurring duty (Step 4).

Claim the **oldest / highest-priority** open ticket first. One ticket at a time.

## 3. Run the ticket — self-cert, or ask

Execute the workflow named in the brief end to end. Then:

- **Done and you're confident?** `complete_task(id, result)` — you **self-certify**
  the outcome. Write a substantive `result`: what you did + where the artifact
  is. (If the cofounder/user later disagrees, they reopen the ticket back to
  `todo` and you'll re-run it — that's the correction path, not a gate.)
- **Blocked on intent only the cofounder has** (which target? what tone? is this
  spend OK?)? Do **not** guess and do **not** message the user. Post the question
  with `add_task_comment(id, "<your question>")`, then
  `update_task_status(id, "needs_input", blocked_on: "<short>")`. The cofounder
  answers on the thread and flips you back to `in_progress`.
- **Genuinely failed** (dead dependency, impossible task)? `fail_task(id,
  failure_reason)`.

You write only to the ticket — never DM the user, never DM the cofounder out of
band. The ticket *is* the channel.

## 4. Recurring duty (heartbeat pulse, no dispatched ticket)

<!-- TODO: spell out the agent's recurring heartbeat duty here. Example:
     "If it has been ≥ 24h since the last citation audit, run the
     github.sweep_open_issues workflow and file the result as a kind:'routine'
     ticket assigned to yourself (no notify_channel — routine output stays off
     the user's radar)." Be specific about cadence so the agent doesn't
     double-fire on a short pulse. Most recurring duty is better driven by a
     cron in crons/jobs.json that creates the routine ticket; see
     docs/bundle-reference.md → "Crons through the board". -->

- TODO

## 5. Digest — before closing the session

Before you end the turn, write a one-paragraph digest of this wake to
`memory/YYYY-MM-DD.md`:

- **What you did** — the ticket(s) advanced, by id or short title.
- **What changed** — outputs produced, drafts advanced, blockers cleared.
- **What's still open** — anything carried to the next wake (esp. `needs_input`
  tickets you're waiting on), with the reason.
- **Next wake's first move** — the single thing future-you should pick up.

The digest is for *future-you*. Material news reaches the cofounder through the
ticket (`complete_task` result, an `add_task_comment`, a `needs_input` flip) —
the cofounder is the one who decides what to tell the user. A wake without a
digest is an unfinished wake.

## 6. Close the loop

- On completion: `complete_task` with the outcome (self-cert).
- On a clarification need: `add_task_comment` + `update_task_status(needs_input)`.
- On a hard blocker: `fail_task` with the reason; log it.
- Never disappear silently — every wake either advances a ticket and digests, or
  logs *why* nothing was actionable and returns `NO_REPLY`.

## 7. Weekly learning

On the last heartbeat of the week, log one learning: what worked, what
didn't, one hypothesis. File it under **Weekly Learnings** in `MEMORY.md`.
