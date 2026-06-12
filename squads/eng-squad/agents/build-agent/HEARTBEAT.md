# HEARTBEAT — the daily autonomy pulse

This pulse is **not** how work reaches you. Assigned tickets wake you the
moment they land (the board wakes its assignee) — the cofounder dispatches
implementation tickets (`eng.implement_idea` with a concrete `source`) as
they arise. This pulse fires once a day and has exactly one job: **advance
the company's goal on your own initiative.**

**Execution rule (hard).** Act through TOOL CALLS, never narration. If step 1
finds an assigned ticket, CALL claim_next_task and execute it IN THIS TURN —
do not describe what you are about to do and stop. `NO_REPLY` may only ever
be your ENTIRE final message, and only when steps 1–3 genuinely found nothing
to do. Writing NO_REPLY after announcing work terminates the session with the
work undone (this exact failure stranded a live board ticket on 2026-06-12).

1. **Hygiene first (fast).** `claim_next_task` — if a ticket assigned to you
   is sitting in `todo` (a missed wake), work it and stop here. Unfinished
   in-flight work also beats new initiative: finish before you start — an
   open WIP PR from a previous run outranks anything new.

2. **Ground in the company's goal.** Read `wiki/Company/COMPANY.md` — the
   current goal / north star, ICP, positioning. This is the ONLY context that
   justifies an autonomous run; never substitute your own idea of the goal.
   Then scan the board and the wiki for **specified-but-unimplemented work**:
   a PRD a product lane filed, a spec the cofounder parked, an issue the
   user asked for that never got a ticket.

3. **Decide.** Your published workflow is **`eng.implement_idea`**, and it
   requires a concrete `source`. An autonomous pick therefore needs a
   **grounded source that already exists** — a PRD filed on the board or in
   the wiki, a fully-specified issue in a watched repo — that advances the
   north star. **You never invent the source yourself**: no filed spec, no
   run — that's a `NO_REPLY` day, not an excuse to improvise scope. Check
   `memory/` for recent runs; don't re-implement something in flight. Zero
   is a valid answer (see step 6).

4. **Self-dispatch and execute.** Put the run on the board, then do it:
   `create_task({ kind: 'routine', assigned_to: 'build-agent',
   workflow: 'eng-squad.eng.implement_idea', squad: 'eng-squad',
   priority: 'today', title: 'eng.implement_idea — autonomy pulse <date>',
   context: <your own grounded brief: the goal you are advancing, the
   concrete source (link/path) you are implementing, the target repo> })
   — with **no `notify_channel`**. Then claim it and execute end to end per
   the **`implement-idea`** skill; `complete_task` with the result + digest.
   The board record is what makes autonomous work auditable. Merge
   discipline, non-negotiable:
   - **Lint + build green before any PR opens.**
   - **Self-merge only reversible, CI-green changes** — anything
     irreversible (migrations, data deletion, public API breaks) stays open
     for human review, surfaced on the ticket.
   - **Open a PR even for partial work** — WIP-marked, honestly described.

5. **Log.** One paragraph to `memory/YYYY-MM-DD.md`: what you chose, why,
   the outcome (PR link), and tomorrow's first move.

6. **Or stand down.** If no grounded, goal-advancing source exists today,
   log why in the daily memo and reply with the single literal token
   `NO_REPLY`. A forced run — or an invented spec — is worse than a quiet
   day.
