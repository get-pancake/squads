# Heartbeat

Every time you wake (heartbeat pulse or dispatched task), run this procedure
**in order**, then act.

## The non-negotiable

**At least one task must be EXECUTED before you close the session.** A wake is
not "orient, decide nothing is due, NO_REPLY". A wake is "orient, find the
highest-leverage thing in your lane, do it, file the result". If there is
truly nothing actionable — every dispatched task is blocked, no recurring duty
is due, and no open output is awaiting your hand — only then is `NO_REPLY`
acceptable, and you must log *why* in `memory/YYYY-MM-DD.md` before ending the
turn.

## 1. Orient

1. Read `MEMORY.md` — analytics tool, repo, vault keys, where you file.
2. Skim the most recent `memory/YYYY-MM-DD.md` entries — what's been reported,
   what's pending, what anomalies are still open.
3. `list_tasks` — see what's dispatched and waiting.

## 2. Decide what this wake is for

- **Dispatched task waiting?** Handle it first. That's why you were woken.
- **Heartbeat pulse with no task?** Pull the latest traffic numbers, check
  for anomalies, draft the daily digest. Don't bail at orient — the wake
  exists to *do work*.
- **Genuinely nothing actionable?** Log the reason in
  `memory/YYYY-MM-DD.md`, reply with the single literal token `NO_REPLY`, end
  the turn.

## 3. Recurring duty

- If the daily heartbeat fires and no task is dispatched, load the
  `analytics-setup` skill and run the daily check — sources, conversions,
  anomalies. File the digest to `wiki/Projects/LandingPage/TrafficReports/`.
- Anomaly threshold = 30%. If any key metric moves >30% vs the prior period,
  flag it to the co-founder immediately via `update_task` or a fresh task —
  don't bury it in tomorrow's digest.

## 4. Execute

Actually do the work picked in Step 2. Don't just plan — pull the data, write
the digest, file the wiki entry, open the tracking PR. Output > deliberation.

## 5. Digest — before closing the session

Before you end the turn, write a one-paragraph digest of this wake to
`memory/YYYY-MM-DD.md`:

- **What you did** — the task(s) executed, by id or short title.
- **What changed** — digests filed, anomalies flagged, tracking PRs opened.
- **What's still open** — anything carried to the next wake, with the reason.
- **Next wake's first move** — the single thing future-you should pick up.

The digest is for *future-you*, not the co-founder. Surface to the co-founder
only when there is material news (use `update_task` / a Slack post per
`SOUL.md`'s personality). A wake without a digest is an unfinished wake.

## 6. Close the loop

- On task completion: `complete_task` with a summary of findings + the wiki
  link.
- On blocker: `fail_task` (or `update_task`) with the reason, log it, surface
  it to the co-founder.
- Never disappear silently — every wake either executes work and digests, or
  logs *why* nothing was actionable and returns `NO_REPLY`.
