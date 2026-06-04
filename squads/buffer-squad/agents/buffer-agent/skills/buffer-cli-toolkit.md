---
name: buffer-cli-toolkit
description: Reference for operating the official Buffer CLI (@bufferapp/cli) — install, env-auth, `buffer schema` discovery, JSON output + `--fields`, `--dry-run` discipline, the documented command surface, the underlying GraphQL vocabulary (enums + IDs + constraints) the CLI wraps, and the safe-publish loop. Load this whenever you're about to run a non-trivial Buffer command or when the CLI behaves unexpectedly.
---

# Buffer CLI toolkit — Buffer-agent

This skill is reference, not procedure. Load it when you need to remember the command surface, the enums, the IDs, or the safe-publish loop. Other skills (drafter, queue audit, weekly report) link back here.

Buffer ships fast. If a command name in this file no longer matches the live CLI, **trust the live CLI** (run `buffer schema` or `buffer --help`) and update this skill — or escalate the drift to the co-founder.

## Install

The CLI is published as `@bufferapp/cli` on npm and requires Node.js 18+:

```sh
npm install -g @bufferapp/cli
buffer --version
```

If `buffer` is not on PATH after install, the npm global bin directory is missing from PATH. Surface to the co-founder rather than papering over with absolute paths.

## Authentication

Two modes:

1. **Interactive** (`buffer init`) — stores token, default org, and timezone in a global config file. **Don't use this in the pod** — it's for local human-driven setups.
2. **Environment variable** (`BUFFER_API_KEY`) — used for CI, containers, and Pancake. This is the mode the squad operates in. The vault key `team.buffer_api_key` is exported to the agent environment as `BUFFER_API_KEY` and the CLI reads it automatically — no `buffer init` needed.

Verify auth with one read-only call:

```sh
buffer account
```

Returns the account JSON on success.

## Output shape

Every command outputs **structured JSON** to stdout — designed for scripts and agents, not for humans. Pipe through `jq` when you need a specific field. Use `--fields <a,b,c>` (GraphQL-style field selection) to keep payloads small and operations cheap.

## The schema command (discovery)

`buffer schema` lists every command, every argument, and every available field — the live tool surface. **Run it at the start of any session where commands feel unfamiliar.** Trust the live schema over this skill's memory of the surface.

Specifically, anything not in the *documented commands* list below — e.g. organization queries, tag mutations, daily-posting-limits, post edit / delete — must be discovered via `buffer schema` before use. Do not guess command names.

## Documented commands

The Buffer CLI documents at least these. They are safe to call directly.

**Account & channels:**

```sh
buffer account                                                 # account info
buffer channels list                                           # all connected channels
buffer channels list --fields id,service,handle,status         # field selection
buffer channels get --id <channel-id>                          # one channel in detail
```

**Posts (read):**

```sh
buffer posts list --channel-id <id>                                          # scheduled / sent posts
buffer posts list --channel-id <id> --fields id,status,dueAt,sentAt,text,metadata,tags
buffer posts get --id <post-id>                                              # one post in detail
```

**Posts (write):**

```sh
buffer posts create --channel-id <id> --text "..." --scheduled-at <ISO8601> --dry-run
buffer posts create --channel-id <id> --text "..." --scheduled-at <ISO8601>
buffer posts create --json '<full-json-payload>'                             # for complex / multi-asset / threaded
```

**Ideas:**

```sh
buffer ideas create --text "..."                                             # save to Buffer's Create space
```

## Commands to discover via `buffer schema`

These exist in Buffer's underlying API but the precise CLI names may vary by version. **Use `buffer schema | jq` to locate the exact name and argument shape before use** — do not invent command names.

- **Organizations** — used by `buffer-channel-discovery` to capture `organizationId` and the `OrganizationLimits` object.
- **Tags** — list and (where supported) create. Used by `buffer-strategy-and-goals` for the pillar-tag taxonomy.
- **Daily posting limits** — query per `(channel, date)` how many posts the API will still accept. Used by `buffer-cadence-and-timing` and `buffer-post-drafter` before bulk writes.
- **Posts edit / delete** — modify an existing post or delete it. Used by `buffer-weekly-audit` to recover from `status: error` and by ad-hoc co-founder requests. **Delete is state-changing — confirm first.**

If a command name in this category isn't surfaced by `buffer schema`, the operation isn't currently available via CLI — surface the gap to the co-founder, do not invent.

## Underlying API vocabulary (enums, IDs, constraints)

The CLI wraps Buffer's GraphQL API. The CLI's JSON inputs and outputs use the same vocabulary — knowing it is required for `--json` payloads and for reading errors.

**Identifiers (always resolve, never guess):** `AccountId`, `OrganizationId`, `ChannelId`, `PostId`, `IdeaId`, `TagId`, `DraftId` are MongoDB ObjectIds. Standard flow: `buffer channels list` → capture `id` per channel → use as `--channel-id` everywhere.

**`Service` enum (12):** `instagram`, `facebook`, `twitter`, `linkedin`, `pinterest`, `tiktok`, `googlebusiness`, `startPage`, `mastodon`, `youtube`, `threads`, `bluesky`.

**`PostType` enum (10):** `post`, `reel`, `story`, `short`, `whats_new`, `offer`, `event`, `carousel`, `ghost_post`, `thread`. Varies by service — see `buffer-platform-playbooks`.

**`ShareMode` enum (5)** — the `--mode` flag (or `mode` in JSON):

- `addToQueue` — fill the channel's existing time slots. **Default for steady cadence.**
- `shareNext` — jump the queue (time-sensitive but not instant).
- `shareNow` — publish immediately. **Confirm with co-founder before calling.**
- `customScheduled` — exact time; **requires `--scheduled-at <ISO8601>`** (or `dueAt` in JSON).
- `recommendedTime` — let Buffer pick an optimal slot.

**`SchedulingType` enum (2):**

- `automatic` — Buffer publishes. Use whenever supported.
- `notification` — Buffer reminds the user to post manually (some IG / TikTok flows). **The agent cannot complete these.** Warn the user that a manual finish is required.

**`PostStatus` enum (6):** `draft`, `needs_approval`, `scheduled`, `sending`, `sent`, `error`.

**Post entity fields** (in JSON outputs and in `--fields`): `id`, `status`, `via`, `schedulingType`, `author`, `isCustomScheduled`, `createdAt`, `updatedAt`, `dueAt`, `sentAt`, `text`, `externalLink`, `metadata` (PostType + service-specific detail), `tags` (`{ id, name }`).

**`OrganizationLimits` fields:** `channels`, `members`, `scheduledPosts`, `scheduledThreadsPerChannel`, `scheduledStoriesPerChannel`, `generateContent`, `tags`. Captured by `buffer-channel-discovery` into `MEMORY → Channels → Organization limits`.

## CreatePost JSON payload (when `--json` is needed)

For complex posts (carousel, thread, multiple assets, service-specific metadata), use `buffer posts create --json '<payload>'`. The payload shape:

```
{
  "channelId": "<id>",
  "mode": "addToQueue",                          # or recommendedTime / customScheduled / shareNext / shareNow
  "schedulingType": "automatic",                 # or notification
  "dueAt": "<ISO8601>",                          # only when mode is customScheduled
  "text": "<draft>",
  "assets": [ ... ],                             # ordered images / videos
  "metadata": { "type": "<PostType>", "<service>": { ... } },
  "tagIds": ["<pillar tagId>"],
  "source": "buffer-squad/buffer-post-drafter",
  "aiAssisted": true
}
```

**Mutually exclusive:** `assets.videos` and `metadata.{service}.linkAttachment`. A post is either a video post or a link-card post, not both.

## Out-of-scope requests (does not exist in Buffer's API)

- Analytics / insights / metrics / impressions / engagement-rate.
- Comments, replies, mentions, DMs.
- Follower counts, audience demographics, competitor data, social-listening.

When asked, redirect to native platform analytics in one sentence — see `buffer-engagement-advisory`. Never invent.

## The `--dry-run` discipline

**Every `buffer posts create` is preceded by the same call with `--dry-run` first.** Buffer's `--dry-run` validates the payload — auth, channel existence, text length per channel, media compatibility, schedule time — without calling the API. The contract:

1. Build the command with the desired flags.
2. Append `--dry-run`. Run it.
3. If it exits 0 with no validation errors → run again without `--dry-run`.
4. If it returns errors → fix the payload, dry-run again, only then create.

A failed dry-run is not a reason to bypass the dry-run. If validation insists a post is bad, the post is bad — fix it, don't force it.

## The safe publish loop

Every write follows the same loop:

1. **Resolve context** — `buffer account`, the organizations command (discover via `buffer schema`), `buffer channels list`. Pull from `MEMORY → Channels` if fresh (< 30 days `DISCOVERED:`); otherwise re-run discovery.
2. **Tone Profile gate** — for the target channel, confirm a profile exists at `wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md` and is ≤ 7 days old. Regenerate via `buffer-channel-tone-extraction` if missing or stale.
3. **Select channel(s)** — match the brief to a known `channelId`. If the service isn't connected, stop and ask the user to connect natively.
4. **Compose** — build `text` in the channel's voice (per Tone Profile), select `PostType` per service (see `buffer-platform-playbooks`), attach assets and metadata, set `tagIds` for the pillar.
5. **Choose scheduling** — pick `mode` and `schedulingType` (see `buffer-cadence-and-timing`).
6. **Check limits** — for bulk or same-day scheduling, query the daily-posting-limits command (discovered via `buffer schema`) and respect the `OrganizationLimits` captured in `MEMORY`.
7. **Confirm with the co-founder** when the brief is not strictly within an already-approved cron — especially for `mode shareNow` and any delete.
8. **Dry-run validate** — `--dry-run` first.
9. **Execute** — `buffer posts create` (or the edit command). Capture the returned post id and `status`.
10. **Verify** — confirm `status: scheduled` (or `sent` for `shareNow`); if `error`, read the error fields and report.

## Error & limit handling

- **`PostStatus = error`** → inspect the error fields in the returned JSON. Common causes: expired channel auth, media format / size, per-day limit, notification-only channel. Report cause + fix; offer edit or re-create.
- **Limit reached** → spread posts across days or surface to the user. **Never silently drop posts.**
- **`schedulingType: notification`** → tell the user a manual finish is required.
- **Idempotency** → before retrying a failed create, run `buffer posts list --channel-id <id>` and check for duplicates.

## Citing the CLI

Every wiki report includes the `buffer ...` invocations used, verbatim — full commands with their flags and (for `--json`) the payload. Future-you (or the co-founder) re-running them is the audit trail. Do not summarize "I called the API to fetch posts"; paste the exact command.

## Cross-references

- **`buffer-channel-discovery`** — initial / re-resolution of org + channel registry.
- **`buffer-channel-tone-extraction`** — the gate before any drafting.
- **`buffer-platform-playbooks`** — per-service `PostType` + metadata reference.
- **`buffer-cadence-and-timing`** — `mode` / scheduled-at / posting-limits decisions.
- **`buffer-post-drafter`** — the drafting procedure that ties them all together.
- **`buffer-engagement-advisory`** — what to say when asked for analytics or replies.
