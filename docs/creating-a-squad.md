# Creating an Agent Squad

This guide walks through building a complete, valid Agent Squad bundle — the unit the
Pancake marketplace ingests. By the end you'll have a bundle that passes the validator
and is ready to publish.

If you're using Claude Code in this repo, the **`create-squad` skill** automates every
step below. This guide is the canonical manual reference — what the skill does, and what
you need to know if you're building by hand.

## 0. Before you build — scope, placement, and merging

> **The validator does not catch this.** It checks file *shape*, not whether a new squad
> should exist, whether you named it for a tool, or whether another squad already owns the
> domain. Nothing on a tenant pod catches it either. **This section is the only guardrail.**
> A mis-scoped squad fragments a domain across two bundles, ships a tool-shaped name that
> blocks the obvious second tool, or bloats the catalog with a job that was really one
> workflow. Get it right here; there is no later gate.

### 0.1 The placement decision — find the *smallest* unit that delivers the capability

A request for "a new squad" is almost always a request for a *capability*. Don't default to a
new squad. Given the desired capability **X**, walk these in order and stop at the first match:

1. **Is X one-shot, conversational, or sub-~2-minute work?**
   → **Not a squad.** The co-founder handles it inline. A squad exists for *persistent,
   proactive, recurring* domain ownership — if X runs once when asked and then it's done,
   it's a co-founder turn, not a deployable agent. *(e.g. "summarize this thread", "draft one
   reply" — inline.)*

2. **Does an existing squad already own X's domain?** (Enumerate first — see §0.4.)
   → **Add to that squad. Do not create a new one.** Two sub-cases:
   - **X is a new job / outcome within the domain** → add a **workflow** (plus the skill that
     runs it) to the existing squad. *(e.g. a new Google Ads pacing report → a `google.*`
     workflow on `paid-ads-squad` — not a new squad.)*
   - **X is a new channel / sub-domain that needs its own cadence, identity, or tools** → add
     an **agent** to the existing squad. *(e.g. a Twitter presence alongside Reddit → a
     `twitter-agent` in `community-squad`.)* Agents don't share context (see §0.5), so only
     split when the lane is genuinely distinct.

3. **Is X a genuinely new domain that no existing squad covers, and is it worth a persistent
   autonomous owner** (recurring, proactive, with its own tool surface and crons)?
   → **Now create a new squad.**

The three outcomes, in one line: **co-founder turn** (one-shot) → **workflow** (new job in an
owned domain) → **agent** (new lane in an owned domain) → **new squad** (new domain). Reach for
the heaviest unit last.

### 0.2 Name the squad for the DOMAIN, never a tool

A squad owns a **goal**; a tool is one way to serve it. A squad named after a single tool is a
design smell — it silently forecloses the obvious second tool and forces a fragmented catalog
later.

| Tool-shaped (smell) | Domain-shaped (right) | Workflow namespaces |
|---|---|---|
| `posthog-squad` | `analytics-squad` | `posthog.*` (later `amplitude.*`) |
| `reddit-squad` | `community-squad` | `reddit.*` (later `discord.*`) |
| `google-ads-squad`, `meta-ads-squad` | `paid-ads-squad` | `google.*`, `meta.*` |

**The test:** *"Could a second tool serve this same goal?"* If yes, the squad **is** the goal,
and the tool is a **workflow-id namespace** (`<tool>.<verb>`), not the squad name. The squad
name is what the user is trying to achieve; the workflow id says how.

### 0.3 Workflow, agent, or squad — the unit definitions

- A **workflow** is one *input → outcome* entrypoint a squad runs via its own skills. It is the
  squad's published API. Reach for a workflow when the capability is a *job within a domain an
  existing (or about-to-exist) squad owns*, runs on that squad's existing tools and identities,
  and needs no persona or heartbeat of its own. Cheap to add: one `manifest.workflows[]` entry
  + one skill.
- A **new agent in an existing squad** when the work is the *same domain* but a distinct lane —
  different cadence, different identity/tools, different persona — that the existing agent
  shouldn't carry. Costs context isolation (agents don't share memory) and its own
  IDENTITY/SOUL/HEARTBEAT.
- A **new squad** is a persistent owner of a *whole domain* — its own crons, identities, vault
  secrets, and a catalog of workflows. The heaviest unit. Justified only when no existing squad
  owns the domain *and* the domain warrants an always-on autonomous owner.

### 0.4 Pre-flight: enumerate existing squads and check for overlap

**Before scaffolding anything**, list what already exists and whether it covers your domain:

```sh
ls squads/                                   # the current roster
# for each, the domain it owns + its published jobs:
for d in squads/*/; do
  echo "== $d"; sed -n '/## What this squad does/,/^$/p' "$d/SQUAD.md" | head -4
  node -e "for (const w of (require('./'+process.argv[1]).workflows||[])) console.log('  -', w.id)" "$d/manifest.json" 2>/dev/null
done
```

If any squad's *domain* already contains your capability, go back to §0.1 step 2 and add a
workflow or agent there instead of creating a new bundle.

### 0.5 Merging overlapping squads (when you find two that are one domain)

If you discover two squads that are really the same domain reached through different tools (two
tools, one job — `google-ads-squad` + `meta-ads-squad` were exactly this), **merge them**;
don't ship a third squad beside them. The procedure (worked example: `squads/paid-ads-squad/`):

1. **Pick the domain name** and create the new bundle (or `git mv` one of the two into it to
   keep history).
2. **Move each tool's agent in** — `agents/<tool>-agent/` for each.
3. **Demote each tool's squad-wide skills to agent-specific.** This is the load-bearing step:
   `manifest.skills[]` are **copied into every agent at install**. In a multi-agent squad,
   leaving tool-A's skills squad-wide dumps them onto tool-B's agent and bloats its context —
   the exact problem squads exist to avoid. Move them under `agents/<id>/skills/` and list them
   in that agent's `agent.json#/skills`; leave `manifest.skills[]` for genuinely shared skills
   only (often none).
4. **Union the workflow catalog** — `toolA.*` + `toolB.*`, each `agent` pointing at its own agent.
5. **Combine the crons** into one `crons/jobs.json`, each `sessionTarget` its own agent, each
   routing output through the board (§7).
6. **Write one `SQUAD.md`** describing both agents and one **`ONBOARD.md` that branches by
   platform** ("Run Section A for Google, Section B for Meta") so a user installing one tool
   isn't dragged through the other's setup.
7. **Delete the old bundles**, start the merged squad at a fresh `version`, and update the
   `README.md` roster.

The same skill-isolation trap (step 3) applies to *any* multi-agent squad you author from
scratch — keep per-lane skills agent-specific.

## 1. Prerequisites

You don't need to read anything else first, but it helps to know:

- **What a squad is.** A squad is one or more *focused, single-lane* sub-agents that get
  installed into a Pancake pod and run autonomously — finding leads, monitoring metrics,
  publishing content, whatever the squad is built for. Each agent reports to the user's
  co-founder agent; the user never talks to a squad agent directly.
- **The runtime.** Squads run on OpenClaw inside a Pancake pod. Each agent wakes on a
  *heartbeat* (e.g. every 2 hours, or daily) and runs a procedure you write.
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
  agent.json                   ✔  per-agent runtime config (model, heartbeat, skills)
  IDENTITY.md                  ✔  who the agent is (name, role, scope)
  SOUL.md                      ✔  how the agent behaves (personality, principles)
  HEARTBEAT.md                 ·* the wake procedure (required when heartbeat is declared)
  MEMORY.md                    ·  agent-specific seed memory (overrides squad-wide)
  skills/<name>.md             ·  agent-specific skills
crons/jobs.json                ·  native OpenClaw cron jobs
```

A few things the validator *forbids* inside a bundle:

- `AGENTS.md`, `USER.md`, `BOOTSTRAP.md`, `BOOT.md` — these are pod-level files managed
  by Pancake Cloud, not by squads. Don't ship them.
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
  "workflows": [
    { "id": "domain.do_the_thing",
      "summary": "One line the co-founder reads to match intent to this job.",
      "inputs": {
        "target": {
          "type": "string",
          "description": "What this input means and what the squad does with it.",
          "example": "a concrete value the co-founder can crib from"
        }
      },
      "outcome": "The defined done-state this workflow guarantees.",
      "agent": "your-agent-id",
      "secrets": ["team.your_setting"],
      "tools": ["web_search"] }
  ],
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

- `workflows[]` is the squad's **published interface** — see [§3.2b](#32b-publish-the-workflow-catalog).
- Delete every optional section your squad doesn't use. The validator complains about
  empty values, not absent fields.

### 3.2b Publish the workflow catalog

`manifest.workflows[]` is the list of **outcome-typed entrypoints** the squad exposes — its
public API. The co-founder matches a user's intent to a workflow and dispatches a board ticket
to its `agent`; it never reaches into the squad's internal tools. This is what keeps the
co-founder's context bounded as squads are added: it carries a compact catalog (id + summary +
inputs + outcome + agent), not every squad's tool schemas.

```json
{ "id": "seo.audit_citations",
  "summary": "Audit ChatGPT/Gemini/Perplexity citation share for the target keywords.",
  "inputs": {
    "keywords": {
      "type": "string",
      "description": "Comma-separated keywords to audit (defaults to the team.target_keywords vault value).",
      "example": "ai sales agent,outbound automation",
      "required": false
    }
  },
  "outcome": "Per-keyword citation-share table filed to the wiki and the delta filed on the board.",
  "agent": "geo-agent" }
```

Authoring rules:

- **`id`** is `<tool|subdomain>.<verb_noun>`, lower dotted/kebab (`seo.audit_citations`,
  `google.optimize_account`), **unique within the squad**. The namespace is the tool or
  sub-domain (§0.2); the verb is the job.
- **`summary`** ≤ 200 chars — this is the *only* thing the co-founder reads to route intent, so
  make it match how a user would phrase the ask.
- **`inputs`** are rich descriptors, not type strings: each input is
  `{ type, description, example?, required?, default?, enum? }` (`description` required,
  ≤ 280 chars; names lower_snake_case). The co-founder writes its dispatch brief from these —
  a good `example` is the difference between a vague brief and a usable one. Treat the catalog
  like a microservice API contract.
- **`outcome`** is the done-state the workflow guarantees — what "complete" means.
- **`agent`** must be one of `manifest.agents`. In a multi-agent squad, each workflow names the
  agent that runs it.
- **Aim for 3–5 workflows per agent.** Ten is a smell — several are probably one job
  parameterized; fold them into one workflow with an input. Too few (a squad that publishes
  none) is dispatched ad hoc, which works but gives the co-founder nothing repeatable to call.
- **Every workflow maps to a skill** the agent loads to run it — by convention a skill named
  after the workflow. Don't publish a workflow the agent has no procedure to execute.
- **Cron-driven routines are workflows too.** A daily sweep or weekly report is a published
  workflow that a cron fires on a schedule (filing its result through the board, §7) — the same
  workflow the co-founder could also dispatch on demand.
- **Scope secrets and tools to the workflow that uses them.** `required_vault_secrets` and
  `required_tool_permissions` are squad-level *registries* (secrets defined once so onboarding
  knows what to collect; tool permissions the install grants). Each workflow's `secrets` /
  `tools` arrays reference the registry keys it actually needs at runtime — an agent only needs
  a secret or tool while running a workflow that lists it. Referencing an undefined key is a
  validation error; a registry entry no workflow references draws a validator warning.

Workflows are optional in the schema but expected in practice: publishing them is what turns a
squad into a clean, repeatable, fire-and-forget unit. Full field contract:
[`bundle-reference.md#workflows`](./bundle-reference.md#workflows--the-squads-published-interface).

### 3.3 Write each agent's `agent.json`

For every id in `manifest.agents`, create `agents/<id>/agent.json`:

```json
{
  "id": "your-agent-id",
  "description": "One line on what this agent owns.",
  "model": "sonnet",
  "heartbeat": { "every": "24h" },
  "skills": ["agents/your-agent-id/skills/your-skill.md"]
}
```

This file is the bundle's slice of OpenClaw's agent runtime config. See
[*4. agent.json reference*](#4-agentjson-reference) below for every field.

### 3.4 Write `IDENTITY.md`, `SOUL.md`, and `HEARTBEAT.md`

For every agent:

- **`IDENTITY.md` — who the agent is.** A header (Name, Role, Scope, Created by) plus
  *What I Do*, *What I Don't Do*, *KPI / Goal*, *How To Reach Me*, *Voice / Personality*.
  Mirror [`template/agents/example-agent/IDENTITY.md`](../template/agents/example-agent/IDENTITY.md).

- **`SOUL.md` — how the agent behaves.** Personality, *Operating Principles*,
  *Escalation Rules*, *Boundaries (Inviolable)*, *What Success Looks Like*. The *Boundaries*
  **must** carry the mute-to-user inviolable (board is the only channel; never message the user
  or DM the co-founder out of band — §7). Mirror
  [`template/agents/example-agent/SOUL.md`](../template/agents/example-agent/SOUL.md).

- **`HEARTBEAT.md` — the wake procedure.** *Required* when `agent.json#/heartbeat` is set.
  See [*6. HEARTBEAT.md contract*](#6-heartbeatmd-contract) below.

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

### 3.7 Optional: add `crons/jobs.json` and `MEMORY.md`

- `crons/jobs.json` for native OpenClaw cron jobs. Each job's `sessionTarget` must be an
  agent id declared in your own `manifest.agents`. A cron run with nothing to report must
  reply with the literal token `NO_REPLY`. **Route cron output through the board:** the
  payload runs a workflow, then files the result as
  `create_task({ kind: "routine" | "digest", assigned_to: "<self>", … })` with **no
  `notify_channel`**, then `complete_task`s it — never a Slack post, never silent work. Only
  `task`/`needs_input`/`failed` tickets surface to the user; `routine`/`digest` stay quiet on
  the board for the co-founder's daily roll-up. Mirror `squads/eng-squad/crons/jobs.json`.
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
| `heartbeat` | object | · | Curated subset of [OpenClaw's `agents.list[].heartbeat`](https://docs.openclaw.ai/gateway/config-agents#agents-defaults-heartbeat) — `{ every, model, lightContext, isolatedSession, skipWhenBusy, timeoutSeconds }`. Common shape `{ "every": "<duration>" }`. `every` is a duration in OpenClaw units `ms`/`s`/`m`/`h` (e.g. `"30m"`, `"2h"`, `"24h"`, `"0m"` to disable) — named values like `"daily"` are rejected. `heartbeat.model` is the same `haiku`/`sonnet`/`opus` enum as the top-level `model`. Pod-level fields (`prompt`, `target`, `directPolicy`, `session`, `to`, `ackMaxChars`, etc.) are not authorable from a bundle and are rejected. When the heartbeat object is present, `agents/<id>/HEARTBEAT.md` must exist. |
| `skills` | string[] | · | Bundle-relative paths to this agent's skill files. |
| `contextInjection` | string | · | Enum: `always` \| `continuation-skip` \| `never`. Pod default applies when omitted. |
| `bootstrapMaxChars` | integer | · | Positive integer. OpenClaw bootstrap budget. |
| `params` | object | · | Free-form provider params passed through to OpenClaw (e.g. `{ "cacheRetention": "1h" }`). |

Unknown fields are rejected — the validator does not silently drop them. If you need a
new OpenClaw field, add it to the schema first.

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
  add `dispatch: later` to defer the first run to the agent's heartbeat.

## 6. `HEARTBEAT.md` contract

OpenClaw loads `agents/<id>/HEARTBEAT.md` on **every wake** — both heartbeat pulses and
dispatched tasks. This is the right home for the procedure the agent runs each tick;
keeping it out of `SOUL.md` (which is for behavioural rules) and out of `MEMORY.md`
(which is an index of pointers) lets you iterate on the procedure without touching the
agent's personality.

Write it in the imperative, addressed to the agent. **The board is the source of truth** — the
wake reconciles the agent's assigned tickets against it, so a missed wake or a mid-ticket
restart self-heals on the next pulse (the same reconcile-loop discipline pancake-controller uses
against the cluster). A solid structure:

1. **The non-negotiable** — at least one ticket must be **advanced** before the session
   closes. A wake is "reconcile the board, find the highest-leverage ticket in the lane, advance
   it, file the result" — not "orient and `NO_REPLY`". `NO_REPLY` is only acceptable when nothing
   is actionable, and the reason must be logged to `memory/YYYY-MM-DD.md` first.
2. **Orient — reconcile the board first.** `list_tasks` for your *own* open tickets (`todo`,
   `in_progress`, `needs_input`) — **this**, not the wake message, is what you act on. Then read
   `MEMORY.md` and skim recent daily logs.
3. **Pick and claim a ticket.** Claim a `todo` (`update_task_status(in_progress)` → `get_task`
   for the brief, which names the **workflow** + inputs), resume an `in_progress`, or resume a
   `needs_input` whose answer arrived. No assigned ticket → fall to the recurring duty.
4. **Run the workflow — self-cert or ask.** Load the matching skill, run it end to end, then
   `complete_task(result)` (self-certify), or `add_task_comment` + `update_task_status(needs_input)`
   when blocked on intent, or `fail_task` on a hard blocker. Never guess, never message the user.
5. **Recurring duty** — heartbeat-pulse work when no ticket is assigned; most recurring duty is
   cron-driven and files a `routine`/`digest` ticket (§3.7).
6. **Digest** — before closing the session, append a one-paragraph digest to
   `memory/YYYY-MM-DD.md`: *what you did, what changed, what's still open, and the single
   first move for the next wake.* Material news reaches the co-founder *through the ticket*.
7. **Close the loop** — `complete_task` / `add_task_comment` + `needs_input` / `fail_task`.

## 7. Authoring principles

The contract tells you what's valid. This tells you what's good.

- **The board is the bus; the squad is mute to the user.** A squad agent communicates *only*
  through the company task board (the `tasks` plugin) — `complete_task` with a self-certified
  outcome, `add_task_comment` + `update_task_status(needs_input)` to ask, a `routine`/`digest`
  ticket for cron output. It **never** messages the user (directly or indirectly) and never DMs
  the co-founder out of band; the co-founder is the single voice out and relays from the board.
  Bake this into every `SOUL.md` *Boundaries (Inviolable)*, and make the `HEARTBEAT.md`
  reconcile the board *first* (§6). There are no approval gates — self-certify reversible
  outcomes; the correction path is the co-founder *reopening* a ticket. (This is also why Slack
  and voice/TTS are not authorable from a bundle.) The template and `squads/eng-squad/`
  already embody this — mirror them.

- **Publish workflows, route crons through the board.** A squad's public interface is its
  `workflows[]` catalog (§3.2b), not its internal tools. Every recurring job is a published
  workflow; a cron runs that workflow and files its result as a `routine`/`digest` ticket with
  no `notify_channel` (§3.7) — autonomous activity shows up on the same board the user watches,
  without paging anyone.

- **One agent, one lane.** A squad agent is a focused specialist. If you're tempted to
  make an agent do two unrelated things, that's two agents — or the second thing belongs
  to the user's co-founder, not to a squad. (And if it's a whole second *domain*, re-read §0.)

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

- **Heartbeat first, cron only when timing matters.** A heartbeat is a state-driven
  trigger — the agent wakes on its pulse and decides what to do. A cron is clock-driven:
  it fires at an exact time with a hard-coded instruction. Reach for a cron only when the
  time itself matters to someone outside the agent — an 18:00 PT end-of-day report, a
  Monday-morning digest. Otherwise raise the heartbeat.

- **Crons stay quiet unless something changed.** A scheduled run with nothing to report
  must reply with the single literal token `NO_REPLY`. A chatty cron that posts "nothing
  changed" every day trains the user to ignore it.

- **`MEMORY.md` is an index, not a notebook.** One-line pointers only. Detailed findings
  go to the shared wiki.

- **Wake procedure in `HEARTBEAT.md`, behaviour in `SOUL.md`, pointers in `MEMORY.md`.**
  Three files, three concerns. Burying wake steps in `SOUL.md` or pointers in
  `HEARTBEAT.md` makes both hard to maintain.

Before publishing, grade the finished bundle against
[`squad-scorecard.md`](./squad-scorecard.md) — it turns the principles above into a
0–2-scored rubric (scope, manifest hygiene, workflows, agents, board discipline,
onboarding, evals) with invariant violations called out explicitly.

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
