---
name: validate-squad
description: Validate an Agent Squad bundle and fix what's broken — runs the repo validator, explains each error in plain language, and corrects the offending files. Use when the user wants to check, validate, or debug a squad bundle.
---

# Validate a squad

Run the validator, explain what it found, and fix it.

## Step 1 — Run the validator

```sh
node scripts/validate.mjs                 # every squads/* bundle and template/
node scripts/validate.mjs squads/<name>   # one specific bundle
```

Scope it to a single bundle if the user named one. The validator exits non-zero if any
bundle has an error; warnings never fail the run.

## Step 2 — Explain each error

For every error, tell the user in plain language **what** is wrong and **why** it matters,
referencing [`docs/bundle-reference.md`](../../../docs/bundle-reference.md) for the rule.
The validator's checks fall into the following categories:

- **Manifest schema** (e.g. `agents[0]  "Geo Agent" must be kebab-case`) — a field in
  `manifest.json` breaks a rule: bad kebab-case or semver, a missing required field, a
  value outside an enum, a duplicate agent id, or `agents` is no longer an object array
  (it must now be a string array of agent ids).
- **`agent.json` missing** (`agents/<id>/agent.json  not found`) — every id in
  `manifest.agents` must have a matching `agents/<id>/agent.json` file.
- **`agent.json` schema** (e.g. `agents/<id>/agent.json#/model  must be one of: haiku,
  sonnet, opus`) — the per-agent config is invalid. Common causes:
  - Wrong `model` value (string enum `haiku`/`sonnet`/`opus`).
  - `heartbeat` declared on the agent — this is now an **unknown field**. OpenClaw's
    per-agent heartbeat does not fire for squad sub-agents today; move the wake
    procedure into a cron in `crons/jobs.json` whose `sessionTarget` is the agent's id,
    and embed the procedure in `payload.text`.
  - Other unknown field on the agent (only `id`, `description`, `model`, `skills`,
    `contextInjection`, `bootstrapMaxChars`, `params` are accepted).
  - `id` not matching the directory name.
- **Referenced-file errors** — a file the manifest or agent.json points to (`SQUAD.md`,
  `ONBOARD.md`, a skill, `IDENTITY.md`, `SOUL.md`) is missing, is a symlink, is not a
  regular file, or resolves outside the bundle root.
- **Unknown tool permission** (e.g. `required_tool_permissions[2]  "message" is not an
  accepted tool key`) — an entry in `manifest.required_tool_permissions` is not in the
  canonical Pancake tool list (see [`bundle-reference.md#tool-permissions`](../../../docs/bundle-reference.md#tool-permissions)).
  Common migrations: `browser_task`/`browser_open`/`browser_action` → `browser`;
  `message`, `slack-block-kit`, `voice`, `tts` → **delete** (Slack and voice are
  user-facing channels owned by the co-founder, not a squad agent). If the bundle still
  carries `slack-block-kit` from an earlier draft, that's why — drop it.
- **Targeting errors** (`crons/jobs.json`) — a cron's `sessionTarget` names an agent the
  squad does not declare. Squad crons may target only the squad's own agents.
- **Forbidden file** (e.g. `agents/<id>/USER.md  forbidden filename`) — the bundle
  contains a file named `AGENTS.md`, `USER.md`, `BOOTSTRAP.md`, `BOOT.md`, or
  `HEARTBEAT.md`. The first four are pod-managed by Pancake Cloud; `HEARTBEAT.md` is
  forbidden because OpenClaw's per-agent heartbeat does not fire for squad sub-agents
  today. **Migration:** move the wake procedure from `HEARTBEAT.md` into the
  `payload.text` of a cron in `crons/jobs.json` (with `sessionTarget` set to that agent's
  id), then delete the `HEARTBEAT.md` file and the `heartbeat` field from `agent.json`.
  For other forbidden files, just delete them. `TOOLS.md` is *allowed* and is not flagged.
- **Deprecated field** (e.g. `SQUAD.md  frontmatter has a deprecated 'token_intensity:'
  line`) — `token_intensity` has been removed from the contract. Pancake Cloud computes
  token usage automatically; delete the line.
- **Unresolved TODO** (e.g. `SQUAD.md  unresolved TODO marker on line 12`) — the bundle
  still contains `<!-- TODO`, `TODO:`, or a bare `TODO` line left over from the template.
  Strip the placeholder.
- **Frontmatter warnings** — `SQUAD.md` missing `tags`, or `ONBOARD.md` missing its
  frontmatter block. These do not fail the run but advise the user to fix them so the
  catalog card renders correctly.

## Step 3 — Fix the offending files

Correct each error in the relevant file. Make the smallest change that satisfies the
contract — don't rewrite content that isn't broken. For a missing referenced file, either
create the file or remove the manifest reference, depending on the user's intent (ask if
unclear). For a forbidden filename, delete the file (or rename it if the content is
worth keeping — e.g. `USER.md` content can move into `MEMORY.md` as a pointer).

## Step 4 — Re-run until clean

Run the validator again. Repeat Steps 2–3 until it exits 0 with no errors. Then report the
result: confirm the bundle is valid, and list any warnings the user chose to leave.
