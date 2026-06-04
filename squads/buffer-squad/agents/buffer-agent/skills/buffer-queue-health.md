---
name: buffer-queue-health
description: Procedure for the evening queue audit — measure 7-day queue depth per channel against declared cadence (via the `posts` query), regenerate any stale Tone Profiles, draft and schedule posts to fill gaps (respecting dailyPostingLimits), file the audit. Loaded by the evening-queue-audit cron.
---

# Buffer queue health — Buffer-agent

The evening audit's job is to guarantee tomorrow morning's feed isn't empty. It is **not** a creative session — it is a gap detector that produces just enough on-voice posts to keep cadence.

## Step 0 — Pre-conditions

- `MEMORY → Channels` is fresh (≤ 30 days `DISCOVERED:`). If not, re-run `buffer-channel-discovery`.
- `MEMORY → Cadence` is filled — if it reads "you decide, co-founder reviews", default to: LinkedIn 3/week, X 5/week, IG 2/week, others 1/week. Note the default in `memory/YYYY-MM-DD.md`.
- `MEMORY → Pillars` has tagIds resolved.

If any pre-condition fails, file a one-line note to `memory/YYYY-MM-DD.md` and `NO_REPLY`.

## Step 1 — Measure per-channel queue depth

For each channel in `MEMORY → Channels`, run:

```sh
buffer posts list \
  --channel-id <channelId> \
  --status scheduled \
  --status needs_approval \
  --sort-field dueAt \
  --sort-direction asc \
  --first 50 \
  --fields id,status,dueAt,text
```

(Verify the precise filter/sort flag names via `buffer schema` if the live CLI differs.) Filter the JSON response to posts whose `dueAt` is between `now()` and `now() + 7 days`. Count per channel.

## Step 2 — Compare to cadence

For each channel, compute:

- `target_7d` = declared cadence (posts/week from `MEMORY → Cadence`).
- `actual_7d` = count from Step 1.
- `gap` = max(0, target_7d − actual_7d).

Skip channels where `gap == 0`.

## Step 3 — Refresh Tone Profiles where needed

For each channel with `gap > 0`, check the profile at `wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md`:

- If missing or `Last refreshed:` > 7 days old → regenerate via `buffer-channel-tone-extraction` for that channel.
- Otherwise → continue.

No drafting for a channel without a fresh profile.

## Step 4 — Fill gaps

For each channel with `gap > 0`:

1. Pull recent themes the channel has shipped (last 14 days via `buffer posts list --channel-id <id> --status sent`). Avoid repeating the same angle back-to-back.
2. Pick the next-up pillar from `MEMORY → Pillars` that's been under-represented across the last 14 days on this channel — keeps mix balanced.
3. Generate `gap` post ideas — anchored on the channel's Tone Profile, `MEMORY → Audience`, the pillar, the channel's nature (see `buffer-platform-playbooks`), and any recent context from `wiki/Company/`.
4. Hand each idea to `buffer-post-drafter` (Steps 3–12) which: picks the PostType, drafts, optionally generates media, picks `--mode` / `--scheduled-at` from `buffer-cadence-and-timing`, checks daily posting limits for each (channel, date), `--dry-run`-validates, then runs `buffer posts create` with the pillar tag id.
5. Spread schedule times across the gap window — don't pile drafts on day 1.

## Step 5 — File the audit

Write `wiki/Knowledge/Buffer/QueueAudits/YYYY-MM-DD.md`:

```md
# Queue audit — <YYYY-MM-DD>

## Per-channel depth

| Channel | Handle | Target (7d) | Actual (7d) | Gap | Action |
|---|---|---|---|---|---|
| linkedin | <handle> | 3 | 2 | 1 | 1 draft queued |
| twitter | <handle> | 5 | 5 | 0 | none |
| ... |

## Tone Profiles refreshed
- <service>/<handle>: regenerated (Last refreshed → YYYY-MM-DD)
- ...

## Drafts queued

(per-draft: channel, schedule, PostType, hook line, post id, pillar, link to Drafts/YYYY-MM-DD.md)

## Limit checks

- Daily posting limit passes per (channel, date): yes / no — details
- OrganizationLimits headroom: scheduledPosts <remaining>/<limit>, ...

## CLI invocations

(every `buffer ...` command used, verbatim, with all flags and any `--json` payloads)
```

## Step 6 — Surface a 5–8 line digest

`complete_task` with:

```
Evening queue audit — <date>.
- <channel A>: <actual>/<target> in next 7d, <action>
- <channel B>: <actual>/<target>, <action>
- ...
Queued <N> drafts; refreshed <M> Tone Profiles. Archive: wiki/Knowledge/Buffer/QueueAudits/<date>.md
```

## Step 7 — Daily log + close

Append to `memory/YYYY-MM-DD.md`:

- What was done (gaps found, drafts queued, profiles refreshed).
- What changed (channels that drifted from cadence; channels that look healthy).
- What's still open (drafts that hit the daily posting limit and got spread to other days; `status != connected` channels needing user reconnect; `notification` reminders the user must finish manually).
- First move for the next wake.

## Edge: nothing to do

If every channel is at or above its cadence and no drafting is needed, file the audit with an empty "Drafts queued" section and reply with the single literal token `NO_REPLY` — never write "do not respond". Always still file the audit so the trend over time is auditable.

## Edge: CLI / auth down

If `buffer account` or `buffer channels list` fails outright (network, auth, CLI crash), log the failure to `memory/YYYY-MM-DD.md` (include the exact error) and reply `NO_REPLY`. Do not blind-create posts.

## Edge: hitting a limit

If the daily posting limit blocks all candidate dates for a channel, or `OrganizationLimits` is exhausted: do not silently drop posts. File the gap as "blocked by limits" in the audit, surface to the co-founder in the digest, and propose either spreading further out or upgrading the plan.
