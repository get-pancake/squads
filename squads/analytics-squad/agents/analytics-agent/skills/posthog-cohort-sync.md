---
name: posthog-cohort-sync
description: Analytics-agent's procedure for maintaining two static cohorts in PostHog — "Analytics-agent: Power Users" and "Analytics-agent: Dying Users". This is the SINGLE carve-out from the read-only rule. Uses the separate write API key. Runs at the end of every daily analysis cycle. Load when syncing cohorts.
---

# PostHog cohort sync — Analytics-agent

This is the only skill in the squad that **mutates state in the user's PostHog project**. Read every line before invoking it.

## The contract

- Two cohorts, named exactly: **`Analytics-agent: Power Users`** and **`Analytics-agent: Dying Users`**. No other cohorts touched, ever.
- Membership replaced (not appended) on every run.
- Auth via `team.posthog_write_api_key` — the second, narrowly-scoped key. If the key is blank, skill is disabled, exit silently.
- Every modification logged to `wiki/Knowledge/PostHog/CohortSync/YYYY-MM-DD.md`. The wiki is the audit trail; the cofounder can always answer "what did the agent change in our PostHog?" by reading it.

If at any point a query or response shape suggests the skill is about to touch a cohort whose name does *not* match exactly one of the two above, **stop immediately** and surface to the cofounder. Renaming, deleting, or modifying any other cohort is forbidden.

## 0 — Pre-flight

1. Read `MEMORY.md`:
   - `WRITE_KEY` = `team.posthog_write_api_key`. If blank, skill disabled — exit silently, don't log to digest.
   - `PROJECT_ID` = `MEMORY → PostHog connection → Project ID`.
   - `DISPLAY_HANDLE_PATH` from `## PostHog shape`. Confirm `PROBE_COMPLETE` is set; else stop.
2. **Verify the write key is scoped to Cohort write only.** On first use of the run, call a cohort *read* operation with `WRITE_KEY` (e.g. list cohorts). If it succeeds, that's a problem — the key has read scopes it shouldn't have. Surface to the cofounder: "Your write key has read scopes; please re-issue it with Cohort write only for blast-radius containment." Continue the sync anyway (the cofounder can re-scope later), but flag it.

## 1 — Compute the two membership lists

These are the same queries used by the daily analysis (engaged + dying), but here you want the *full* lists, not just top-5.

### Power Users (top 20 by north-star event count this week)

```sql
SELECT person_id, any(distinct_id) AS distinct_id
FROM events
WHERE event IN {NORTH_STAR}
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY person_id
ORDER BY count() DESC
LIMIT 20
```

### Dying Users (full current dying list, same definition as daily-analysis §1.5)

Reuse the dying-users CTE from `posthog-daily-analysis §1.5`, drop the `LIMIT 5` so you get every qualifying person.

Each membership list is a set of `person_id`s (or `distinct_id`s, depending on what the cohort tool accepts — check the MCP).

## 2 — Sync to PostHog

Through the PostHog MCP (using `WRITE_KEY` — explicitly, not the read key from `team.posthog_api_key`):

1. **List cohorts** to find existing cohorts matching the exact two names. If neither exists, create them. If they exist, capture their IDs.
2. **For Power Users cohort**: replace membership with the Power Users list from §1. The cohort type is *static* (a fixed list, not a dynamic query) so PostHog doesn't recompute it daily — the agent owns the membership and PostHog just stores it.
3. **For Dying Users cohort**: same, with the Dying Users list.

If the MCP exposes a write-cohort tool that takes a fully-resolved member list, use it. If it only accepts a dynamic definition, fall back: define the cohort as a dynamic query that filters `person_id IN (<list>)`. Static is preferred — dynamic cohorts are recomputed by PostHog itself on its own cadence and may not match the agent's intent.

**Forbidden during sync** (each is a stop-and-escalate event):
- Modifying any cohort whose name doesn't match exactly `Analytics-agent: Power Users` or `Analytics-agent: Dying Users`.
- Calling any non-cohort write tool (events, flags, dashboards, surveys, experiments, persons, insights).
- Calling `delete` on any cohort, even one of the two — replacements only, no deletes.

## 3 — Log

Append to `wiki/Knowledge/PostHog/CohortSync/YYYY-MM-DD.md`:

```
# Cohort sync — YYYY-MM-DD HH:MM UTC

## Power Users
**Membership size:** {n_power}
**Diff vs last sync:** +{added} new, -{removed} dropped
**Cohort ID:** {pid}
**Added:** {handle_or_did_list, truncated to 10}
**Dropped:** {handle_or_did_list, truncated to 10}

## Dying Users
**Membership size:** {n_dying}
**Diff vs last sync:** +{added} new, -{removed} recovered
**Cohort ID:** {did}
**Added:** {handle_or_did_list, truncated to 10}
**Dropped (recovered):** {handle_or_did_list, truncated to 10}

## HogQL
{The membership queries from §1, verbatim.}

## API calls
{Each PostHog API call made, with method, endpoint, response status. No payloads — the membership lists are already above.}
```

The "Diff vs last sync" is computed by reading the prior day's `CohortSync/` file. Track the diff so the cofounder can see "this person joined the dying list yesterday, agent should have already DM'd them".

## 4 — Surface (or don't)

Cohort sync is plumbing — the cofounder doesn't need a daily DM about it. **Default silent.** Add a one-line note to the daily digest only when:

- The dying list grew by ≥ 3 since the last sync, OR
- A previously-power user moved to the dying list (worth knowing immediately), OR
- The sync failed (auth, API error) — then surface the exact error and propose a fix.

## 5 — Failure modes

- **`WRITE_KEY` missing or empty** → skill disabled. Exit silently.
- **`WRITE_KEY` returns 403 on cohort write** → key not scoped correctly. Surface once, do not retry every run — the cofounder needs to re-issue the key.
- **A cohort with one of the two reserved names exists and was created by someone other than the agent** → ambiguous; surface to cofounder, do not overwrite. Wait for explicit go-ahead.
- **PostHog API returns a non-cohort write succeeding on `WRITE_KEY`** → the key is over-scoped; surface to cofounder immediately, complete the cohort sync, do not use the key for anything else.

## 6 — Reverting

If the cofounder wants to undo the squad's cohort writes, deletion is a *human* operation in the PostHog UI — the agent never deletes a cohort, including its own two. This is deliberate: the agent has only the narrowest possible mutation surface (replace membership of two named cohorts), and any teardown happens outside the agent's authority.
