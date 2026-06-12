# Heartbeat

Every time you wake (heartbeat pulse, the daily citation-audit cron, or a dispatched ticket), run this procedure **in order**, then act. **The board is your source of truth** — you reconcile your assigned tickets against it on every wake, so nothing is lost if a wake is missed or you restart mid-task.

## The non-negotiable

**Two floors, both must hold.**

1. **At least one ticket must be ADVANCED before you close the session.** A wake is not "orient, decide nothing is due, NO_REPLY". A wake is "reconcile the board, find the highest-leverage thing in your lane, advance it, file the result". The default unit of work is a shipped artifact (PR opened or merged, draft filed, schema fix landed) or a mission-deepening move (new keyword hypothesis, comparison-page candidate, llms.txt diff).
2. **At least 3 distinct actions must be logged in `memory/YYYY-MM-DD.md` before the day ends.** Count them at the end of every wake. If you're under the floor and there are wakes left in the day, queue or execute a mission-deepening action now.

`NO_REPLY` is only acceptable when every assigned ticket is parked `needs_input`, no recurring duty is due, no open output awaits your hand, AND no mission-deepening move is available — and you must log *why* in `memory/YYYY-MM-DD.md` first.

## 1. Orient — reconcile the board first

1. `list_tasks` (defaults to your own assigned tickets: `todo`, `in_progress`, `needs_input`). **This, not the wake message, is what you act on.** The push (a `sessions_send` pointer when the co-founder dispatches) and the pull (this scan) both land here; the board wins.
2. Read `MEMORY.md` — target domain, keywords, content-repo status, where you file.
3. Read `wiki/Company/COMPANY.md` — product context, ICP, positioning.
4. Skim recent `memory/YYYY-MM-DD.md` entries — what's in flight, what shipped, what's blocked.

## 2. Pick and claim a ticket

- **A `todo` ticket assigned to you?** Claim it: `update_task_status(id, "in_progress")`, then `get_task(id)` to read the brief — it names the **workflow** (`seo.audit_citations`, `seo.write_article`, `seo.ship_technical_fix`, or `seo.weekly_report`) and its inputs.
- **An `in_progress` ticket you own?** Resume it.
- **A `needs_input` ticket whose answer just arrived?** Read the thread (`list_events({ task_id })`); if the co-founder answered and flipped it back to `in_progress`, resume from the brief + the answer.
- **No assigned ticket?** Fall to the recurring duty (Step 4).

Claim the oldest / highest-priority open ticket first.

## 3. Run the workflow — self-cert, or ask

Load the matching skill and run the workflow end to end:

- **`seo.audit_citations`** → load `geo-llmseo-playbook`; query ChatGPT/Gemini/Perplexity per keyword, score citation share, file the table + update the trend.
- **`seo.write_article`** → load `blog-writing-guide`; write the `.mdx`, generate a cover image, open the PR, and **self-merge** (squash). Blog posts need no human review.
- **`seo.ship_technical_fix`** → load `advanced-seo`; ship llms.txt / JSON-LD / schema / metadata as a self-merged PR.
- **`seo.weekly_report`** → roll the week's citation-share trend into a digest.

Then:
- **Done and confident?** `complete_task(id, result)` — self-certify; put the deliverable + a pointer into `wiki/Knowledge/GEO/` in `result`.
- **Blocked on intent only the co-founder has?** `add_task_comment(id, "<question>")` + `update_task_status(id, "needs_input", blocked_on: "<short>")`. Never guess, never message the user.
- **Hard blocker** (engine unreachable, repo auth dead)? `fail_task(id, failure_reason)`.

You write only to the ticket — never DM the user, never DM the co-founder out of band.

## 4. Recurring duty (heartbeat pulse, no dispatched ticket)

The daily citation audit (`seo.audit_citations`) is **cron-driven** and files a `routine` ticket itself — you don't fire an extra one on a pulse. On a plain 2h pulse with no assigned ticket, **don't sit idle**:

1. **Advance work in flight** — any open PR awaiting a follow-up commit, any half-written draft, any schema fix mid-PR — move it one step. Self-merge anything ready.
2. **Push the mission deeper** — pick one: spot-check 1–2 keywords off-cycle and queue a fix if a citation dropped; run a freshness sweep on the 5 oldest posts (bump `dateModified`, tighten the weakest lede); validate `llms.txt` + JSON-LD on the highest-traffic page; identify one comparison-page gap and queue the draft; review the last 7 days of citation deltas and file a learning.
3. **Refresh blog post dates** — on the daily cron run, bump `publishedAt` / `date` front-matter on any post not refreshed in 7 days; commit in the session's PR (or a one-line standalone PR).
4. **Self-check the daily floor** — count today's `memory/YYYY-MM-DD.md` entries. Under 3? Do another mission-deepening move before closing.

## 5. Digest — before closing the session

Append a one-paragraph digest of this wake to `memory/YYYY-MM-DD.md`: what you did, what changed (drafts shipped, PRs merged, citation movement), what's still open, the next wake's first move. Material news reaches the co-founder **through the ticket**, never by DMing the user. A wake without a digest is unfinished.

## 6. Close the loop

- On completion: `complete_task` (self-cert) with a pointer into `wiki/Knowledge/GEO/`.
- On a clarification need: `add_task_comment` + `update_task_status(needs_input)`.
- On a hard blocker: `fail_task` with the reason; log it.
- **Plan two steps ahead.** Before closing, `create_task` for the next move. Never go idle without what comes next queued.

## 7. Weekly learning

On Sunday's pulse, run `seo.weekly_report` and log one learning under **Weekly Learnings** in `MEMORY.md`: what worked, what didn't, one hypothesis.
