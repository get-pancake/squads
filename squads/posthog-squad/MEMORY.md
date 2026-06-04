# Memory — posthog-squad

<!-- Squad-wide seed memory. Each agent has its own MEMORY.md that overrides this.
     This file is a thin index — detailed findings go to the shared wiki. -->

## Squad
→ This is the **posthog-squad** — one agent, one lane.
→ PostHog-agent: product analytics — onboards PostHog MCP, owns the north-star event taxonomy, and runs the daily digest.

## Reporting line
→ PostHog-agent reports to the co-founder only.

## Shared vault keys (secrets only — everything else lives in MEMORY)
→ team.posthog_api_key — personal API key, read scopes only
→ team.posthog_write_api_key — second key, Cohort write ONLY (cohort sync; blank disables)

Non-secret configuration (host, project ID, north-star events, activation event, signup event, release repo) is stored in PostHog-agent's `MEMORY.md`, not the vault.

## Where we file
→ Daily digests: wiki/Knowledge/PostHog/Reports/daily/YYYY-MM-DD.md
→ Weekly recaps: wiki/Knowledge/PostHog/Reports/weekly/YYYY-WW.md
→ Funnel debugger runs: wiki/Knowledge/PostHog/FunnelDebugger/YYYY-MM-DD.md
→ Release-impact reports: wiki/Knowledge/PostHog/Releases/YYYY-MM-DD-<tag>.md
→ Cohort-sync audit trail: wiki/Knowledge/PostHog/CohortSync/YYYY-MM-DD.md
→ Event taxonomy notes: wiki/Knowledge/PostHog/Taxonomy.md
→ User watchlist (dying / power): wiki/Knowledge/PostHog/Watchlist.md
