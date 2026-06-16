---
name: buffer-post-drafter
description: The core write path. Turns a brief into channel-tailored, on-voice, dry-run-validated, scheduled Buffer posts via `buffer posts create` — gated on per-channel Tone Profiles, per-service PostType / metadata (playbook), cadence rules, and daily posting limits. Use for every dispatched drafting task and to fill queue gaps from the evening audit.
---

# Buffer post drafter — Buffer-agent

Every post Buffer-agent ships goes through this procedure. Skipping the Tone Profile gate, the `--dry-run`, or the daily-posting-limit check is a boundary violation; reread `SOUL.md → Boundaries`.

## Step 0 — Pre-conditions

- `MEMORY → Channels` carries a `DISCOVERED:` stamp ≤ 30 days old. If not, run `buffer-channel-discovery` first.
- `MEMORY → Pillars` has the pillar list with `tagId`s. If not, run `buffer-strategy-and-goals` first.
- `MEMORY → Voice` (via Audience) and `MEMORY → Cadence` are filled. If either reads `(set at onboarding)`, **escalate** — drafting without these is guessing.
- A clear brief from the co-founder, the evening audit (queue gap), or the weekly report (angle to test).

## Step 1 — Resolve target channels

From the brief, pick the channels the post is for. "LinkedIn" → one channel. "everywhere" → expand to every connected channel in `MEMORY → Channels`. **Draft per channel** (one post per channel) — a tailored post outperforms a copy-paste broadcast.

## Step 2 — Tone Profile gate (HARD)

For each target channel:

1. Check `wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md` exists.
2. Check `Last refreshed:` in the profile is ≤ 7 days old.
3. If either fails: regenerate via `buffer-channel-tone-extraction` for that channel **before** continuing.

No profile → no draft. This is non-negotiable.

## Step 3 — Pick the PostType per channel

Load `buffer-platform-playbooks` for the service. Match the brief's intent (reach / depth / conversation / saves / time-sensitive) to a `PostType` the service supports. Note any `schedulingType: notification` requirement up front — surface to the co-founder if the channel + PostType combination requires it, so they know a manual finish is needed.

## Step 4 — Draft, per channel

For each (channel, PostType):

1. Load the channel's Tone Profile. Treat DO/DON'T rules, POV, emoji/hashtag/CTA norms, and structure as **constraints**, not suggestions.
2. Write a draft in that voice, addressed to the audience from `MEMORY → Audience`.
3. Front-load the hook (every platform truncates the fold).
4. End with a CTA, question, or punch consistent with the profile — never a flat tail.
5. Pick the **pillar** from `MEMORY → Pillars` the post belongs to; capture its `tagId` for the `buffer posts create --tag-ids ...` call.
6. If the channel benefits from media (IG, FB, Pinterest, often LinkedIn / X) **and** none was supplied → proceed to Step 5. Otherwise → Step 6.

## Step 5 — Generate media when it helps

If the channel benefits from an image / video and none has been supplied, generate one with `image-generation`. Anchor on:

- The post text (the image must reinforce the point, not be generic stock).
- The channel's Tone Profile (technical, warm, punchy — image style follows).
- The platform format (IG / Pinterest expect higher production; X / LinkedIn often look better with a clean diagram or screenshot).

If the brief calls for a screenshot of a real product surface or chart Buffer-agent doesn't have access to: **do not fabricate.** Surface the gap to the co-founder. A made-up "screenshot" is a publication-risk boundary violation.

Buffer expects assets via `assets: [AssetInput!]!` in `CreatePostInput`. Order matters (carousel cards / multi-image posts use array order). Remember: `assets.videos` and `metadata.{service}.linkAttachment` are **mutually exclusive**.

## Step 6 — Choose `--mode` and `--scheduled-at`

Load `buffer-cadence-and-timing`. For each (channel, draft):

- Default `--mode addToQueue` for steady cadence, `recommendedTime` when slots are sparse, `customScheduled` when timing matters.
- For `--mode customScheduled`, set `--scheduled-at <ISO8601>` ≥ `now() + 1h`. Spread multiple drafts across the cadence window.
- `schedulingType: automatic` whenever supported; `notification` only when the service / PostType forces it (surface to co-founder).

## Step 7 — Limit check (MANDATORY before any create)

1. Run the daily-posting-limits command (discovered via `buffer schema`) for each (channelId, target date) in the batch. If the live CLI does not expose it, the `--dry-run` in Step 8 is the de-facto check — read its error output.
2. If the batch would exceed the limit on any (channel, date): re-spread the batch across days. Re-check.
3. `buffer posts list --channel-id <id> --status scheduled --status needs_approval` to count currently-scheduled per channel; compare batch additions to `OrganizationLimits.scheduledPosts`, `scheduledThreadsPerChannel`, `scheduledStoriesPerChannel`. Refuse the batch if any cap would be breached — surface to the co-founder.

**No `buffer posts create` (non-dry-run) calls before this check passes.**

## Step 8 — Confirm before `shareNow` / large batches

- For any `mode: shareNow` post → **explicit co-founder confirmation** (paste the draft, channel, time; await sign-off).
- For batches of > 5 posts → summarize the batch (per-channel count, pillar mix, schedule window) and await sign-off.
- For an evening-audit auto-fill (cron context) → the cron payload's instruction is the standing approval; proceed.

## Step 9 — Dry-run validate

For each (channel, draft, mode, schedulingType, assets, metadata, tagIds) tuple, run `buffer posts create` **with `--dry-run`** first. Simple text-only post:

```sh
buffer posts create \
  --channel-id <id> \
  --text "<draft>" \
  --mode addToQueue \
  --scheduling-type automatic \
  --tag-ids <pillar-tagId> \
  --dry-run
```

For complex posts (carousel, thread, multiple assets, service-specific metadata), use `--json`:

```sh
buffer posts create --json '{
  "channelId": "<id>",
  "mode": "addToQueue",
  "schedulingType": "automatic",
  "dueAt": "<ISO8601>",
  "text": "<draft>",
  "assets": [ ... ],
  "metadata": { "type": "<PostType>", "<service>": { ... } },
  "tagIds": ["<pillar tagId>"],
  "source": "buffer-squad/buffer-post-drafter",
  "aiAssisted": true
}' --dry-run
```

Read the validation output. Common failures and fixes:

- **Text too long for channel** → tighten the draft (do not "compress" by stripping voice; revise the hook).
- **Schedule in the past** → recompute `--scheduled-at` against `now() + 1h` minimum.
- **Media not supported on channel** → drop the media for that channel, or replace with a still.
- **Channel not found** → re-run `buffer-channel-discovery`.
- **Daily limit exceeded** → spread the batch and re-validate.

If dry-run fails, **fix and re-validate.** Do not skip the dry-run.

## Step 10 — Execute `buffer posts create`

For each tuple whose dry-run passed, run the same command **without** `--dry-run`. Capture the returned `id` and `status` from the JSON response. Expect `status: scheduled` (or `sent` for `shareNow`). If `status: error`, read the error fields and surface — do not retry blindly (idempotency: re-run `buffer posts list --channel-id <id>` to avoid duplicates).

## Step 11 — File the drafts

Append to `wiki/Knowledge/Buffer/Drafts/YYYY-MM-DD.md`:

```md
## <brief title> — <today>

### <service> | <handle> | channelId: <id>
- **Post id**: <id>
- **PostType**: <type>
- **Status**: <scheduled / sent / needs_approval / error>
- **Mode**: <addToQueue / recommendedTime / customScheduled / shareNext / shareNow>
- **Scheduling type**: <automatic / notification>
- **scheduled-at**: <ISO8601 or "queue slot">
- **Pillar**: <pillar name> (tagId: <id>)
- **Text**:
  > <draft>
- **Image**: <path or "none">
- **CLI**:
  ```
  buffer posts create --channel-id <id> --text "..." --mode <mode> --scheduling-type <type> --tag-ids <ids> --dry-run
  buffer posts create --channel-id <id> --text "..." --mode <mode> --scheduling-type <type> --tag-ids <ids>
  ```
  (or the `--json '...'` payload if used)
```

## Step 12 — Report back

`complete_task` with a 5–8 line summary:

- How many posts created across which channels.
- One sentence each on the hook / angle.
- Schedule window (earliest → latest).
- Pillar mix in the batch.
- Any `notification` reminders the user must finish manually.
- Wiki path to the full archive.

Do not paste full drafts back in the surface message — the co-founder reads them on the wiki link, or in Buffer directly when they care to. **Do not surface engagement projections** — Buffer cannot measure them.
