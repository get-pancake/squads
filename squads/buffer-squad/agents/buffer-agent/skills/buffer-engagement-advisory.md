---
name: buffer-engagement-advisory
description: Reference for what to say (and what to do) when the user asks Buffer-agent for engagement work, analytics, replies, DMs, comments, mentions, or follower data — none of which Buffer's API exposes. Defines the honest redirect and the community-supporting work the agent CAN do via Buffer.
---

# Buffer engagement advisory — Buffer-agent

A lot of social-media work is conversation: replies, DMs, mentions, comment threads, follower growth. **The Buffer API exposes none of it.** This skill is the agent's playbook for the inevitable asks.

## What Buffer's API cannot do (be explicit)

Through Buffer (and therefore through Buffer-agent), the agent CANNOT:

- Read or reply to comments, @mentions, or DMs on any platform.
- Like / follow / engage with other accounts.
- See follower counts, audience growth, or demographics.
- Pull impressions, reach, engagement rate, clicks, video views, saves, shares.
- Detect comment sentiment, mention sentiment, or social-listening signals.
- Benchmark against competitors.

When asked for any of the above, **redirect in one sentence** and offer the closest thing Buffer-agent CAN do. Do not refuse in a loop; pivot to the supportable work.

## What Buffer-agent CAN do to support community (via Buffer)

- **Schedule community-oriented content** that invites responses (questions, prompts, polls-as-text, "what would you build") — written in the channel's Tone Profile voice. `buffer-post-drafter`.
- **Plan conversational threads** using `PostType: thread` on X / Threads / Mastodon / Bluesky — narrative unfolds, replies arrive natively.
- **Maintain consistency** — the trust-builder. Steady volume, recognizable voice (Tone Profiles), balanced pillars (tags), reliable schedule.
- **Capture community-driven ideas** via `buffer ideas create` — turn a recurring audience question into a planned post. `buffer-ideas-capture`.
- **Time content for responsiveness** — schedule conversation-inviting posts when the user can be online to engage natively. The audit / drafter respects this when the brief asks.
- **Pause or edit a misfit post** — `editPost` / `deletePost` (with co-founder confirmation) when a scheduled post might land badly in a sensitive moment.

## The honest redirect script

When asked: "What's our engagement this week?" / "How many followers did we gain?" / "Did the LinkedIn post about X go viral?" / "Reply to those comments on the Instagram launch post."

Reply, in one breath:

> "Buffer's API only exposes publishing data — what shipped, when, and whether it published cleanly. For engagement, impressions, follower growth, or comment / DM activity, pull native analytics from the platform itself (LinkedIn → 'Page analytics', Instagram → 'Insights', X → 'Premium / Analytics'). I can still give you what Buffer CAN see right now — volume per channel, pillar mix, posts that errored. Want that read while you grab the native numbers?"

Then deliver the Buffer-derivable read via `buffer-weekly-audit` or an ad-hoc `posts` query.

## Community / engagement principles (advisory)

The agent does not execute these — they live natively. But when the co-founder asks for input on engagement strategy:

- **Respond fast.** Most platforms expect a reply within 24h to land in the surfaced thread. Buffer-agent can remind (schedule a "check the mentions" task in the co-founder's queue) but cannot execute.
- **Relationships over reach.** Learn from comments / DMs to inform future content — feed back into `buffer ideas create` and Tone Profile refreshes.
- **Be inclusive, avoid tone-deaf timing.** When sensitive moments hit (industry crisis, holiday, user-base news), surface scheduled posts that might land badly and offer to `editPost` / `deletePost`.

## Outreach (advisory only — Buffer is not an outreach tool)

If asked for outreach (cold DMs, mass DMs, follower-buying, engagement pods, hashtag-hijacking): **refuse and explain.** Buffer is publishing infrastructure, not growth-hack tooling, and engagement-bait kills voice over time. Propose, instead:

1. Warm intro via a mutual connection — agent can draft the intro copy.
2. Personalized cold email with persistent, value-first follow-up — outside Buffer.
3. Thoughtful gift with a handwritten note — outside Buffer.
4. Targeted paid social as last resort — outside Buffer.

Always personalize; never buy followers or use engagement-bait.

## What to tell the user (sample lines for the co-founder's relay)

- "Buffer's API publishes; it doesn't read engagement. Native analytics owns that read."
- "I can keep the queue full and on-voice; replies are yours."
- "Three IG posts came back in error status — the channel needs reconnecting in the Buffer dashboard."
- "I scheduled the launch post; the IG flow needs a manual finish via the Buffer app on your phone."
- "If you tell me what your top 3 LinkedIn posts were last week, I'll fold that into the next weekly audit's observation."
