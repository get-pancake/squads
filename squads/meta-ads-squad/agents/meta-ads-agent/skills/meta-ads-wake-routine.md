---
name: meta-ads-wake-routine
description: The meta-ads-agent's end-to-end wake procedure — orient, load skills, run the operations sweep / daily digest / weekly review, resolve approvals, digest, and close the loop. Load this at the start of every cron wake or dispatched task; the cron payloads reference its numbered sections.
---

# Wake procedure

Every time you wake, run this procedure **in order**, then act. Wakes come from four sources:

- **Daily operations cron** in `crons/jobs.json` — `meta-ads-daily-operations` fires once each day at 09:00 account-local. Runs the optimization sweep.
- **Daily digest cron** — `meta-ads-daily-digest` fires once each day at 17:00 account-local. Composes the digest from today's audit log + approval queue and returns it to the co-founder.
- **Weekly review cron** — `meta-ads-weekly-review` fires Monday 08:00 account-local. Runs the weekly cadence; on the first Monday of a month folds in the monthly audits; on the first Monday of a quarter adds the quarterly audits on top.
- **Dispatched tasks** — ad-hoc work from the co-founder (e.g. `approve <id>` / `skip <id>` from the user, an investigation request). Handle first when one is waiting.

There is no heartbeat pulse. The agent wakes only on the three crons above or on a dispatched task. (OpenClaw's per-agent heartbeat does not fire for squad sub-agents, so all scheduled wakes are crons in `crons/jobs.json`.)

## The non-negotiable

**At least one action must be EXECUTED before you close the session.** A wake is not "orient, decide nothing is due, NO_REPLY". A wake is "orient, find the highest-leverage thing in your lane, do it, file the result."

`NO_REPLY` is acceptable only when (a) every dispatched task is blocked, AND (b) the wake's specific duty produced nothing meaningful — the operations sweep found zero flags and wrote the `all systems normal` line, OR the digest cron found yesterday flat with zero spend / zero actions / zero pending approvals. You must log *why* in `memory/YYYY-MM-DD.md` before ending the turn.

## 1. Orient

1. Read `MEMORY.md` — your settings (account ID, primary KPI + target, business model, maturity, flag thresholds, naming conventions), the **Mode** (autonomous vs recommendation-only), the **Approval queue**, vault keys, and where you file outputs.
2. Skim the most recent `memory/YYYY-MM-DD.md` entries — what's in flight, what's blocked, what's queued for approval, what shipped since last wake.
3. `list_tasks` — see what's dispatched and waiting.
4. Confirm the Meta MCP is reachable: a single read call (e.g. `me`-style or list-campaigns with limit 1). If the call fails, do **not** silently proceed — log the failure to `memory/YYYY-MM-DD.md`, `fail_task` (or `update_task`) any in-flight task with the reason, escalate to the co-founder, end the turn.

## 2. Load skills

Always load:

- `pancake-meta-ads-01-account-foundations` (settings the rest of the playbooks read).
- `pancake-meta-ads-10-root-cause-analysis` (the diagnostic framework — every sweep starts here).
- `pancake-meta-ads-13-operational-routines` (the action playbooks).

Add per-branch as the diagnostic surfaces them:

- Budget or bid issue → `pancake-meta-ads-03-budget-and-bid-controls`.
- Creative fatigue or refresh → `pancake-meta-ads-04-ad-asset-handbook`.
- Audience saturation or overlap → `pancake-meta-ads-05-people-targeting`.
- Placement-tier action → `pancake-meta-ads-06-placement-rotation`.
- Advantage+ / catalog issue → `pancake-meta-ads-07-advantage-plus-and-catalog`.
- Measurement / attribution issue → `pancake-meta-ads-08-attribution-and-tracking`.
- Compliance / policy / restricted content → `pancake-meta-ads-09-policy-and-privacy`.
- Automated-rule review → `pancake-meta-ads-11-guardian-rules`.
- Weekly / monthly / quarterly review → `pancake-meta-ads-12-review-cadence`.

The digest cron doesn't need the methodology skills — only the always-on set is required for it, plus a read of the audit log and headline metrics.

## 3. Decide what this wake is for

- **Dispatched task waiting?** Handle it first. That's why you were woken.
- **Daily-operations cron fired?** Run the operations sweep in Step 4.
- **Daily-digest cron fired?** Run the digest in Step 5.
- **Weekly-review cron fired?** Run the review in Step 6. Branch on the calendar to fold in monthly / quarterly.

## 4. Operations sweep (09:00 cron)

1. Pull the last 24h of account performance via the Meta MCP — campaigns, ad sets, ads, with spend, impressions, clicks, conversions, CPA, ROAS, frequency, hook rate, hold rate, CTR. Compare to the rolling 7-day baseline.
2. Run the eight-branch root-cause framework (`pancake-meta-ads-10`) over every entity flagged by the thresholds in `MEMORY.md → Flag thresholds`. For each finding, identify the playbook action from `pancake-meta-ads-13`.
3. **Classify each action** against the autonomy model in `SOUL.md → Autonomy Model`:
   - **Autonomous-allowed** (pause, reduce budget, lower Cost Cap, consolidate within envelope, switch bid strategy without raising ceiling, tighten audience, refresh customer list, activate prepared creative, create Custom Conversion): **execute now** via the Meta MCP. Capture the before-state from the API response, run the mutation, capture the after-state, append an entry to `wiki/Knowledge/MetaAds/AuditLog/YYYY-MM-DD.md` (timestamp, entity, before, action, after, trigger).
   - **Budget-commitment** (raise budget / Cost Cap / Bid Cap, lower Minimum ROAS floor, launch new entity, re-allocate growing total spend): **queue, do not execute**. Generate a unique id (e.g. `BUD-YYYYMMDD-NN`), append to `MEMORY.md → Approval queue` with rationale + expected impact + entity reference, surface in the next digest.
4. If `MEMORY.md → Mode` is `recommendation-only`, override step 3: execute nothing, queue *everything* (autonomous-allowed actions too) in the approval queue.
5. Self-audit at end of sweep: count entries written to today's audit log + approval queue. If both are empty AND no flags fired, write a one-line `all systems normal` entry to today's audit log so the 17:00 digest cron has something to read.

## 5. Daily digest (17:00 cron)

1. Read today's `wiki/Knowledge/MetaAds/AuditLog/YYYY-MM-DD.md` and the current `MEMORY.md → Approval queue`.
2. Pull yesterday's headline metrics (blended CPA, blended ROAS, spend, conversions) and the 7-day trend.
3. Compose the digest in the structure below. File the full digest to `wiki/Knowledge/MetaAds/Digests/YYYY-MM-DD.md`. Return the same digest body to the co-founder via `complete_task` for relay to the user on whatever channel the pod uses.
4. If yesterday produced zero spend, zero actions, no approvals waiting, and metrics are flat: reply with the single literal token `NO_REPLY` and log the reason in `memory/YYYY-MM-DD.md`. Never post a no-news digest.

**Digest structure:**

```
Meta Ads — Daily Digest — YYYY-MM-DD
Account: <name> · Maturity: <stage> · Currency: <code> · Mode: <autonomous|recommendation-only>

Yesterday's headline
- Blended CPA: $X (target $Y) · trend ↑/↓/flat vs prior 7d
- Blended ROAS: X.Xx (target Y.Yx) · trend
- Spend: $X of $Y daily budget
- Conversions: N

What worked (top 3)
1. <Brief: ad/campaign + metric + delta>
2. ...

What didn't (top 3)
1. <Brief: ad/campaign + metric + delta>
2. ...

Autonomous actions taken (last 24h)
- <Action, what it affected, why>
- ...
(Full log: wiki/Knowledge/MetaAds/AuditLog/YYYY-MM-DD.md)

Awaiting your approval
- [<id>] <Budget-increase request with rationale and expected impact>
- ...
(Reply 'approve <id>' or 'skip <id>' to resolve)

Today's single focus
<One sentence — the most important thing the user should think about>

Status
<All systems normal | One issue flagged | Kill switch active — recommendation-only mode>
```

## 6. Weekly review (Monday 08:00 cron)

Always run the weekly cadence per `pancake-meta-ads-12-review-cadence`:

- Pipeline of the past 7 days: spend pacing, KPI trend, creative refresh signals, audit log throughput.
- Weekly creative analysis: which ads gained share, which fatigued. File creative briefs for any unit due for refresh.
- Sweep automated rules per `pancake-meta-ads-11-guardian-rules` — confirm coverage holds.

**First Monday of a month** — fold in monthly audits:
- Audience audit (`pancake-meta-ads-05-people-targeting` + routines from `13`).
- Structure audit (`pancake-meta-ads-02-campaign-architecture`).
- Measurement audit (`pancake-meta-ads-08-attribution-and-tracking`).
- Budget allocation review (`pancake-meta-ads-03-budget-and-bid-controls`).

**First Monday of a quarter** — add quarterly audits on top:
- Compliance audit (`pancake-meta-ads-09-policy-and-privacy`).
- Account maturity reassessment (`pancake-meta-ads-01-account-foundations`) — if maturity has changed, update `team.account_maturity_level` in the vault via `vault_request` and note in `MEMORY.md`.

Write the weekly / monthly / quarterly report to `wiki/Knowledge/MetaAds/Reports/<cadence>/YYYY-MM-DD.md`. Return a one-paragraph summary to the co-founder via `complete_task`.

## 7. Resolve approvals (dispatched-task wake)

If the co-founder dispatched an `approve <id>` or `skip <id>` task:

- `approve` → execute the queued action via the Meta MCP, log to audit log with `trigger: user-approved`, remove from `MEMORY.md → Approval queue`.
- `skip` → log to `memory/YYYY-MM-DD.md` with the reason if supplied, remove from `MEMORY.md → Approval queue`.

## 8. Execute

Actually do the work picked above. Don't just plan — call the Meta MCP, mutate the entity, capture before/after, write the audit-log row. Output > deliberation.

## 9. Digest — before closing the session

Before you end the turn, append a one-paragraph internal digest of this wake to `memory/YYYY-MM-DD.md`:

- **What you did** — the sweeps, actions, queued approvals, briefs.
- **What changed** — entities mutated, metrics that moved, drafts shipped.
- **What's still open** — approvals waiting, briefs in draft, blockers.
- **Next wake's first move** — the single thing future-you should pick up.

This is the per-session memo, distinct from the user-facing daily digest in Step 5. Surface to the co-founder only when there is material news beyond the cron's own digest.

## 10. Close the loop

- On task completion: `complete_task` with the outcome + pointer into `wiki/Knowledge/MetaAds/`.
- On blocker: `fail_task` / `update_task` with the reason, log it, surface it.
- **Plan two steps ahead.** Before closing, queue the next task via `create_task` if anything obvious is coming.

## 11. Weekly learning

On the weekly-review cron (Mondays), log one learning under **Weekly Learnings** in `MEMORY.md`: what worked, what didn't, one hypothesis.
