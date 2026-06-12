---
name: posthog-daily-analysis
description: Analytics-agent's daily analytics procedure — DAU/WAU/MAU, north-star event volumes, activation, top engaged users, dying users. Includes the weekly recap variant. Load this on every daily cron and the Monday weekly cron.
---

# PostHog daily analysis — Analytics-agent

This is your operating procedure for the daily digest and the Monday weekly recap. All queries are HogQL through the official PostHog MCP, read-only.

## 0 — Before you start

Everything in this skill is a **sketch**. PostHog projects vary heavily above the platform layer — column names you might want (`email`, `name`) are not guaranteed to exist on any given tenant. Resolve tenant-specifics from `MEMORY.md` first, then adapt.

1. Read `MEMORY.md` and pull, into local variables:
   - `NORTH_STAR` = the events from `MEMORY → Events → North-star`.
   - `ACTIVATION` = the single event from `MEMORY → Events → Activation`.
   - `DISPLAY_HANDLE_PATH` from `## PostHog shape` (e.g. `person.properties.email`, or `distinct_id` if persons are anonymous-only on this tenant).
   - `PERSON_ON_EVENTS`, `SESSION_SIGNAL_AVAILABLE`, `LOW_VOLUME_PROJECT`, `AUTOCAPTURE_ACTIVE`.
   - **Hard gate.** Confirm `## PostHog shape` section exists in MEMORY with a `PROBE_COMPLETE: YYYY-MM-DD` marker. The section is created by `posthog-discovery §0.5` on first run and is not seeded by the bundle — its absence means the probe has never been run. If absent or marker missing, **stop**: load `posthog-discovery`, execute §0.5 in full (it will create the section, write the resolved values, and stamp the marker), then resume. Do not proceed with hardcoded assumptions — the engaged/dying lists will come back as UUIDs and any handle-dependent query will silently degrade.
2. Confirm the MCP is up with one trivial read call. If it errors, surface the exact error to the co-founder and `fail_task` — do not silently skip a daily.
3. Quick taxonomy health check. For every event in `NORTH_STAR`, classify the 7-day volume against the prior 7 days and surface anything weird as **item #1** in today's digest before the rest of the numbers. Two distinct failure modes:
   - **Silent break.** 7-day volume = 0 (or < 5% of prior 7d). Almost always SDK / ingestion break, not user collapse. Flag: "event `X` dropped from N to ~0 — verify SDK before reading this as churn".
   - **Suspicious jump.** Prior 7-day volume < 100 AND current 7-day volume is > 300% of prior. Almost always one of: a newly-instrumented event firing for the first full week, an event renamed (and the prior name is in the historical baseline), or a marketing burst. Flag: "event `X` jumped from N to M on a small prior baseline — confirm this is real user behaviour, not instrumentation change or rename, before reading this as growth". Do **not** celebrate the number in the surfaced summary until the cause is named in the wiki report.

   **For every item-#1 anomaly fired in this step**, also call `create_task` with: title `Investigate {event} {anomaly_type} on {YYYY-MM-DD}`, owner = cofounder, body containing the HogQL used to detect the anomaly + a one-paragraph reading of what the data shows + a suggested first diagnostic step (e.g. "check the SDK's last successful event timestamp for `{event}` in PostHog → Live events"). The task moves the anomaly out of the digest and into the cofounder's task queue, where it has a chance of actually being investigated instead of scrolled past.
4. If `LOW_VOLUME_PROJECT` is true, tag every number in today's digest `directional` by default. Don't claim trend on a tenant that doesn't have the volume to support one.
5. The HogQL below uses these variables literally — substitute them in. Anything else in the queries (`events`, `persons`, `event`, `timestamp`, `person_id`, `distinct_id`, `properties` JSON, autocapture event names) is a PostHog platform primitive and is the same on every tenant.

## 1 — Daily section

Run these in order. File each result + the HogQL used to `wiki/Knowledge/PostHog/Reports/daily/YYYY-MM-DD.md`.

### 1.1 — DAU / WAU / MAU

Compute three numbers and each one's comparison baseline:

- **DAU** today vs DAU 7 days ago and 30 days ago. Use the standard definition: distinct persons with any event in the window.
- **WAU** for the last 7 days vs the prior 7 days.
- **MAU** for the last 30 days vs the prior 30 days.

HogQL sketch (adapt names as needed):

```sql
SELECT count(DISTINCT person_id) AS wau
FROM events
WHERE timestamp >= now() - INTERVAL 7 DAY
  AND timestamp <  now()
```

Tag any window where the underlying volume is < 30 distinct persons with `directional` — moves on small samples are noise.

### 1.2 — North-star event volumes

For each event in `NORTH_STAR`:

- Last-7-day count.
- Last-7-day distinct persons.
- Week-over-week delta on both.

```sql
SELECT event,
       count() AS volume,
       count(DISTINCT person_id) AS distinct_persons
FROM events
WHERE event IN {NORTH_STAR}
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY event
```

Compute the prior-7-day equivalent and the delta.

### 1.3 — Activation rate of last week's signup cohort

Cohort: persons whose **first ever event** (any event) fell in the window `[now()-14d, now()-7d]`. Activated: those who, within 7 days of their first event, triggered `ACTIVATION` at least once.

```sql
WITH cohort AS (
  SELECT person_id, min(timestamp) AS first_seen
  FROM events
  GROUP BY person_id
  HAVING first_seen >= now() - INTERVAL 14 DAY
     AND first_seen <  now() - INTERVAL 7 DAY
)
SELECT
  count() AS cohort_size,
  countIf(EXISTS (
    SELECT 1 FROM events e
    WHERE e.person_id = cohort.person_id
      AND e.event = {ACTIVATION}
      AND e.timestamp BETWEEN cohort.first_seen AND cohort.first_seen + INTERVAL 7 DAY
  )) AS activated
FROM cohort
```

Report: `activated / cohort_size` and the prior week's equivalent for comparison.

**Auto-trigger the funnel debugger** when either holds:
- Activation rate dropped by more than 2pp WoW (e.g. 8% → 5.5%), OR
- Activation rate is below an absolute 5% floor.

When the trigger fires, load `posthog-funnel-debugger` and run it inline before §1.4. Its output (biggest drop-off step + one-sentence hypothesis) gets folded into the daily digest under the Activation section as a 3-line block — see `posthog-funnel-debugger §6`. If `MEMORY → Events → Signup` is blank on this tenant, the funnel debugger is a no-op and you just note "funnel debugger disabled — no signup event configured" in the digest.

### 1.4 — Top 5 most engaged users (this week)

Persons ranked by total `NORTH_STAR` event count over the last 7 days. Tie-break on distinct event types triggered, then on most recent activity.

Substitute `{DISPLAY_HANDLE_PATH}` with the resolved path from MEMORY (e.g. `person.properties.email` if email is the chosen handle, `toString(distinct_id)` if the tenant is anonymous-only):

```sql
SELECT person_id,
       any(distinct_id) AS distinct_id,
       any({DISPLAY_HANDLE_PATH}) AS handle,
       count() AS ns_events,
       count(DISTINCT event) AS distinct_event_types,
       max(timestamp) AS last_seen
FROM events
WHERE event IN {NORTH_STAR}
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY person_id
ORDER BY ns_events DESC, distinct_event_types DESC, last_seen DESC
LIMIT 5
```

The query returns both `distinct_id` (always present, the SDK-side id used for click-through links in PostHog's UI) and `handle` (the resolved display name; may be null on anonymous-only tenants). If the same person tops the list every week, note it — that's signal about which design partners to call.

### 1.5 — Top 5 dying users

Definition: persons whose **last-7-day** north-star event count is ≤ 25% of their **prior weekly rate** (= prior-14-day count ÷ 2), AND who have not been seen at all in the last 48 hours, AND whose prior-14-day count was ≥ 5 events (filter out one-time visitors). The query below computes the weekly rate as `count() / 2.0` so the `* 0.25` filter compares apples-to-apples against the last-7-day count.

```sql
WITH baseline AS (
  SELECT person_id,
         any(distinct_id) AS distinct_id,
         any({DISPLAY_HANDLE_PATH}) AS handle,
         count() / 2.0 AS weekly_baseline
  FROM events
  WHERE event IN {NORTH_STAR}
    AND timestamp >= now() - INTERVAL 21 DAY
    AND timestamp <  now() - INTERVAL 7  DAY
  GROUP BY person_id
  HAVING count() >= 5
), recent AS (
  SELECT person_id,
         count() AS recent_count,
         max(timestamp) AS last_seen
  FROM events
  WHERE event IN {NORTH_STAR}
    AND timestamp >= now() - INTERVAL 7 DAY
  GROUP BY person_id
)
SELECT b.person_id,
       b.distinct_id,
       b.handle,
       b.weekly_baseline,
       coalesce(r.recent_count, 0) AS recent_count,
       coalesce(r.last_seen, now() - INTERVAL 999 DAY) AS last_seen
FROM baseline b
LEFT JOIN recent r ON r.person_id = b.person_id
WHERE coalesce(r.recent_count, 0) <= b.weekly_baseline * 0.25
  AND (r.last_seen IS NULL OR r.last_seen < now() - INTERVAL 48 HOUR)
ORDER BY b.weekly_baseline DESC
LIMIT 5
```

Cross-reference each result against the prior week's dying list in `wiki/Knowledge/PostHog/Watchlist.md`:
- **Re-appeared from dying → engaged**: mark as `recovered` and remove.
- **Same name as last week, still dying**: mark `churn_risk_high`.
- **New entry**: mark `new`.

### 1.6 — File and surface

1. **File** the full report to `wiki/Knowledge/PostHog/Reports/daily/YYYY-MM-DD.md`. The filed report **MUST** follow the skeleton below; the `## HogQL` section is non-negotiable and must contain every query you ran, verbatim, in the order you ran them. A filed report without `## HogQL` is an unfinished report — re-open it before closing the session.

   Report skeleton:
   ```
   # PostHog daily — YYYY-MM-DD

   ## Flagged (item #1 if anything weird)
   ## DAU / WAU / MAU
   ## North-star event volumes
   ## Activation rate
   ## Top 5 engaged users
   ## Top 5 dying users
   ## Suggested move
   ## HogQL
   (every query used, verbatim, in code blocks, with a one-line label above each)
   ```

2. **Update** `wiki/Knowledge/PostHog/Watchlist.md` with the dying-users deltas.
3. **Sync the PostHog cohorts** — load `posthog-cohort-sync` and run it. The skill is a no-op if `team.posthog_write_api_key` is blank; otherwise it replaces membership on the two static cohorts `Analytics-agent: Power Users` (top 20 engaged) and `Analytics-agent: Dying Users` (full current dying list) so the cofounder can slice any PostHog chart by them. Every cohort write is logged to `wiki/Knowledge/PostHog/CohortSync/`.
4. **Surface** a 6–8 line summary to the co-founder via `complete_task`. Template:

```
PostHog daily, {date}.

· DAU {n} (WoW {±%}), WAU {n} (WoW {±%}), MAU {n}.
· North-star: {event_a} {n} (WoW {±%}), {event_b} {n} (WoW {±%}).
· Activation last week's signups: {x/y} = {pct}% (prior week {pct}%).
· Engaged: {handle_1}, {handle_2}, {handle_3}, {handle_4}, {handle_5}.
· Dying: {handle_1} ({baseline} to {recent}), {handle_2} (…), … {n} new on watchlist.
· Suggested move: {one sentence, e.g. call a dying user, ship X, dig into Y}.
```

If nothing meaningful changed, replace the suggested move with `Nothing material, hold course.` Do not pad.

## 2 — Weekly recap section (Monday cron)

On the Monday 10:00 cron, also run:

### 2.1 — 4-week trends

DAU / WAU / MAU and each north-star event's weekly count, plotted as a 4-row × 4-week table. Note the slope (up, flat, down).

### 2.2 — 4-week activation cohort table

For each of the last 4 signup cohorts, compute the 7-day activation rate against `ACTIVATION`. Note whether activation is improving.

### 2.3 — Churn count

How many users on the dying list 2+ weeks ago have not returned (0 north-star events in the last 14 days)? That's your churn count for the week.

### 2.4 — One written hypothesis

Read the numbers + the ICP + the goal. Write **one paragraph** (no more) answering: *given what the data shows and the 90-day goal, what is the single highest-impact thing to ship or do this week?* Examples: "activation dropped because the signup flow lost the demo CTA, restore it"; "the top 5 engaged users are all in the EU and we have zero EU-targeted positioning, fix the landing page"; "dying users all stopped after the v2 release, investigate the regression in `report_generated`."

### 2.5 — File and surface

File to `wiki/Knowledge/PostHog/Reports/weekly/YYYY-WW.md`. Surface a 10–12 line summary ending with the hypothesis. If the project is genuinely pre-traction (< 20 events in the trailing 7 days across all north-star events), say so explicitly and stop — no hypothesis-on-noise.

## 3 — Failure modes

- **MCP auth fails** → `fail_task` with the error. The co-founder needs to refresh `team.posthog_api_key`. Do not retry silently.
- **One HogQL query errors but the rest succeed** → file what you have, name the broken query in the surfaced summary, keep going.
- **A north-star event's 7-day count is 0 and was non-zero last week** → likely SDK / ingestion break. Make this item #1 in the surfaced summary. Do not blame the product.
- **A north-star event's WoW delta is > 300% AND prior-week baseline was < 100 events** → almost never real growth on a first read. Either the event was just instrumented, renamed, or there was a one-off marketing push. Make this item #1, ask the question explicitly, and do not celebrate the % in the surfaced summary. Reading "🚀 explosive growth" off a 26→515 spike is exactly the failure mode this rule exists to prevent.
- **No movement at all worth a digest** → say so in one sentence in the surfaced summary; do not pad to look busy.

## 4 — Sample sizes

Tag any number computed on < 30 distinct persons as `directional`. Tag a WoW delta as significant only when both the baseline and the current value are ≥ 30 distinct persons. Be honest about noise; the co-founder will trust your numbers more if you don't dress up randomness.
