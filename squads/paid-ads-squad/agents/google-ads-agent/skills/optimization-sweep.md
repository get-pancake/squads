---
name: optimization-sweep
description: The procedure for one end-to-end optimization run against the configured Google Ads account. Load on every `morning-optimization` and `afternoon-optimization` cron wake — and on any dispatched task asking for "a sweep" or "an optimization run". Routes through the orchestrator, picks the right inspect/evaluate/diagnose skills based on what changed, ships every reversible fix, and queues follow-ups.
---

# Optimization sweep

## When to use this

The `daily-optimization` cron (17:00 PT) loads this skill once a day. Also load it when the co-founder dispatches a task whose brief boils down to "run a sweep" / "do an optimization pass" / "check what's changed and fix it".

## The procedure

1. **Calibrate.** Load `pancake_account_foundations` and `pancake_orchestrator` first — they read the account settings, KPI target, brand terms, universal negatives, and maturity stage out of `MEMORY.md` and the toolkit config. Without them, every downstream skill produces noise.

2. **Pull the performance read.** Use `pancake_orchestrator`'s per-account performance read — GAQL queries against the configured customer (and login_customer_id if present), period-over-period KPI deltas, campaign breakdowns, four-week directional trends. The read describes *what* changed; it does not yet decide *why*.

3. **Diff against the last sweep.** Open the most recent `memory/YYYY-MM-DD.md` entries to find the last sweep's snapshot. Compute deltas in: account KPI vs target, top-mover campaigns, new search-term anomalies, settings drift, bid-strategy learning-state changes. **If nothing material has shifted since the last sweep and no follow-up is due, log the reason and reply with `NO_REPLY`.**

4. **Route to the right skills.** Use the orchestrator's routing logic — it picks which of the inspect/evaluate/diagnose skills to load based on what changed:
   - Search-term anomalies → `pancake_query_intelligence`.
   - Bid-strategy learning-state or efficiency drift → `pancake_inspect_bidding` + `pancake_bidding_playbook`.
   - Settings or privacy drift → `pancake_inspect_settings` + `pancake_settings_playbook`.
   - PMax movement → `pancake_pmax_workshop`.
   - Shopping movement → `pancake_evaluate_shopping` + `pancake_shopping_playbook`.
   - Demand Gen movement → `pancake_evaluate_demandgen` + `pancake_demandgen_playbook`.
   - YouTube movement → `pancake_evaluate_youtube` + `pancake_youtube_playbook`.
   - Local/LSA movement → `pancake_inspect_local` + `pancake_local_playbook`.
   - Cross-campaign budget signal → `pancake_budget_engine`.
   - Creative fatigue or landing-page mismatch → `pancake_creative_atelier`.
   - Big anomalous KPI swing with no obvious driver → `pancake_root_cause_lab`.
   Do **not** load skills the data doesn't justify. Running everything is the failure mode.

5. **Ship reversible fixes immediately.** Every recommendation the loaded skills emit that falls under the agent's autonomy (negatives, keyword pauses, bid adjustments inside the strategy, creative pauses, asset rotations, audience adds/excludes, settings corrections, cross-campaign budget reallocation within the existing total) — execute it. Log each action to `memory/YYYY-MM-DD.md` with a one-line reason that ties back to the KPI target.

6. **Queue what you can't ship.** Anything outside the autonomy contract — budget increase, new campaign type, launching an A/B test, cross-channel work — hand off via `create_task` **assigned to the co-founder** with rationale, projected impact, and a recommended action. The co-founder's queue is how the user-facing decision surfaces; do not post externally and do not raise budget unilaterally. Title format: `Approve budget raise — <campaign>` (or `Decision needed — <topic>` for non-budget escalations). The "Open items" section of the daily digest will reference these task IDs.

7. **Honour the orchestrator's checkpoints.** `pancake_orchestrator` defines four to five mandatory checkpoints (C1–C5) for any run that produces a client-facing artifact. Do not skip them; they exist to keep the run safe.

8. **Watch the maturity threshold.** If the account has been above the next stage's monthly-conversion threshold (15 / 50 / 100) for 30 consecutive days, append a one-line recalibration recommendation to today's digest. Do not recalibrate unilaterally — that is a `pancake_account_foundations` decision the co-founder confirms.

9. **Close the loop.** Append the sweep digest (what shipped, what queued, what's still open) to `memory/YYYY-MM-DD.md`. `complete_task` the cron's task with a one-line outcome the co-founder can paste.

## Notes

- A clean sweep with no actions is a valid outcome — reply `NO_REPLY` to the cron, but **still log the reason** before doing so. Silent skipping is forbidden.
- Sustained signals beat single-day noise: a single bad Tuesday is not actionable. Use rolling windows the orchestrator computes.
- Token budget: this sweep is data-heavy. If a GAQL pull would obviously blow context, narrow to the campaigns the deltas surfaced rather than the full account.
- When a diagnosis is genuinely inconclusive (data not available at the account's maturity tier, sample too small), say so plainly in the digest — do not invent a story.
