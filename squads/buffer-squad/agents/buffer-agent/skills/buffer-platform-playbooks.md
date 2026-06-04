---
name: buffer-platform-playbooks
description: Reference for per-service Buffer publishing — PostType, metadata fields, automatic vs notification publishing, and tactical guidance. Loaded by buffer-post-drafter for every composition pass.
---

# Buffer platform playbooks — Buffer-agent

This skill is reference. For every channel the drafter writes to, look up the service block here, then combine with the channel's Tone Profile (`buffer-channel-tone-extraction`) and the cadence rules (`buffer-cadence-and-timing`).

**Cross-service rules** (apply to every post, every service):

- Apply the channel's Tone Profile (voice, emoji/hashtag/CTA norms, structure) to all `text`.
- Pick a `PostType` the service supports. Don't request `reel` on Twitter.
- `assets.videos` and `metadata.{service}.linkAttachment` are **mutually exclusive**.
- If a service requires `schedulingType: notification`, tell the user a manual finish step is needed — the agent cannot complete those.
- The API cannot edit channel / page profile fields or connect new channels — advise the user to do those natively.

## Instagram (`instagram`)

- **PostTypes**: `post`, `reel`, `story`, `carousel`.
- **Metadata**: geolocation, user tags, `InstagramStickerFields` for reminder (notification) publishing.
- **Publishing**: some flows require `schedulingType: notification` — Buffer reminds the user to finish in-app; agent can't auto-publish. Use `automatic` where supported.
- **Tactics**: reels for reach, carousels for saves, stories for intimacy. Strong hook in the first line of the caption. Instagram SEO + relevant hashtags in `text` (count per channel's Tone Profile). No clickable links in captions — route to "link in bio" copy.

## TikTok (`tiktok`)

- **PostTypes**: `post` (video).
- **Publishing**: may be `notification` depending on account type — warn the user if a manual step remains.
- **Tactics**: native vertical video; episodic series (organize via playlists natively); patience — traction can take months; TikTok SEO matters; first 2 seconds carry the hook.

## LinkedIn (`linkedin`)

- **PostTypes**: `post`, `carousel` (document).
- **Metadata**: `linkAttachment`, annotations (mentions).
- **Tactics**: documents / carousels and professional insight perform best. Front-load the hook in the first 2 lines (LinkedIn truncates the "see more" fold around line 3). The Company Page profile (logo, description, URL, size, industry, type, location) lives natively — the API can't edit it, so flag any gaps to the user.

## X / Twitter (`twitter`)

- **PostTypes**: `post`, `thread`.
- **Metadata**: `TwitterPostMetadata`, retweet metadata; threads via threaded post inputs (list of replies).
- **Constraints**: 280-char hard cap per post. Links count toward the limit (via t.co).
- **Tactics**: video and text both strong; great for learnings and real-time commentary; put context in the post (use `linkAttachment` rather than dropping bare URLs).

## Threads / Mastodon / Bluesky (`threads`, `mastodon`, `bluesky`)

- **PostTypes**: `post`, `thread`.
- **Tactics**: conversational, native tone. Bluesky is decentralized — Buffer supports scheduling / crossposting. Check `buffer channels get --id <id>` for the service-specific text limit if unsure.

## Pinterest (`pinterest`)

- **PostTypes**: `post` (pin).
- **Metadata**: target **board** (required), link, title (`PinterestPostMetadataInput`).
- **Tactics**: high-quality vertical images, keyword-rich titles / descriptions, correct board.

## Facebook (`facebook`)

- **PostTypes**: `post` (+ `PostTypeFacebook` variants).
- **Metadata**: `linkAttachment`, annotations.
- **Tactics**: pictures outperform text and video on Facebook on average.

## Google Business (`googlebusiness`)

- **PostTypes**: `whats_new`, `offer`, `event` (`PostTypeGoogleBusiness`).
- **Metadata**: offer / event / whats-new specifics, CTA action type.
- **Tactics**: short, location-anchored, action-oriented. Each post type has a specific CTA semantic.

## YouTube (`youtube`)

- **PostTypes**: `post`, `short`.
- **Metadata**: title, privacy (`YoutubePrivacy`), category, license.
- **Tactics**: shorts for discovery; titles matter as much as the video itself.

## Start Page (`startPage`)

- A Buffer feature for the brand's link-in-bio page. Apply Tone Profile copy; treat as a single "channel" with its own scheduling rules.

## Picking the right PostType per brief

When the brief is "post about X", pick the `PostType` the service rewards for the intent:

- **Reach / discovery** → Instagram `reel`, TikTok video, YouTube `short`, X `post`.
- **Depth / authority** → LinkedIn `carousel`, X `thread`, YouTube long `post`.
- **Conversation** → X `thread`, Threads / Mastodon / Bluesky `thread`, Instagram `story` with stickers.
- **Saves / reference** → Instagram `carousel`, LinkedIn `carousel`, Pinterest `post`.
- **Time-sensitive announcement** → `shareNow` (with co-founder confirmation) on the channels with highest real-time audience (X usually).

## Notification-only quirks

If `schedulingType: notification` is the only path for a given combination (e.g. some IG flows, some TikTok account types), the agent **cannot complete the publish**. Schedule the reminder via `buffer posts create --scheduling-type notification`, then surface to the co-founder:

> "Scheduled an IG Story reminder for <handle> at <time>. This service requires a manual finish in the Buffer app on your phone — please tap through when the reminder fires."
