---
name: buffer-channel-discovery
description: Procedure to enumerate the organization and every connected Buffer channel via the CLI, write the registry to MEMORY.md, and stamp it with a DISCOVERED date. Run at onboarding and whenever a CLI call returns "channel not found" or `401`.
---

# Buffer channel discovery — Buffer-agent

Run this procedure once at onboarding, then whenever the channel registry in `MEMORY → Channels` is suspect (a `channel not found` error, a `401`, a user mention of a new connection, no `DISCOVERED:` stamp in the last 30 days).

The output is a refreshed `MEMORY → Channels` (and `MEMORY → Organization`) section, time-stamped, that every downstream skill substitutes from. **Never guess identifiers.**

## Step 0 — Pre-conditions

- Buffer CLI is installed and `BUFFER_API_KEY` is set. Verify with one read-only call:
  ```sh
  buffer account
  ```
- Run `buffer schema` once if you don't have a fresh memory of the surface — discover the precise organizations command, the channels command (`buffer channels list`), and the tags listing command before using them.

If `buffer account` fails, **escalate** rather than proceed — a registry built without auth is empty and would silently disable the whole squad.

## Step 1 — Resolve the organization

From `buffer schema`, find the organizations-listing command (typical name forms: `buffer organizations list`, `buffer orgs list`). Run it with `--fields id,name,limits` (or the equivalent fields the schema exposes). Capture for each org:

- `id` (the `OrganizationId`).
- `name`.
- `limits` — `channels`, `members`, `scheduledPosts`, `scheduledThreadsPerChannel`, `scheduledStoriesPerChannel`, `generateContent`, `tags`.

If multiple orgs are returned, ask the co-founder which one this squad operates against (and only then). Most setups have one — pick it without asking.

Write to `MEMORY → Channels`:

```
## Channels
→ Organization ID: <id>
→ Organization name: <name>
→ Organization limits: scheduledPosts=<n> / scheduledThreadsPerChannel=<n> / scheduledStoriesPerChannel=<n> / tags=<n>
```

## Step 2 — List every connected channel

```sh
buffer channels list --fields id,service,handle,status
```

Each entry has at minimum:

- `id` — the `ChannelId`. The value `--channel-id` takes elsewhere.
- `service` — `instagram` / `facebook` / `twitter` / `linkedin` / `pinterest` / `tiktok` / `googlebusiness` / `startPage` / `mastodon` / `youtube` / `threads` / `bluesky`.
- `handle` — the user's display name on that platform.
- `status` — typically `connected` / `expired` / `disconnected` / `paused`.

Filter to channels with `status: connected`. Note any non-connected channels in `memory/YYYY-MM-DD.md` so the co-founder knows to reconnect them — Buffer-agent cannot reconnect channels itself.

## Step 3 — Write the registry to MEMORY

Append under `## Channels`:

```
→ DISCOVERED: YYYY-MM-DD
→ <service> | <handle> | channelId: <id> | status: <connected/expired/disconnected>
→ <service> | <handle> | channelId: <id> | status: <connected/expired/disconnected>
...
```

Stamp `DISCOVERED:` with today's date (UTC). Sort entries by `service` then `handle` for stability.

## Step 4 — Discover existing tags (for pillars)

From `buffer schema`, locate the tags-listing command. Run it. Write each tag as `→ <tag name> | tagId: <id>` under `## Pillars` in MEMORY — even before the user has decided which are pillars. They'll need them in `buffer-strategy-and-goals`.

If the CLI doesn't expose tag listing, note it in MEMORY and surface to the co-founder so the user creates pillar tags in the Buffer dashboard manually.

## Step 5 — Surface anomalies

If any of the below are true, file a one-line entry in `memory/YYYY-MM-DD.md` and (when running outside a cron) surface them to the co-founder:

- A channel disappeared compared to the previous registry — flag for tone-profile cleanup.
- A new channel appeared — congratulate, ask whether `MEMORY → Cadence` should include it, and generate a Tone Profile via `buffer-channel-tone-extraction`.
- Any channel has `status != connected` — reconnect required by the user in the Buffer dashboard.
- `OrganizationLimits.scheduledPosts` headroom (limit minus currently-scheduled) is < 10% — surface so the user can decide.

## Step 6 — Verify

Sanity-check by running one read-only call against the first channel id you wrote:

```sh
buffer channels get --id <first-channel-id>
```

If it returns the channel object, the id is wired. If it 404s, the id you stored is wrong — re-run Step 2 and rebuild.

## When to re-run

- Onboarding Step 4 (initial discovery).
- Any time a downstream call returns `channel not found` / `401` — the registry telling you it's stale.
- When the user tells the co-founder they connected or disconnected a channel.
- Weekly audit, on a rolling 30-day refresh schedule. Do not re-run on every wake — it's a no-op cost.
