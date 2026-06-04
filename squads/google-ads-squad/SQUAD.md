---
tags: [google-ads, ppc, paid-search, optimization, performance-marketing]
preview_image: https://squads.getpancake.ai/avatars/astronaut.png
---

## What this squad does

`google-ads-squad` deploys a single **Google Ads agent** that runs your account
like a senior in-house PPC manager. Once a day it pulls fresh performance data,
diagnoses what changed, and ships fixes — search-term negatives, bid moves,
creative pauses, asset rotations, settings corrections, and budget reallocations
within the existing total. Then it hands a tight digest to your co-founder for
relay. The agent owns the entire 19-playbook Google Ads toolkit and picks the
right method for the moment. It only stops to ask permission for one thing:
raising a budget.

## What you'll need

- A Google Ads **developer token** (apply for or retrieve from your MCC's
  Tools → API Center).
- An **OAuth refresh token** for the account you want managed, plus that
  account's **customer ID** (and `login_customer_id` if the account is under
  an MCC). This refresh token is the long-lived credential — the agent mints
  fresh access tokens from it on every run, no human in the loop.
- A primary KPI for the account (CPA, ROAS, or CPL) plus its target.

That's the full setup — these API credentials drive every read and write. A
connected `google.com` browser identity is **optional**: it's only a backup for
re-running the OAuth consent dance or pulling CSV exports from the UI. If you
enforce passkeys on your Google accounts, skip it — the squad is fully
functional on the API credentials alone.

## What you get

- **A daily optimization sweep** (17:00 PT) that diagnoses what changed and
  ships every reversible fix without asking.
- **A daily digest** (~200 words, three sections) handed to your co-founder at
  18:00 PT for relay — the co-founder picks the channel (Slack, voice, email,
  whatever your pod is configured for).
- **End-to-end coverage** of Search, Performance Max, Shopping, Demand Gen,
  YouTube, and Local — driven by 19 production playbooks plus root-cause and
  query-intelligence labs.
- **A single escalation channel.** Budget-raise asks land on your co-founder's
  queue as tasks with rationale and projected impact. Everything else, the
  agent decides and ships.

## How it works

You never talk to the agent directly — your co-founder relays everything.
After install, the co-founder runs the onboarding script: collects API
credentials via the vault (optionally connecting a Google identity as a
backup), walks the account-foundations interview, assesses maturity stage,
and dispatches a baseline audit. From there the agent runs on two crons (one sweep, one
digest hand-off), supplemented by ad-hoc tasks the co-founder dispatches.
Every cron stays silent unless something material happened — `NO_REPLY` is
the default. The agent operates fully autonomously within the budget envelope;
the only thing it ever brings back to your co-founder is a budget-raise ask
with a one-paragraph rationale, surfaced as a clear task on the co-founder's
queue.
