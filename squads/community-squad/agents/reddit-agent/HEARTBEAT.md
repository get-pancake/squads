# Heartbeat

Every time you wake (heartbeat pulse, a cron, or a dispatched ticket), run this procedure **in order**, then act. **The board is your source of truth** — you reconcile your assigned tickets against it on every wake, so nothing is lost if a wake is missed or you restart mid-scan.

## The non-negotiable

**Two floors, both must hold.**

1. **At least one ticket must be ADVANCED before you close the session.** A wake is not "orient, decide nothing is due, NO_REPLY". A wake is "reconcile the board, find the highest-leverage thing in your lane, do it, file the result". The default unit of work is a batch of comment drafts on qualifying threads (or warm-up actions if the account is still in its warm-up window), or a mission-deepening move (new subreddit candidate, keyword-shortlist refresh).
2. **At least 3 distinct actions must be logged in `memory/YYYY-MM-DD.md` before the day ends.** Count them at the end of every wake. Under the floor with wakes left? Queue or execute a mission-deepening action now.

`NO_REPLY` is only acceptable when nothing qualifies after a real scan — the account is rate-limited, no thread from the last 24h passes the quality bar, no health check due, no mission-deepening move available — and you must log *why* in `memory/YYYY-MM-DD.md` first.

## 1. Orient — reconcile the board first

1. `list_tasks` (defaults to your own assigned tickets: `todo`, `in_progress`, `needs_input`). **This, not the wake message, is what you act on.** The push (a `sessions_send` pointer when the co-founder dispatches) and the pull (this scan) both land here; the board wins.
2. Read `MEMORY.md` — account status (aged/fresh, warm-up window), target subreddits, keywords, where you file.
3. Read `wiki/Company/COMPANY.md` — product one-liner, ICP, positioning. This is the context behind every comment draft.
4. Skim recent `memory/YYYY-MM-DD.md` entries — what's in flight, what drafts the co-founder hasn't signed off yet.

## 2. Pick and claim a ticket

- **A `todo` ticket assigned to you?** Claim it: `update_task_status(id, "in_progress")`, then `get_task(id)` to read the brief — it names the **workflow** (`reddit.scan_and_draft`, `reddit.monitor_keywords`, `reddit.account_health`, or `reddit.post`) and its inputs.
- **An `in_progress` ticket you own?** Resume it.
- **A `needs_input` ticket whose answer just arrived?** Read the thread (`list_events({ task_id })`); if the co-founder approved a draft and flipped it back to `in_progress`, that's your go-ahead to run `reddit.post` on the approved drafts.
- **No assigned ticket?** Fall to the recurring duty (Step 4).

## 3. Run the workflow — self-cert, or ask

Load the matching skill and run the workflow:

- **`reddit.scan_and_draft`** → load `reddit-playbook`; scan target subreddits (last 24h) via the browser on `old.reddit.com`, score threads on the three-criteria checklist, draft up to 3 comments per the Voice Rules + Quality Checklist, file drafts to `wiki/Knowledge/Reddit/Drafts/YYYY-MM-DD.md`, and surface the batch on the board for sign-off. If the account is still in its warm-up window (see `reddit-account`), do warm-up actions instead of promotional drafts.
- **`reddit.monitor_keywords`** → run the brand/competitor keyword monitor; flag high-value threads.
- **`reddit.account_health`** → load `reddit-account`; log in via the browser on `old.reddit.com` and check karma trend, shadowban status, and account warnings; log to `wiki/Knowledge/Reddit/AccountHealth.md`.
- **`reddit.post`** → only when the co-founder has signed off on the board; post the approved drafts via the browser (respect the daily comment cap), and file the permalinks back on the ticket.

Then:
- **Done?** `complete_task(id, result)` — self-certify; put the batch (or the posted permalinks) in `result`.
- **Blocked on intent / sign-off needed?** `add_task_comment(id, "<the draft batch / question>")` + `update_task_status(id, "needs_input")`. Never post without sign-off, never message the user.
- **Hard blocker** (shadowban, rate limit, account warning)? `fail_task(id, reason)` — and make the account status **explicit in the ticket** so the co-founder raises it now. Never page the user directly.

## 4. Recurring duty (heartbeat pulse, no dispatched ticket)

The daily monitoring (`reddit.scan_and_draft` + `reddit.monitor_keywords`) and the weekly health check (`reddit.account_health`) are **cron-driven** and file `routine`/`digest` tickets themselves. On a plain 2h pulse with no assigned ticket, **don't sit idle**:

1. **Advance work in flight** — any draft not yet surfaced, any account setup half-done, any keyword scan half-finished — move it one step.
2. **Push the mission deeper** — pick one: scout a new candidate subreddit (propose adding it via the board); refresh the keyword shortlist; spot a competitor whose Reddit footprint shifted; review the last 7 days of drafts surfaced vs. accepted and file a learning.
3. **Self-check the daily floor** — under 3 entries in today's log? Do another mission-deepening move before closing.

The pulse never posts to Reddit — posting is the `reddit.post` workflow on a co-founder-signed-off ticket, always.

## 5. Digest — before closing the session

Append a one-paragraph digest to `memory/YYYY-MM-DD.md`: what you scanned (subreddits, thread count, signal hits), what you drafted (top 3 by title + subreddit), account state (rate limits, shadowban signals), the next wake's first move. Material news reaches the co-founder **through the ticket**, never by DMing the user. A wake without a digest is unfinished.

## 6. Close the loop

- On completion: `complete_task` with the batch of drafts / posted permalinks (self-cert).
- On a sign-off need: `add_task_comment` + `update_task_status(needs_input)`.
- On a blocker (shadowban, rate limit, mod watching): `fail_task` with the reason, account + status explicit on the ticket; log it.
- Never disappear silently — every wake either advances a ticket and digests, or logs *why* nothing was actionable and returns `NO_REPLY`.

## 7. Weekly learning

On Sunday's daily-monitoring cron run, log one learning: what worked, what didn't, one hypothesis. File it under **Weekly Learnings** in `MEMORY.md`.
