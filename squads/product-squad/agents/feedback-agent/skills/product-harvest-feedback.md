---
name: product-harvest-feedback
description: Feedback-agent's procedure for the product.harvest_feedback workflow — collect new feedback from the configured sources since the last checkpoint, dedupe, file into the Notion feedback DB, flag recurring themes, advance the checkpoint. Load on every harvest ticket (cron or dispatched).
---

# Harvest feedback — Feedback-agent

Run this for every `product.harvest_feedback` ticket. The done-state: every piece of feedback from the configured sources since the last checkpoint is deduplicated, filed in the Notion feedback DB with a priority label, and the checkpoint is advanced.

## 0 — Before you start

1. Read `MEMORY.md`: the feedback DB id + schema notes, the `Sources I monitor` list, the triage rules, and the `Last run checkpoint`. DB id or source list missing → `fail_task` with "feedback DB / sources not set in MEMORY; onboarding incomplete".
2. Probe Notion access with one trivial read (fetch the DB). Prefer the Notion tool (OAuth); fall back to the raw API with `vault_get(key: "team.notion")` only for queries the tool can't express.
3. Fix the harvest window: from the checkpoint timestamp to now. First run ever (no checkpoint) → ask the co-founder how far back to sweep via `add_task_comment` + `update_task_status(needs_input)`, unless the ticket brief already says.

## 1 — Collect, per source in MEMORY

For each configured source, collect everything new inside the window, using the access method MEMORY records for it (`agentmail` for forwarded-email inboxes, `web_fetch` for API-backed sources, the Notion tool for Notion-native ones). Rules:

- **Completeness over interpretation** — capture verbatim text, author, source, and date. Don't filter by your own judgment of importance.
- A source erroring out doesn't kill the run: note it, harvest the rest, and list it under "sources missed" in the digest. A source missed twice in a row escalates (SOUL.md → Escalation Rules).
- Never reply, react, or send anything outbound from any source. Read-only.

## 2 — Extract and triage

1. From the raw haul, extract distinct feedback items: feature requests, bugs, pain points, use cases, competitive mentions. One item per distinct point — a single email can carry three items.
2. Label each with a priority per `MEMORY.md → Triage rules`: P0 (blocks a paying customer / churn risk / critical bug), P1 (high-impact multi-customer request or competitive gap), P2 (valuable, 2+ mentions, north-star-aligned), P3 (nice-to-have). Ambiguous → bias higher.

## 3 — Dedupe and file

1. Fetch the DB's open entries (skip closed/done ones) and match each new item semantically — topic, user, keywords, not exact strings.
2. **Duplicate** → update the existing row: append the new source + date, bump the priority if the new mention warrants it. **Novel** → create a row, following the field/option names recorded in `MEMORY.md → Schema` exactly (probe the DB and update MEMORY first if the schema looks drifted — never invent select options).
3. Set the fields you own (priority, source, customer, description, date); leave status at the DB default for new entries.

## 4 — Themes and checkpoint

1. Scan the filed items plus the recent DB for recurring themes (e.g. "3rd SSO mention this week") — these go in the digest, and a theme spanning 3+ customers is worth flagging even if every individual item is P2.
2. **Advance the checkpoint in `MEMORY.md` only now**, after the Notion writes have landed: new timestamp, window covered, counts, sources reached/missed.

## 5 — Close the ticket

1. Log the run to `memory/YYYY-MM-DD.md`: sources checked, items extracted, Notion writes, anything missed.
2. **Zero new items collected** → quiet run. On a cron ticket: log it and reply with the single literal token `NO_REPLY`. On a dispatched ticket: `complete_task` with "no new feedback in the window" and a one-line digest.
3. Otherwise `complete_task` with:
   - `result`: counts + the top 3–5 items, e.g. "Harvested 6 new items from 2 sources (4 email, 2 meeting notes); 1 P0 (login broken for Acme), filed and flagged. DB now at 95 entries."
   - `digest`: collected counts, top highlights with priorities, trends, urgent flags — P0s explicitly at the top so the co-founder raises them now.
4. No `notify_channel`, no messages to anyone — the board carries the result.

## Notes

- No meta-narration anywhere — the digest reports findings, not your activity log.
- All persistent artifacts (Notion entries, logs, digests) in English, regardless of the source language.
- One row per distinct piece of feedback, forever — when in doubt, update rather than create.
