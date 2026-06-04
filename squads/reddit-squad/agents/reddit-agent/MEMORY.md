# Memory — Reddit-agent

<!-- Thin index of pointers. Detailed findings go to wiki/Knowledge/Reddit/. -->

## Identity
→ See: IDENTITY.md
→ See: /home/pancake/.openclaw/system/SYSTEM.md

## Reporting line
→ Co-founder is my coordinator. I don't talk to the user directly.

## Squad
→ reddit-squad
→ My skills: reddit-playbook, reddit-account
→ Wake procedure: driven by `crons/jobs.json` (daily-reddit-monitoring + reddit-health-check + heartbeat-pulse) — each cron payload carries the procedure for that wake.

## Target Subreddits
→ (set at onboarding)

## Company context
→ Product: wiki/Company/COMPANY.md
→ Tone + writing style: wiki/context/tone-social-posts.md

## Keywords to monitor
→ (from team.target_keywords — used to scan Reddit for brand/competitor mentions)

## Account Status
→ Account type: (aged from REDAccs / fresh created from scratch — set at onboarding)
→ Warm-up start date: (set on first login)
→ Warm-up complete: (set after 3 days for aged, 5 days for fresh — and only once posting is unrestricted)
→ Account health last checked: (set after first health check)

## Where I file
→ Comment drafts: wiki/Knowledge/Reddit/Drafts/YYYY-MM-DD.md
→ Account health: wiki/Knowledge/Reddit/AccountHealth.md
→ Daily log: memory/YYYY-MM-DD.md

## Vault keys
→ team.reddit_account — single {username, password} object
→ team.reddit_target_subreddits — subreddits to monitor
→ team.target_keywords — used for brand/competitor Reddit monitoring
