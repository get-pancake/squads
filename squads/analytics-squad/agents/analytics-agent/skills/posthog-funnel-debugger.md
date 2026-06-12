---
name: posthog-funnel-debugger
description: Analytics-agent's procedure for finding the biggest drop-off step in the signup → activation funnel. Triggered automatically when the daily digest detects activation rate dropping > 2pp WoW or sitting below a 5% floor. Load when a funnel investigation is needed.
---

# PostHog funnel debugger — Analytics-agent

This skill answers one question: **between signup and activation, where do users actually drop off?**

It's the first thing to reach for when the daily digest flags a low or falling activation rate. The output is a funnel breakdown with the biggest drop-off step named, plus a hypothesis for the cofounder.

## 0 — Pre-flight

1. Read `MEMORY.md`:
   - `SIGNUP` = `MEMORY → Events → Signup`. If blank, **stop**: the funnel debugger is disabled on this tenant. Log the reason in `memory/YYYY-MM-DD.md` and exit.
   - `ACTIVATION` = `MEMORY → Events → Activation`.
   - `DISPLAY_HANDLE_PATH` from `## PostHog shape`.
   - Confirm `PROBE_COMPLETE` is set; if not, run `posthog-discovery §0.5` first.
2. Trigger conditions (decide whether to run):
   - Activation rate dropped > 2pp WoW, OR
   - Activation rate < 5% absolute, OR
   - The cofounder dispatched a `funnel investigation` task manually.

   If none apply, exit — don't run noise.

## 1 — Define the cohort

The funnel cohort is everyone who fired `SIGNUP` in the window `[now()-14d, now()-7d]`. Two weeks is long enough to give the funnel time to complete (so a 7-day activation window is still inside the observation period) and short enough to reflect the *current* product.

```sql
WITH signup_cohort AS (
  SELECT person_id, min(timestamp) AS signup_time
  FROM events
  WHERE event = {SIGNUP}
    AND timestamp >= now() - INTERVAL 14 DAY
    AND timestamp <  now() - INTERVAL 7  DAY
  GROUP BY person_id
)
```

Report `cohort_size` first. If < 30, tag everything `directional` and say so in the surfaced summary; don't draw conclusions from a small cohort.

## 2 — Find the intermediate steps the activated cohort actually takes

Don't guess the funnel steps. Instead, observe what activated users (those who fired both `SIGNUP` and `ACTIVATION` within 7 days) actually do between the two events. The top 5 such events become the funnel's intermediate steps.

```sql
WITH activated AS (
  SELECT s.person_id, s.signup_time, min(a.timestamp) AS activation_time
  FROM signup_cohort s
  INNER JOIN events a
    ON a.person_id = s.person_id
    AND a.event = {ACTIVATION}
    AND a.timestamp BETWEEN s.signup_time AND s.signup_time + INTERVAL 7 DAY
  GROUP BY s.person_id, s.signup_time
)
SELECT e.event, count() AS occurrences, count(DISTINCT e.person_id) AS persons
FROM activated a
INNER JOIN events e
  ON e.person_id = a.person_id
  AND e.timestamp BETWEEN a.signup_time AND a.activation_time
WHERE e.event NOT IN ({SIGNUP}, {ACTIVATION})
  AND e.event NOT LIKE '$%'
GROUP BY e.event
ORDER BY persons DESC
LIMIT 5
```

The top 5 events by *distinct persons* (not raw volume — raw volume biases toward chatty events) are your intermediate funnel steps. Call them `STEP_1, STEP_2, …, STEP_5` in the chronological order most activated users hit them (use `argMin(event, timestamp)` patterns or just take the order from the median activation path).

## 3 — Build the funnel

For each step in order `SIGNUP → STEP_1 → STEP_2 → … → STEP_5 → ACTIVATION`, count how many of the original `signup_cohort` reached *at least* that step within 7 days of their signup. Express each as a percentage of `cohort_size`.

```sql
SELECT
  count() AS reached_signup,
  countIf(EXISTS (SELECT 1 FROM events e WHERE e.person_id = s.person_id AND e.event = {STEP_1} AND e.timestamp BETWEEN s.signup_time AND s.signup_time + INTERVAL 7 DAY)) AS reached_step_1,
  countIf(EXISTS (SELECT 1 FROM events e WHERE e.person_id = s.person_id AND e.event = {STEP_2} AND e.timestamp BETWEEN s.signup_time AND s.signup_time + INTERVAL 7 DAY)) AS reached_step_2,
  -- … repeat for STEP_3, STEP_4, STEP_5 …
  countIf(EXISTS (SELECT 1 FROM events e WHERE e.person_id = s.person_id AND e.event = {ACTIVATION} AND e.timestamp BETWEEN s.signup_time AND s.signup_time + INTERVAL 7 DAY)) AS reached_activation
FROM signup_cohort s
```

(In practice, run this as a single `query-funnel` MCP call if available — the HogQL above is the sketch that mirrors what the typed insight tool does internally. The skill explicitly favors `query-funnel` over raw SQL when the surface is available, per `posthog-mcp-toolkit`.)

## 4 — Find the biggest drop-off

For each consecutive pair of steps, compute the conversion rate `reached_next / reached_prev`. The step pair with the *lowest* conversion rate is the biggest drop-off — that's the surfaced finding.

Edge cases:
- If the biggest drop is between `SIGNUP` and `STEP_1`, the problem is "users sign up and never come back" (onboarding flow is failing immediately, or signup is happening from a context where users never reach the product, e.g. bot signups).
- If the biggest drop is between `STEP_4` and `ACTIVATION`, the problem is "users almost get there but bail on the last mile" (last step has friction, requires a thing they don't have, or there's a bug).
- If all conversion rates are roughly equal and low, the problem is diffuse — the whole funnel is leaky, not one specific step. Say so.

## 5 — File the report

Write the full breakdown to `wiki/Knowledge/PostHog/FunnelDebugger/YYYY-MM-DD.md`:

```
# Activation funnel — YYYY-MM-DD

## Cohort
{cohort_size} signups in [now()-14d, now()-7d]. {directional tag if < 30}.

## Funnel steps (derived from activated-user paths)
1. {SIGNUP}
2. {STEP_1}: {brief inferred meaning}
3. {STEP_2}: …
…
N. {ACTIVATION}

## Conversion
| Step | Reached | % of cohort | Drop from prior |
|---|---|---|---|
…

## Biggest drop-off
Between **{STEP_X}** and **{STEP_Y}**: {pct}% of users who reached X never reach Y.

## Hypothesis
{One sentence on what to look at — e.g. "Step Y requires email verification; check if the verification email is reaching the inbox" or "Step Y is the pricing page; check if pricing changed".}

## HogQL
{Every query used, verbatim, in code blocks.}
```

## 6 — Surface

Add a 3-line block to the daily digest under the **Activation** section:

```
Funnel debugger: cohort {n}, biggest drop between {STEP_X} → {STEP_Y} (-{pct}pp).
Hypothesis: {one sentence}.
Full breakdown: wiki/Knowledge/PostHog/FunnelDebugger/YYYY-MM-DD.md
```

Do not pad. If the cohort was too small for a confident read, replace the block with a single line: `Funnel debugger: cohort {n} too small for a confident read, retry next week.`

## 7 — Failure modes

- **`SIGNUP` event not configured** → skill is disabled on this tenant. Exit cleanly, log the reason, do not error.
- **`SIGNUP` event has zero volume in the window** → either the signup flow is broken (item #1 in tomorrow's digest) or the event was renamed. Surface to cofounder, do not invent a funnel.
- **Activated cohort is empty** → activation rate is genuinely 0%, no signal to build a funnel from. Surface "no users activated in the trailing window — funnel debugger has nothing to model from".
- **All conversion rates > 95%** → the funnel doesn't explain low activation; the cohort is converting fine but the absolute numbers are small. Look at signup *volume* instead.
