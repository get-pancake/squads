---
tags: [buffer, social-media, scheduling, content, marketing]
preview_image: https://squads.getpancake.ai/avatars/astronaut.png
---

## What this squad does

Deploys Buffer-agent — a social media operator that drives your Buffer account through the **official Buffer CLI** (`@bufferapp/cli`). It reads how you actually sound on each channel, drafts and schedules on-voice copy across every connected service, keeps your queue topped up, files an honest weekly output report, and surfaces ideas worth posting next.

Before it writes anything for a channel, it builds a **Tone Profile** from your 20 most recent published posts on that channel — so LinkedIn long-form, X punch, IG playfulness each get their own voice. That profile is the gate every drafting pass goes through.

## What you'll need

- A Buffer account with the channels you care about already connected (X, LinkedIn, Instagram, Facebook, Bluesky, Threads, TikTok, Pinterest, YouTube, Mastodon, Google Business, Start Page)
- A **Buffer API token** from `publish.buffer.com/settings/api`
- Node.js 18+ available in the pod (the CLI installs globally via npm)
- ~5 minutes to confirm voice direction, content pillars, and posting cadence

## What you get

- A **per-channel Tone Profile** for every connected channel — voice, topics, formatting, emoji/hashtag/CTA habits, do/don't rules — refreshed weekly
- **Content pillars as Buffer tags**, so the queue mix stays balanced and the agent reports per-pillar volume
- An **evening queue audit** at 17:00 (your timezone): each channel's 7-day depth, gaps flagged against your declared cadence, drafts queued to fill them — posting limits checked before any bulk write
- A **weekly Monday output report** at 09:00: what shipped per channel, per pillar, what's still scheduled, what failed (`status: error`), tone drift vs. profile, queue health
- **On-demand drafting**: ask the co-founder for "five LinkedIn posts about X" — Buffer-agent loads the LinkedIn tone profile, drafts five on-voice posts, `--dry-run` validates each, generates images where useful, then schedules them with the right `mode`
- **Ideas capture** via `buffer ideas create` so recurring angles get filed into Buffer's Create space

## What it deliberately does NOT do

- **No engagement metrics from Buffer.** Buffer's API has no analytics — no impressions, no engagement rate, no follower data. Buffer-agent reports volume and consistency honestly and points you at native analytics for the rest.
- **No replies, DMs, or comment handling.** Buffer's API doesn't expose them. Buffer-agent publishes; engagement is yours to handle natively.
- **No connecting / disconnecting channels.** Buffer-agent works with whatever channels you've connected in the Buffer dashboard.

## How it works

Buffer-agent speaks to Buffer through the official CLI authenticated via `BUFFER_API_KEY` from the vault. It runs on two crons — an evening queue audit (17:00 local) and a Monday morning output report (09:00 local) — and otherwise wakes on dispatched work from the co-founder. Every `buffer posts create` is preceded by the same call with `--dry-run`. Every draft passes through the channel's Tone Profile. Every artifact (tone profiles, audits, reports, drafts) is filed under `wiki/Knowledge/Buffer/` so you can audit what shipped and why.

> **Why a single agent.** Social ops is a coordination problem: voice, calendar, channel mix, and cadence all need to stay in one head. One agent owning the whole loop produces a more coherent feed than a swarm each touching a slice.
