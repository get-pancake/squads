---
name: posthog-discovery
description: PostHog-agent's onboarding discovery procedure — how to scan the project's event taxonomy, surface a candidate north-star event shortlist to the co-founder, and capture ICP + company goal. Load this during onboarding and any time the north-star event list needs re-confirmation.
---

# PostHog discovery — PostHog-agent

This is your procedure for the first contact with a new PostHog project, and for any later re-confirmation of the north-star event list.

All PostHog interactions happen through the **official PostHog MCP** in read-only mode. Never call a mutating tool. If the MCP exposes one, ignore it.

## 0 — Pre-flight

1. Confirm the MCP is connected and authenticated. A single read-only call (list 5 event definitions) is the sanity check. If it fails, escalate with the exact error; do not proceed.
2. Read `MEMORY.md` for any prior north-star event list. If one exists, treat this as a *re-confirmation* pass, not a from-scratch discovery.

## 0.5 — Probe the tenant's PostHog shape (mandatory before any analysis)

Every tenant's PostHog looks different above the platform layer. Before any analysis runs, probe and write the answers to `MEMORY.md → PostHog shape` — every later query reads from there instead of hardcoding column paths.

**First action**: stamp the header of `MEMORY → PostHog shape` with `PROBE_COMPLETE: YYYY-MM-DD` once every value below has been resolved and written. `posthog-daily-analysis §0` will check for this marker before running; if it's missing, it stops and routes back here.

Resolve and record:

1. **Person identification model.** Run a small HogQL: `SELECT countIf(event = '$identify') AS identified, count() AS total FROM events WHERE timestamp >= now() - INTERVAL 7 DAY`. If `identified` is ~0, this tenant is **anonymous-only** — every later report keys on `distinct_id`, not on a human-readable handle, and the dying-users / engaged-users lists will show opaque ids. Note this explicitly in the surfaced digest each day so the founder isn't surprised.
2. **Best display handle.** If persons are identified, sample 20 identified persons and inspect `properties` keys present in *all 20*. In priority order, pick the first that exists: `email`, `username`, `name`, `$email`, `user_email`, `handle`. If none exists on every sampled person, fall back to `distinct_id`. Record the resolved JSON path as `display_handle_path` in MEMORY (e.g. `person.properties.email` or `distinct_id`). Every later "named user" output uses this.
3. **Person-on-events mode.** Quick probe: query the same person on two different days for one person property and see if the value can differ across rows. On Cloud this is on by default; on self-hosted it varies. Record `person_on_events: true|false`. This decides whether `person.properties.*` is point-in-time (PoE on) or current (PoE off).
4. **Session signal availability.** Check whether `$session_id` is populated on ≥ 50% of events in the last 7 days. If yes, session-level analysis is available later; if no, all "engagement" rolls up by `person_id` only.
5. **Volume floor.** Total events last 7 days. If < 200, every subsequent number is small-sample by default — record `low_volume_project: true` so the daily report tags everything `directional` automatically.
6. **Autocapture status.** Is `$pageview` firing? If not, the tenant is using server-side or product-only events (no web SDK). Note it — it changes what "DAU" means.

These are the only assumptions the squad is allowed to bake in: PostHog's primitives (`events`, `persons`, `event`, `timestamp`, `distinct_id`, `person_id`, `properties` JSON, autocapture event names, HogQL itself). Anything else — including which property holds the user's email — must come from this probe.

## 1 — Scan the event taxonomy

1. List event definitions for the project, sorted by 30-day volume descending. Cap at the top ~50.
2. Drop autocapture / housekeeping noise from what you'll show the user: `$pageview`, `$autocapture`, `$rageclick`, `$identify`, `$set`, `$opt_in`, `$exception`, `$pageleave`, `$web_vitals`, anything starting with `$feature_`.
3. For each remaining event, fetch a quick stat triple: 30-day volume, 7-day volume, and number of distinct persons who triggered it in the last 7 days. The distinct-person count matters as much as raw volume — a "value" event should be triggered by many people, not 50× by one user.

Tabulate the result with columns: `event_name | 30d volume | 7d volume | 7d distinct persons | first seen | example properties`. Sort by 7-day distinct-person count descending.

## 2 — Build the candidate shortlist

From the table, propose **5–8 candidate events** to the co-founder. Apply these filters:

- The event name reads like a user action that delivered value (`message_sent`, `report_generated`, `invite_accepted`) — not a UI side-effect (`button_clicked`, `modal_opened`).
- 7-day distinct persons ≥ 5, or, if the product is genuinely pre-traction, the event with the most distinct persons regardless of count (be explicit about the small sample).
- The event is reasonably stable — has fired in each of the last 4 weeks, not a one-off from a launch day.

If multiple events look interchangeable (e.g. both `message_sent` and `chat_message_created` from a half-finished rename), flag the duplication explicitly — that's a taxonomy bug the co-founder should fix on the product side, not something you should silently pick between.

## 3 — Present to the co-founder

Format the shortlist as a short Markdown block surfaced via the co-founder. For each candidate include: the event name, what it appears to mean (your inference from the name + properties), 7-day volume, 7-day distinct persons, and a one-line *why this might be a north-star event*.

Then ask the two questions, verbatim:

1. **"Which 1–3 of these events means this user actually got value from the product?"**
2. **"Which single one means a new signup is now activated?"** (Usually the first occurrence of one of the answers to question 1.)

If the co-founder is unsure, do **not** pick for them. Pick the highest-7d-distinct-person non-autocapture event as a provisional placeholder, store it with a clear `provisional: true` note in `MEMORY.md`, and create a follow-up task to re-run discovery after the first weekly digest.

## 4 — Capture ICP and goal

Open `wiki/Company/COMPANY.md` and `wiki/Company/ICP.md` if they exist. If both are current and the co-founder confirms, point `MEMORY.md` at them and stop. Otherwise ask:

- **"In one sentence, who is the ICP?"** → write to `MEMORY.md → ICP`.
- **"In one sentence, what's the single goal of the company over the next 90 days?"** → write to `MEMORY.md → Goal (next 90 days)`.

These two answers are the lens through which every future digest is read — a 12% DAU bump means something very different for a "200 WAU by Q3" goal than for a "5% paid conversion by Q3" goal.

## 5 — Persist

Write directly to `MEMORY.md` — only the API key(s) go through `vault_request`; the event names are configuration, not secrets:

- `## North-star events` — the list + one-line *why* per event (in the user's words).
- `## Activation event` — the event + one-line *why* (in the user's words).
- `## ICP` and `## Goal (next 90 days)` — if not just a wiki pointer.
- `## PostHog shape` — the resolved probe answers from §0.5: `display_handle_path`, `person_identification`, `person_on_events`, `session_signal_available`, `low_volume_project`, `autocapture_active`. Every later query reads these instead of guessing.

## 6 — File the discovery report

Write the full discovery output to `wiki/Knowledge/PostHog/Discovery/YYYY-MM-DD.md`:

- The full top-50 event table from Step 1 (with the HogQL used).
- The shortlist from Step 2 and your reasoning per candidate.
- The co-founder's chosen north-star events and activation event, with their stated *why*.
- The ICP + goal sentences.

This is the audit trail. Any later "why did we pick these events?" question is answered by reading this file.

## 7 — When to re-run discovery

Re-run this skill when any of the following happens:

- The co-founder ships a major new product surface (new feature area, new user role).
- The product deprecates a feature that owned a north-star event.
- A north-star event's volume drops > 80% week-over-week and the SDK is verified healthy — the event itself may have been renamed in code.
- The co-founder asks to re-evaluate.

Re-running discovery is cheap (one wake) and the cost of stale north-star events is high (every daily digest measures the wrong thing). Prefer re-running over guessing.
