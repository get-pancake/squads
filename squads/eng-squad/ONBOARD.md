---
required_tools: [github_install_start, github_install_check, github_get_token, vault_set, create_task, sessions_spawn]
required_identities: [github.com]
estimated_setup_minutes: 6
---

You (the cofounder) just installed **eng-squad** — two agents, Triage (read lane) and Build
(write lane). Run this script to get both working. Keep it to a few questions — don't lecture.

## 1. Connect GitHub

Both agents use the pod's GitHub App — Triage reads issues and writes labels + comments;
Build pushes branches and opens PRs.

- If GitHub is already connected (check with `github_get_token`), reuse it — don't re-ask.
- Otherwise, start the install: `github_install_start`, give the user the URL, and confirm with
  `github_install_check`. Both agents act as the installed App, so labels/comments/PRs are
  attributed to the install.

## 2. Which repos?

Ask the user which repositories the squad should work on — `owner/repo`, comma-separated (e.g.
`basalt-ai/infrastructure, basalt-ai/claw`). Save the answer to the vault:

- `vault_set team.github_repos "<their answer>"`

Confirm the App is actually installed on those repos (if not, point them at the App's repo-access
settings). Write the repo list into both agents' `MEMORY.md` too, as a convenience pointer.

## 3. Build lane — confirm the merge policy

One question: Build's default is to **self-merge a PR only when the change is reversible and CI
is green**, and to leave everything else (migrations, API breaks, anything hard to roll back)
open for the user's review. Ask the user to confirm that default, or tighten it to
"never self-merge — every PR waits for review".

Record the answer — plus any repo conventions they volunteer (branch naming, PR title format,
required reviewers) — under **Onboarding-collected settings** in
`agents/build-agent/MEMORY.md`. The GitHub connection and repo list from steps 1–2 are reused;
nothing else to collect.

## 4. First task — triage now, so they see it work

Pick the most active watched repo and dispatch the first sweep immediately so Triage does real
work while the user is here:

- `create_task({ assigned_to: "triage-agent", priority: "today", title: "Initial triage sweep — <repo>", context: "Run the eng.sweep_open_issues workflow for <repo>. Classify every untriaged open issue P0–P3, label it, post + file each assessment, then file the sweep digest as a routine ticket. Report the headline numbers and any P0/P1 back on this ticket.", notify_channel: <your Slack channel id>, notify_session_key: <your sessionKey> })`
- Then `sessions_spawn` Triage on it (runtime: subagent, mode: run) and `update_task_status(id, "in_progress")`.

Build gets no first task — it runs when there's something specified to implement.

## 5. Tell the user what's live

Briefly: the squad is connected to <repos>. **Triage** is running an initial sweep now, and from
here it sweeps daily (09:00) and reports weekly (Mon 10:00) — plus a once-daily autonomy pulse
where it may run an extra sweep or ad-hoc triage when that advances the company goal. **Build**
is on standby: whenever the user has an idea, issue, or PRD to ship, they tell you ("implement
issue #N" / "build this: …") and you dispatch `eng.implement_idea` to it — it'll come back with
a PR, self-merged only if reversible and CI-green per the policy just confirmed. To triage a
specific issue any time, they just ask you ("triage issue #N in <repo>"). P0s come straight to
you.
