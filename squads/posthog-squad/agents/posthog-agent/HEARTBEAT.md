# Heartbeat

Every time you wake (cron, heartbeat pulse, or dispatched task), run this
procedure **in order**, then act.

## The non-negotiable

**At least one task must be EXECUTED before you close the session.** A wake
is not "orient, decide nothing is due, NO_REPLY". A wake is "orient, find
the highest-leverage thing in your lane, do it, file the result". If there
is truly nothing actionable — every dispatched task is blocked, no
recurring duty is due, no open output is awaiting your hand — only then is
`NO_REPLY` acceptable, and you must log *why* in `memory/YYYY-MM-DD.md`
before ending the turn.

## 1. Orient

1. Read `MEMORY.md` — your settings, vault keys, and where you file.
2. Skim the most recent `memory/YYYY-MM-DD.md` entries — what's in flight,
   what's blocked, what you promised the co-founder.
3. `list_tasks` — see what's dispatched and waiting.

## 2. Decide what this wake is for

- **Dispatched task waiting?** Handle it first. That's why you were woken.
- **Cron fired?** The cron payload names the skill to load (e.g.
  `daily-posthog-analysis` for the daily, `posthog-daily-analysis` weekly
  section for the Monday recap). Load that skill and run it end to end.
- **Heartbeat pulse with no task?** Pick the highest-leverage action in
  your lane: advance a draft, refresh the dying-users watchlist with
  intra-day data, scout a candidate north-star event, run the lightweight
  anomaly check (procedure in `posthog-daily-analysis`), poll for new
  releases (procedure in `posthog-release-tracker`). Don't bail at orient.
- **Genuinely nothing actionable?** Log the reason in
  `memory/YYYY-MM-DD.md`, reply with the single literal token `NO_REPLY`,
  end the turn.

## 3. Execute

Actually do the work picked in Step 2. Don't just plan — produce the
artifact, file the draft, run the audit, advance the task. Output >
deliberation.

## 4. Digest — before closing the session

Before you end the turn, write a one-paragraph digest of this wake to
`memory/YYYY-MM-DD.md`:

- **What you ran** — which queries or which skill, which window.
- **What changed** — outputs produced, drafts advanced, blockers cleared.
- **What's still open** — anything carried to the next wake, with the reason.
- **Next wake's first move** — the single thing future-you should pick up.

The digest is for *future-you*, not the co-founder. Surface to the
co-founder only when there is material news (the daily-analysis skill
handles its own digest surfacing). A wake without a digest is an
unfinished wake.

## 5. Close the loop

- On task completion: `complete_task` with the outcome.
- On blocker (MCP down, auth fail, ingestion broken): `fail_task` with the
  exact error, log it, surface it to the co-founder. Data integrity issues
  are higher-priority than missing a digest.
