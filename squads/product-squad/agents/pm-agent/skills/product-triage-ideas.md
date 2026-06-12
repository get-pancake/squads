---
name: product-triage-ideas
description: PM-agent's procedure for the product.triage_ideas workflow — sweep the Notion ideas DB for Status=New entries, research each one, write a PRD sub-page, and set the Todo/Rejected verdict. Load on every triage ticket (cron or dispatched).
---

# Triage product ideas — PM-agent

Run this for every `product.triage_ideas` ticket. The done-state: no entry in the ideas DB is left at Status = `New`.

## 0 — Before you start

1. Read `MEMORY.md` → `Notion — Product Improvement Ideas DB` for the DB id and status rules. If the DB id is missing, onboarding hasn't completed — `fail_task` with "ideas DB id not set in MEMORY; onboarding incomplete".
2. Probe Notion access with one trivial read (fetch the DB). Prefer the Notion tool (OAuth). If a query the tool can't express is needed, fall back to the raw API with `vault_get(key: "team.notion")` — never paste the token anywhere.
3. Query the DB for entries with **Status = `New`**, oldest first.
4. **Zero `New` entries** → this is a quiet run. On a cron ticket: log one line to `memory/YYYY-MM-DD.md` and reply with the single literal token `NO_REPLY`. On a dispatched ticket: `complete_task` with "no New entries — DB clean" as the result and a one-line digest.

## 1 — Per idea, in order

For each `New` entry:

1. **Mark in flight.** Set the entry's Status to `Analyzed` so a crashed run is visible.
2. **Research** (the SOUL.md Research Standard, mandatory):
   - `web_search` for prior art, market practices, and competitor behavior on this problem.
   - `web_fetch` at least 3 deep technical sources — actual docs, READMEs, technical discussions. Snippets don't count.
   - Check existing packages/frameworks that already solve it; check how competitors handle it (or don't).
   - Validate feasibility against the company's stack (per `wiki/Company/COMPANY.md`); collect blockers for Open Questions.
3. **Decide** — `Todo` (build) or `Rejected` (don't). Decision criteria:
   - `Todo`: solves a real pain for the ICP, feasible with the current stack, meaningfully differentiates, fits roughly 1–4 weeks of engineering effort.
   - `Rejected`: solvable with a tool the user already has, cost >> value at the current stage, conflicts with a documented architectural decision, or outside the target customer profile.
   - No "it depends" — pick one and state why.
4. **Write the PRD** as a Notion child page of the entry, titled `PRD: {Idea Title}`, with all nine sections: Problem statement, Proposed solution, Scope (in/out), User stories (≥ 3, concrete), Technical approach, Implementation steps (ordered, rough estimates), Open questions, Success metrics, Research sources (every URL fetched, minimum 3).
5. **Update the entry**: final Status (`Todo` or `Rejected`), a one-paragraph verdict in the notes field, and confirm the PRD sub-page is linked.

## 2 — Close the ticket

1. Log the run to `memory/YYYY-MM-DD.md`: entries processed, verdicts, anything odd.
2. `complete_task` with:
   - `result`: counts + per-idea one-liners, e.g. "Triaged 3 ideas: 2 → Todo (CSV export, board templates), 1 → Rejected (native mobile app — cost >> value, PRD explains). PRDs filed as sub-pages."
   - `digest`: the short read for the co-founder — verdicts, the single most important open question, what's next.
3. No `notify_channel`, no messages to anyone — the board carries the result.

## Notes

- Never set Status to `In Review` or `Shipped`, and never reset an entry to `New` — those belong to other owners.
- If an idea genuinely needs a strategic call only the co-founder can make (pricing, major pivot), leave it at `Analyzed`, file what research you have, and ask on the ticket via `add_task_comment` + `update_task_status(needs_input)` — don't guess, and don't block the other ideas behind it.
- A bad PRD costs 10x the research time it would have taken to get it right. Slow is fine; wrong is not.
