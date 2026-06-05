# Creating an Agent Squad

This guide walks through building a complete, valid Agent Squad bundle — the unit the
Pancake marketplace ingests. By the end you'll have a bundle that passes the validator
and is ready to publish.

If you're using Claude Code in this repo, the **`create-squad` skill** automates every
step below. This guide is the canonical manual reference — what the skill does, and what
you need to know if you're building by hand.

## 1. Prerequisites

You don't need to read anything else first, but it helps to know:

- **What a squad is.** A squad is one or more *focused, single-lane* sub-agents that get
  installed into a Pancake pod and run autonomously — finding leads, monitoring metrics,
  publishing content, whatever the squad is built for. Each agent reports to the user's
  co-founder agent; the user never talks to a squad agent directly.
- **The runtime.** Squads run on OpenClaw inside a Pancake pod. Each agent wakes on a
  *cron* (e.g. every 2 hours, or daily) declared in `crons/jobs.json` and runs the
  procedure embedded in the cron's payload. (OpenClaw's per-agent
  `agent.json#/heartbeat` does not fire for squad sub-agents today — that's why the wake
  procedure lives in a cron, not in a `HEARTBEAT.md`.)
- **The file contract.** A bundle is a directory of files with a specific shape. The
  validator enforces that shape; the marketplace re-checks it on ingest.

The skeleton bundle [`template/`](../template/) is the canonical living example — every
file the contract permits is present with placeholder content. Walking it is the fastest
way to learn the layout.

## 2. Squad anatomy

A bundle's directory layout, with required (✔) and optional (·) members:

```
manifest.json                  ✔  package descriptor (name, version, agents list, …)
SQUAD.md                       ✔  marketplace catalog card (frontmatter + Markdown body)
ONBOARD.md                     ✔  onboarding script the co-founder runs after deploy
MEMORY.md                      ·  squad-wide seed memory
skills/<name>.md               ·  squad-wide skills (every agent receives a copy)
TOOLS.md                       ·  optional documentation of the squad's tool surface
agents/<agent-id>/
  agent.json                   ✔  per-agent runtime config (model, skills)
  IDENTITY.md                  ✔  who the agent is (name, role, scope)
  SOUL.md                      ✔  how the agent behaves (personality, principles)
  MEMORY.md                    ·  agent-specific seed memory (overrides squad-wide)
  skills/<name>.md             ·  agent-specific skills
crons/jobs.json                ·  native OpenClaw cron jobs — also the home of any
                                  recurring wake procedure (the cron's payload text)
```

A few things the validator *forbids* inside a bundle:

- `AGENTS.md`, `USER.md`, `BOOTSTRAP.md`, `BOOT.md` — these are pod-level files managed
  by Pancake Cloud, not by squads. Don't ship them.
- `HEARTBEAT.md` — OpenClaw's per-agent heartbeat does not fire for squad sub-agents
  today. The wake procedure lives in a cron's `payload.text` in
  [`crons/jobs.json`](../template/crons/jobs.json) instead.
- `token_intensity` in `manifest.json` or `SQUAD.md` frontmatter — deprecated. Pancake
  Cloud computes token usage automatically.
- `tasks/` directory — squads do not ship task templates. Ad-hoc work is dispatched at
  runtime via the co-founder.

For the exact file-by-file contract see [`bundle-reference.md`](./bundle-reference.md).

## 3. Step-by-step walkthrough

### 3.1 Copy the template

```sh
cp -R template squads/<your-squad-name>      # if you're contributing to this repo
# or, for a self-hosted bundle, copy the template's contents to your own repo's root
```

Every file under `template/` is a complete, valid example with `<!-- TODO -->` comments
and placeholder content. Your job over the next steps is to replace all of it.

### 3.2 Fill `manifest.json`

```json
{
  "name": "your-squad-name",
  "version": "0.1.0",
  "description": "One sentence on what installing this deploys.",
  "author": "your-github-handle",
  "license": "MIT",
  "skills": ["skills/your-shared-playbook.md"],
  "agents": ["your-agent-id"],
  "required_identities": [
    { "site": "github.com", "reason": "why the agent needs github connected" }
  ],
  "required_vault_secrets": [
    { "key": "team.your_setting", "label": "Prompt shown to the user", "type": "string" }
  ],
  "required_tool_permissions": ["web_search", "web_fetch", "message"],
  "min_pancake_version": "1.0.0"
}
```

- `name` must be globally unique, kebab-case, ≤ 64 chars.
- `version` follows semver. Start at `0.1.0`; bump on every release.
- `description` is the one-line catalog card subtitle, ≤ 200 chars.
- `agents` is a string array of kebab-case agent ids — each id must have a matching
  `agents/<id>/agent.json` file (next step).
- `required_tool_permissions` must contain only **accepted Pancake tool keys**. Anything
  else is a validation error. Tools shipped today (with their accepted aliases):

  | Tool | Accepted keys |
  |---|---|
  | Browser (Anchor) | `browser` |
  | Web search / fetch (Exa) | `exa`, `web_search`, `web_fetch` |
  | GitHub | `github` |
  | Google Workspace | `google-workspace`, `google_workspace` |
  | Notion | `notion` |
  | Email (AgentMail) | `agentmail` |
  | Identity vault | `vault` |
  | Preview hosting | `preview-host`, `publish_preview` |
  | MCP installer | `mcp-installer` |
  | Image generation | `image-generation`, `image_generate`, `image` |
  | Scheduling | `cron` |

  Slack and voice/TTS are intentionally not authorable from a squad — those are
  user-facing channels owned by the co-founder agent. Squad agents report to the
  co-founder, which relays to the user.

- Delete every optional section your squad doesn't use. The validator complains about
  empty values, not absent fields.

### 3.3 Write each agent's `agent.json`

For every id in `manifest.agents`, create `agents/<id>/agent.json`:

```json
{
  "id": "your-agent-id",
  "description": "One line on what this agent owns.",
  "model": "sonnet",
  "skills": ["agents/your-agent-id/skills/your-skill.md"]
}
```

This file is the bundle's slice of OpenClaw's agent runtime config. See
[*4. agent.json reference*](#4-agentjson-reference) below for every field. Note that
`heartbeat` is **not authorable** from a squad bundle — see
[*6. Recurring wakes — the cron pattern*](#6-recurring-wakes--the-cron-pattern).

### 3.4 Write `IDENTITY.md` and `SOUL.md`

For every agent:

- **`IDENTITY.md` — who the agent is.** A header (Name, Role, Scope, Created by) plus
  *What I Do*, *What I Don't Do*, *KPI / Goal*, *How To Reach Me*, *Voice / Personality*.
  Mirror [`template/agents/example-agent/IDENTITY.md`](../template/agents/example-agent/IDENTITY.md).

- **`SOUL.md` — how the agent behaves.** Personality, *Operating Principles*,
  *Escalation Rules*, *Boundaries (Inviolable)*, *What Success Looks Like*. Mirror
  [`template/agents/example-agent/SOUL.md`](../template/agents/example-agent/SOUL.md).

`HEARTBEAT.md` is a **forbidden filename** anywhere in a bundle — see
[*6. Recurring wakes — the cron pattern*](#6-recurring-wakes--the-cron-pattern).

### 3.5 Write the skills

For every entry in `manifest.skills` (squad-wide, under `skills/`) and every entry in any
`agent.json#/skills` (agent-specific, under `agents/<id>/skills/`), create the referenced
file in **SKILL.md format**:

```markdown
---
name: my-skill
description: One or two sentences on what the skill does and when to load it.
---

# My skill

…the procedure, written as steps…
```

A skill is a *procedure*, not reference docs. Squad-wide skills are duplicated into every
agent at install; agent-specific skills are deployed only into that agent.

### 3.6 Write `SQUAD.md` and `ONBOARD.md`

**`SQUAD.md`** is the marketplace catalog card. Frontmatter is minimal:

```yaml
---
tags: [growth, gtm, content]
preview_image: https://example.com/your-squad-avatar.png  # optional
---
```

`tags` drives catalog filtering; `preview_image` is the squad's avatar URL.

**The body of `SQUAD.md` is the catalog's source of truth for per-agent prose** — describe
each agent here in user-facing language, not in `manifest.json`. Recommended sections:
*What this squad does*, *What you'll need*, *What you get*, *How it works*.

**`ONBOARD.md`** is a **script the co-founder agent executes** after the mechanical deploy.
See [*5. ONBOARD.md contract*](#5-onboardmd-contract) below.

### 3.7 Add `crons/jobs.json` (required for recurring wakes) and optionally `MEMORY.md`

- **`crons/jobs.json`** — native OpenClaw cron jobs. This is also where every recurring
  wake lives, because per-agent heartbeats do not fire for squad sub-agents (see
  [*6. Recurring wakes — the cron pattern*](#6-recurring-wakes--the-cron-pattern)). Each
  job's `sessionTarget` must be an agent id declared in your own `manifest.agents`. A cron
  run with nothing to report must reply with the literal token `NO_REPLY`.
- A squad-wide `MEMORY.md` if multiple agents share the same seed pointers.

### 3.8 Strip every placeholder

The template ships with `<!-- TODO -->` comments and placeholder prose. The validator
errors on any unresolved TODO marker outside `template/` itself, so strip them all before
publishing.

### 3.9 Validate

```sh
node scripts/validate.mjs squads/<your-squad-name>     # in this repo
# or in a self-hosted repo:
node validate.mjs .
```

Fix every error and re-run until clean. The validator mirrors marketplace ingestion
exactly — a green local run means a green ingest.

## 4. `agent.json` reference

Every field accepted in `agents/<id>/agent.json`:

| Field | Type | Required | Rules |
|---|---|---|---|
| `id` | string | ✔ | kebab-case. Must match the directory name and the `manifest.agents` entry. |
| `description` | string | ✔ | Non-empty. One-line role description. |
| `model` | string | · | Enum: `haiku` \| `sonnet` \| `opus`. Defaults to the pod default (`sonnet`). |
| `skills` | string[] | · | Bundle-relative paths to this agent's skill files. |
| `contextInjection` | string | · | Enum: `always` \| `continuation-skip` \| `never`. Pod default applies when omitted. |
| `bootstrapMaxChars` | integer | · | Positive integer. OpenClaw bootstrap budget. |
| `params` | object | · | Free-form provider params passed through to OpenClaw (e.g. `{ "cacheRetention": "1h" }`). |

Unknown fields are rejected — the validator does not silently drop them. If you need a
new OpenClaw field, add it to the schema first.

> **`heartbeat` is not authorable from a squad bundle.** OpenClaw's
> `agents.list[].heartbeat` does not fire for squad sub-agents today. If you put
> a `heartbeat` object in `agent.json`, the validator rejects it as an unknown
> field. See [*6. Recurring wakes — the cron pattern*](#6-recurring-wakes--the-cron-pattern).

## 5. `ONBOARD.md` contract

`ONBOARD.md` is **a runnable script, not a README.** The co-founder agent executes it
verbatim after the squad is deployed — collecting secrets, connecting identities, seeding
the agent's MEMORY, and dispatching the first task. It must finish within
`estimated_setup_minutes`; if it can't, shorten it.

Frontmatter:

```yaml
---
required_tools: [vault_request, browser_identity_add]
required_identities:
  - { site: github.com, reason: "push generated PRs" }
estimated_setup_minutes: 5
---
```

The body, in the imperative addressed to the co-founder:

- **Ask the user** the questions needed to configure the squad. Group them — don't ping-pong.
- **Collect secrets only via `vault_request`.** Never have the co-founder ask for a secret
  in plain chat. Even non-sensitive setup values declared in `required_vault_secrets` go
  through the vault.
- **Connect identities via `browser_identity_add`,** reusing an existing pod identity when
  one matches the `site`.
- **Save answers** to the agent's `MEMORY.md` (or a wiki page the MEMORY indexes).
- **Create the first task** with `create_task` and dispatch it immediately — unless you
  add `dispatch: later` to defer the first run to the agent's next cron wake.

## 6. Recurring wakes — the cron pattern

OpenClaw's per-agent `agents.list[].heartbeat` (i.e. `agent.json#/heartbeat`) does
**not fire for squad sub-agents** today. Every recurring wake for a squad agent must
therefore be driven by a cron in [`crons/jobs.json`](../template/crons/jobs.json), with
the wake procedure embedded in the cron's `payload.text`. `HEARTBEAT.md` is a forbidden
filename — the validator rejects it anywhere inside a bundle.

The typical pattern for an agent that wants to wake every 2 hours:

```json
{
  "id": "heartbeat-pulse",
  "name": "2h heartbeat pulse — your-agent-id self-driven check-in",
  "enabled": true,
  "schedule": { "kind": "cron", "expr": "0 */2 * * *", "tz": "America/Los_Angeles" },
  "sessionTarget": "your-agent-id",
  "payload": {
    "kind": "systemEvent",
    "text": "<the wake procedure — imperative, addressed to the agent>"
  },
  "failureAlert": false,
  "state": {}
}
```

Compose `payload.text` as the imperative wake procedure the agent runs every tick.
A solid structure:

1. **The non-negotiable** — at least one task must be **executed** before the session
   closes. A wake is "orient, find the highest-leverage action in the lane, do it, file
   the result" — not "orient and `NO_REPLY`". `NO_REPLY` is only acceptable when nothing
   is actionable, and the reason must be logged to `memory/YYYY-MM-DD.md` first.
2. **Orient** — read `MEMORY.md`, skim recent daily logs, call `list_tasks`.
3. **Decide what this wake is for** — a dispatched task, a recurring duty, a draft to
   advance, or genuinely nothing (with a logged reason).
4. **Recurring duty** — the agent's specific cron-driven work and its cadence. If a
   separate daily cron already covers the bulk of the work, the pulse cron typically
   focuses on advancing in-flight items and mission-deepening between daily runs.
5. **Execute** — actually produce the artifact; don't just plan.
6. **Digest** — before closing the session, append a one-paragraph digest to
   `memory/YYYY-MM-DD.md`: *what you did, what changed, what's still open, and the single
   first move for the next wake.*
7. **Close the loop** — `complete_task` / `fail_task`, surface blockers.

A cron run that intentionally produces no output must instruct the agent to reply with
the single literal token `NO_REPLY` (OpenClaw's silent-turn sentinel) — never write
"do not respond", which trips a false-positive failure alert.

> **Tip — long procedures.** When the wake procedure is too long for a comfortable
> payload string, ship a `heartbeat-pulse` *skill* under the agent's
> `agent.json#/skills` and have the cron's payload say only
> *"Load the `heartbeat-pulse` skill and run it end to end."* — either shape is allowed.

## 7. Authoring principles

The contract tells you what's valid. This tells you what's good.

- **One agent, one lane.** A squad agent is a focused specialist. If you're tempted to
  make an agent do two unrelated things, that's two agents — or the second thing belongs
  to the user's co-founder, not to a squad.

- **Default to autonomous execution.** Squad agents do the work end to end and report
  back with a digest — they don't pause mid-task to ask the user "is this OK?". Escalate
  only in the narrow cases that genuinely need a human: out-of-scope work, hard blockers,
  irreversible commitments, or user-facing decisions. Everything else, the agent decides
  and ships.

- **Track work in the tasks system, not in markdown.** Pancake's tasks plugin is the
  shared store every agent reads and writes through `list_tasks`, `create_task`,
  `complete_task`, `fail_task`. Don't maintain parallel to-do lists or kanban tables
  in `.md` files — the task tools own state. Daily memos (`memory/YYYY-MM-DD.md`) are
  for context and decisions, not for ticket tracking.

- **Name agents by their job, not with a persona.** `Outreach agent`, `GEO audit agent`,
  `Content writer` — not personal names like `Atlas` or `Nova`. The user already has a
  named co-founder; sub-agents are specialists, and a job-shaped name makes the lane
  obvious at a glance.

- **Prefer fewer agents.** Sub-agents report to the co-founder, never to each other —
  they don't share context. If agent B needs data agent A produced, the co-founder has
  to relay it. Only split when work is genuinely distinct: different cadence, different
  skills, different identities. When in doubt, one agent.

- **Everything time-driven is a cron.** Per-agent heartbeats don't fire for squad
  sub-agents today, so every recurring wake — whether it's a daily citation audit, a
  Monday digest, or a 2-hour self-driven pulse — lives in `crons/jobs.json`. Reach for a
  separate clock-time cron when the time itself matters to someone outside the agent (a
  09:00 LA daily report), and a `0 */2 * * *`-style pulse cron for the agent's recurring
  background work.

- **Crons stay quiet unless something changed.** A scheduled run with nothing to report
  must reply with the single literal token `NO_REPLY`. A chatty cron that posts "nothing
  changed" every day trains the user to ignore it.

- **`MEMORY.md` is an index, not a notebook.** One-line pointers only. Detailed findings
  go to the shared wiki.

- **Wake procedure in the cron payload, behaviour in `SOUL.md`, pointers in `MEMORY.md`.**
  Three concerns, three homes. Keep behavioural rules out of cron payloads (they belong
  in `SOUL.md`), and keep step-by-step procedure out of `SOUL.md` (it belongs in the
  cron's `payload.text`, or in a `heartbeat-pulse` skill the cron loads).

## 8. Testing your squad

The validator is your test suite. It's a zero-dependency Node.js script that mirrors the
marketplace's ingest checks exactly — a clean local run means a clean ingest.

```sh
node scripts/validate.mjs                       # every bundle in the repo
node scripts/validate.mjs squads/your-squad     # one bundle
```

It exits non-zero on any error; warnings (e.g. a missing `tags` line) never fail the run.
The CI workflow in this repo runs the same command on every push and PR, so a passing
local run means a passing CI run.

While iterating, **re-run the validator after every batch of edits** — it catches
unresolved TODO markers, forbidden filenames, schema drift, and broken file references
that compound if left until the end.

## 9. Publishing

How a finished bundle gets into the marketplace.

### Official squads (the Pancake team)

Official squads live in the [`squads/`](../squads/) directory of this repo. To publish:

1. Add the bundle as `squads/<name>/`.
2. Run `node scripts/validate.mjs` and confirm clean.
3. Update the squad table in [`README.md`](../README.md).
4. Open a PR. CI must be green.
5. On merge, the marketplace re-seeds and the squad appears in the catalog.

Bump `version` (semver) on every release.

### Self-hosted squads (external authors)

This repo is Pancake-curated and not open to outside PRs. External authors **self-host**:
keep the bundle in a public GitHub repo of your own, with the bundle's files (`manifest.json`,
`SQUAD.md`, `agents/`, …) at the **repo root** — no `squads/` nesting.

To submit, send your repo URL and the tag you want ingested to the Pancake team. A
self-serve submission flow is planned but not yet available. Full details:
[`publishing.md`](./publishing.md).

---

That's the whole contract. The fastest way to confirm you've got it right is to copy
[`template/`](../template/), fill it in, and run the validator. When it exits 0, you
have a publishable squad.
