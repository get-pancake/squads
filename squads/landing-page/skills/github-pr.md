---
name: github-pr
description: Open a GitHub pull request against the landing page repo using the pod's connected GitHub identity. Use this whenever an agent needs to propose a code or content change.
---

# GitHub PR

## Prerequisites

- A `github.com` identity must be connected on this pod (verified during onboarding).
- The landing page repo slug must be in `MEMORY.md` (set at onboarding as `team.landing_repo`).

## Step 1 — Prepare the change

Before opening a PR, ensure:
1. The change is complete and self-contained — no WIP PRs.
2. You know the target branch (default: `main` or the repo's default branch).
3. You have a clear branch name: `<type>/<short-description>` — e.g. `copy/headline-v2`, `analytics/add-ga4`, `design/standardize-button`.

## Step 2 — Open the PR via browser automation

Use the connected `github.com` browser identity to:
1. Fork or branch the repo (create the branch from the default branch HEAD).
2. Commit the file changes to the branch.
3. Open a pull request with:
   - **Title**: concise, action-oriented (e.g. "Copy: sharpen homepage headline for clarity")
   - **Body**: structured description — What, Why/Hypothesis, Merge criteria
   - **Draft status**: draft if the change needs review before merging; ready-for-review if self-contained and safe

## Step 3 — Verify

Confirm the PR URL is valid and the diff looks correct before reporting it.

## Step 4 — Report

Return the PR URL to include in `complete_task`. Never merge — only open.
