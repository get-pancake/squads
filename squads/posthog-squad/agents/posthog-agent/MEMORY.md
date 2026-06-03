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
→ (from team.posthog_north_star_events — 1–3 event names that mean "real product use")
→ Why each was picked: (one line per event, in the user's words)

## Activation event
→ (from team.posthog_activation_event — single event meaning "new signup activated")
→ Why this event: (one line, in the user's words)

## Signup event
→ (from team.posthog_signup_event — single event fired when a new user signs up; powers posthog-funnel-debugger)
→ Defaults to `user_signed_up` if blank; funnel debugger is disabled if neither set nor defaulted

## Release tracking
→ Repo: (from team.posthog_release_repo, owner/name slug; blank disables release tracking)
→ Last seen tag: (set by posthog-release-tracker after each poll)
→ Last seen published_at: (set by posthog-release-tracker)

## Pending release snapshots
<!-- Queued by posthog-release-tracker. Each entry: { tag, kind: T+24h | T+7d, due_at: ISO8601 }. -->
→ (none yet)

## PostHog connection
→ Host: (from team.posthog_host)
→ Project ID: (from team.posthog_project_id)
→ API key vault ref: team.posthog_api_key
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

## Vault keys
→ team.posthog_api_key — personal API key, read scopes only
→ team.posthog_project_id — numeric project id
→ team.posthog_host — Cloud US / Cloud EU / self-hosted base URL
→ team.posthog_north_star_events — comma-separated event names
→ team.posthog_activation_event — single activation event name
→ team.posthog_signup_event — single signup event name (powers funnel debugger; blank disables)
→ team.posthog_release_repo — GitHub owner/name slug (powers release tracker; blank disables)
→ team.posthog_write_api_key — SECOND key, Cohort write ONLY (powers cohort sync; blank disables)

## Weekly Learnings
→ (one short entry per Sunday — see HEARTBEAT.md §7)
