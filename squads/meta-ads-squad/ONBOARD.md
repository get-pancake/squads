---
required_tools:
  - vault_request
  - mcp_install
estimated_setup_minutes: 25
---

## Onboarding — meta-ads-squad (Meta Ads agent)

You are the co-founder running this onboarding. The mechanical deploy has completed — agent files are written, the three crons are registered, all 13 skills are deployed. Run the steps below in order. The user was promised about 25 minutes assuming the Meta-side prerequisites are already in place.

Tell the user you're setting up the Meta Ads agent and need to walk through a handful of vault prompts plus install the Meta API connector. Note up front that two Meta-side prerequisites are non-optional — if either is missing, you'll pause and direct them to handle it before continuing.

### Step 1 — Gate on Meta-side prerequisites

Ask, plainly:

1. **"Do you have a Meta Developer App with Marketing API Standard Access?"** (Free tier won't work — too little quota for the agent's cron rhythm. Standard Access requires Meta App Review, typically 3–10 business days.) If they don't have it, walk them through it briefly: developers.facebook.com → create an app → add Marketing API product → submit for App Review on `ads_management`, `ads_read`, `business_management`. Then **pause onboarding** and ask them to come back once approval lands. Do not proceed.
2. **"Do you have a System User token from Business Manager scoped to the target ad account?"** (System User tokens are long-lived — they don't expire. They're what makes unattended operation possible.) If they don't have one, walk them through it: Business Manager → Business Settings → System Users → add a System User with admin access → Generate New Token → select the Meta App from Step 1 → select `ads_management`, `ads_read`, `business_management` → set expiration to **Never** → copy the token immediately (Meta only shows it once).

If both are confirmed, proceed.

### Step 2 — Collect the Meta credentials via vault_request

For each below, use `vault_request` — never have the user paste a token or ID into chat:

- `team.meta_api_token` — the System User access token from Step 1.2. Type `token`. Never echo this anywhere.
- `team.meta_ad_account_id` — the ad account ID, format `act_<digits>`. Type `string`.
- `team.meta_pixel_id` — the Meta Pixel ID for the account. Type `string`.
- `team.meta_capi_dataset_id` — the CAPI Gateway dataset ID. **Optional** — if they don't use CAPI Gateway, store an empty string.

### Step 3 — Collect the account profile via vault_request

Group these into one ask if the user has them ready — don't ping-pong:

- `team.account_currency` — ISO 4217 code (USD, GBP, EUR, …).
- `team.account_timezone` — IANA timezone (e.g. `America/New_York`). The cron schedules in `crons/jobs.json` are written for `America/Los_Angeles` as the default — if the user's timezone differs, note that the three crons will need their `tz` field updated post-install. Surface this once, don't block on it.
- `team.account_business_model` — one of `ecommerce | lead_gen | saas | app | local | dual`. If unsure, ask what they sell and pick the closest.
- `team.account_maturity_level` — one of `nascent | developing | established | advanced`. If they're unsure, ask: *monthly spend tier, account age, conversion volume per week, learning-phase frequency*. Use `pancake-meta-ads-01-account-foundations` to map their answers to a stage. The quarterly review re-runs this so getting it perfect today doesn't matter.
- `team.primary_kpi` — `cpa | roas | cpl | cpv | cpm`. For ecommerce and value-optimized accounts default to `roas`; for lead-gen / SaaS / app / count-optimized default to `cpa`.
- `team.kpi_target` — the numeric target (e.g. `45.00` for $45 CPA, `4.0` for 4× ROAS). The agent measures against this on a rolling 30-day window.

### Step 4 — Optional overrides (skip if user has no preference)

- `team.flag_thresholds` — JSON blob overriding the critical/warning defaults in `pancake-meta-ads-01-account-foundations`. If the user doesn't have custom thresholds, store an empty string — the skill's defaults apply.
- `team.naming_conventions` — JSON blob of campaign / ad-set / ad name templates. Enables automated segmentation parsing. If they don't have a convention, store an empty string and note in `MEMORY.md` that segmentation parsing is disabled.

### Step 5 — Install the Meta MCP

Use `mcp_install` to install **pipeboard-co/meta-ads-mcp** (`pip install meta-ads-mcp`) in **self-hosted streamable HTTP mode**. Pin to the latest stable version at install time. Configure it with the env vars:

- `META_ACCESS_TOKEN` ← `team.meta_api_token`
- `META_AD_ACCOUNT_ID` ← `team.meta_ad_account_id`

Do **not** set `PIPEBOARD_API_TOKEN` — that would route through their hosted SaaS. With only `META_ACCESS_TOKEN` set, the MCP talks directly to `graph.facebook.com` and never contacts pipeboard.co. Confirm in the install output that no Pipeboard auth env vars are picked up.

### Step 6 — Verify with a read-only call

Through the freshly installed MCP, make one read-only call against the configured ad account — list 5 campaigns or read account name. If it succeeds, you're wired. If it fails:

- **401/invalid token** → token wrong, expired, or scoped to the wrong app. Send the user back to Step 1.2.
- **403/missing permission** → the System User doesn't have `ads_management`/`ads_read` on the target ad account. Send back to Business Manager → People → grant.
- **400/account not found** → `act_` prefix missing or wrong account ID. Re-prompt.

Do not proceed past this step until the verification call succeeds. Surface the exact error to the user.

### Step 7 — Dispatch the first task

Create the Meta Ads agent's first task: a **baseline account audit** running the full 13-skill onboarding cadence — account profile, campaign structure, budget allocation, creative inventory, audience overlap, placement mix, Advantage+ coverage, measurement health, compliance pass, and a top-3 root-cause read. Output: a single `wiki/Knowledge/MetaAds/Reports/baseline/YYYY-MM-DD.md` summarizing the account today plus the 3 highest-leverage actions queued for tomorrow's 09:00 daily-operations sweep.

Dispatch it now via `sessions_spawn meta-ads-agent`, mark the task `in_progress`. Don't leave it for the morning cron — the user is here and the first impression matters.

Close by telling the user the Meta Ads agent is already auditing the account, the daily operations sweep will land at 09:00 their timezone, and the daily digest comes at 17:00.
