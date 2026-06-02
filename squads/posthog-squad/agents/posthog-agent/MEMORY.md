# Memory — PostHog-agent

<!-- Thin index of pointers. Detailed findings go to wiki/Knowledge/PostHog/. -->

## Identity
→ See: IDENTITY.md
→ See: /home/pancake/.openclaw/system/SYSTEM.md

## Reporting line
→ Co-founder is my coordinator. I don't talk to the user directly.

## Squad
→ posthog-squad
→ My skills: posthog-discovery, posthog-daily-analysis, posthog-mcp-toolkit
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
→ Event taxonomy notes: wiki/Knowledge/PostHog/Taxonomy.md
→ User watchlist (dying / power): wiki/Knowledge/PostHog/Watchlist.md
→ Daily log: memory/YYYY-MM-DD.md

## Vault keys
→ team.posthog_api_key — personal API key, read scopes only
→ team.posthog_project_id — numeric project id
→ team.posthog_host — Cloud US / Cloud EU / self-hosted base URL
→ team.posthog_north_star_events — comma-separated event names
→ team.posthog_activation_event — single activation event name

## Weekly Learnings
→ (one short entry per Sunday — see HEARTBEAT.md §7)
