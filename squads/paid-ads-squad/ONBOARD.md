---
required_tools:
  - vault_request
  - browser_identity_add
  - mcp_install
  - create_task
  - sessions_spawn
required_identities: []
estimated_setup_minutes: 25
---

## Onboarding — paid-ads-squad

You are the co-founder running this onboarding. The mechanical deploy has completed — both
agents' files are written, all five crons are registered, and every skill is deployed. This
squad ships **two agents**, `google-ads-agent` and `meta-ads-agent`, but most users run one
platform. Don't onboard a platform the user isn't using.

### Step 0 — Which platform(s)?

Ask the user plainly: **"Do you want me to run Google Ads, Meta Ads, or both?"**

- Run **Section A** only if they're connecting Google Ads.
- Run **Section B** only if they're connecting Meta Ads.
- If only one platform is in play, tell the user the other agent stays idle (no account
  connected, its crons no-op) until they connect it later — no harm, no cost surprise.

Budget ~12 minutes for Google, ~25 for Meta (Meta App Review must already be done).

---

## Section A — Google Ads

**A1 — Walk the user through obtaining Google Ads API credentials.** Post the steps and wait
for each. Never ask for a secret in chat — collect every value with `vault_request`.

- **Developer token.** MCC → `Tools → API Center` → apply for / copy the developer token.
  Store with `vault_request` key `google_ads.developer_token` (type `token`).
- **Google Cloud project + OAuth client.** Create a GCP project, enable the **Google Ads API**,
  configure the OAuth consent screen (external, scope `.../auth/adwords`), create an OAuth 2.0
  Client ID.
- **Refresh token.** Walk the one-time OAuth dance to obtain a long-lived **refresh token**
  (link Google's `oauth2l` quickstart or a short Python snippet). Store at
  `google_ads.oauth_refresh_token` (type `token`).
- **Customer IDs.** Ask for the **customer ID** to manage (10 digits, no dashes) → store at
  `google_ads.customer_id`. If under an MCC, also store the **login customer ID** at
  `google_ads.login_customer_id`; if direct, store an empty string there (don't skip it).

Once these four values are in the vault the agent has everything it needs to operate. The
refresh token *is* the long-lived credential — the agent mints fresh access tokens from it on
every run with no human in the loop. This API path is the primary and complete path; reads and
writes all flow through it.

**A2 — (Optional) Connect a Google identity as a backup.** This is *not* required for normal
operation — the API credentials from A1 already drive every read and write. A connected
`google.com` identity is only a fallback for the rare case where the agent needs to re-run the
OAuth consent dance or pull CSV exports from the Google Ads UI. If the user enforces passkeys
on their Google accounts (which blocks the browser sign-in), **skip this step** — it won't
affect day-to-day operation. To set it up anyway: reuse a matching pod `google.com` identity if
one exists, otherwise `browser_identity_add` for `google.com`. Make clear to the user that
skipping is fine and the squad is fully functional without it.

**A3 — Account-foundations interview.** Load `pancake_account_foundations` and walk the
questionnaire: agency + account name, business model, primary KPI (`cpa`/`roas`/`cpl`) and its
target, brand terms, universal negatives, data source (default `api`). Persist every answer to
`agents/google-ads-agent/MEMORY.md` under `## Account settings` and to the toolkit's config file.

**A4 — Maturity stage.** Walk the five-question maturity questionnaire, pick the stage
(`nascent`/`developing`/`established`/`advanced`), save it in `agents/google-ads-agent/MEMORY.md`
under `## Maturity stage`. Note that sweep depth scales with stage and quarterly recalibration
is the default.

**A5 — Dispatch the first task.** The user is here now — don't wait for the cron. Create the
first task naming the workflow, and put your relay coordinates on THIS task only so the user
sees it work live:

- `create_task({ assigned_to: "google-ads-agent", priority: "today", title: "Initial baseline audit", context: "Run the google.optimize_account workflow in baseline mode against the configured account: produce the pancake_orchestrator performance snapshot plus a Settings audit (pancake_inspect_settings) and a Bidding audit (pancake_inspect_bidding). File the orientation digest as a routine ticket on the board and report the headline read back on this ticket. Surface any budget-raise opportunity (don't apply it).", notify_channel: <your Slack channel id>, notify_session_key: <your sessionKey> })`
- Then `sessions_spawn google-ads-agent` on it and `update_task_status(id, "in_progress")`.

---

## Section B — Meta Ads

**B1 — Gate on Meta-side prerequisites.** Ask plainly:

1. **"Do you have a Meta Developer App with Marketing API Standard Access?"** (Free tier won't
   work.) If not, walk them through it (developers.facebook.com → create app → add Marketing API
   → submit App Review on `ads_management`, `ads_read`, `business_management`) and **pause** —
   come back once approval lands.
2. **"Do you have a System User token from Business Manager scoped to the target ad account?"**
   If not: Business Settings → System Users → add admin System User → Generate New Token → select
   the app → select the three scopes → expiration **Never** → copy immediately (shown once).

If both confirmed, proceed.

**B2 — Collect Meta credentials via `vault_request`** (never in chat):
- `team.meta_api_token` (token) — the System User access token. Never echo it.
- `team.meta_ad_account_id` (string) — `act_<digits>`.
- `team.meta_pixel_id` (string).
- `team.meta_capi_dataset_id` (string, optional — empty string if no CAPI Gateway).

**B3 — Account profile via `vault_request`** (group into one ask if ready):
- `team.account_currency` (ISO 4217), `team.account_timezone` (IANA — note the five crons default
  to `America/Los_Angeles`; if the user's tz differs, the `tz` fields need updating post-install —
  surface once, don't block), `team.account_business_model`
  (`ecommerce|lead_gen|saas|app|local|dual`), `team.account_maturity_level`
  (`nascent|developing|established|advanced` — use `pancake-meta-ads-01-account-foundations` to map),
  `team.primary_kpi` (`cpa|roas|cpl|cpv|cpm`), `team.kpi_target` (numeric).

**B4 — Optional overrides** (empty string if none): `team.flag_thresholds` (JSON),
`team.naming_conventions` (JSON).

**B5 — Install the Meta MCP.** `mcp_install` **pipeboard-co/meta-ads-mcp** in self-hosted
streamable-HTTP mode, pinned to latest stable. Env: `META_ACCESS_TOKEN ← team.meta_api_token`,
`META_AD_ACCOUNT_ID ← team.meta_ad_account_id`. Do **not** set `PIPEBOARD_API_TOKEN` — with only
`META_ACCESS_TOKEN`, traffic goes straight to `graph.facebook.com`. Confirm no Pipeboard auth env
is picked up.

**B6 — Verify** with one read-only call (list 5 campaigns / read account name). On 401 → token;
403 → System User permissions; 400 → `act_` prefix / account id. Don't proceed until it succeeds;
surface the exact error.

**B7 — Dispatch the first task**, naming the workflow, with your relay coordinates on THIS task
only:

- `create_task({ assigned_to: "meta-ads-agent", priority: "today", title: "Baseline account audit", context: "Run the full 13-skill baseline cadence (account profile, structure, budget allocation, creative inventory, audience overlap, placement mix, Advantage+ coverage, measurement health, compliance, top-3 root-cause). File wiki/Knowledge/MetaAds/Reports/baseline/<date>.md, queue the 3 highest-leverage actions for tomorrow's 09:00 sweep, and report the headline read on this ticket.", notify_channel: <your Slack channel id>, notify_session_key: <your sessionKey> })`
- Then `sessions_spawn meta-ads-agent` on it and `update_task_status(id, "in_progress")`.

---

### Close out

Tell the user which agent(s) are live, that the baseline audit(s) are running now, and the
ongoing rhythm: Google sweeps at 17:00 PT and digests at 18:00 PT; Meta sweeps at 09:00 and
digests at 17:00 account-local, with a Monday weekly review. Everything lands on the board and
you relay it — they never talk to either agent directly. Budget-raise asks and blockers come
straight to you; routine output stays quiet on the board.
