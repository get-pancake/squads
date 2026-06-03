# Memory — PostHog-agent

<!-- Thin index of pointers. Detailed findings go to wiki/Knowledge/PostHog/. -->

## Identity
→ See: IDENTITY.md
→ See: /home/pancake/.openclaw/system/SYSTEM.md

## Reporting line
→ Co-founder is my coordinator. I don't talk to the user directly.

## Squad
→ posthog-squad
→ My skills: posthog-discovery, posthog-daily-analysis, posthog-mcp-toolkit, posthog-funnel-debugger, posthog-release-tracker, posthog-cohort-sync
→ Wake procedure: HEARTBEAT.md (loaded on every wake)

## Company context
→ Product: wiki/Company/COMPANY.md
→ ICP: wiki/Company/ICP.md (or inline below if not yet on the wiki)

## ICP
→ (set at onboarding — one sentence on who the ideal customer is)

## Goal (next 90 days)
→ (set at onboarding — one sentence on the company's current goal)

## North-star events
→ (set at onboarding — 1–3 event names that mean "real product use")
→ Why each was picked: (one line per event, in the user's words)

## Activation event
→ (set at onboarding — single event meaning "new signup activated")
→ Why this event: (one line, in the user's words)

## Signup event
→ (set at onboarding — single event fired when a new user signs up; powers posthog-funnel-debugger)
→ Blank disables the funnel debugger; the rest of the squad still works

## Release tracking
→ Repo: (set when the user enables release tracking — owner/name slug; absent disables)
→ Last seen tag: (set by posthog-release-tracker after each poll)
→ Last seen published_at: (set by posthog-release-tracker)

## Pending release snapshots
<!-- Queued by posthog-release-tracker. Each entry: { tag, kind: T+24h | T+7d, due_at: ISO8601 }. -->
→ (none yet)

## PostHog connection
→ Host: (set at onboarding — https://us.posthog.com / https://eu.posthog.com / self-hosted URL)
→ Project ID: (set at onboarding — numeric project ID)
→ API key vault ref: team.posthog_api_key (the only secret in this squad's required vault)
→ MCP: official PostHog MCP, installed via mcp_install, read-only flag set

## PostHog shape
<!-- Resolved by posthog-discovery §0.5. Every later query reads these instead of guessing.
     The PROBE_COMPLETE marker below is checked by posthog-daily-analysis §0 as a hard gate. -->
→ PROBE_COMPLETE: (YYYY-MM-DD — set by posthog-discovery §0.5 once all values below are real)
→ person_identification: (identified | anonymous_only)
→ display_handle_path: (e.g. person.properties.email, or toString(distinct_id) if anonymous-only)
→ person_on_events: (true | false)
→ session_signal_available: (true | false — based on $session_id coverage)
→ low_volume_project: (true | false — < 200 events / 7d)
→ autocapture_active: (true | false — $pageview firing)
→ Last probed: (YYYY-MM-DD)

## Where I file
→ Daily digests: wiki/Knowledge/PostHog/Reports/daily/YYYY-MM-DD.md
→ Weekly recaps: wiki/Knowledge/PostHog/Reports/weekly/YYYY-WW.md
→ Funnel debugger runs: wiki/Knowledge/PostHog/FunnelDebugger/YYYY-MM-DD.md
→ Release-impact reports: wiki/Knowledge/PostHog/Releases/YYYY-MM-DD-<tag>.md
→ Cohort-sync audit trail: wiki/Knowledge/PostHog/CohortSync/YYYY-MM-DD.md
→ Event taxonomy notes: wiki/Knowledge/PostHog/Taxonomy.md
→ User watchlist (dying / power): wiki/Knowledge/PostHog/Watchlist.md
→ Daily log: memory/YYYY-MM-DD.md

## Vault keys (secrets only)
→ team.posthog_api_key — personal API key, read scopes only
→ team.posthog_write_api_key — SECOND key, Cohort write ONLY (powers cohort sync; blank disables)

Everything else (host, project ID, event names, release repo) is configuration and lives in this MEMORY file, not the vault. Asking the user to fill a vault form for non-secret config is bad UX.

## Weekly Learnings
→ (one short entry per Sunday — see HEARTBEAT.md §7)
