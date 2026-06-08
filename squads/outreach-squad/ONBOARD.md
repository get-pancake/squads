---
required_tools:
  - vault_request
  - browser_identity_add
  - message
required_identities:
  - linkedin.com
estimated_setup_minutes: 8
---

## Onboarding — outreach-agent

You are the co-founder running the install skill. The mechanical deploy is done. Run the onboarding conversation below, then seed the pipeline and trigger the first wake. The user was promised about 8 minutes — keep it tight.

**1 — Connect the LinkedIn identity.** Ask the user whether they want the outreach agent to use their personal LinkedIn or a company LinkedIn profile. Then connect the chosen `linkedin.com` identity with `browser_identity_add` — but first check whether a matching identity already exists on this pod (via `browser_profile_list` or `browser_profile_status`) and reuse it if so.

**2 — Define or confirm the ICP.** Ask the user:
- What role feels the pain most acutely? (e.g. Head of Sales, CTO, VP Marketing)
- Which industry or vertical?
- Company size range or funding stage?
- What trigger event makes them ready to buy? (new hire, funding, competitor switch, product launch, etc.)
- Core pain your product solves?
- Anti-ICP — who should never be contacted?

The user may already have this defined in the wiki. Check `wiki/Company/COMPANY.md` or `wiki/Company/ICP.md` first. If yes, confirm it's current. If not, collect the answers and write them to `agents/outreach-agent/MEMORY.md` under a clear **ICP** heading. If the user doesn't want to answer or doesn't know, use what you know about their product to propose an ICP — and confirm before proceeding.

**3 — Reporting line (no channel to pick).** The outreach agent is **mute to the user** — it files the daily digest and every result onto the company task board as `routine`/`digest` tickets, and you (the co-founder) read the board and relay to the user on whatever channel your pod uses. There's no separate digest channel to configure. Note this in `agents/outreach-agent/MEMORY.md` under **Reporting line** so the agent doesn't try to post anywhere itself. (This is distinct from the *outreach channel* — LinkedIn/email — which is how it messages leads; that's set in steps 1 and 4.)

**4 — Optional automation tools.** Ask whether the user already has accounts for Heyreach, Lemlist, FullEnrich, Jungler, or Crunchbase. If yes, collect the API keys via `vault_request` at the paths listed in `manifest.json` — share the returned vault URLs exactly as returned, do not compose or fabricate vault URLs. If no, skip this step — the agent starts in manual mode (it drafts messages, the user sends them).

**5 — Dispatch the first ticket.** The Active leads table in `agents/outreach-agent/MEMORY.md` starts empty — that's fine. Dispatch the first campaign naming the workflow, with your relay coordinates on THIS task only so the user sees it work live:

- `create_task({ assigned_to: "outreach-agent", priority: "today", title: "Seed the pipeline — <ICP>", context: "Run the outreach.run_campaign workflow against the onboarded ICP: source the first 4 leads (signal-first, ICP-search fallback), append them to the Active leads ledger, send Touch 1, and file the seed digest as a routine ticket. Report the headline (leads sourced, touches sent) back on this ticket.", notify_channel: <your Slack channel id>, notify_session_key: <your sessionKey> })`
- Then `sessions_spawn outreach-agent` on it and `update_task_status(id, "in_progress")`.

From then on: the `daily-outbound-loop` cron runs at 08:00 LA daily, the `reply-sweep` cron runs every 2h (excluding 08:00) to keep reply latency under 2h, and the 2h heartbeat pulse handles mission-deepening between cron runs.

Close by telling the user the agent is already working, the first batch of leads + drafted messages is underway, and everything from here lands on the board for you to relay — they never talk to the agent directly.
