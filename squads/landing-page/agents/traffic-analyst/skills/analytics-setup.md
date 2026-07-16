---
name: analytics-setup
description: Set up the analytics tool for the landing page (first run), or run the daily traffic check (subsequent runs). Load on every daily heartbeat.
---

# Analytics setup and daily traffic check

## Detect mode: setup vs daily check

Read `MEMORY.md`. If the analytics setup is marked complete (GA snippet in repo, tool confirmed working), skip to **Daily check**. Otherwise run **First-time setup** first.

---

## First-time setup

### Step 1 — Identify the tool

Read `team.analytics_tool` from the vault. Map to the right setup path:

- `google_analytics` → GA4 with `team.ga_measurement_id`
- `google_analytics` + GTM → GA4 via GTM with `team.gtm_container_id`
- `plausible` → Plausible script tag
- `posthog` → PostHog JS snippet
- `custom` → ask the co-founder for the snippet via `fail_task`

### Step 2 — Audit the repo for existing tracking

Clone or fetch the landing repo (`team.landing_repo`). Search for existing `<script>` analytics tags, `gtag`, `_paq`, `posthog`, or `plausible` calls. If tracking already exists, document it in `wiki/Projects/LandingPage/TrafficReports/setup.md` and skip to Step 4.

### Step 3 — Generate and add the tracking snippet

Write the minimal correct snippet for the chosen tool. Open a PR to the landing repo:
- Branch: `analytics/add-<tool>-tracking`
- File: add snippet to `<head>` in the main layout file
- PR description: tool name, what data it captures, and how to verify it's firing

### Step 4 — Verify or document GTM setup (if applicable)

If GTM is used, document the container ID in the wiki and note which tags are configured. If GTM is not yet configured, write a setup guide in `wiki/Projects/LandingPage/TrafficReports/gtm-setup.md`.

### Step 5 — Mark setup complete

Update `MEMORY.md`: add "Analytics setup complete: [tool], [date]" under "## Analytics setup".

---

## Daily check

### Step 1 — Pull last 24h data

Using the configured analytics tool, fetch:
- Unique visitors (today vs yesterday)
- Top 5 traffic sources
- Primary conversion event count and rate (sign-ups, CTA clicks)
- Bounce rate (if available)

If you cannot access the analytics API directly, note "manual check needed" and skip to Step 3.

### Step 2 — Flag anomalies

Compare today vs the 7-day rolling average. If any metric is >30% above or below average:
- Create a new task for the co-founder via `create_task` with a one-paragraph anomaly summary
- Title: "Traffic anomaly — [metric] [up/down] [X%] — [date]"

### Step 3 — Write the digest

Append a dated entry to `wiki/Projects/LandingPage/TrafficReports/YYYY-MM.md`:

```
## YYYY-MM-DD
- Visitors: X (vs X yesterday)
- Top sources: [source 1], [source 2], [source 3]
- Conversions: X (rate: X%)
- Notes: [anomaly or nothing notable]
```

### Step 4 — Report

`complete_task` with a 3-line summary: visitors, top source, conversion rate. If there's an anomaly, prefix with "ANOMALY: ".
