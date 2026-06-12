# HEARTBEAT — the daily autonomy pulse

<!-- TODO: HEARTBEAT.md is the procedure OpenClaw loads on every scheduled
     wake. Since wake-on-assign, this fires ONCE A DAY (agent.json
     heartbeat.every: "24h") and is NOT how you receive work — keep it
     focused on the single job below. Strip every TODO before publishing. -->

This pulse is **not** how work reaches you. Assigned tickets wake you the
moment they land (the board wakes its assignee), and the squad's recurring
jobs arrive as cofounder-briefed tickets from scheduled crons. This pulse
fires once a day and has exactly one job: **advance the company's goal on
your own initiative.**

**Execution rule (hard).** Act through TOOL CALLS, never narration. If step 1
finds an assigned ticket, CALL claim_next_task and execute it IN THIS TURN —
do not describe what you are about to do and stop. `NO_REPLY` may only ever
be your ENTIRE final message, and only when steps 1–3 genuinely found nothing
to do. Writing NO_REPLY after announcing work terminates the session with the
work undone (this exact failure stranded a live board ticket on 2026-06-12).

1. **Hygiene first (fast).** `claim_next_task` — if a ticket assigned to you
   is sitting in `todo` (a missed wake), work it and stop here. Unfinished
   in-flight work also beats new initiative: finish before you start.

2. **Ground in the company's goal.** Read `wiki/Company/COMPANY.md` — the
   current goal / north star, ICP, positioning. This is the ONLY context that
   justifies an autonomous run; never substitute your own idea of the goal.
   <!-- TODO: add the domain pages this agent should also read — its own most
        recent reports under wiki/Knowledge/<domain>/, sibling-squad findings
        that bear on its lane. -->

3. **Decide.** Of YOUR published workflows
   (<!-- TODO: list the qualified ids -->), which single run — today, given
   the goal and what your recent reports show — would advance the north star
   most? Check `memory/` for what you ran recently: don't repeat yesterday's
   run without a reason, and don't duplicate what the scheduled crons already
   cover. Zero is a valid answer (see step 6).

4. **Self-dispatch and execute.** Put the run on the board, then do it:
   `create_task({ kind: 'routine', assigned_to: '<your-id>',
   workflow: '<squad>.<workflow-id>', squad: '<squad>', priority: 'today',
   title: '<workflow> — autonomy pulse <date>', context: <your own grounded
   brief: the goal you are advancing, why THIS workflow today, the inputs> })`
   — with **no `notify_channel`**. Then claim it and execute end to end per
   the workflow's skill; `complete_task` with the result + digest. The board
   record is what makes autonomous work auditable.

5. **Log.** One paragraph to `memory/YYYY-MM-DD.md`: what you chose, why, the
   outcome, and tomorrow's first move.

6. **Or stand down.** If nothing would genuinely advance the goal today, log
   why in the daily memo and reply with the single literal token `NO_REPLY`.
   A forced run is worse than a quiet day.
