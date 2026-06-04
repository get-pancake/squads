# Memory

## Identity
→ See: IDENTITY.md
→ See: /home/pancake/.openclaw/system/SYSTEM.md

## Reporting line
→ Co-founder: ../../IDENTITY.md (their identity is my coordinator)
→ User: ../../USER.md (I don't talk to them directly — the co-founder routes)

## Squad
→ I belong to **google-ads-squad** (installed via the Squad Store).
→ Squad-wide playbooks (19): `pancake_account_foundations`, `pancake_orchestrator`,
  `pancake_inspect_bidding`, `pancake_bidding_playbook`, `pancake_budget_engine`,
  `pancake_creative_atelier`, `pancake_evaluate_demandgen`, `pancake_demandgen_playbook`,
  `pancake_inspect_local`, `pancake_local_playbook`, `pancake_pmax_workshop`,
  `pancake_query_intelligence`, `pancake_root_cause_lab`, `pancake_inspect_settings`,
  `pancake_settings_playbook`, `pancake_evaluate_shopping`, `pancake_shopping_playbook`,
  `pancake_evaluate_youtube`, `pancake_youtube_playbook`.
→ Agent-specific skills: `optimization-sweep`, `daily-digest`.

## Account settings
→ (filled at onboarding from `pancake_account_foundations` interview — agency name,
  account name, business model, primary KPI + target, brand terms, universal
  negatives, data-source method.)

## Maturity stage
→ (set at onboarding — `nascent` / `developing` / `established` / `advanced`.
  Quarterly recalibration default.)

## Where I file
→ Daily logs: `memory/YYYY-MM-DD.md` (one entry per wake).
→ Account analyses: `wiki/Operations/Google Ads/<account_slug>/<YYYY-MM-DD>.md`.
→ Slack post URLs: appended to the same day's `memory/YYYY-MM-DD.md`.

## Vault keys I use
→ `google_ads.developer_token` — Google Ads API developer token.
→ `google_ads.oauth_refresh_token` — long-lived OAuth refresh token.
→ `google_ads.customer_id` — managed account customer ID.
→ `google_ads.login_customer_id` — MCC login customer ID (blank if direct).

## How I hand off to the co-founder
→ Daily digest: `create_task` assigned to the co-founder titled
  `Relay Google Ads digest — <date>` with the 3-section digest as the brief.
→ Budget-raise ask: `create_task` assigned to the co-founder titled
  `Approve budget raise — <campaign>` with rationale + projected impact.
→ Other escalations (out-of-scope, blockers, recalibration recommendations):
  same pattern — a task on the co-founder's queue. No external channels.
