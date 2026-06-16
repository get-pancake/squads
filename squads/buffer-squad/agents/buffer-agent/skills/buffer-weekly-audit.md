---
name: buffer-weekly-audit
description: Procedure for the Monday weekly output report — what shipped (volume per channel + per pillar), failed posts (status error), tone drift vs. profile, queue and limit headroom, 4-week volume trend. HONEST about what Buffer cannot measure (no engagement / impressions / followers — those live in native analytics).
---

# Buffer weekly audit — Buffer-agent

Monday morning report. **What Buffer's API CAN tell us**: volume, consistency, pillar mix, failures, tone drift, queue / limit headroom. **What it CANNOT**: impressions, engagement rate, reach, follower growth, comment sentiment. Do not invent those — the report is honest about Buffer's surface.

## Step 0 — Pre-conditions

- `MEMORY → Channels` is fresh.
- `MEMORY → Pillars` has tagIds resolved.
- Every channel in `MEMORY → Channels` has a Tone Profile file.

If a profile is missing, generate it via `buffer-channel-tone-extraction` before continuing.

## Step 1 — Pull the trailing 7 days, per channel

For each channel:

```sh
buffer posts list \
  --channel-id <channelId> \
  --start-date <ISO8601, now() - 7d> \
  --end-date <ISO8601, now()> \
  --sort-field dueAt \
  --sort-direction desc \
  --first 100 \
  --fields id,status,dueAt,sentAt,text,metadata,tags
```

(Verify filter flag names against `buffer schema` if the live CLI differs.) Paginate via `--after <cursor>` until exhausted.

## Step 2 — Volume per channel

For each channel, count posts with `status: [sent]` in the window. This is the **shipped** count. Also count `status: [error]` separately.

## Step 3 — Volume per pillar

Group `sent` posts by `tags[].id`. Map to pillar names via `MEMORY → Pillars`. Compute per-pillar share of total. Flag any pillar at 0% (under-represented) and any pillar > 50% (over-represented) — both are mix problems worth surfacing.

## Step 4 — Failed posts

For each post with `status: error`, capture:

- Post id, channel, intended `dueAt`, draft text (first 80 chars).
- The `PostPublishingError` / `RestProxyError` reason if exposed by the API (expired auth, media format, per-day limit, notification-only).
- A proposed fix: re-create via the CLI edit or `buffer posts create` with adjusted input, or escalate (e.g. expired channel auth needs user reconnect).

## Step 5 — Tone drift check

For each channel, take the last 3 `sent` posts in the window. Compare each against the channel's Tone Profile DO / DON'T rules. Flag any violation explicitly:

> "On linkedin/<handle>, the post `<id>` violated DO/DON'T rule: 'don't open with a question on LinkedIn — the data showed bold-claim openers outperform questions for this channel'. The post opened with: '<first 60 chars>'."

If a channel has > 2 violations across 3 posts → schedule a Tone Profile refresh (`buffer-channel-tone-extraction`) at end of run; voice may have shifted intentionally.

## Step 6 — Queue and limit headroom

- For each channel: count posts with `status: [scheduled, needs_approval]` and `dueAt` in the next 7 days. This is forward queue depth.
- Compare org's currently-scheduled posts to `OrganizationLimits.scheduledPosts`. Report headroom percentage.
- Flag any channel with `status: expired` or `disconnected` — user must reconnect natively.

## Step 7 — 4-week volume trend

For each channel, pull a wider window — the same `buffer posts list` invocation as Step 1 with `--start-date <ISO8601, now() - 28d>` and `--end-date <ISO8601, now()>`.

Bucket by trailing-7-day windows. Report per-channel: this week vs. last week vs. trailing 28d average. Tag any window with < 5 posts as `small sample — directional only`.

## Step 8 — Write one written observation

Read the data. Pick **one** concrete observation the co-founder can act on:

- A pillar that's drifted (e.g. "Engineering deep-dives are 0% of LinkedIn this week vs. 30% the prior week — likely cause: launch week pulled everything to product news. Worth a deliberate engineering post this week").
- A channel showing systemic errors (e.g. "IG had 3 of 5 posts in `error` status this week — the error message flags expired auth; user needs to reconnect in the Buffer dashboard").
- A tone-drift pattern (e.g. "LinkedIn opened the last 3 posts with questions — the profile says bold-claim openers; worth a profile refresh or a deliberate style decision").

If nothing recurs cleanly, say so honestly. **Do not invent a pattern.**

## Step 9 — Refresh stale Tone Profiles

End of the audit run: for any channel whose profile is > 7 days old, regenerate via `buffer-channel-tone-extraction`. Note in the report which profiles were refreshed.

## Step 10 — File the report

Write `wiki/Knowledge/Buffer/Reports/weekly/YYYY-WW.md`:

```md
# Weekly output report — <YYYY-WW> (<start>–<end>)

> Honest note: Buffer's API does not expose engagement / impressions / follower data. This report covers VOLUME, CONSISTENCY, PILLAR MIX, FAILURES, TONE DRIFT, and QUEUE HEADROOM. For reach / engagement / follower growth, pull native platform analytics.

## Per-channel volume

| Channel | Handle | Sent (7d) | Error (7d) | Forward queue (next 7d) | Status |
|---|---|---|---|---|---|

## Pillar mix
(per-pillar share of sent posts; flags for 0% and > 50%)

## Failed posts (status: error)
(per-post: id, channel, reason, proposed fix)

## Tone drift findings
(per-channel: DO/DON'T violations, with cited post ids)

## 4-week volume trend
(per-channel mini-table; small samples tagged)

## Queue / limit headroom
- OrganizationLimits.scheduledPosts: <current>/<limit> (<headroom>% free)
- Channels with status != connected: <list>

## Observation for this week
<one paragraph>

## Action
(per the observation: pillar to lean into, error to fix, profile to refresh)

## Tone Profiles refreshed this run
- <service>/<handle>: refreshed → YYYY-MM-DD
- ...

## CLI invocations
(every `buffer ...` command used this run, verbatim, including all flags)
```

## Step 11 — Capture follow-ups in Buffer Ideas

For any angle that emerged from the audit (an under-represented pillar worth a deliberate post, a recurring topic worth its own series), hand to `buffer-ideas-capture` — file as a Buffer Idea, tagged with the pillar.

## Step 12 — Surface a 10–12 line digest

`complete_task` with:

- One line on overall volume (sent / error / forward queue).
- Per-channel one-liner.
- Pillar mix in one sentence.
- Failed posts: count and one-line headline for the most impactful (e.g. "1 IG channel needs reconnect").
- Tone drift: one sentence (or "no drift detected").
- The observation (the punchline).
- The recommended action.
- **One explicit line**: "Engagement, impressions, follower numbers — those live in native analytics, not Buffer. Pull them when you want the engagement read."
- Wiki path.

Do not bury the observation. It is the deliverable.

## Step 13 — Daily log + close

Append a 4–6 line digest to `memory/YYYY-MM-DD.md`: what you found, the observation, what's queued / scheduled to follow up, the first move for the next wake.

## Edge: pre-traction / low volume

If total `sent` posts in the trailing 7 days < 5:

- File the report with the volume table, the failures, the queue headroom, and a one-line "still pre-traction, hold for next week".
- Skip the observation section (or scope it to "increase volume to baseline 5 posts / week before drawing conclusions").
- Surface the same one-liner via `complete_task`.
- **Do not invent a pattern.**
