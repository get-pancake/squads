---
name: implement-idea
description: The end-to-end procedure for the eng.implement_idea workflow — take a specified idea, issue, or PRD and ship it as a tested, reviewable PR. Load it whenever you run eng.implement_idea.
---

# Implement an idea

Turn one specified source into working, tested, reviewable code. The source defines the
scope; the merge policy defines the gate. Work the steps in order — don't skip the scoping
to get to the code faster.

## 1. Ground in the source

- Resolve the ticket's `source` input: a GitHub issue URL (fetch the issue **and its full
  comment thread**), a PRD/spec reference (read the whole document — wiki page or board
  ticket), or an idea written out in the ticket itself.
- Extract: the goal, what's explicitly **in** scope, what's explicitly **out**, acceptance
  criteria, and any open questions.
- **Gate — escalate before coding** (`add_task_comment` + `update_task_status(needs_input)`)
  if any of these hold:
  - The ticket has no concrete source, or the source is a one-liner with no implementable
    spec. Never fabricate the missing spec.
  - An open question in the source is a hard blocker.
  - The spec conflicts with the existing architecture, or with another in-flight change in
    the same area.

## 2. Scope and plan

- Resolve the target repo: the `repo` input if given, otherwise pick the matching repo from
  the `team.github_repos` vault value (read it with `vault_get`). If no repo plausibly
  matches the source, that's a `needs_input`, not a guess.
- Read the relevant code paths before planning. Note the repo's conventions: branch naming,
  PR title format, lint/build/test commands (`package.json`, `Makefile`, CI config,
  `CONTRIBUTING.md`) — and anything recorded in your `MEMORY.md` from onboarding.
- Estimate complexity. **More than a day of work → flag on the ticket before starting**
  with your estimate and a proposed slice; don't silently take on a multi-day task.
- Plan the change as the smallest diff that satisfies the spec. If the source has multiple
  decoupled pieces, plan one PR per piece.

## 3. Implement

- Get a fresh token (`github_get_token`) and create a feature branch: `feat/<slug>` (or
  `fix/<slug>`), from the default branch, never committing to it directly.
- Implement per the spec's scope. Stay inside it — adjacent improvements you notice go in
  the ticket report as follow-up suggestions, not in this diff.
- Write tests for the new behaviour: at minimum, tests the spec implies; match the repo's
  existing test style and framework.

## 4. Verify before any PR

- Run the repo's **lint, build, and test** commands locally. All green before a PR opens —
  no exceptions. A PR with a red build is worse than no PR.
- Re-read the diff once against the acceptance criteria.

## 5. Open the PR

- Title: `feat: <short description>` (or `fix:`), matching the repo's convention if it has
  one.
- Description: what changed and why, a link back to the source (issue URL / PRD ref) and
  the dispatching board ticket, and test notes. Lead with the summary.
- Push the branch, open the PR, and watch CI.
- **Partial or blocked mid-way?** Open the PR anyway, marked WIP, with an honest
  description of what's done and what's left.

## 6. The merge call

- **Self-merge (squash) only when BOTH hold:**
  1. The change is **reversible** — a revert cleanly undoes it. Not reversible: schema or
     data migrations, data deletion, public API breaks, auth/security changes,
     infrastructure or release config.
  2. **CI is fully green** on the PR.
- Anything else: leave the PR open for human review and say so explicitly in the ticket
  report — the cofounder routes the review.
- Never force-push shared history or merge over a red check "because it's flaky".

## 7. File the outcome on the board

- `complete_task` on the dispatching ticket with:
  - **result**: what was implemented, the PR link, merged-or-awaiting-review, test/CI
    status, and any follow-ups or out-of-scope findings.
  - **digest**: one or two sentences — the change, the merge state, the next move.
- If the run failed on a hard blocker (dead dependency, missing credential, unresolvable
  conflict): `fail_task` with the concrete reason — never a silent stall.
- Log one paragraph to `memory/YYYY-MM-DD.md`: source, decisions made alone, outcome.
