---
required_tools:
  - vault_request
  - browser_identity_add
  - create_task
  - sessions_spawn
estimated_setup_minutes: 12
---

## Onboarding — google-ads-agent

You are the co-founder running the install skill. The mechanical deploy is done
(agent files written, crons registered, skills deployed). Run the script below
in order. Budget about 12 minutes — Google Ads API credentialing is multi-step.

**1 — Walk the user through obtaining Google Ads API credentials.** Post the
following steps and wait for the user to complete each. Do not ask for any
secret in chat — collect every value with `vault_request` at the keys listed.

- **Developer token.** Have the user go to their Google Ads MCC →
  `Tools → API Center` and apply for (or copy) the developer token. Once they
  have it, call `vault_request` with key `google_ads.developer_token` (type
  `token`).
- **Google Cloud project + OAuth client.** Have them create a Google Cloud
  project, enable the **Google Ads API**, configure the OAuth consent screen
  (external, scope `https://www.googleapis.com/auth/adwords`), then create an
  OAuth 2.0 Client ID (Desktop or Web).
- **Refresh token.** Walk them through the one-time OAuth dance to obtain a
  long-lived **refresh token** (link them to Google's `oauth2l` quickstart or
  paste a short Python snippet that runs the consent flow and prints the
  refresh token). Capture it with `vault_request` at key
  `google_ads.oauth_refresh_token` (type `token`).
- **Customer IDs.** Ask for the **customer ID** of the account to manage
  (10 digits, no dashes) and store it with `vault_request` at key
  `google_ads.customer_id` (type `string`). If the account is managed under
  an MCC, also ask for and store the **login customer ID** at
  `google_ads.login_customer_id` (type `string`). If the account is direct
  (no MCC), store an empty string at that key — don't skip it.

Once these four values are in the vault the agent has everything it needs to
operate. The refresh token *is* the long-lived credential — the agent mints
fresh access tokens from it on every run with no human in the loop. This API
path is the primary and complete path; reads and writes all flow through it.

**2 — (Optional) Connect a Google identity as a backup.** This is *not*
required for normal operation — the API credentials from step 1 already drive
every read and write. A connected `google.com` identity is only a fallback for
the rare case where the agent needs to re-run the OAuth consent dance or pull
CSV exports from the Google Ads UI. If you enforce passkeys on your Google
accounts (which blocks the browser sign-in), **skip this step** — it won't
affect day-to-day operation. To set it up anyway: check whether the pod already
has a matching `google.com` identity and reuse it, otherwise call
`browser_identity_add` for `google.com`. Make clear to the user that skipping is
fine and the squad is fully functional without it.

**3 — Run the account-foundations interview.** Load the
`pancake_account_foundations` skill (it is one of this squad's squad-wide
skills) and walk the user through its onboarding questionnaire:

- Agency name and account/client name.
- Business model (B2C ecom, B2B SaaS, lead-gen, local services, etc.).
- Primary KPI (`cpa` / `roas` / `cpl`) and its **target value**.
- Brand terms (the keywords that count as brand traffic).
- Universal negatives (terms that should be excluded across the whole account).
- Data source method — default to `api` since you just configured the
  developer token.

Persist every answer to `agents/google-ads-agent/MEMORY.md` under a
`## Account settings` heading, and also to the foundational config file the
toolkit reads on every run.

**4 — Assess maturity stage.** Walk the user through the five-question
maturity questionnaire in `pancake_account_foundations`. Pick the resulting
stage (`nascent` / `developing` / `established` / `advanced`) and save it in
the agent's `MEMORY.md` under `## Maturity stage`. Tell the user that the
agent's sweep depth and recommendation aggressiveness scale with this stage,
and that quarterly recalibration is the default.

**5 — Dispatch the first task.** Don't wait for tomorrow's cron — the user
is here now. Create the agent's first task with `create_task`, titled
"Initial baseline audit", with this brief:

> Run an initial baseline audit of the configured Google Ads account.
> Produce the per-account performance snapshot from `pancake_orchestrator`,
> plus a Settings audit (`pancake_inspect_settings`) and a Bidding audit
> (`pancake_inspect_bidding`). When done, hand the orientation digest to
> the co-founder via `create_task` titled `Relay Google Ads orientation
> digest — <date>`. Do not post externally yourself.

Then `sessions_spawn` `google-ads-agent` on that task and mark it
`in_progress`. Close by telling the user the agent is already working and
will surface its orientation digest as a task on your queue shortly — you
will relay it to them once it lands.
