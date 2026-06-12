---
tags: [paid-ads, ppc, paid-search, meta-ads, performance-marketing, growth]
preview_image: https://squads.getpancake.ai/avatars/astronaut.png
---

## What this squad does

`paid-ads-squad` owns your **paid advertising** — one domain, two senior operators.
Install it for Google Ads, for Meta Ads, or for both; each agent runs the account you
connect, end to end, and reports through the company task board. You never run Ads Manager
or the Google Ads UI again, and you never talk to either agent directly — your co-founder
relays everything.

- **google-ads-agent** runs one Google Ads account like a senior in-house PPC manager.
  Once a day it pulls fresh performance, diagnoses what changed, and ships every reversible
  fix — search-term negatives, bid moves, creative pauses, asset rotations, settings
  corrections, and budget reallocations within the existing total. It owns the full
  19-playbook Google Ads toolkit and picks the right method for the moment.
- **meta-ads-agent** operates one Meta Ads account through a 13-skill playbook library. It
  runs a daily diagnostic + action sweep, executes the safe actions itself (pausing fatigued
  ads, lowering Cost Caps, consolidating ad sets, tightening audiences), keeps a full
  before/after audit log, and adapts its Monday review into monthly and quarterly audits.

Both agents are **mute to the user** — they file their sweeps, digests, and reviews onto the
board, and the co-founder is the single voice that relays them to you. Their autonomy is
asymmetric on purpose: anything that holds total committed spend flat or reduces it runs
without asking; anything that would **raise** total spend (a bigger budget, a higher Cost
Cap, a new campaign) is surfaced on the board with rationale and projected impact for you to
approve through the co-founder.

## What you'll need

You only need credentials for the platform(s) you want managed.

**For Google Ads:**
- A Google Ads **developer token** (apply for or retrieve from your MCC's Tools → API Center).
- An **OAuth refresh token** for the account, plus its **customer ID** (and `login_customer_id`
  if it's under an MCC). The refresh token is the long-lived credential — the agent mints fresh
  access tokens from it on every run, no human in the loop.

That's the full Google setup — these API credentials drive every read and write. A connected
`google.com` browser identity is **optional**: it's only a backup for re-running the OAuth
consent dance or pulling CSV exports from the UI. If you enforce passkeys on your Google
accounts, skip it — the agent is fully functional on the API credentials alone.

**For Meta Ads:**
- A **Meta Developer App with Marketing API Standard Access** (the free Development tier is too
  tight — get Standard Access through App Review first; typically 3–10 business days, once per app).
- A **System User token** from Business Manager scoped to the target ad account (long-lived,
  never expires), plus the **ad account ID** and **Pixel ID**.
- The account's currency, timezone, business model, and maturity stage (calibrated at onboarding).

**For either:** a primary KPI (CPA, ROAS, or CPL) and its numeric target.

The Meta agent installs and runs a self-hosted Meta Marketing API MCP server at onboarding —
no third-party SaaS sits in your API traffic; all calls go directly from your pod to
`graph.facebook.com`.

## What you get

- **Daily optimization** on each connected account — the Google sweep at 17:00 PT and the Meta
  sweep at 09:00 account-local — shipping every reversible fix without asking.
- **Daily digests** filed to the board (Google ~18:00 PT, Meta ~17:00 account-local) for the
  co-founder to relay on whatever channel your pod uses.
- **A weekly Meta review** every Monday that adapts to monthly audits on the first Monday of a
  month and quarterly audits on the first Monday of a quarter.
- **End-to-end Google coverage** of Search, Performance Max, Shopping, Demand Gen, YouTube, and
  Local — 19 production playbooks plus root-cause and query-intelligence labs.
- **A complete audit trail** for both — every autonomous action and every cron output lands on
  the board, so you can reconstruct exactly what changed and why.
- **One escalation path.** Budget-raise asks surface on the board with rationale and projected
  impact; everything else, the agents decide and ship.
- **A kill switch (Meta).** Ask the co-founder to put the Meta agent in recommendation-only
  mode any time and every proposed action queues for your approval until you `resume`.

## How it works

After install, the co-founder runs the onboarding script for whichever platform(s) you chose —
collecting credentials via the vault, connecting identities, walking the account-foundations
interview, and dispatching a baseline audit so you see real work while you're still there.

From then on each agent wakes the moment a ticket is assigned to it: the crons (Google:
optimization + digest; Meta: operations + digest + weekly review) file cofounder-briefed
tickets on their schedules, and ad-hoc work arrives as tickets the co-founder dispatches by
matching your intent to one of the squad's **published workflows** (`google.optimize_account`,
`google.root_cause`, `google.scale_budget`, `meta.daily_operations`, `meta.weekly_review`,
`meta.investigate`, and the two digests). On top of that, a **daily autonomy pulse** lets each
agent pick and run one of its own workflows to advance the company goal recorded on the wiki —
reversible actions only; anything budget-committing still goes through the approval path. Every
cron routes its result **through the board** as a `routine`/`digest` ticket rather than paging
you — only genuine asks (a budget approval, a blocker) surface, and the co-founder's daily
report rolls up the rest. The agents talk to the
ad platforms through the Google Ads API credentials and a self-hosted Meta MCP; your tokens
never leave your pod.
