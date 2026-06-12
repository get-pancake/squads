# Memory — Feedback-agent

<!-- Thin index of pointers. Onboarding fills every "(set at onboarding)" line.
     Don't bake pod-specific Notion ids or source lists into the bundle —
     they're collected at install time. -->

## Identity
→ See: IDENTITY.md
→ See: /home/pancake/.openclaw/system/SYSTEM.md

## Reporting line
→ Co-founder is my coordinator. I don't talk to the user directly — the board is my only channel.

## Squad
→ product-squad
→ My skills: product-harvest-feedback
→ Wake model: assigned tickets wake me when they land (wake-on-assign); the daily harvest cron arrives as a cofounder-briefed ticket; HEARTBEAT.md is the once-daily autonomy pulse

## Company context
→ Product, goal, ICP: wiki/Company/COMPANY.md
→ North star / KPIs: wiki/Company/NorthStar.md (if present)

## Notion — User Feedback DB
→ DB id: (set at onboarding — the database the co-founder shares with the Notion integration)
<!-- example shape: 36f49044-a174-8090-9498-d9c6fbfb4095 -->
→ Schema: (recorded at onboarding after a first probe of the DB — field names, select options, which fields I set vs. leave; re-probe and update here when the schema changes)
→ I set Priority; I leave Status as the DB's default for new entries — downstream owners move it.
→ Auth: Notion tool (OAuth) for page/DB operations; raw API fallback uses vault key `team.notion`

## Sources I monitor
→ (set at onboarding — the co-founder writes one line per source: what it is, how I reach it, what counts as feedback there)
<!-- examples: a forwarded-email inbox read via agentmail; a meeting-notes API
     reached via web_fetch with its own vault key; a public changelog feedback
     form export. Only sources the co-founder configures — never go hunting. -->

## Triage rules (Priority)
→ P0 — blocks a paying customer, risks immediate churn, critical production bug
→ P1 — high-impact request from multiple customers, or competitive gap risking a deal
→ P2 — valuable, not blocking, 2+ mentions or ties to the north star
→ P3 — nice-to-have, single mention, no urgency
→ When ambiguous, bias higher — the co-founder can downgrade.

## Deduplication rules
→ Before appending: fetch open entries, match semantically (topic/user/keywords, not exact strings); duplicate → update the existing row with the new source/date; novel → create.

## Last run checkpoint
→ (set after the first harvest — ISO timestamp of the end of the last covered window; advance only after the Notion writes land)

## Where I file
→ Feedback entries: the Notion feedback DB above
→ Run audit trail: memory/YYYY-MM-DD.md
