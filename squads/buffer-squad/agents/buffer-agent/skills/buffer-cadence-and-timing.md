---
name: buffer-cadence-and-timing
description: Reference + procedure for choosing the post `mode`, scheduled-at, and scheduling type for each Buffer post via the CLI, and respecting daily posting limits / OrganizationLimits before bulk operations. Loaded by buffer-post-drafter and buffer-queue-health.
---

# Buffer cadence and timing — Buffer-agent

This skill answers two questions for every post: **how** to schedule it (the `--mode` flag) and **when** (`--scheduled-at` or which queue slot). It also enforces the limit checks that have to precede any bulk write.

## Choosing the `mode`

Five values, passed via `--mode <value>` on `buffer posts create` (or as `mode` in a `--json` payload).

| Mode | When to use |
|---|---|
| `addToQueue` | **Default.** Fill the channel's existing time slots (configured in Buffer). Best for steady cadence — let Buffer space posts. |
| `recommendedTime` | When you want Buffer to pick a slot based on its own data. Often better than guessing. |
| `customScheduled` | When the exact time matters (a launch at 09:00 PT, an event-tied post). **Requires `--scheduled-at <ISO8601>`** (timezone-aware). |
| `shareNext` | Jump the queue to the next available slot. Time-sensitive but not instant. |
| `shareNow` | Publish immediately. **Always confirm with the co-founder before calling.** Real-time news, urgent fixes. |

Defaults the drafter and queue-health audit apply:

- Filling a queue gap → `addToQueue` (or `recommendedTime` if the channel's existing slots are sparse).
- A scheduled launch / event → `customScheduled` with a precise `dueAt`.
- An anomaly response / co-founder ask "post this now" → `shareNow`, with confirmation.

## Choosing the `schedulingType`

Two values.

- `automatic` — Buffer publishes for you. **Use whenever the service supports it.**
- `notification` — Buffer reminds the user to post manually (some Instagram / TikTok flows). **The agent cannot complete these.** When this is the only path, schedule the reminder, then surface to the co-founder that a manual finish is required.

Some service / `PostType` combinations only support `notification` — check `buffer-platform-playbooks` per service.

## `--scheduled-at` — when you have to set one

Required only for `--mode customScheduled`. ISO 8601, timezone-aware (e.g. `2026-06-10T09:00:00-07:00`). Rules:

- Minimum: `now() + 60 seconds`. Buffer rejects schedules in the past.
- Maximum: respect the org's `OrganizationLimits.scheduledPosts` headroom — far-future dates push other planned posts over the limit.
- Spacing: don't pile multiple custom-scheduled posts within ~4h on the same channel unless the brief explicitly demands a thread or rapid sequence. Spread.

## Limit checks (mandatory before bulk writes)

Two limits, two checks, both before any batch of `buffer posts create` calls.

### Daily posting limits

The Buffer API exposes a per-channel-per-date "how many more posts can I schedule today?" query. **Find the exact CLI command via `buffer schema` once** (commonly something like `buffer daily-posting-limits` or `buffer posts limits`) and capture it in MEMORY for reuse. For each `(channelId, date)` in the batch:

1. Run the discovered limits command with `--channel-id <id>` and the target date.
2. Compare against how many posts the batch plans for that `(channelId, date)`.
3. If over the limit: spread to the next day(s) — do not silently drop posts.

If `buffer schema` does not surface a limits command, fall back to detection: each `--dry-run` is the de facto limit check (Buffer rejects with a limit-error if you'd exceed). Read the error, spread the batch.

### `OrganizationLimits`

Captured in `MEMORY → Channels → Organization limits` by `buffer-channel-discovery`. Fields:

- `scheduledPosts` — total scheduled posts allowed across the org. Cap.
- `scheduledThreadsPerChannel` — per-channel cap for `thread` PostTypes.
- `scheduledStoriesPerChannel` — per-channel cap for `story` PostTypes.

Before a batch:

1. `buffer posts list --channel-id <id> --status scheduled --status needs_approval` to count currently-scheduled per limit-relevant slice (across all channels for the org-wide cap).
2. Compute headroom = limit − current. If batch size > headroom for any slice, refuse the batch and surface to the co-founder — propose either spreading across more days or upgrading the plan.

If `OrganizationLimits.scheduledPosts` headroom across the org is < 10%, surface it in the next surface message regardless — gives the user time to decide.

## Cadence — translating `MEMORY → Cadence` into schedule decisions

`MEMORY → Cadence` looks like `LinkedIn 3×/week, X daily, IG 2×/week`. The drafter and queue-audit translate that into:

- Per-channel `target_7d` for the queue-health check.
- Per-channel default `mode`:
  - High-cadence (≥ 1/day): `addToQueue` (rely on Buffer slot spacing).
  - Medium-cadence (2–3 / week): `recommendedTime`, then `customScheduled` if the brief is time-specific.
  - Low-cadence (1 / week): `customScheduled` with deliberate `dueAt`.

When cadence is blank ("you decide, co-founder reviews"), default to: LinkedIn 3/week, X 5/week, IG 2/week, others 1/week. Note the default in `memory/YYYY-MM-DD.md`.

## Benchmark reference (advisory only)

Algorithm-driven; treat as starting points, not guarantees. Validate against the brand's own native analytics.

| Service | Reference best time | Best post type | Reference engagement rate |
|---|---|---|---|
| Facebook | ~5 a.m. Mondays | Picture | ~3.6% |
| Instagram | ~3 p.m. Fridays | Reels (reach) | ~4.3% |
| TikTok | ~8 p.m. Sundays | Video | ~4.86% |
| X / Twitter | ~9 a.m. Wednesdays | Text | ~2.15% |
| LinkedIn | ~11 a.m. Thursdays | Carousel / PDF | ~6.5% |

These rates are **measured outside Buffer**. Buffer-agent cannot verify or report them. The user (or the monthly review) folds in native-analytics numbers; we only choose the schedule.

**Two important caveats:**

1. Buffer's `recommendedTime` already encodes optimization on the channel's own slot data — prefer it over hardcoded reference times when in doubt.
2. Weekends on X / Twitter are often an underused, higher-engagement window for many brands (B2B usually skews weekday — but check the channel's Tone Profile evidence).

## Frequency, etiquette, mix

- **Consistency beats volume.** Post several times a day on fast platforms (X), but space them. Don't burst.
- **Promotion ≤ ~20%** of queued content. The rest is educational / community / personal. Pillar tags make this measurable.
- **Don't schedule conversation-inviting posts when the user can't be online to engage natively** — flag the time to the co-founder and offer to shift if they'll be unavailable.

## What to tell the user

When asked "why this time?":

> "I used `--mode <mode>` for <channel>. <Reason: queue slot from `addToQueue` / Buffer's `recommendedTime` pick / explicit `--scheduled-at <ISO>` because <reason>>. The `--dry-run` passed and the daily posting limit for that date had <N> posts of headroom."

Stay specific. The dispatch reasoning is the audit trail.
