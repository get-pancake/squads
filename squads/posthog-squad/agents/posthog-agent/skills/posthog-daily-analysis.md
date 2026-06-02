---
name: posthog-daily-analysis
description: PostHog-agent's daily analytics procedure — DAU/WAU/MAU, north-star event volumes, activation, top engaged users, dying users. Includes the weekly recap variant. Load this on every daily cron and the Monday weekly cron.
---

# PostHog daily analysis — PostHog-agent

This is your operating procedure for the daily digest and the Monday weekly recap. All queries are HogQL through the official PostHog MCP, read-only.

## 0 — Before you start

Everything in this skill is a **sketch**. PostHog projects vary heavily above the platform layer — column names you might want (`email`, `name`) are not guaranteed to exist on any given tenant. Resolve tenant-specifics from `MEMORY.md` first, then adapt.

1. Read `MEMORY.md` and pull, into local variables:
   - `NORTH_STAR` = the events from `team.posthog_north_star_events`.
   - `ACTIVATION` = the single event from `team.posthog_activation_event`.
   - `DISPLAY_HANDLE_PATH` from `## PostHog shape` (e.g. `person.properties.email`, or `distinct_id` if persons are anonymous-only on this tenant).
   - `PERSON_ON_EVENTS`, `SESSION_SIGNAL_AVAILABLE`, `LOW_VOLUME_PROJECT`, `AUTOCAPTURE_ACTIVE`.
   - If `## PostHog shape` is missing or stale, **stop and run `posthog-discovery` §0.5 first** — do not proceed with hardcoded assumptions.
2. Confirm the MCP is up with one trivial read call. If it errors, surface the exact error to the co-founder and `fail_task` — do not silently skip a daily.
3. Quick taxonomy health check: for every event in `NORTH_STAR`, is the 7-day volume > 0? If any is 0, that is your **item #1** in today's digest — flag it as a likely SDK / ingestion break (not user collapse) and surface it before the rest of the numbers.
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

1. **File** the full report (numbers + HogQL + raw rows) to `wiki/Knowledge/PostHog/Reports/daily/YYYY-MM-DD.md`.
2. **Update** `wiki/Knowledge/PostHog/Watchlist.md` with the dying-users deltas.
3. **Surface** a 6–8 line summary to the co-founder via `complete_task`. Template:

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
- **No movement at all worth a digest** → say so in one sentence in the surfaced summary; do not pad to look busy.

## 4 — Sample sizes

Tag any number computed on < 30 distinct persons as `directional`. Tag a WoW delta as significant only when both the baseline and the current value are ≥ 30 distinct persons. Be honest about noise; the co-founder will trust your numbers more if you don't dress up randomness.
