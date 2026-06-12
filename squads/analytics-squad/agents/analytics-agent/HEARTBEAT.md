# HEARTBEAT — the daily autonomy pulse

This pulse is **not** how work reaches you. Assigned tickets wake you the
moment they land (the board wakes its assignee), and the squad's recurring
jobs — the 09:00 daily digest, the Monday weekly recap — arrive as
cofounder-briefed tickets from the scheduled crons. This pulse fires once a
day and has exactly one job: **advance the company's goal on your own
initiative.**

1. **Hygiene first (fast).** `claim_next_task` — if a ticket assigned to you
   is sitting in `todo` (a missed wake), work it and stop here. Unfinished
   in-flight work also beats new initiative: finish before you start.

2. **Ground in the company's goal.** Read `wiki/Company/COMPANY.md` — the
   current goal / north star, ICP, positioning. This is the ONLY context that
   justifies an autonomous run; never substitute your own idea of the goal.
   Then read your own most recent reports under
   `wiki/Knowledge/PostHog/Reports/` (latest daily, latest weekly) — what the
   numbers actually showed last, and what you flagged as worth a follow-up.

3. **Decide.** Of YOUR published workflows
   (`posthog.daily_digest`, `posthog.weekly_recap`, `posthog.debug_funnel`,
   `posthog.adhoc_report`), which single run — today, given the goal and what
   your recent reports show — would advance the north star most? A sagging
   activation rate in yesterday's digest argues for `posthog.debug_funnel`; a
   goal-relevant question no standing report answers argues for
   `posthog.adhoc_report`. Check `memory/` for what you ran recently: don't
   repeat yesterday's run without a reason, and don't duplicate what the
   scheduled crons already cover — the daily digest and weekly recap run on
   their own tickets. Zero is a valid answer (see step 6).

4. **Self-dispatch and execute.** Put the run on the board, then do it:
   `create_task({ kind: 'routine', assigned_to: 'analytics-agent',
   workflow: 'analytics-squad.posthog.debug_funnel', squad: 'analytics-squad',
   priority: 'today', title: 'posthog.debug_funnel — autonomy pulse <date>',
   context: <your own grounded brief: the goal you are advancing, why THIS
   workflow today, the inputs> })` — with **no `notify_channel`**. Then claim
   it and execute end to end per the workflow's skill; `complete_task` with
   the result + digest. The board record is what makes autonomous work
   auditable. Execution discipline, non-negotiable:
   - **Probe the PostHog MCP before querying.** If it's unreachable, fails
     auth, or returns scope errors, `fail_task` with the exact error, log it,
     and surface it to the co-founder — credentials need refresh. Data
     integrity issues outrank a missed run.
   - **Bounded queries only.** Aggregates or small explicit `LIMIT`s; never
     `SELECT *`, never a raw `properties` / `person.properties` JSON dump. An
     oversized tool result wedges the session. Full rules:
     `posthog-mcp-toolkit → Result-size discipline`.
   - File the full report to `wiki/Knowledge/PostHog/Reports/...` (HogQL
     included, verbatim) before surfacing the summary.

5. **Log.** One paragraph to `memory/YYYY-MM-DD.md`: what you chose, why, the
   outcome, and tomorrow's first move.

6. **Or stand down.** If nothing would genuinely advance the goal today, log
   why in the daily memo and reply with the single literal token `NO_REPLY`.
   A forced run is worse than a quiet day.
