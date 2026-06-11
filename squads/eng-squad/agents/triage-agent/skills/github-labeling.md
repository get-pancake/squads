---
name: github-labeling
description: How to read issues and apply the single-priority label scheme on GitHub — getting a fresh token, the priority/P0–P3 labels, creating them if missing, swapping (never stacking) them, and posting the triage comment. Load it alongside triage-playbook when running a triage workflow.
---

# GitHub labeling

The mechanics of reading issues and writing labels/comments. The *judgement* (which P-level)
lives in `triage-playbook`.

## Auth

The pod connects GitHub as an App installation. Before any `gh` / API call, get a fresh token —
the cofounder exposes `github_get_token` (tokens are 1h-lived). Use it as `GH_TOKEN` for the
`gh` CLI, or as a bearer token for the REST API. Never hard-code or cache a token across wakes.

## The label scheme

Exactly **one** criticality label per issue, from this fixed set:

| Label | Color | Meaning |
|---|---|---|
| `priority/P0` | `b60205` (red) | Critical — production broken/unsafe |
| `priority/P1` | `d93f0b` (orange) | High — major function degraded |
| `priority/P2` | `fbca04` (yellow) | Medium — real bug, limited blast radius |
| `priority/P3` | `0e8a16` (green) | Low — minor / cosmetic / speculative |

**Create-if-missing.** On first run in a repo, ensure the four labels exist (`gh label create`
or the labels API). Idempotent — skip any that already exist.

## Applying a label (swap, never stack)

A single issue must carry at most one `priority/P*`. To set P2 on an issue:

1. Read its current labels.
2. Remove any existing `priority/P*` label that isn't the target.
3. Add the target `priority/P*`.

```sh
# illustrative — gh CLI
gh issue edit <n> --repo <owner/repo> --add-label "priority/P2" \
  --remove-label "priority/P0,priority/P1,priority/P3"
```

`--remove-label` silently ignores labels the issue doesn't have, so removing all three non-target
levels in one call is safe.

## Posting the assessment comment

After labeling, post the assessment paragraph (from `triage-playbook`) as an issue comment:

```sh
gh issue comment <n> --repo <owner/repo> --body "<the assessment>"
```

Sign nothing as the user — the comment is Triage's classification, written plainly. One comment
per triage; if re-triaging after a reopen, post a new comment noting the revised call and why.

## What you must never do

- Never `gh issue close` / reopen / edit the title or body — you classify, you don't resolve.
- Never stack multiple `priority/P*` labels.
- Never apply a label you can't justify from the issue contents (see `triage-playbook` → assessment).
