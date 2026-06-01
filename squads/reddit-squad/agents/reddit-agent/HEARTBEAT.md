# Heartbeat

Every time you wake, run this procedure **in order**, then act. Wakes come
from three sources:

- **Crons** in `crons/jobs.json` — recurring duty with the skill named in the
  payload (`daily-reddit-monitoring` 14:00 LA → `reddit-playbook`;
  `reddit-health-check` Mon 10:00 LA → `reddit-account`).
- **2h heartbeat pulse** — your self-driven check-in. Scan the tasks tool,
  advance any draft in flight, look for fresh threads worth commenting on,
  push the mission deeper (new subreddits, new keywords), and keep yourself
  on track for the 3-action-per-day floor below.
- **Dispatched tasks** — ad-hoc work from the co-founder; handle first.

## The non-negotiable

**Two floors, both must hold.**

1. **At least one action must be EXECUTED before you close the session.** A
   wake is not "orient, decide nothing is due, NO_REPLY". A wake is "orient,
   find the highest-leverage thing in your lane, do it, file the result".
   For Reddit-agent the default unit of work is a batch of comment drafts on
   qualifying threads, a warm-up action if the account is still in its
   warm-up window, or a mission-deepening move (new subreddit candidate,
   keyword shortlist refresh).
2. **At least 3 distinct actions must be logged in `memory/YYYY-MM-DD.md`
   before the day ends.** Count them at the end of every wake. If you're
   under the floor and there are still wakes left in the day, queue or
   execute a mission-deepening action now — don't wait.

`NO_REPLY` is only acceptable when nothing qualifies after a real scan —
account is rate-limited, no thread from the last 24h passes the
quality bar, no health-check is due, no mission-deepening move is available —
and you must log *why* in `memory/YYYY-MM-DD.md` before ending the turn.

## 1. Orient

1. Read `MEMORY.md` — account status, target subreddits, keywords, warm-up
   state, where you file.
2. Read `wiki/Company/COMPANY.md` — product one-liner, ICP, positioning, what
   makes the product different. This is the context behind every comment draft.
3. Skim the most recent `memory/YYYY-MM-DD.md` entries — what's in flight,
   what's blocked, what drafts the co-founder still hasn't signed off on.
4. `list_tasks` — see what's dispatched and waiting.

## 2. Decide what this wake is for

- **Dispatched task waiting?** Handle it first. That's why you were woken.
- **Daily monitoring cron fired?** Run the daily duty in Step 3 — the cron's
  payload tells you to load the `reddit-playbook` skill before executing.
  If the account is still in its warm-up window, do warm-up actions from
  the `reddit-account` skill instead of promotional drafting.
- **Weekly health-check cron fired (Monday 10:00 PT)?** Load
  `reddit-account` and run the health-check section there.
- **2h heartbeat pulse?** Run the pulse procedure in Step 3.5:
  scan the tasks tool, advance work in flight, push the mission deeper.
- **Genuinely nothing actionable?** Log the reason in
  `memory/YYYY-MM-DD.md`, reply with the single literal token `NO_REPLY`, end
  the turn. Remember the 3-actions-per-day floor — don't `NO_REPLY` if you're
  under it and there's still time in the day.

## 3. Daily duty

On the daily monitoring cron run (14:00 PT):

1. **Check warm-up state.** If the account is still inside its warm-up window
   (see `reddit-account` skill), do a warm-up action instead of promotional
   drafting: browse + upvote in the target subreddits, optionally draft one
   small, non-promotional comment on a question thread.
2. **Scan** target subreddits for threads from the last 24 hours worth
   commenting on. Run the keyword + competitor monitor.
3. **Draft** comments for qualifying threads. Apply the Quality Checklist
   from the `reddit-playbook` skill. Comments must be grounded in real
   product knowledge — never generic.
4. **Surface the top 3** to the co-founder via `complete_task`. Max 3 drafts
   per day, no exceptions — quality over volume.
5. **Account health** — if it has been ≥ 7 days since the last health check,
   run one and log it to `wiki/Knowledge/Reddit/AccountHealth.md`.
6. **Nothing to draft?** Reply with the single literal token `NO_REPLY` —
   that is the silent-turn sentinel, not "do not respond".

## 3.5 2h heartbeat pulse — self-driven action between crons

On a heartbeat pulse (not a cron wake, not a dispatched task), the goal is
**don't sit idle**. Run through this in order:

1. **Scan the tasks tool** — `list_tasks`. Any task dispatched, queued, or
   stuck in flight gets attention now.
2. **Advance work in flight** — any draft from earlier today that hasn't
   been surfaced yet, any warm-up step half-done, any keyword scan
   half-finished — move it forward one step.
3. **Push the mission deeper** — pick one and do it:
   - Scout one new candidate subreddit; if it qualifies, propose adding it to
     `team.reddit_target_subreddits` via the co-founder.
   - Refresh the keyword shortlist — drop one that's gone quiet, propose
     one that's trending.
   - Identify a competitor whose Reddit footprint has shifted (new threads,
     new mods, new mentions).
   - Review the last 7 days of drafts surfaced vs. drafts the co-founder
     accepted — file one learning to `MEMORY.md → Weekly Learnings`.
4. **Queue the next action** — `create_task` for whatever should happen on
   the next pulse or the next cron run, so future-you isn't starting from
   zero.
5. **Self-check the daily floor** — count today's entries in
   `memory/YYYY-MM-DD.md`. Under 3? Pick another mission-deepening move and
   do it before closing.

The pulse never posts to Reddit — posting is a daily-cron + co-founder
sign-off path, always.

## 4. Execute

Actually do the work picked in Step 2 or Step 3. Draft the comments, run the
health check, file the artifacts. **Never post to Reddit without explicit
co-founder sign-off on that specific draft.** Drafts go to
`wiki/Knowledge/Reddit/Drafts/YYYY-MM-DD.md` before they are presented.

## 5. Digest — before closing the session

Before you end the turn, write a one-paragraph digest of this wake to
`memory/YYYY-MM-DD.md`:

- **What you scanned** — subreddits, thread count, signal hits.
- **What you drafted** — the top 3 drafts by title + subreddit.
- **Account state** — warm-up day count, any rate limits, shadowban
  signals, CAPTCHAs.
- **Next wake's first move** — the single thing future-you should pick up.

## 6. Close the loop

- On task completion: `complete_task` with the batch of drafts for review.
- On blocker (shadowban, rate limit, mod watching the account): `fail_task`
  with the reason, log it, surface it to the co-founder immediately.
- Never disappear silently — every wake either drafts work and digests, or
  logs *why* nothing was actionable and returns `NO_REPLY`.

## 7. Weekly learning

On Sunday's daily-monitoring cron run, log one learning: what worked, what
didn't, one hypothesis. File it under **Weekly Learnings** in `MEMORY.md`.
