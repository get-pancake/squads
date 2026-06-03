# Memory — posthog-squad

<!-- Squad-wide seed memory. Each agent has its own MEMORY.md that overrides this.
     This file is a thin index — detailed findings go to the shared wiki. -->

## Squad
→ This is the **posthog-squad** — one agent, one lane.
→ PostHog-agent: product analytics — onboards PostHog MCP, owns the north-star event taxonomy, and runs the daily digest.

## Reporting line
→ PostHog-agent reports to the co-founder only.

## Shared vault keys
→ team.posthog_api_key — personal API key, read scopes only
→ team.posthog_project_id — numeric project id
→ team.posthog_host — Cloud US / Cloud EU / self-hosted base URL
→ team.posthog_north_star_events — comma-separated event names that count as "real product use"
→ team.posthog_activation_event — single event meaning "new signup is activated"
→ team.posthog_signup_event — single signup event (funnel debugger; blank disables)
→ team.posthog_release_repo — GitHub owner/name slug (release tracker; blank disables)
→ team.posthog_write_api_key — second key, Cohort write ONLY (cohort sync; blank disables)

## Where we file
→ Daily digests: wiki/Knowledge/PostHog/Reports/daily/YYYY-MM-DD.md
→ Weekly recaps: wiki/Knowledge/PostHog/Reports/weekly/YYYY-WW.md
→ Funnel debugger runs: wiki/Knowledge/PostHog/FunnelDebugger/YYYY-MM-DD.md
→ Release-impact reports: wiki/Knowledge/PostHog/Releases/YYYY-MM-DD-<tag>.md
→ Cohort-sync audit trail: wiki/Knowledge/PostHog/CohortSync/YYYY-MM-DD.md
→ Event taxonomy notes: wiki/Knowledge/PostHog/Taxonomy.md
→ User watchlist (dying / power): wiki/Knowledge/PostHog/Watchlist.md
