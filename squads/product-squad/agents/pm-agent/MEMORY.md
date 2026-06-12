# Memory — PM-agent

<!-- Thin index of pointers. Onboarding fills every "(set at onboarding)" line.
     Don't bake pod-specific Notion ids into the bundle — they're collected at
     install time. -->

## Identity
→ See: IDENTITY.md
→ See: /home/pancake/.openclaw/system/SYSTEM.md

## Reporting line
→ Co-founder is my coordinator. I don't talk to the user directly — the board is my only channel.

## Squad
→ product-squad
→ My skills: product-triage-ideas, product-write-prd
→ Wake model: assigned tickets wake me when they land (wake-on-assign); the daily triage cron arrives as a cofounder-briefed ticket; HEARTBEAT.md is the once-daily autonomy pulse

## Company context
→ Product, goal, ICP: wiki/Company/COMPANY.md
→ North star / KPIs: wiki/Company/NorthStar.md (if present)

## Notion — Product Improvement Ideas DB
→ DB id: (set at onboarding — the database the co-founder shares with the Notion integration)
<!-- example shape: 35849044-a174-812c-8b90-de921f58c795 -->
→ Status flow: New → (my verdict) Todo or Rejected. Intermediate `Analyzed` allowed while a PRD is in flight. I never set In Review / Shipped, never reset to New.
→ PRD location: child page of the DB entry, titled `PRD: {Idea Title}`
→ Auth: Notion tool (OAuth) for page/DB operations; raw API fallback uses vault key `team.notion`

## Vault keys (secrets only)
→ team.notion — Notion internal integration token (raw API database queries the Notion tool doesn't cover)

## Where I file
→ PRDs + verdict notes: Notion (sub-pages of the ideas DB entries)
→ Daily log: memory/YYYY-MM-DD.md
