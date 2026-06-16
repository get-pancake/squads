---
name: buffer-strategy-and-goals
description: Procedure to translate a Buffer-account strategy into concrete API actions — ≤3 outcome-linked goals, 3–5 content pillars represented as Buffer tags, an idea backlog via createIdea, and a per-channel cadence. Run at onboarding and monthly.
---

# Buffer strategy and goals — Buffer-agent

A strategy is the map from where the Buffer presence is today to where it should be in 6–12 months. Through the Buffer CLI, that map becomes concrete decisions Buffer-agent CAN execute: **which channels to post to, at what cadence, around which pillars (tracked via tags), seeded with which ideas.**

Prerequisite: every in-scope channel already has a Tone Profile from `buffer-channel-tone-extraction`. Strategy decisions about content reference each channel's real voice.

## (A) What the agent executes via the Buffer CLI

- **Channel selection** → `buffer channels list`; decide which connected services this strategy actively uses. If a needed service isn't connected, tell the user to connect it natively — the CLI can't add channels.
- **Content pillars as tags** → represent each pillar as a Buffer **tag**. The agent then filters `buffer posts list --tag-ids <id>` to keep the mix balanced. Compare these intended pillars against the *observed* pillars in each channel's Tone Profile and flag drift.
- **Idea backlog** → `buffer ideas create --text "..."` per seeded idea (with the pillar tag id where the CLI supports it — verify via `buffer schema`).
- **Cadence** → encode the plan as scheduled posts using `--mode` + `--scheduled-at` (see `buffer-cadence-and-timing`).

## (B) Advisory knowledge

- **Cap goals at three**, each tied to a **business outcome** (awareness, leads/sales, community) — not vanity metrics. Outcomes aren't measurable via Buffer (no analytics) — define how success is checked **on-platform** up front, and write that down.
- **Audience first**: pick channels by where the audience actually is and where the content format fits. Not "be everywhere".
- **3–5 content pillars**, each mapped to a Buffer tag.
- **Leave wiggle room**: keep open queue slots for trends and experiments. No idea is "dumb".
- **Review monthly**: `buffer posts list` for the period, see what shipped per pillar / channel, adjust pillar mix and cadence.

## Procedure (onboarding + monthly review)

1. **List channels.** `buffer channels list` → list active services to the user. Flag missing ones (where their audience reportedly is but the service isn't connected).
2. **Ensure Tone Profiles.** For every active channel, confirm a profile exists at `wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md`. Regenerate any that are missing or > 7 days old via `buffer-channel-tone-extraction`.
3. **Define / confirm goals.** ≤3, outcome-linked, with explicit external success criteria ("LinkedIn followers growth → measured in LinkedIn analytics", "trial signups attributed to social → measured in CRM"). Write to `MEMORY → Goals (next 90 days)`.
4. **Define / confirm pillars.** 3–5. Write to `MEMORY → Pillars` as `<name> | tagId: <id> | description`. For each pillar without an existing Buffer tag, create the tag (via the CLI tag-creation command if `buffer schema` exposes one — otherwise ask the user to create them in the dashboard and re-run `buffer-channel-discovery` to capture the new tag ids).
5. **Seed the backlog.** For each pillar, capture 3–5 starting ideas via `buffer ideas create --text "..."` (with the pillar tag id where supported). Use `buffer-ideas-capture` for the per-idea procedure.
6. **Set default cadence per channel.** Posts per week per channel. Write to `MEMORY → Cadence`. The evening queue audit and the post drafter both read this.
7. **File the strategy doc.** Write the full strategy (goals, pillars, audience, cadence, channels) to `wiki/Knowledge/Buffer/Strategy.md`. This is the canonical reference; `MEMORY` carries the pointers.

## Monthly review procedure

The monthly review is **not** on a cron by default — it runs when the co-founder dispatches it. Procedure:

1. **List posts** with `buffer posts list` filtered to the last 30 days per channel, then group locally by channel and tag id.
2. **Volume per channel per pillar** — surface a small table.
3. **Pillar drift** — for each channel, compare observed pillars in the latest Tone Profile to intended pillars in `MEMORY → Pillars`. Flag mismatches.
4. **Goal-progress framing** — Buffer can show output (volume / consistency); the user owes you native-analytics input on outcomes. Ask for the outcome numbers in one message; structure the review around what they bring back.
5. **Recommend adjustments** — pillar mix changes, cadence tweaks, channels to drop or add. **Propose, do not execute** changes to pillars/cadence/channel scope without explicit co-founder sign-off.
6. **File** to `wiki/Knowledge/Buffer/Reports/monthly/YYYY-MM.md`.

## Decision heuristics

- > 3 goals → push to prioritize.
- Goals are all vanity metrics ("more followers") → reframe to outcomes; remind the user Buffer cannot measure followers — native analytics will.
- "Post everywhere" → ask where the audience actually is; only use connected channels that fit.
- No pillars / no tags → define and create them before scheduling anything.
- Observed pillars (Tone Profile) ≠ intended pillars → surface the mismatch in the monthly review and the weekly audit.

## What "good" looks like

≤3 outcome-linked goals; a short list of deliberately chosen connected channels each with a Tone Profile; 3–5 pillars as Buffer tags; a tagged Idea backlog of ≥ 10 items; a confirmed per-channel cadence; a monthly review filed under `wiki/Knowledge/Buffer/Reports/monthly/`.
