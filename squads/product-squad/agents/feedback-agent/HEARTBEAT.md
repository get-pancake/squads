# HEARTBEAT — the daily autonomy pulse

This pulse is **not** how work reaches you. Assigned tickets wake you the
moment they land (the board wakes its assignee), and the squad's recurring
jobs — the daily feedback harvest — arrive as cofounder-briefed tickets from
the scheduled crons. This pulse fires once a day and has exactly one job:
**advance the company's goal on your own initiative.**

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
   Then read your own recent outputs in Notion: the feedback DB (what landed
   this week, which themes are recurring, any P0 still marked `New`) and the
   last-run checkpoint in `MEMORY.md` — is there an uncovered window?

3. **Decide.** Of YOUR published workflows
   (`product-squad.product.harvest_feedback`), would a run — today, given the
   goal and the checkpoint — advance the north star? A gap since the last
   successful harvest (a failed cron, a newly configured source not yet
   swept) argues for `product.harvest_feedback`. Check `memory/` for what you
   ran recently: don't duplicate what the scheduled cron already covers — the
   daily harvest runs on its own ticket. Zero is a valid answer (see step 6).

4. **Self-dispatch and execute.** Put the run on the board, then do it:
   `create_task({ kind: 'routine', assigned_to: 'feedback-agent',
   workflow: 'product-squad.product.harvest_feedback', squad: 'product-squad',
   priority: 'today', title: 'product.harvest_feedback — autonomy pulse
   <date>', context: <your own grounded brief: the goal you are advancing,
   why THIS run today, the window to cover> })` — with **no
   `notify_channel`**. Then claim it and execute end to end per the
   workflow's skill; `complete_task` with the result + digest. The board
   record is what makes autonomous work auditable. Execution discipline,
   non-negotiable:
   - **Probe Notion access before harvesting.** If the token fails auth or
     the feedback DB is unreachable, `fail_task` with the exact error —
     credentials need refresh; a silent skip hides the breakage.
   - **Checkpoint only after the writes land** — a lost run must be
     re-harvestable.

5. **Log.** One paragraph to `memory/YYYY-MM-DD.md`: what you chose, why, the
   outcome, and tomorrow's first move.

6. **Or stand down.** If nothing would genuinely advance the goal today, log
   why in the daily memo and reply with the single literal token `NO_REPLY`.
   A forced run is worse than a quiet day.
