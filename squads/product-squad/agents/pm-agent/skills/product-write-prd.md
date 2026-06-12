---
name: product-write-prd
description: PM-agent's procedure for the product.write_prd workflow — write a full, research-backed PRD for one named idea, ad hoc, filing it into the Notion ideas DB. Load when a ticket names a specific idea rather than a DB sweep.
---

# Write a PRD for a named idea — PM-agent

Run this for every `product.write_prd` ticket. Inputs from the ticket brief: `idea` (required — the idea in one or two sentences) and `context` (optional — who asked, constraints, prior discussion).

## 0 — Before you start

1. Read `MEMORY.md` → `Notion — Product Improvement Ideas DB` for the DB id. Missing → `fail_task` with "ideas DB id not set in MEMORY; onboarding incomplete".
2. Probe Notion access with one trivial read. Prefer the Notion tool (OAuth); fall back to the raw API with `vault_get(key: "team.notion")` only for queries the tool can't express.
3. Search the ideas DB for an existing entry matching the idea (semantic match on the title and notes, not exact strings).
   - **Found** → work against that entry. If it already carries a PRD sub-page, you are *revising*: read it first, keep what holds, update what the new context changes, and note the revision at the top.
   - **Not found** → create a new DB entry titled from the idea, Status `Analyzed`, with the ticket's `context` in the notes.

## 1 — Research (mandatory, no shortcuts for ad-hoc asks)

The SOUL.md Research Standard applies in full:

1. `web_search` for prior art, market practices, and competitor behavior.
2. `web_fetch` at least 3 deep technical sources — docs, READMEs, technical discussions.
3. Check existing packages/frameworks; check competitor implementations.
4. Validate feasibility against the company's stack (`wiki/Company/COMPANY.md`); collect blockers for Open Questions.
5. Fold the ticket's `context` into scope — a constraint the co-founder stated outranks your inference.

## 2 — Write and file

1. Write the PRD as a Notion child page of the entry, titled `PRD: {Idea Title}`, with all nine sections: Problem statement, Proposed solution, Scope (in/out), User stories (≥ 3, concrete), Technical approach, Implementation steps (ordered, rough estimates), Open questions, Success metrics, Research sources (minimum 3 URLs).
2. Set the entry's final Status — `Todo` or `Rejected` — by the same decision criteria as `product-triage-ideas` §1.3, with a one-paragraph verdict in the notes. Yes, an ad-hoc PRD can conclude "don't build this"; say so plainly.

## 3 — Close the ticket

1. Log the run to `memory/YYYY-MM-DD.md`.
2. `complete_task` with:
   - `result`: the verdict + the Notion location, e.g. "PRD: CSV export filed as sub-page of the ideas-DB entry; verdict Todo — ~1 week effort, no blocking open questions."
   - `digest`: verdict, the one decision the co-founder should know about, top open question if any.
3. No `notify_channel`, no messages to anyone — the board carries the result.

## Notes

- If the `idea` input is too vague to research ("make the product better"), don't pad a PRD around fog — ask one specific scoping question via `add_task_comment` + `update_task_status(needs_input)`.
- Never duplicate entries: one idea, one DB row, one PRD sub-page, revised in place.
