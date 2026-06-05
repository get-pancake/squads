# Memory — Meta Ads agent

<!-- Thin index of pointers. Detailed findings go to wiki/Knowledge/MetaAds/. -->

## Identity
→ See: IDENTITY.md
→ See: /home/pancake/.openclaw/system/SYSTEM.md

## Reporting line
→ Co-founder is my coordinator. I don't talk to the user directly.
→ Digest, approval requests, and escalations all return through `complete_task` for the co-founder to relay.

## Squad
→ meta-ads-squad
→ Skills: pancake-meta-ads-01 through 10 (methodology) + 11 through 13 (operations) — all squad-wide; plus `meta-ads-wake-routine` (agent-specific)
→ Wake procedure: the `meta-ads-wake-routine` skill, loaded by each cron in `crons/jobs.json` (meta-ads-daily-operations + meta-ads-daily-digest + meta-ads-weekly-review). No heartbeat pulse.

## Mode
→ autonomous
<!-- Set to `recommendation-only` by the co-founder when the user invokes the kill switch. In that mode, every proposed action — including autonomous-allowed ones — goes through the approval queue and nothing executes. Recover with an explicit `resume`. -->

## Account
→ Ad account ID: (set at onboarding from `team.meta_ad_account_id`)
→ Currency: (set at onboarding from `team.account_currency`)
→ Timezone: (set at onboarding from `team.account_timezone`)
→ Business model: (set at onboarding from `team.account_business_model`)
→ Maturity level: (set at onboarding from `team.account_maturity_level` — reassessed quarterly)

## KPI
→ Primary KPI: (set at onboarding from `team.primary_kpi` — cpa | roas | cpl | cpv | cpm)
→ Target: (set at onboarding from `team.kpi_target`)
→ Rolling window: 30 days

## Thresholds
→ Flag thresholds: (set at onboarding from `team.flag_thresholds` — JSON blob; falls back to defaults in skill-01)
→ Naming conventions: (set at onboarding from `team.naming_conventions` — JSON blob; falls back to defaults in skill-01)

## Vault keys
→ team.meta_api_token — Meta Marketing API System User access token (consumed by the Meta MCP at boot)
→ team.meta_ad_account_id
→ team.meta_pixel_id
→ team.meta_capi_dataset_id (optional)
→ team.account_currency · team.account_timezone · team.account_business_model · team.account_maturity_level
→ team.primary_kpi · team.kpi_target
→ team.flag_thresholds · team.naming_conventions

## Meta MCP
→ Installed at onboarding via `mcp-installer` (pipeboard-co/meta-ads-mcp, self-hosted, version pinned)
→ Reads `META_ACCESS_TOKEN` (from `team.meta_api_token`) and `META_AD_ACCOUNT_ID` (from `team.meta_ad_account_id`)
→ All API traffic goes directly to graph.facebook.com — no third-party intermediary

## Approval queue
<!-- Domain state, not task state. Each row: id · timestamp · entity · action · rationale · expected impact -->
→ (empty)

## Where I file
→ Audit log: `wiki/Knowledge/MetaAds/AuditLog/YYYY-MM-DD.md` (every autonomous action)
→ Daily digest: `wiki/Knowledge/MetaAds/Digests/YYYY-MM-DD.md` (durable copy of the 17:00 daily digest)
→ Weekly / monthly / quarterly reports: `wiki/Knowledge/MetaAds/Reports/<cadence>/YYYY-MM-DD.md`
→ Creative briefs: `wiki/Knowledge/MetaAds/Briefs/YYYY-MM-DD-<slug>.md`
→ Daily log: `memory/YYYY-MM-DD.md`

## Weekly Learnings
→ (populated on the Monday weekly-review cron)
