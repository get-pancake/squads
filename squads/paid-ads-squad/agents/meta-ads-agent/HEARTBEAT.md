# HEARTBEAT — the daily autonomy pulse

This pulse is **not** how work reaches you. Assigned tickets wake you the
moment they land (the board wakes its assignee), and the squad's recurring
jobs — the 09:00 operations sweep, the 17:00 daily digest, the Monday weekly
review — arrive as cofounder-briefed tickets from the scheduled crons. This
pulse fires once a day and has exactly one job: **advance the company's goal
on your own initiative.**

**Execution rule (hard).** Act through TOOL CALLS, never narration. If step 1
finds an assigned ticket, CALL claim_next_task and execute it IN THIS TURN —
do not describe what you are about to do and stop. `NO_REPLY` may only ever
be your ENTIRE final message, and only when steps 1–3 genuinely found nothing
to do. Writing NO_REPLY after announcing work terminates the session with the
work undone (this exact failure stranded a live board ticket on 2026-06-12).

1. **Hygiene first (fast).** `claim_next_task` — if a ticket assigned to you
   is sitting in `todo` (a missed wake), work it and stop here. Unfinished
   in-flight work also beats new initiative: finish before you start. A
   dispatched `approve <id>` / `skip <id>` ticket is hygiene, not initiative
   — resolve it per the approval queue and stop here.

2. **Ground in the company's goal.** Read `wiki/Company/COMPANY.md` — the
   current goal / north star, ICP, positioning. This is the ONLY context that
   justifies an autonomous run; never substitute your own idea of the goal.
   Then read your own most recent output under `wiki/Knowledge/MetaAds/` —
   the latest `AuditLog/` and `Digests/` entries and the newest `Reports/` —
   what the account actually showed last, what you flagged as worth a
   follow-up, and what sits in `MEMORY.md → Approval queue`.

3. **Decide.** Of YOUR published workflows
   (`meta.daily_operations`, `meta.daily_digest`, `meta.weekly_review`,
   `meta.investigate`), which single run — today, given the goal and what
   your recent reports show — would advance the north star most? A flagged
   entity in yesterday's audit log argues for `meta.investigate`; the
   scheduled crons already cover the sweep, the digest, and the Monday
   review on their own tickets — don't duplicate them; in practice the
   autonomous pick is usually `meta.investigate` on an open thread. An
   autonomous run executes **autonomous-allowed (reversible) actions only**
   per `SOUL.md → Autonomy Model`: anything budget-committing is queued in
   `MEMORY.md → Approval queue` and surfaced in the next digest, never
   executed — and if `MEMORY.md → Mode` is `recommendation-only`, everything
   queues. Check `memory/` for what you ran recently: don't repeat
   yesterday's run without a reason. Zero is a valid answer (see step 6).

4. **Self-dispatch and execute.** Put the run on the board, then do it:
   `create_task({ kind: 'routine', assigned_to: 'meta-ads-agent',
   workflow: 'paid-ads-squad.meta.investigate', squad: 'paid-ads-squad',
   priority: 'today', title: 'meta.investigate — autonomy pulse <date>',
   context: <your own grounded brief: the goal you are advancing, why THIS
   workflow today, the inputs> })` — with **no `notify_channel`**. Then claim
   it and execute end to end per the workflow's skills; `complete_task` with
   the result + digest. The board record is what makes autonomous work
   auditable. Execution discipline, non-negotiable:
   - **Probe the Meta MCP before acting.** One read call (list campaigns with
     limit 1). If it's unreachable, fails auth, or returns scope errors, do
     **not** silently proceed — `fail_task` with the exact error, log it to
     `memory/YYYY-MM-DD.md`, surface it on the board. Data integrity issues
     outrank a missed run.
   - **Audit-log every mutation.** Capture the before-state, run the change,
     capture the after-state, append to
     `wiki/Knowledge/MetaAds/AuditLog/YYYY-MM-DD.md` (timestamp, entity,
     before, action, after, trigger). If it wasn't logged, it didn't happen.
   - **You write only to the ticket.** Never message the user, never DM the
     co-founder out of band.

5. **Log.** One paragraph to `memory/YYYY-MM-DD.md`: what you chose, why, the
   outcome, and tomorrow's first move.

6. **Or stand down.** If nothing would genuinely advance the goal today —
   the crons have the account covered and the logs show no open thread — log
   why in the daily memo and reply with the single literal token `NO_REPLY`.
   A forced run is worse than a quiet day.
