---
name: buffer-channel-tone-extraction
description: FIRST STEP before composing for any channel. Fetches the 20 most recent published posts on a Buffer channel via `buffer posts list`, analyzes them across 11 dimensions, and emits a per-channel Tone Profile under wiki/Knowledge/Buffer/ToneProfiles/. Every drafting skill loads this profile as a hard constraint.
---

# Buffer channel tone extraction — Buffer-agent

Tone is **channel-specific**: the same brand is punchy on X, polished on LinkedIn, playful on TikTok. This skill builds a separate Tone Profile per channel by reading its real recent posts. **No drafting for a channel without a profile.**

## When to run

- **Onboarding Step 5**: once per connected channel.
- **Weekly**, during the Monday audit, on any channel whose profile is > 7 days old.
- **Whenever the user reports a style shift** (rebrand, new editor, new positioning).
- **On drift flag** from the weekly audit (sent posts violating DO/DON'T rules).
- **Whenever a new channel is connected** mid-cycle.

If a profile is missing or stale at draft time, regenerate it **before** drafting — not after.

## Pre-conditions

- `MEMORY → Channels` is fresh (< 30 days `DISCOVERED:`). The channel's `service` and `channelId` come from there.
- `organizationId` is in `MEMORY → Channels → Organization ID`.

## Step 1 — Fetch the 20 most recent sent posts

Run the CLI:

```sh
buffer posts list \
  --channel-id <channelId> \
  --status sent \
  --sort-field dueAt \
  --sort-direction desc \
  --first 20 \
  --fields id,status,text,sentAt,externalLink,metadata,tags
```

(The exact flag names follow Buffer CLI conventions — verify against `buffer schema` if the live CLI exposes different filter/sort flag names; the schema is authoritative.)

If fewer than 20 sent posts exist, paginate via the CLI's cursor flag (typically `--after <cursor>`) — or if the channel genuinely has < 20 sent posts, broaden the status filter to include `scheduled` to fill, and mark the profile `confidence: low` (note the smaller sample in the deliverable).

If a channel has **0 sent posts** (brand-new), skip extraction entirely. Ask the co-founder for a one-sentence voice direction and seed a profile from that — clearly mark it `confidence: user-seeded, not data-derived`.

## Step 2 — Analyze the sample across 11 dimensions

For each post collect the `text` and the post type (`metadata.type`). Then analyze:

1. **Tone & personality** — formal ↔ casual; serious ↔ playful; authoritative ↔ peer-to-peer; warm/empathetic vs. neutral; promotional vs. educational. Capture 3–5 adjectives that recur.
2. **Voice & POV** — first-person singular ("I") vs. plural ("we") vs. brand-as-third-person; how the audience is addressed ("you", "folks", community nicknames).
3. **Topics & themes** — recurring subjects (cluster into observed pillars). Ratio of educational vs. promotional vs. personal/behind-the-scenes.
4. **Expertise & depth** — beginner-friendly vs. expert; jargon level; whether it explains concepts, cites data, or shares hot takes.
5. **Structure & formatting** — typical length (short/medium/long); line breaks, lists, hooks; thread usage.
6. **Hooks & openers** — how the first line grabs attention (question, stat, contrarian claim, story).
7. **Emoji usage** — none / sparing / heavy; which emojis recur; placement.
8. **Hashtag usage** — count per post, branded vs. generic, placement (inline vs. trailing).
9. **CTAs** — typical calls to action (comment, save, click, follow, reply) and how directly phrased.
10. **Links & media** — frequency of links/attachments; whether context is given before a link; common media types (reel, carousel, image).
11. **Punctuation & quirks** — em-dashes, ALL CAPS for emphasis, ellipses, sign-offs, fragments, recurring phrases.

Quantify where possible (e.g., "avg ~180 chars", "~1.3 hashtags/post", "emoji in 8/20 posts").

## Step 3 — Emit the Tone Profile

Write `wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md`:

```markdown
# Tone Profile — <Brand> on <Service> (channelId: <id>)
_Generated from the <N> most recent sent posts. Confidence: <high/medium/low/user-seeded>. Last refreshed: <YYYY-MM-DD>._

## Voice in one sentence
<e.g., "A knowledgeable but approachable peer who shares practical tips in a warm, lightly witty 'we'-voice.">

## Tone adjectives
<3–5 adjectives, e.g., practical, encouraging, concise, lightly humorous>

## Point of view & audience address
- Person: <I / we / brand-name>
- Audience addressed as: <"you" / community term>

## Topics / pillars (observed)
- <pillar 1> (~X% of posts)
- <pillar 2> ...
- Educational : Promotional : Personal ≈ <e.g., 70:20:10>

## Expertise level
<beginner-friendly / intermediate / expert; jargon: low/med/high; cites data: yes/no>

## Structure & formatting
- Typical length: <chars / lines>
- Openers: <question / bold claim / stat / story>
- Lists & line breaks: <usage>
- Threads: <yes/no, when>

## Emoji
<none / sparing (list) / heavy; placement>

## Hashtags
<count per post; branded vs generic; placement>

## CTAs
<common CTAs and phrasing style>

## Links & media
<frequency; context-before-link habit; common media types>

## Quirks & signatures
<em-dashes, caps, sign-offs, fragments, recurring phrases>

## DO / DON'T (writing rules for this channel)
- DO: <3–6 concrete rules distilled from the above>
- DON'T: <3–6 anti-patterns, e.g., "don't exceed ~2 hashtags", "don't use formal corporate tone">

## 2–3 representative example posts (paraphrased, not copied)
- <short paraphrase capturing structure/tone, NOT a verbatim copy>

## Source
- Sample size: <N>
- Status filter: <sent / sent+scheduled>
- CLI invocation used:
  ```
  buffer posts list --channel-id <id> --status sent ... --fields ...
  ```
```

> **Paraphrase, never copy.** The example section is a style fingerprint, not a content archive. Do not store verbatim post text — capture structure and tone in your own words.

## Step 4 — Index the profile in MEMORY

If `MEMORY → Tone Profiles` doesn't already index this channel's profile, leave the section pointer in place (it points at the `ToneProfiles/` directory; individual files don't need per-channel MEMORY entries). The drafter resolves the file by `<service>-<channelId>`.

If the observed pillars in this profile diverge from `MEMORY → Pillars` (intended pillars), file a one-line note in `memory/YYYY-MM-DD.md` — the weekly audit will surface it as drift.

## Step 5 — Tell the co-founder (in the surface message)

After the first profile, or whenever the user has asked, surface a one-line summary per channel:

> "Tone profile refreshed for <service>/<handle>: <voice in one sentence>. DO/DON'T rules at wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md. Want to review or tweak before I start composing?"

## Refresh policy and edge cases

- **Refresh weekly** during the Monday audit, or after a noticeable style change.
- **Sparse history** (< 8 sent posts): mark confidence `low`, widen status filter to include `scheduled`, tell the user the profile is provisional.
- **Brand-new channel** (0 sent posts): no extraction possible — ask the user for voice guidance, mark `user-seeded`.
- **Mixed authors**: if `author` varies a lot, note voice may be inconsistent and base rules on the dominant pattern.
- **Never** treat low-engagement guesses as fact — this skill reads style, not performance. Performance isn't in the Buffer API; see `buffer-engagement-advisory`.

## How later skills use this

- `buffer-post-drafter` — loads the matching profile and obeys DO/DON'T, POV, emoji/hashtag/CTA norms, and structure when writing `text`. Refuses to draft without a profile.
- `buffer-platform-playbooks` — combines the channel's profile with the service's PostType / metadata to compose a complete post.
- `buffer-weekly-audit` — compares the last 3 sent posts on each channel against the profile and flags DO/DON'T violations as **tone drift**.
- `buffer-strategy-and-goals` — compares observed pillars in profiles against the intended pillars in `MEMORY → Pillars` and surfaces mismatch.
