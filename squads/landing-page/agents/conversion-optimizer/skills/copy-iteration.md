---
name: copy-iteration
description: Daily copy improvement loop for the landing page — read, diagnose, hypothesize, write a variant, open a PR. Load this skill on every daily heartbeat run.
---

# Copy iteration

## Step 1 — Read the current state

1. Read `MEMORY.md` to get the repo slug and primary conversion goal.
2. Clone or fetch the landing page repo. Read the homepage and any key landing pages.
3. Skim `wiki/Projects/LandingPage/CopyVariants/` for recent proposals — avoid repeating work from the last 7 days.

## Step 2 — Diagnose the top conversion weakness

Evaluate the page against these criteria (pick the single weakest area today):

- **Headline clarity** — does it immediately communicate who this is for and what they get?
- **Value prop specificity** — are benefits concrete and differentiated, or vague ("faster", "better")?
- **CTA strength** — is the primary CTA action-oriented and low-friction?
- **Social proof** — is it specific (names, numbers, outcomes) or generic?
- **Objection handling** — are the top 2-3 buyer objections addressed above the fold?
- **Secondary pages** — are lead magnets or secondary pages missing that could capture intent earlier?

## Step 3 — Form a hypothesis

Write a one-sentence hypothesis:
> "I believe [changing X] will [increase sign-ups / reduce bounce / increase CTA clicks] because [specific reason tied to the diagnosis]."

## Step 4 — Write the variant

Write the new copy (headline, subhead, CTA, body section, or full secondary page — whatever the hypothesis calls for). Keep it tight. This is the content that goes into the PR.

## Step 5 — Open a PR

Using the GitHub identity on this pod:
1. Create a branch: `copy/<short-description>` (e.g. `copy/headline-specificity-v2`).
2. Apply the copy change to the relevant file(s).
3. Write a PR description with three sections:
   - **What changed**: one sentence.
   - **Hypothesis**: paste from Step 3.
   - **Merge criteria**: what signal (analytics, co-founder approval) means this ships.
4. Open the PR as a draft if it needs review; ready-for-review if the change is small and self-contained.

## Step 6 — File and report

1. Append a one-line entry to `wiki/Projects/LandingPage/CopyVariants/` — date, what was proposed, PR link.
2. Log in `memory/YYYY-MM-DD.md`: what you changed and why.
3. `complete_task` with PR link + one-line rationale, or `fail_task` if blocked (with reason).
