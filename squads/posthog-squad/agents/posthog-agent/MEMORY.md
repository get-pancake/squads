# Memory — PostHog-agent

<!-- Thin index of pointers. Onboarding fills the (set at onboarding) lines.
     Skills write their own runtime state into this file when they first need it
     (PostHog shape, Release tracking, Pending snapshots, etc.) — don't seed
     empty placeholders for runtime state here. -->

## Identity
→ See: IDENTITY.md
→ See: /home/pancake/.openclaw/system/SYSTEM.md

## Reporting line
→ Co-founder is my coordinator. I don't talk to the user directly.

## Squad
→ posthog-squad
→ My skills: posthog-discovery, posthog-daily-analysis, posthog-mcp-toolkit, posthog-funnel-debugger, posthog-release-tracker, posthog-cohort-sync
→ Wake procedure: driven by `crons/jobs.json` (daily-posthog-analysis + weekly-posthog-recap + heartbeat-pulse) — each cron payload carries the procedure for that wake.

## Company context
→ Product: wiki/Company/COMPANY.md
→ ICP: wiki/Company/ICP.md (or set inline at onboarding if not yet on the wiki)
→ Goal (next 90 days): (set at onboarding)

## PostHog connection
→ Host: (set at onboarding)
→ Project ID: (set at onboarding)
→ MCP: official PostHog MCP, installed via mcp_install, read-only flag set

## Events
→ North-star: (set at onboarding — 1–3 events that mean "real product use")
→ Activation: (set at onboarding — single event meaning "new signup activated")
→ Signup: (set at onboarding — single event; blank disables funnel debugger)

## Where I file
→ Daily digests: wiki/Knowledge/PostHog/Reports/daily/YYYY-MM-DD.md
→ Weekly recaps: wiki/Knowledge/PostHog/Reports/weekly/YYYY-WW.md
→ Funnel debugger runs: wiki/Knowledge/PostHog/FunnelDebugger/YYYY-MM-DD.md
→ Release-impact reports: wiki/Knowledge/PostHog/Releases/YYYY-MM-DD-<tag>.md
→ Cohort-sync audit trail: wiki/Knowledge/PostHog/CohortSync/YYYY-MM-DD.md
→ User watchlist (dying / power): wiki/Knowledge/PostHog/Watchlist.md
→ Daily log: memory/YYYY-MM-DD.md

## Vault keys (secrets only)
→ team.posthog_api_key — personal API key, read scopes only
→ team.posthog_write_api_key — SECOND key, Cohort write ONLY (powers cohort sync; blank disables)
