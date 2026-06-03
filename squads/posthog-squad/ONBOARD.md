---
required_tools:
  - vault_request
  - mcp_install
required_identities: []
estimated_setup_minutes: 10
---

## Onboarding — posthog-squad (PostHog-agent)

You are the co-founder running this onboarding. The mechanical deploy has completed — agent files, both crons, and the six skills are in place. The user was promised ~10 minutes; most of that is them clicking around PostHog Settings, not waiting on you.

**Read this discipline before you start a single step.** This onboarding has historically over-shared. The user is busy and reading from their phone half the time. They don't want a feature list — they want their analyst running. Walk through one step at a time, ask one question per turn, and **do not preview future steps**. The two failure modes to avoid:

- *Dumping the whole script up front* — "here's everything we'll do" lists overwhelm and cause the user to bail before step 1.
- *Listing every optional capability* — the squad ships with three add-ons (release tracking, auto-cohorts, auto-tasks) that are deliberately disabled by default. Do not surface them during onboarding. Step 9 mentions them in one line at the end, that's it.

Open with one sentence: "Setting up PostHog-agent — I'll need a few things from your PostHog account, then we'll agree on which events matter. Sound good?" Wait for confirmation, then begin Step 1. Move at the user's pace.

### Step 1 — Gate on PostHog prerequisites

Ask, plainly:

1. **"Is PostHog already deployed and receiving events from your product?"** If no, pause onboarding and direct them to posthog.com → install the SDK for their stack → confirm events appear in the **Live events** view. Do not proceed until events are flowing — there is nothing to analyze otherwise.
2. **"Which PostHog do you use — Cloud US, Cloud EU, or self-hosted?"** Record the answer; you'll need the host URL in Step 2.

### Step 2 — Collect PostHog credentials via vault_request

Group these into one ask — don't ping-pong. For each, use `vault_request`; never have the user paste a key into chat. After you submit the API key, I'll auto-resolve your project ID from it — no need to look it up manually.

- `team.posthog_host` — `https://us.posthog.com`, `https://eu.posthog.com`, or their self-hosted base URL. Type `string`. If the user just says "EU" or "US", pre-fill `https://eu.posthog.com` or `https://us.posthog.com` respectively.
- `team.posthog_api_key` — a **personal API key** with read access. Walk them to: PostHog → Settings → **Personal API keys** → "Create personal API key" → scope it to their project → grant *read* on **Query**, **Insight**, **Event definition**, **Action**, **Person**, **Cohort**. Type `api_key`. Tell them: never the project's *write* key, never an org-wide key with delete scopes — PostHog-agent reads, it does not mutate.

**After the user submits the API key, auto-resolve the project ID** — don't make them hunt for it in Settings:

1. Call `GET {team.posthog_host}/api/projects/` with the personal API key as a Bearer token (header `Authorization: Bearer <team.posthog_api_key>`) via `web_fetch`.
2. Parse the JSON response. The projects live in the `results` array, each with an `id` and a human-readable `name`.
   - **If there's exactly one project**, take its `id` directly — no need to ask.
   - **If there's more than one**, don't guess. Show the user the project **names** (not the numeric IDs — those mean nothing to them) and ask which one PostHog-agent should watch. Map their choice back to that project's `id`.
3. Store the resolved `id` in the vault as `team.posthog_project_id` (type `string`).

If the call fails (401 → bad/expired key, 403 → missing scope, or an empty `results` array → key not scoped to any project), surface the exact error and send the user back to re-issue the API key before continuing. Don't fall back to asking for the project ID by hand — fix the key.

### Step 3 — Install the PostHog MCP

Use `mcp_install` to install PostHog's official MCP (`@posthog/agent-toolkit` MCP, published by PostHog). Configure it with:

- `POSTHOG_API_KEY` ← `team.posthog_api_key`
- `POSTHOG_HOST` ← `team.posthog_host`
- `POSTHOG_PROJECT_ID` ← `team.posthog_project_id`

If the MCP exposes a `--read-only` flag (current versions do), pass it. PostHog-agent must not be able to mutate the project.

Confirm in the install output that the MCP starts cleanly and lists tools that include at minimum: an event-definition listing tool, an insight/query execution tool (HogQL), and a person/cohort listing tool. If the tools surface looks different, look it up via `web_fetch` against `posthog.com/docs/model-context-protocol` rather than guessing — PostHog ships fast and the tool names move.

### Step 4 — Verify with a read-only call

Through the freshly installed MCP, run one read-only call: list 10 event definitions for the configured project. If it succeeds, you're wired. If it fails:

- **401 / invalid key** → key wrong, expired, or scoped to a different project. Send back to Step 2.
- **403 / missing scope** → personal API key missing the read scopes named in Step 2. Re-issue.
- **404 / project not found** → wrong `POSTHOG_PROJECT_ID` or host. Re-check both.

Do not proceed past this step until the verification call succeeds. Surface the exact error to the user.

### Step 5 — Reconcile ICP and company goal

Open `wiki/Company/COMPANY.md` and `wiki/Company/ICP.md` if they exist. Read what's already on file, then ask the user to confirm two things in plain language:

- **"In one sentence, who is the ICP?"** — write the answer to PostHog-agent's `MEMORY.md` under `## ICP`.
- **"In one sentence, what's the single goal of the company over the next 90 days?"** (e.g. "hit 200 weekly active users", "ship paid conversion above 5%"). Write it to PostHog-agent's `MEMORY.md` under `## Goal (next 90 days)`.

If both are already documented in the company wiki and the user confirms they're still current, just point PostHog-agent's `MEMORY.md` at those wiki paths and move on. Don't duplicate prose.

### Step 5.5 — Run the schema probe (hard gate)

**Do not skip this step.** Every analysis the agent runs after onboarding substitutes tenant-specific values out of `MEMORY → PostHog shape`. If the probe doesn't run, the agent falls back to hardcoded guesses — engaged/dying user lists come back as opaque UUIDs instead of human handles, queries that depend on `$identify` behavior silently misbehave, and small-volume tenants get treated as if they had stable data.

Load `posthog-discovery` skill, **execute its §0.5 procedure end to end** (probe person identification model, resolve `display_handle_path`, person-on-events mode, session signal availability, volume floor, autocapture status), then write each resolved value into PostHog-agent's `MEMORY.md → PostHog shape` and stamp the section header with `PROBE_COMPLETE: YYYY-MM-DD` so later runs can verify the probe actually ran.

**Verify before moving on:** open `MEMORY → PostHog shape` and confirm every line has a real value (not the placeholder text from the seeded template). If any line still reads `(identified | anonymous_only)` or similar, the probe didn't run — re-execute §0.5 before Step 6.

### Step 6 — Agree on the north-star events

This is the most important step in the entire onboarding. The daily digest is only useful if the events it counts mean "this user got real value".

Run a discovery pass through the MCP first, *silently* (don't dump the raw list at the user):

1. List the top ~50 event definitions in the project, sorted by 30-day volume.
2. Drop the autocaptured noise (`$pageview`, `$autocapture`, `$rageclick`, `$identify`, `$set`, `$opt_in`, `$exception`).
3. From what remains, prepare a short shortlist of 5–8 events worth considering as north-star, plus your best guess at which is the signup event (usually contains "sign", "register", or "account").

Then ask the user in **one** turn — not three separate questions back-to-back. Present the shortlist as a clean Slack list and ask all three event questions together:

> "I scanned your project and these are the events that look most product-meaningful:
>
> {shortlist of 5–8 events with one-line inferred meaning each}
>
> Three quick questions:
> 1. Which 1–3 of these mean **'this user actually got value'**? (north-star events)
> 2. Which **single** event means **'this new signup is now activated'**? (often the first occurrence of one of #1)
> 3. Which event fires when a **brand-new user signs up**? (looks like `<your best guess>` from the shortlist — confirm or correct)"

Store the answers in vault:
- `team.posthog_north_star_events` — comma-separated event names (string).
- `team.posthog_activation_event` — single event name (string).
- `team.posthog_signup_event` — single event name (string). If the user genuinely has no signup event (auth-less product), store empty — the funnel debugger will be disabled, the rest of the squad still works.

Also write all three to PostHog-agent's `MEMORY.md` under `## North-star events`, `## Activation event`, `## Signup event` — each with a one-line *why* in the user's words.

**If the user is stuck on the north-star pick**, don't push. Pick the single highest-distinct-persons non-autocapture event as a provisional placeholder, note `provisional: true` in MEMORY, and tell them you'll revisit after the first weekly digest. The first week will be noisier than usual.

### Step 7 — Pin the cron timezone

The two crons ship pinned to `America/Los_Angeles`. Ask the user, plainly: **"What timezone should the 09:00 daily digest and the Monday 10:00 weekly recap land in?"** Expect an IANA tz (`Europe/Paris`, `America/New_York`, etc.).

If they want the default, skip — leave both crons as LA. Otherwise edit `crons/jobs.json` in PostHog-agent's installed bundle: replace the `tz` field on both `daily-posthog-analysis` and `weekly-posthog-recap` with the user's tz. Confirm the new schedule back to them in one line so they know exactly when to expect the digest.

### Step 8 — Dispatch the baseline scan to PostHog-agent (do NOT run it yourself)

**Important — read this before you act.** This step is the most common place this onboarding gets the agent architecture wrong. The baseline scan is **PostHog-agent's** work, not yours. You are the cofounder; you do not impersonate squad agents. Spawn a session targeted at `posthog-agent` and let it execute against its own IDENTITY/SOUL/MEMORY/HEARTBEAT. If you run the queries as a `main` subagent, the agent's loaded skills (`posthog-discovery`, `posthog-daily-analysis`, `posthog-mcp-toolkit`) are never in context, the per-agent MEMORY isn't read, and the report ends up missing the schema-probe-aware substitutions and the HogQL-in-report rule. (This has happened in the wild — fixed in v0.1.1.)

The task brief: a **baseline analytics scan** — current DAU/WAU/MAU, north-star event volume for the last 30 days with WoW deltas, activation rate of the last 4 weeks of signups, top 10 most engaged users this week, and a first-pass list of users likely to churn (previously-active accounts with a sharp recent drop in north-star event count). Output: a single `wiki/Knowledge/PostHog/Reports/baseline/YYYY-MM-DD.md` (including the verbatim HogQL used) plus a 6–8 line summary surfaced to the co-founder. Pre-condition: §5.5 schema probe must be complete (see `MEMORY → PostHog shape`).

Dispatch it via the tasks plugin with `agent: "posthog-agent"` (the exact agent id from `manifest.agents`). Mark the task `in_progress`. Don't leave it for tomorrow's 09:00 cron — the user is here and the first impression matters.

**Verify before reporting setup-complete:** look up the spawned session and confirm its `agent_id` is `posthog-agent`, not `main`. If it isn't, you spawned the wrong target — kill it and re-dispatch with the correct agent id.

Close by telling the user PostHog-agent is now scanning the project, and confirm the exact daily + weekly schedule using the timezone they pinned in Step 7 (e.g. "daily digest at 09:00 Europe/Paris, weekly recap Mon 10:00 Europe/Paris"). Remind them that if the north-star events ever change (new product surface, deprecated feature), they just have to tell the co-founder and PostHog-agent will refresh its definitions — no re-onboarding needed.

### Step 9 — Mention the opt-in add-ons (one line, then stop)

After the close, add **one** short message naming the three add-ons the user can enable later. Do not pitch them, do not explain how they work, do not ask if they want them now. Onboarding is over; this is just so they know the surface exists:

> "When you want, you can also ask me to enable: release-impact tracking (snapshot metrics around each GitHub release), auto-maintained PostHog cohorts (Power Users + Dying Users kept in sync), or auto-filed investigation tasks (anomalies become tasks in your queue). They each need one extra piece of config — happy to walk through any of them later."

That's the whole step. Do not list features for each, do not offer to enable any of them in the same turn. The user just finished a 10-minute setup; respect that they're done. They'll come back when they want one.

If the user *does* immediately ask to enable one in the same turn, walk through just the one they asked for (the relevant skill — `posthog-release-tracker`, `posthog-cohort-sync` — has the full procedure). Don't bundle them.
