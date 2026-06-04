---
name: posthog-mcp-toolkit
description: Reference for operating the official PostHog MCP — auth model, tool surface, HogQL patterns, and the read-only discipline. Load this when you're about to write a non-trivial HogQL query or when the MCP behaves unexpectedly.
---

# PostHog MCP toolkit — PostHog-agent

This skill is reference, not procedure. Load it when you're stuck on a query, when the MCP behaves unexpectedly, or when you need to remember which tools are safe to call.

PostHog ships fast. If a tool name in this file no longer matches the live MCP, trust the live MCP and update this skill (or escalate the drift to the co-founder).

## Connection

- Host: `MEMORY → PostHog connection → Host` — Cloud US (`https://us.posthog.com`), Cloud EU (`https://eu.posthog.com`), or a self-hosted base URL.
- Project: `MEMORY → PostHog connection → Project ID` — numeric.
- Auth: `team.posthog_api_key` — personal API key with read-only scopes: Query, Insight, Event definition, Action, Person, Cohort.

When the MCP starts, it should list its tools. Confirm the surface includes at minimum:

- An **event-definition listing** tool.
- An **insight / HogQL query execution** tool.
- A **person and cohort listing** tool.

If a tool prefixed with `create_`, `update_`, `delete_`, `mutate_`, or any verb that writes state appears in the surface — **do not call it**. PostHog-agent is read-only, period. The MCP may expose those if started without `--read-only`; that's an install bug. Surface it to the co-founder, don't quietly use them.

## What's stable across tenants vs what isn't

Tenants plug their own PostHog projects. The squad must rely **only** on what PostHog itself ships — never on a particular tenant's event taxonomy or property layout.

**Stable across every tenant (safe to hardcode):**
- Tables: `events`, `persons`, `sessions`, `groups`.
- Event columns: `event`, `timestamp`, `distinct_id`, `person_id`, `properties` (JSON), `$session_id`.
- Person columns: `id`, `properties` (JSON, free-form).
- Autocapture / lifecycle events: `$pageview`, `$autocapture`, `$pageleave`, `$identify`, `$set`, `$exception`, `$rageclick`, `$web_vitals`, `$opt_in`, and `$feature_*` flag-evaluation events.
- HogQL itself; the MCP's query / event-definition / person / cohort tools.
- The fact that `$identify` is the only reliable signal that a `distinct_id` was promoted to an identified person.

**Tenant-specific (must be discovered, never hardcoded):**
- Every non-`$`-prefixed event name. The "north-star" events.
- Every `properties.*` key. Including `email`, `name`, `user_id`, etc. — none of these are guaranteed.
- Whether persons are identified at all (some tenants run anonymous-only).
- Person-on-events mode (affects whether `person.properties.*` is point-in-time or current).
- Naming conventions (`message_sent` vs `MessageSent` vs `message.sent`).
- Whether autocapture is on, server-side ingestion only, or both.

All tenant-specific values are resolved once by `posthog-discovery` §0.5 and written to `MEMORY.md → PostHog shape`. Every query downstream substitutes from there. If you find yourself about to type a tenant-specific column name into a query directly, stop and read MEMORY instead.

## HogQL basics

PostHog's `events` table is the workhorse. Useful columns:

- `event` — the event name string.
- `timestamp` — UTC timestamp of the event.
- `person_id` — internal stable person UUID.
- `distinct_id` — the SDK-side identifier (often the user's email-hash or anonymous id).
- `properties.*` — event properties (the SDK payload).
- `person.properties.*` — person-level properties resolved at query time (or at ingest time depending on the project's `person-on-events` mode — assume ingest-time on Cloud).

Useful patterns:

- **Distinct persons in a window**
  ```sql
  SELECT count(DISTINCT person_id)
  FROM events
  WHERE timestamp >= now() - INTERVAL 7 DAY
  ```

- **First-seen per person (signup cohort)**
  ```sql
  SELECT person_id, min(timestamp) AS first_seen
  FROM events
  GROUP BY person_id
  ```

- **Per-event volume + distinct persons**
  ```sql
  SELECT event, count() AS volume, count(DISTINCT person_id) AS persons
  FROM events
  WHERE event IN ('a','b','c')
    AND timestamp >= now() - INTERVAL 7 DAY
  GROUP BY event
  ```

- **Person-property pull** (read at ingest time on Cloud — value is what was set when the event fired, not the person's current property)
  ```sql
  SELECT any(person.properties.email) AS email FROM events WHERE person_id = '...'
  ```

## Cohorts

Prefer ad-hoc cohorts (`WITH cohort AS (...)`) inside HogQL over PostHog-side Cohort objects. Cohort objects mutate the project; ad-hoc CTEs do not. The dying-users and signup-cohort queries in `posthog-daily-analysis` both use this pattern.

## Avoiding common HogQL footguns

- **Timezones.** PostHog stores timestamps UTC. Don't manually shift; let `now() - INTERVAL N DAY` do the math. If the founder asks for "today" in their local timezone, scope by their tz at the surface, not in HogQL.
- **`person.properties.*` ingest-time semantics.** On Cloud (person-on-events mode), the same person can have different property values across events. If you need *current* properties, query the `persons` table or use the MCP's person tool — don't read `person.properties.*` and call it "current".
- **Sampling.** Some MCP query tools default to sampling on large projects. Confirm you're hitting un-sampled data when reporting absolute volumes; sampled estimates are fine for trends but wrong for "exactly how many".
- **`distinct_id` vs `person_id`.** Always group by `person_id` for counts; `distinct_id` can be multiple-per-person (anonymous before login, identified after).
- **Empty-string vs NULL emails.** A non-identified person has `null` email; an identified one with a bad SDK call might have `''`. Filter both: `WHERE coalesce(email, '') != ''`.

## When a query fails

- **Syntax error** → simplify and re-run. HogQL accepts most ClickHouse SQL but is stricter on some functions; consult docs via `web_fetch` against `posthog.com/docs/hogql` rather than guessing.
- **Timeout** → the project may be larger than expected. Narrow the timestamp window, or add a `LIMIT`, or run the query for one event at a time.
- **Permission denied on a column** → the personal API key may be scoped without person-properties read. Re-issue with the right scopes (see Connection above).

## When the MCP itself misbehaves

- **401 on every call** → key invalid or expired. Surface to co-founder, do not retry.
- **403 on a specific tool** → tool needs a scope the key doesn't have. Either re-scope the key or stop using that tool.
- **Tool surface changed since last run** → PostHog updated the MCP. Re-read the live tool list, update this skill (or escalate the drift). Do not paper over with guesswork.

## Read-only discipline (with one named carve-out)

The default rule: **PostHog-agent never mutates the PostHog project via the read key (`team.posthog_api_key`).** No created events, no created flags, no edited dashboards, no opened experiments, no surveys, no annotations. If a future MCP version makes mutation easier, that does not change the rule — the founder runs PostHog, PostHog-agent reads from it via this key.

**The single carve-out** lives in `posthog-cohort-sync`: the agent may create + replace membership on exactly two named static cohorts (`PostHog-agent: Power Users`, `PostHog-agent: Dying Users`), authenticated by a **separate** narrowly-scoped key (`team.posthog_write_api_key`, scoped to Cohort write only). Read `posthog-cohort-sync` and `SOUL.md → Boundaries` before invoking it. The two-key separation is what makes the carve-out safe: a compromised read key can leak every event ever ingested but cannot mutate anything; a compromised write key can mutate exactly two cohort memberships and nothing else. Never collapse them into one key.
