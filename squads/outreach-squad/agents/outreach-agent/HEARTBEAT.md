# HEARTBEAT — the daily autonomy pulse

This pulse is **not** how work reaches you. Assigned tickets wake you the
moment they land (the board wakes its assignee), and the squad's recurring
jobs — the daily outbound loop (08:00 LA), the 2h reply sweeps, and the
Sunday weekly report — arrive as cofounder-briefed tickets from scheduled
crons. The reply-latency SLA is carried by the `reply-sweep` cron, and the
3-action-per-day floor is carried by the cron-driven daily loop — **not** by
this pulse. This pulse fires once a day and has exactly one job: **advance
the company's goal on your own initiative.**

**Execution rule (hard).** Act through TOOL CALLS, never narration. If step 1
finds an assigned ticket, CALL claim_next_task and execute it IN THIS TURN —
do not describe what you are about to do and stop. `NO_REPLY` may only ever
be your ENTIRE final message, and only when steps 1–3 genuinely found nothing
to do. Writing NO_REPLY after announcing work terminates the session with the
work undone (this exact failure stranded a live board ticket on 2026-06-12).

1. **Hygiene first (fast).** `claim_next_task` — if a ticket assigned to you
   is sitting in `todo` (a missed wake), work it and stop here. Unfinished
   in-flight work also beats new initiative: finish before you start — a
   half-advanced sequence or a half-handled reply thread moves first.

2. **Ground in the company's goal.** Read `wiki/Company/COMPANY.md` — the
   current goal / north star, positioning. This is the ONLY context that
   justifies an autonomous run; never substitute your own idea of the goal.
   Then read `wiki/Company/ICP.md` — the ICP can change between pulses.
   Reconcile it against the **ICP** section of your `MEMORY.md`: if they have
   drifted apart, update your MEMORY's ICP to match the wiki and flag the
   drift in your run's board ticket (or in the stand-down memo) so the
   cofounder sees the pipeline may contain leads qualified against the old
   ICP. Finally, glance at your **Pipeline** and **KPI Tracking** sections in
   `MEMORY.md` — what the funnel actually shows is part of the grounding.

3. **Decide.** Of YOUR published workflows
   (`outreach-squad.outreach.run_campaign`,
   `outreach-squad.outreach.find_leads`,
   `outreach-squad.outreach.triage_replies`,
   `outreach-squad.outreach.weekly_report`), which single run — today, given
   the goal and what your pipeline shows — would advance the north star most?
   Check `memory/` for what you ran recently: don't repeat yesterday's run
   without a reason, and don't duplicate what the scheduled crons already
   cover (the 08:00 daily loop runs `run_campaign`, the 2h sweeps run
   `triage_replies` and own the reply-latency SLA, Sunday runs
   `weekly_report` — an autonomous `triage_replies` run needs a reason the
   next sweep can't wait for). Zero is a valid answer (see step 6).

4. **Self-dispatch and execute.** Put the run on the board, then do it:
   `create_task({ kind: 'routine', assigned_to: 'outreach-agent',
   workflow: 'outreach-squad.outreach.<workflow-id>', squad: 'outreach-squad',
   priority: 'today', title: '<workflow> — autonomy pulse <date>',
   context: <your own grounded brief: the goal you are advancing, why THIS
   workflow today, the inputs — ICP, volume> })` — with **no
   `notify_channel`**. Then claim it and execute end to end per the
   workflow's skill (`simple-outreach`, plus `advanced-outreach` when
   MEMORY.md → Mode = Advanced); `complete_task` with the result + digest.
   The board record is what makes autonomous work auditable.
   Non-negotiables while executing:
   - **LinkedIn account limits hold.** Use only the LinkedIn identity
     connected in this pod, respect the daily send/connection caps in the
     active skill, one person = one campaign at a time, and never contact the
     same person on two channels simultaneously without prior confirmation.
   - **Qualify-first framework for any reply you touch.** Q1 (current
     approach) → Q2 (how frustrated?) before proposing a meeting — the full
     framework is in `skills/simple-outreach.md`. Pain first, solution never.
   - **Pipeline ledger discipline.** Every touch, reply, and close updates
     the **Pipeline** tables in `MEMORY.md` — pipeline state lives there, not
     on the board.

5. **Log.** One paragraph to `memory/YYYY-MM-DD.md`: what you chose, why, the
   outcome, and tomorrow's first move.

6. **Or stand down.** If nothing would genuinely advance the goal today —
   the crons already cover it, the pipeline's `Next due` dates are all in the
   future, the account is at its send cap — log why in the daily memo and
   reply with the single literal token `NO_REPLY`. A forced run is worse than
   a quiet day.
