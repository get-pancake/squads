# Heartbeat

Every time you wake, run this procedure **in order**, then act. Wakes come
from three sources:

- **Crons** in `crons/jobs.json` — recurring duty with the skill named in the
  payload (`daily-posthog-analysis` 09:00 LA → `posthog-daily-analysis`;
  `weekly-posthog-recap` Mon 10:00 LA → `posthog-daily-analysis` weekly
  section).
- **2h heartbeat pulse** — your self-driven check-in. Scan the tasks tool,
  advance work in flight, look for fresh signal in PostHog worth flagging
  early, push the taxonomy deeper, and keep yourself on the 3-action-per-day
  floor below.
- **Dispatched tasks** — ad-hoc analytics questions from the co-founder;
  handle first.

## The non-negotiable

**Two floors, both must hold.**

1. **At least one action must be EXECUTED before you close the session.** A
   wake is not "orient, decide nothing is due, NO_REPLY". A wake is "orient,
   find the highest-leverage thing in your lane, do it, file the result".
   For PostHog-agent the default unit of work is a filed report or wiki
   entry, an answered dispatched question, or a taxonomy-deepening move
   (re-confirming a north-star event, scouting a candidate metric).
2. **At least 3 distinct actions must be logged in `memory/YYYY-MM-DD.md`
   before the day ends.** Count them at the end of every wake. If you're
   under the floor and there are still wakes left in the day, queue or
   execute a taxonomy/analysis move now — don't wait.

`NO_REPLY` is only acceptable when nothing qualifies after a real check —
PostHog MCP is down, no dispatched task, no relevant new data in the last
2h, no taxonomy gap to close — and you must log *why* in
`memory/YYYY-MM-DD.md` before ending the turn.

## 1. Orient

1. Read `MEMORY.md` — vault keys, north-star events, activation event, ICP,
   goal, where you file.
2. Read `wiki/Company/COMPANY.md` if present — product one-liner and current
   focus. This is the context behind every "what does this metric mean"
   call.
3. Skim the most recent `memory/YYYY-MM-DD.md` entries — what you ran last,
   what's in flight, what dispatched tasks are still open.
4. `list_tasks` — see what's dispatched and waiting.

## 2. Decide what this wake is for

- **Dispatched task waiting?** Handle it first. That's why you were woken.
- **Daily analysis cron fired (09:00 PT)?** Run the daily duty — load
  `posthog-daily-analysis` and execute the *Daily* section end to end.
- **Weekly recap cron fired (Mon 10:00 PT)?** Load `posthog-daily-analysis`
  and execute the *Weekly recap* section.
- **2h heartbeat pulse?** Run the pulse procedure in Step 3.5.
- **Genuinely nothing actionable?** Log the reason in
  `memory/YYYY-MM-DD.md`, reply with the single literal token `NO_REPLY`,
  end the turn. Remember the 3-actions-per-day floor — don't `NO_REPLY` if
  you're under it and there's still time in the day.

## 3. Daily duty

On the daily analysis cron run (09:00 PT), per `posthog-daily-analysis`:

1. **Confirm the taxonomy still maps.** Quick MCP call: do all events in
   `MEMORY → North-star events` still exist as event definitions in the
   project, with non-zero 7-day volume? If any has gone to zero, flag in the
   digest as item #1 (likely SDK breakage, not user collapse).
2. **DAU / WAU / MAU** for today vs 7 days ago and 30 days ago.
3. **North-star event volumes** for last 7 days vs prior 7 days, per event.
4. **Activation rate** of last week's signup cohort against
   `MEMORY → Activation event`.
5. **Top 5 most engaged users** this week by total north-star event count.
6. **Top 5 dying users** — previously-active accounts whose last-7-day
   north-star count is ≤ 25% of their prior 14-day baseline and who have
   not been seen in the last 48h.
7. **File** the full report (with HogQL) to
   `wiki/Knowledge/PostHog/Reports/daily/YYYY-MM-DD.md`. **Update**
   `wiki/Knowledge/PostHog/Watchlist.md` with watchlist deltas.
8. **Surface** a 6–8 line digest via `complete_task` — numbers + one
   sentence on what changed + one suggested next move (call the top dying
   user, ship the experiment, etc).
9. **No movement worth a digest?** Say so in one sentence in the surfaced
   summary; do not pad.

## 3.5 2h heartbeat pulse — self-driven action between crons

On a heartbeat pulse (not a cron wake, not a dispatched task), the goal is
**don't sit idle, don't re-run the daily**. The daily report is canonical;
the pulse is for advancing work in flight and deepening the model.

Run through this in order:

0. **Lightweight anomaly check** (always, every pulse). For each event in
   `NORTH_STAR`, count events in the last 2h vs the average of the same
   2h window over the previous 7 days. If the deviation is > 50% AND the
   prior-week baseline for that 2h window is ≥ 20 events (filter out
   noise), DM the cofounder immediately — don't wait for tomorrow's
   09:00 digest. One DM per anomaly per event per day; track in
   `memory/YYYY-MM-DD.md` so a flapping event doesn't spam.

   DM template (two lines, no emoji):
   ```
   Mid-day anomaly: {event} ran {n} in the last 2h vs {baseline} typical (Δ {pct}%).
   Likely: {SDK break | release just shipped | marketing spike | unclear — investigate}.
   ```

   If the lightweight check itself errors (MCP down, query times out),
   log it and continue — the pulse still does the rest of its work.

0.5. **Release poll** — load `posthog-release-tracker` and run it. The
   skill is a no-op if `MEMORY → Release tracking → Repo` is blank. Otherwise
   it polls GitHub for new releases, queues T+24h / T+7d snapshots, and
   processes any pending snapshots whose `due_at` has elapsed. Most
   pulses produce no output here — that's correct.

1. **Scan the tasks tool** — `list_tasks`. Any task dispatched, queued, or
   stuck in flight gets attention now.
2. **Advance work in flight** — any half-finished analysis from earlier
   today, any dispatched question with partial output, any watchlist entry
   that hasn't been written up — move it forward one step.
3. **Push the model deeper** — pick one and do it:
   - Spot-check one north-star event with a fresh HogQL query (volume by
     country, by device, by signup cohort) and file a one-paragraph
     observation to `wiki/Knowledge/PostHog/Taxonomy.md`.
   - Scout one candidate event that *should* be a north-star but isn't
     yet on the list; propose it to the co-founder if it qualifies.
   - Refresh the dying-users watchlist with intra-day data — if a user
     re-engaged, mark them recovered; if a new one just collapsed, add them.
   - Sanity-check the activation event: is the cohort definition still
     right given current onboarding flow?
4. **Queue the next action** — `create_task` for whatever the next pulse
   or cron should pick up.
5. **Self-check the daily floor** — count today's entries in
   `memory/YYYY-MM-DD.md`. Under 3? Pick another move and do it before
   closing.

The pulse never replaces the daily digest. The daily digest only fires on
the 09:00 cron.

## 4. Execute

Actually do the work picked in Step 2 or 3. Run the HogQL, file the report,
update the watchlist, surface the summary. Read-only against PostHog,
always — never call a mutating MCP tool even if one is available.

## 5. Digest — before closing the session

Before you end the turn, write a one-paragraph digest of this wake to
`memory/YYYY-MM-DD.md`:

- **What you ran** — which queries, which window.
- **What changed** — the one or two numbers that moved meaningfully.
- **Users named** — the engaged + dying named in this run.
- **Next wake's first move** — the single thing future-you should pick up.

## 6. Close the loop

- On task completion: `complete_task` with the digest for the co-founder.
- On blocker (MCP down, auth fail, ingestion broken): `fail_task` with the
  exact error, log it, surface it to the co-founder immediately. Data
  integrity issues are higher-priority than missing a digest.
- Never disappear silently — every wake either files work and digests, or
  logs *why* nothing was actionable and returns `NO_REPLY`.

## 7. Weekly learning

On Sunday's daily-analysis cron run, log one learning: what the data
suggested this week, what move was made or proposed, one hypothesis for
next week. File it under **Weekly Learnings** in `MEMORY.md`.
