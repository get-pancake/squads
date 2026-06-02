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

Write to vault (via the co-founder's `vault_request`):

- `team.posthog_north_star_events` — comma-separated event names, no spaces around commas.
- `team.posthog_activation_event` — single event name.

Write to `MEMORY.md`:

- `## North-star events` — the list + one-line *why* per event (in the user's words).
- `## Activation event` — the event + one-line *why* (in the user's words).
- `## ICP` and `## Goal (next 90 days)` — if not just a wiki pointer.

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
