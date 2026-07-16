---
name: design-system-maintenance
description: Daily design-system audit and maintenance loop — find and fix one visual inconsistency, update the token file and wiki. Load on every daily heartbeat.
---

# Design system maintenance

## Step 1 — Locate the token source of truth

Read `MEMORY.md` for "Design system location". If the token file path is not yet set:
1. Clone or fetch the landing page repo (`team.landing_repo`).
2. Search for: `tailwind.config.*`, `tokens.css`, `variables.css`, CSS custom-property blocks (`--color-*`, `--font-*`, `--spacing-*`), or a `design-tokens.*` file.
3. If found, record the path in `MEMORY.md` under "Design system location → Token file".
4. If not found, create a minimal `tokens.css` at the repo root (or appropriate location) with existing values extracted from the codebase — open a PR for this and skip the consistency audit this run.

## Step 2 — Consistency audit

Scan the landing page source files for these patterns (stop at the first significant finding):

1. **Color inconsistencies** — hardcoded hex/rgb values that are not in the token file, or multiple similar values that should be one token (e.g. `#1a1a1a` and `#111111` both used for "near-black text").
2. **Spacing inconsistencies** — arbitrary px values for margin/padding that don't follow a scale.
3. **Typography inconsistencies** — multiple font-size or font-weight values that don't map to a type scale.
4. **Button / CTA inconsistencies** — multiple button styles (different border-radius, padding, colors) that should be unified.
5. **Shadow / border inconsistencies** — arbitrary box-shadow or border values.

## Step 3 — Pick one fix

Choose the highest-impact inconsistency found (the one that affects the most components or the most visible part of the page). Write down:
- What the inconsistency is
- What the standardized token value should be
- Which files need updating

## Step 4 — Apply the fix

1. Update the token file (add or rename the token).
2. Replace hardcoded values in affected files with the token reference.
3. Update `wiki/Projects/LandingPage/DesignSystem.md`:
   - Add the token to the relevant section (Colors, Typography, Spacing, etc.)
   - Note what it replaced and why

## Step 5 — Open a PR

Branch: `design/standardize-<token-name>` (e.g. `design/standardize-primary-cta-color`)

PR description:
- **What**: one sentence on the inconsistency fixed
- **Token**: the new token name and value
- **Files changed**: list of affected files
- **Wiki**: confirm the design-system doc was updated

## Step 6 — Report

1. Append to `wiki/Projects/LandingPage/DesignSystem.md` under "## Changelog": date, token added/changed, what it replaced.
2. Log in `memory/YYYY-MM-DD.md`: one line on what was standardized.
3. `complete_task` with PR link + one-line summary, or `NO_REPLY` if the daily run found no inconsistencies (everything is already tokenized).
