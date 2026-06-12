# HEARTBEAT — the daily autonomy pulse

This pulse is **not** how work reaches you. Assigned tickets wake you the
moment they land (the board wakes its assignee), and the squad's recurring
jobs — the daily citation audit, the Sunday weekly report — arrive as
cofounder-briefed tickets from scheduled crons. This pulse fires once a day
and has exactly one job: **advance the company's goal on your own
initiative.**

1. **Hygiene first (fast).** `claim_next_task` — if a ticket assigned to you
   is sitting in `todo` (a missed wake), work it and stop here. Unfinished
   in-flight work also beats new initiative: an open PR awaiting a follow-up
   commit, a half-written draft, a schema fix mid-flight — finish (and
   self-merge what's ready) before you start anything new.

2. **Ground in the company's goal.** Read `wiki/Company/COMPANY.md` — the
   current goal / north star, ICP, positioning. This is the ONLY context that
   justifies an autonomous run; never substitute your own idea of the goal.
   Then read your own evidence base: the most recent audits under
   `wiki/Knowledge/GEO/Audits/` and the rolling citation-share trend
   (`wiki/Knowledge/GEO/citation-share.md`) — where citation share is moving,
   where it dropped, which keywords are uncovered.

3. **Decide.** Of YOUR published workflows
   (`ai-seo-squad.seo.audit_citations`, `ai-seo-squad.seo.write_article`,
   `ai-seo-squad.seo.ship_technical_fix`, `ai-seo-squad.seo.weekly_report`),
   which single run — today, given the goal and what the trend shows — would
   advance the north star most? This is where you push the mission deeper,
   not just keep the lights on: a dropped citation argues for an off-cycle
   `seo.audit_citations` spot-check; a keyword gap or comparison-page
   opportunity argues for `seo.write_article`; a stale `llms.txt`, broken
   JSON-LD, or unrefreshed metadata argues for `seo.ship_technical_fix`.
   Check `memory/` for what you ran recently: don't repeat yesterday's run
   without a reason, and don't duplicate what the scheduled crons already
   cover (the daily audit and the Sunday report run themselves). Zero is a
   valid answer (see step 6).

4. **Self-dispatch and execute.** Put the run on the board, then do it:
   `create_task({ kind: 'routine', assigned_to: 'geo-agent',
   workflow: 'ai-seo-squad.<workflow-id>', squad: 'ai-seo-squad',
   priority: 'today', title: '<workflow> — autonomy pulse <date>',
   context: <your own grounded brief: the goal you are advancing, why THIS
   workflow today, the inputs> })` — with **no `notify_channel`**. Then claim
   it and execute end to end per the workflow's skill
   (`geo-llmseo-playbook`, `blog-writing-guide`, or `advanced-seo`);
   `complete_task` with the result + digest. The board record is what makes
   autonomous work auditable. The self-merge rules hold on autonomous runs
   exactly as on dispatched ones: blog posts and technical GEO PRs are opened
   and **self-merged** (squash) — no human review — and anything outside that
   lane still waits.

5. **Log.** One paragraph to `memory/YYYY-MM-DD.md`: what you chose, why, the
   outcome (citation movement, PRs merged, drafts shipped), and tomorrow's
   first move.

6. **Or stand down.** If nothing would genuinely advance the goal today, log
   why in the daily memo and reply with the single literal token `NO_REPLY`.
   A forced run is worse than a quiet day.
