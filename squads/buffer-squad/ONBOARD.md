---
required_tools:
  - vault_request
required_identities: []
estimated_setup_minutes: 8
---

## Onboarding — buffer-squad (Buffer-agent)

You are the co-founder running this onboarding. The mechanical deploy has completed — agent files, both crons, and the eleven skills are in place. The user was promised ~8 minutes; most of that is them clicking around the Buffer dashboard to grab an API token plus confirming a few voice / pillar decisions.

**Read this discipline before you start a step.** Walk through one step at a time, ask one question per turn, and **do not preview future steps**. Open with one sentence: "Setting up Buffer-agent — I'll install Buffer's CLI, learn how you sound on each channel, and confirm cadence + pillars. Sound good?" Wait for confirmation, then begin Step 1.

### Step 1 — Gate on Buffer prerequisites

Ask, plainly: **"Is your Buffer account live with the channels you care about already connected?"** If no, pause onboarding and direct them to `publish.buffer.com` → connect their channels (X, LinkedIn, IG, etc.) → confirm each shows up in their Channels list. Do not proceed until at least one channel is connected — the agent has nothing to schedule otherwise.

### Step 2 — Collect the Buffer API key

Walk them to: `publish.buffer.com/settings/api` → "Create API key" → copy the value. Then `vault_request` at `team.buffer_api_key` (type `api_key`). Never accept the token in chat — vault only.

### Step 3 — Install and authenticate the Buffer CLI

In Buffer-agent's workspace, run:

```sh
npm install -g @bufferapp/cli
```

Then export the vaulted key into the agent's environment as `BUFFER_API_KEY` (the CLI reads it automatically — no `buffer init` needed in CI-style auth). Verify with one read-only call:

```sh
buffer account
```

If this returns the user's account JSON, you're wired. If it fails:

- **401 / invalid key** → key wrong, expired, or scoped to a different org. Re-issue at `publish.buffer.com/settings/api` and re-vault.
- **`buffer: command not found`** → npm global bin not on PATH; surface the install location.
- **Network / DNS** → pod can't reach `api.buffer.com`. Surface to the user.

Then run `buffer schema` once and capture the live command surface — the agent uses it to discover any commands beyond the documented `account` / `channels` / `posts` / `ideas` (e.g. tag and posting-limits commands whose exact names this skill set does not hardcode).

Do not proceed past Step 3 until `buffer account` succeeds.

### Step 4 — Resolve org and discover channels

Load Buffer-agent's `buffer-channel-discovery` skill and execute it: capture the `organizationId` and `OrganizationLimits` via the appropriate `buffer ...` command surfaced by `buffer schema`; run `buffer channels list` and write each connected channel's `service`, `handle`, and `id` to Buffer-agent's `MEMORY.md` under `## Channels`. Stamp the section header with `DISCOVERED: YYYY-MM-DD`. Without this, every later CLI call fails — channels must be resolved, never guessed.

### Step 5 — Build Tone Profiles per channel (HARD GATE)

**Do not skip this step.** Buffer-agent's drafting skills refuse to compose for a channel without a Tone Profile. Without it, the agent falls back to generic voice and you'll feel it.

Load `buffer-channel-tone-extraction` and execute it for **every channel** in `MEMORY → Channels`. For each: pull the 20 most recent `sent` posts via `buffer posts list`, analyze across the 11 dimensions in the skill, and write `wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md`.

If a channel has < 8 sent posts, mark the profile `confidence: low` and ask the user in chat for a one-sentence voice direction to seed it. If a channel has 0 sent posts (brand-new), skip extraction and capture the user's voice direction directly — note in MEMORY that the channel's profile is user-seeded, not data-derived.

**Verify before moving on:** every entry in `MEMORY → Channels` has a corresponding `wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md`. List the missing ones and re-run before Step 6.

### Step 6 — Confirm strategy: goals, pillars, cadence

This is the most important step alongside Step 5. The agent's drafting and audit work depends on it.

Load `buffer-strategy-and-goals`. Read `wiki/Company/COMPANY.md` and `wiki/Company/ICP.md` if they exist. Then ask the user in **one** turn — not four separate questions:

> "Four quick questions:
> 1. What are the **1–3 outcome goals** for this Buffer presence over the next 90 days? (awareness, leads, community — not vanity metrics)
> 2. What are the **3–5 content pillars** I should organize the queue around?
> 3. **How often** should each channel post? (e.g. 'LinkedIn 3×/week, X daily, IG 2×/week', or 'you decide and I'll review')
> 4. **Audience** — confirm the ICP in one sentence."

Write the answers to Buffer-agent's `MEMORY.md` under `## Goals (next 90 days)`, `## Pillars`, `## Cadence`, and `## Audience`. Then create one Buffer **tag** per pillar via the CLI (use `buffer schema` to find the tag-create command if it exists, or queue the user to create them in the Buffer dashboard). Write each pillar's `tagId` next to its name in MEMORY.

### Step 7 — Pin the cron timezone

Both crons ship pinned to `America/Los_Angeles`. Ask: **"What timezone should the 17:00 evening queue audit and Monday 09:00 weekly report land in?"** Expect an IANA tz. If they want the default, skip. Otherwise edit `crons/jobs.json` in Buffer-agent's installed bundle and replace `tz` on both jobs.

### Step 8 — Dispatch the baseline audit to Buffer-agent (do NOT run it yourself)

**Read this before you act.** The baseline audit is **Buffer-agent's** work, not yours. Spawn a session targeted at `buffer-agent` and let it execute against its own IDENTITY / SOUL / MEMORY. If you run the calls as a `main` subagent, the agent's skills are never loaded and the audit won't follow the conventions.

The task brief: a **baseline channel audit** — load `buffer-weekly-audit`, run it once over the trailing 30 days across every channel in `MEMORY → Channels`. Output: volume per channel, pillar mix per channel (via tag filtering on `buffer posts list`), failed posts (`status: error`), gaps vs. declared cadence, and a one-paragraph tone-drift check comparing the last 5 sent posts to each channel's freshly-built Tone Profile. File to `wiki/Knowledge/Buffer/Reports/baseline/YYYY-MM-DD.md`. Surface a 6–8 line summary to the co-founder. Pre-condition: every channel in `MEMORY → Channels` has a Tone Profile (Step 5).

Dispatch via the tasks plugin with `agent: "buffer-agent"`. Mark `in_progress`. **Verify** before reporting setup-complete: confirm the spawned session's `agent_id` is `buffer-agent`, not `main`. If it isn't, kill it and re-dispatch.

Close by telling the user Buffer-agent is now auditing their account, and confirm the exact daily + weekly schedule using the timezone pinned in Step 7. Be honest in one line that engagement metrics (impressions, follower growth, comments) live in native platform analytics, not Buffer — Buffer-agent will not invent them.
