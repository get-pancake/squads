---
required_tools: [github, web_fetch]
required_identities: [github.com]
estimated_setup_minutes: 5
---

You (the cofounder) just installed **github-triage-squad**. Run this script to get Triage working.
Keep it to a couple of questions — don't lecture.

## 1. Connect GitHub

Triage needs the pod's GitHub App connected so it can read issues and write labels + comments.

- If GitHub is already connected (check with `github_get_token`), reuse it — don't re-ask.
- Otherwise, start the install: `github_install_start`, give the user the URL, and confirm with
  `github_install_check`. Triage acts as the installed App, so labels/comments are attributed to
  the install.

## 2. Which repos?

Ask the user which repositories Triage should watch — `owner/repo`, comma-separated (e.g.
`basalt-ai/infrastructure, basalt-ai/claw`). Save the answer to the vault:

- `vault_set team.github_repos "<their answer>"`

Confirm the App is actually installed on those repos (if not, point them at the App's repo-access
settings). Write the repo list into Triage's `MEMORY.md` too, as a convenience pointer.

## 3. First task — triage now, so they see it work

Pick the most active watched repo and dispatch the first sweep immediately so Triage does real
work while the user is here:

- `create_task({ assigned_to: "triage-agent", priority: "today", title: "Initial triage sweep — <repo>", context: "Run the github.sweep_open_issues workflow for <repo>. Classify every untriaged open issue P0–P3, label it, post + file each assessment, then file the sweep digest as a routine ticket. Report the headline numbers and any P0/P1 back on this ticket.", notify_channel: <your Slack channel id>, notify_session_key: <your sessionKey> })`
- Then `sessions_spawn` Triage on it (runtime: subagent, mode: run) and `update_task_status(id, "in_progress")`.

## 4. Tell the user what's live

Briefly: Triage is connected to <repos>, it's running an initial sweep now, and from here it
sweeps daily (09:00) and reports weekly (Mon 10:00). To triage a specific issue any time, they
just ask you ("triage issue #N in <repo>") and you'll hand it to Triage. P0s come straight to you.
