# Bundle reference — the Agent Squad contract

This is the exact file contract for an Agent Squad bundle. It is the source of truth that
[`manifest.schema.json`](../manifest.schema.json), [`agent.schema.json`](../agent.schema.json),
[`scripts/validate.mjs`](../scripts/validate.mjs), the [`template/`](../template/) skeleton,
and the marketplace's own ingest all agree on.

If you haven't yet, read [`how-squads-work.md`](./how-squads-work.md) first for the concepts.
The examples below point at [`template/`](../template/), the complete, valid skeleton bundle.

## What a bundle is

A **bundle** is the unit the marketplace ingests — one squad, complete and self-contained.

- In **this repo**, a bundle is a `squads/<squad-name>/` directory.
- In a **self-hosted third-party repo**, the bundle is the **repo root itself**.

The file contract below is identical in both cases. Only the location differs.

## Directory layout

Required (✔) and optional (·) members of a bundle:

```
manifest.json                  ✔  package descriptor (validated on ingest)
SQUAD.md                       ✔  marketplace catalog card — frontmatter + Markdown body
ONBOARD.md                     ✔  the onboarding script the co-founder runs after deploy
MEMORY.md                      ·  squad-wide seed memory (used by an agent lacking its own)
skills/<name>.md               ·  squad-wide skills — referenced by manifest.skills[]
TOOLS.md                       ·  optional documentation of the squad's tool surface
agents/<agent-id>/
  agent.json                   ✔  per-agent runtime config (mirrors OpenClaw agents.list[])
  IDENTITY.md                  ✔  per agent — name, role, scope
  SOUL.md                      ✔  per agent — personality, principles, boundaries
  HEARTBEAT.md                 ·* per agent — the procedure run on every wake (required when agent.json declares a heartbeat)
  MEMORY.md                    ·  per agent — seed memory (overrides the squad-wide one)
  skills/<name>.md             ·  agent-specific skills — referenced by agent.json#/skills
crons/jobs.json                ·  native OpenClaw cron jobs
```

On ingest the marketplace **verifies every file the manifest references** — it must exist,
be a regular file, not be a symlink, and resolve **inside the bundle root** (no `..`
escape, no absolute path). The files always checked are `SQUAD.md`, `ONBOARD.md`, every
`skills[]` path, and per agent `agents/<id>/agent.json`, `agents/<id>/IDENTITY.md`,
`agents/<id>/SOUL.md`, every `agent.json#/skills[]` path, and `agents/<id>/HEARTBEAT.md`
when the agent declares a heartbeat. `scripts/validate.mjs` performs the identical check.

## `manifest.json` — the package descriptor

The file the marketplace fully parses and validates. JSON, no comments. It carries the
package-level metadata only — per-agent runtime config lives in `agents/<id>/agent.json`.

**Required:** `name`, `version`, `description`, `author`, `agents`.

| Field | Type | Req | Rules |
|---|---|---|---|
| `name` | string | ✔ | kebab-case `^[a-z0-9]+(?:-[a-z0-9]+)*$`, ≤ 64 chars. Globally unique — the marketplace catalog key. |
| `version` | string | ✔ | semver `^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$` |
| `description` | string | ✔ | non-empty, ≤ 200 chars |
| `author` | string | ✔ | non-empty. Official squads: `pancake-official`. External: a GitHub user/org. |
| `license` | string | · | any string when present |
| `skills` | string[] | · | bundle-relative paths to squad-wide skill files (e.g. `skills/playbook.md`) |
| `agents` | string[] | ✔ | non-empty array of kebab-case agent ids. Each id must have a matching `agents/<id>/agent.json`. |
| `workflows` | object[] | · | the squad's published outcome-typed entrypoints — see [*workflows*](#workflows--the-squads-published-interface) below |
| `required_identities` | object[] | · | each `{ site, reason }` — both non-empty. `site` is an eTLD+1, e.g. `github.com`. |
| `required_vault_secrets` | object[] | · | the squad's **secret registry** — each `{ key, label, type }` defined once; `key`/`label` non-empty; `type` ∈ `string` \| `api_key` \| `token`. Workflows reference these keys via `workflows[].secrets`. |
| `required_tool_permissions` | string[] | · | the squad's **tool-permission registry** — each entry must be an accepted Pancake tool key (see [*Tool permissions*](#tool-permissions) below). Unknown keys are an error. Workflows reference these via `workflows[].tools`. |
| `infra_tool_permissions` | string[] | · | **squad-infra tools** used at onboarding/heartbeat time rather than inside any workflow (e.g. `mcp-installer`). Each entry must also appear in `required_tool_permissions`; listed keys are exempt from the unreferenced-tool warning. |
| `min_pancake_version` | string | · | informational only |

Validation returns **all** problems found, not just the first — so a bad manifest can be
fixed in one pass. The authoritative validator in production is
`apps/marketplace/src/services/manifest.ts`; `manifest.schema.json` in this repo is its
JSON Schema mirror, and `scripts/validate.mjs` is a behaviour-identical port. A bundle that
passes `validate.mjs` passes marketplace ingestion.

See [`template/manifest.json`](../template/manifest.json) for the complete file structure.

## `agents/<id>/agent.json` — per-agent runtime config

The file the OpenClaw deploy plugin reads to register each squad agent. JSON, no comments.
The schema mirrors the subset of OpenClaw's `agents.list[]` that bundles are allowed to
declare — see [the OpenClaw config-agents reference](https://docs.openclaw.ai/gateway/config-agents)
for the canonical upstream spec.

**Required:** `id`, `description`.

| Field | Type | Req | Rules |
|---|---|---|---|
| `id` | string | ✔ | kebab-case. Must match the directory name `agents/<id>/` and the entry in `manifest.json#/agents`. |
| `description` | string | ✔ | non-empty one-liner — what this agent owns. |
| `model` | string | · | enum `haiku` \| `sonnet` \| `opus`. Defaults to the pod's `agents.defaults.model` (`sonnet`) when omitted. |
| `heartbeat` | object | · | Curated subset of [OpenClaw's `agents.list[].heartbeat`](https://docs.openclaw.ai/gateway/config-agents#agents-defaults-heartbeat) — `{ every, model, lightContext, isolatedSession, skipWhenBusy, timeoutSeconds }`. All sub-fields optional; the validator rejects anything else (pod-level fields like `prompt`, `target`, `directPolicy`, `session`, `to`, `ackMaxChars` etc. are not authorable from a bundle). `every` is an OpenClaw duration string (units `ms`/`s`/`m`/`h`, e.g. `"30m"`, `"2h"`, `"24h"`, or `"0m"` to disable) — named values like `"daily"` are rejected. `heartbeat.model` follows the same `haiku`/`sonnet`/`opus` enum as the top-level `model`. Inherits any omitted sub-field from the pod's `agents.defaults.heartbeat`. When the heartbeat object is present, `agents/<id>/HEARTBEAT.md` must exist. |
| `skills` | string[] | · | bundle-relative paths to this agent's skill files. |
| `contextInjection` | string | · | enum `always` \| `continuation-skip` \| `never`. Pod default applies when omitted. |
| `bootstrapMaxChars` | integer | · | positive. OpenClaw bootstrap budget; pod default applies when omitted. |
| `params` | object | · | free-form provider params passed through to OpenClaw (e.g. `{ "cacheRetention": "1h" }`). |

`additionalProperties` is false — unknown keys are an error. The validator rejects
unknown fields rather than silently dropping them, so any new OpenClaw field a squad needs
must be added here first.

See [`template/agents/example-agent/agent.json`](../template/agents/example-agent/agent.json).

## `workflows` — the squad's published interface

`manifest.workflows` is the list of **outcome-typed entrypoints** the squad exposes. It is
the squad's *public API*: the cofounder delegates by matching the user's intent to a
workflow, then creating a board ticket assigned to that workflow's agent — it never reaches
into the squad's internal tools. This is what keeps the cofounder's context bounded as
squads are added: the cofounder carries a compact **catalog** (id + summary + inputs +
outcome + agent), not every squad's tool schemas.

Each entry is inline metadata (not a file path), so the catalog can be generated at install
without reading extra files:

```json
"workflows": [
  {
    "id": "eng.triage_issue",
    "summary": "Classify a GitHub issue's criticality and label it.",
    "inputs": { "repo": "string", "issue_number": "int" },
    "outcome": "Issue labeled with a P0–P3 criticality + a one-paragraph assessment filed.",
    "agent": "triage-agent",
    "secrets": ["github.bot_token"],
    "tools": ["github"]
  }
]
```

| Field | Type | Req | Rules |
|---|---|---|---|
| `id` | string | ✔ | lower-kebab/dotted `^[a-z0-9]+(?:[._-][a-z0-9]+)*$`, e.g. `eng.triage_issue`. Unique within the squad. |
| `summary` | string | ✔ | one line, ≤ 200 chars — what the cofounder reads to match intent → workflow. |
| `inputs` | object | · | map of input name → type/description string, e.g. `{ "repo": "string" }`. |
| `outcome` | string | ✔ | the defined done-state, e.g. "issue labeled + assessment filed". |
| `agent` | string | ✔ | the squad agent that runs it — **must be one of `manifest.agents`**. The cofounder assigns the ticket to this agent. |
| `secrets` | string[] | · | the vault keys this workflow needs at runtime. Each entry **must reference a key defined in `required_vault_secrets`** (duplicates are an error). The agent fetches a secret only when running a workflow that lists it. |
| `tools` | string[] | · | the tool permissions this workflow needs at runtime. Each entry **must also appear in `required_tool_permissions`** (duplicates are an error). |

**Secrets and tools are scoped to workflows.** The squad-level
`required_vault_secrets` / `required_tool_permissions` arrays are *registries*: secrets are
defined once (`{ key, label, type }`) so onboarding knows what to collect, and tool
permissions are the union the install grants. What each workflow actually *uses* is declared
on the workflow itself — agents only need a secret or tool while running a workflow that
references it. When a squad publishes workflows, the validator warns about any registry
entry no workflow references. The exception is **squad-infra tools** — tools the squad
uses at onboarding or heartbeat time rather than inside any workflow (e.g.
`mcp-installer` to set up an MCP server during install). List those in
`manifest.infra_tool_permissions` (still alongside their `required_tool_permissions`
registry entry) instead of parking them on a workflow that doesn't actually use them;
the validator exempts them from the unreferenced-tool warning.

**How a workflow runs.** The squad agent maps the workflow id to one of its own skills (by
convention, a skill named after the workflow) and executes it from the ticket's brief +
inputs. Self-certify the outcome with `complete_task`; ask via `needs_input` + a comment
when blocked on intent. The board is the only channel — see
[*HEARTBEAT.md*](#heartbeatmd--the-wake-procedure) and the `tasks` skill.

Workflows are optional — a squad with none is dispatched ad hoc (the cofounder briefs an
agent directly). But publishing workflows is what makes a squad a clean, repeatable,
fire-and-forget unit, so prefer them for any recurring job.

## `SQUAD.md` — the marketplace catalog card

Markdown with a YAML frontmatter block, then a body.

**Frontmatter** is minimal — only two fields are read by the marketplace:

```yaml
---
tags: [gtm, outbound, linkedin, sales, growth]
preview_image: https://squads.getpancake.ai/avatars/astronaut.png  # optional
---
```

- `tags` — string array. Drives catalog filtering. Recommended; if absent, the card shows
  no tags.
- `preview_image` — optional URL. Shown as the squad's avatar in the marketplace.

Every other package-level field (name, version, description, author) lives in
`manifest.json` and must not be duplicated here. The deprecated `token_intensity` field
is a validation error — Pancake Cloud now computes token usage automatically.

**The body** renders as the squad's store detail page **and is the catalog's source of
truth for per-agent prose**. The marketplace reads each agent's user-facing description
from this body, not from `manifest.json` or `agent.json`. Describe every agent here in
plain language — the recommended sections cover it naturally: *What this squad does*,
*What you'll need*, *What you get*, *How it works*.

## `ONBOARD.md` — the onboarding script

Markdown with frontmatter, then prose.

**Frontmatter:** `required_tools: [...]`, `required_identities: [...]`,
`estimated_setup_minutes: <n>`.

**The body is a script the co-founder agent executes** after the mechanical deploy — it is
*instructions, not documentation*. Write it in the imperative, addressed to the co-founder.
It tells the co-founder:

- what to ask the user;
- which secrets to collect — always via `vault_request`, never in chat;
- which identities to connect — via `browser_identity_add`, reusing an existing pod
  identity when one matches;
- where to save the answers — usually the agent's `MEMORY.md`;
- what first task to create and dispatch.

Keep the script short enough to complete within `estimated_setup_minutes`. A step may be
tagged `dispatch: later` to defer its first task to the agent's heartbeat; otherwise the
first task is dispatched immediately.

## `IDENTITY.md` and `SOUL.md` — per agent

Both are deployed verbatim into the agent's workspace at install. Together they define the
agent.

**`IDENTITY.md` — who the agent is.** Recommended sections (mirror
[`template/agents/example-agent/IDENTITY.md`](../template/agents/example-agent/IDENTITY.md)):

- A header block: **Name**, **Role**, **Scope**, **Emoji**, **Created** / **Created by**.
- **What I Do** — the concrete, recurring responsibilities.
- **What I Don't Do** — the edges of the lane; what it routes back to the co-founder.
- **KPI / Goal** — the single outcome the agent exists to move.
- **How To Reach Me** — the reporting line (the user never talks to it directly).
- **Voice / Personality** — a pointer to `SOUL.md`.

**`SOUL.md` — how the agent behaves.** Recommended sections (mirror
[`template/agents/example-agent/SOUL.md`](../template/agents/example-agent/SOUL.md)):

- An opening paragraph: a focused contributor reporting to the co-founder, not a generalist.
- **Scope** — what it owns and explicitly does not own.
- **Personality** — concrete behavioural traits.
- **Operating Principles** — how it works day to day.
- **Escalation Rules** — when to escalate vs decide alone.
- **Boundaries (Inviolable)** — the *Never* / *Always* hard limits.
- **What Success Looks Like** — the bar.

**One voice out — the inviolable a squad must carry.** A squad agent is **mute to the
user**: it communicates *only* through the task board (the `tasks` plugin) — `complete_task`
with a self-certified outcome, `add_task_comment` for a question, `update_task_status` to
`needs_input` when blocked on intent. It **never** messages the user (directly or indirectly)
and **never** DMs the co-founder out of band. The co-founder is the single voice to the user;
it reads the board and relays. Bake this into every squad's `SOUL.md` *Boundaries* — the
template does. (This is also why Slack Block Kit and Voice are not authorable from a bundle —
see [*Tool permissions*](#tool-permissions).) Squads self-certify reversible outcomes; the
correction path is the co-founder reopening a ticket, not an up-front approval gate.

The step-by-step wake procedure lives in [`HEARTBEAT.md`](#heartbeatmd--the-wake-procedure),
not in `SOUL.md` — keep behavioural rules here and the procedure there.

## `HEARTBEAT.md` — the wake procedure

Per agent. **Required when `agent.json` declares a `heartbeat`** — the validator errors
otherwise. OpenClaw loads `agents/<id>/HEARTBEAT.md` on **every wake** — both heartbeat
pulses and dispatched tickets — before the agent starts work. This is the right home for
the recurring procedure the agent runs each tick: what to read, what to decide, what to
file. Keeping it out of `SOUL.md` is the convention because:

- **`SOUL.md` is about behaviour** — personality, principles, escalation rules.
  It should not also carry the step-by-step procedure.
- **`MEMORY.md` is an index of pointers**, not a script. Burying wake steps
  there hides them and bloats memory.
- **Authors can iterate on the wake procedure without touching `SOUL.md`**,
  which keeps personality/principles stable across releases.

**The board is the source of truth.** A wake reconciles the agent's assigned tickets
against the task board — both the *push* (a `sessions_send` pointer when the cofounder
dispatches) and the *pull* (this scan) converge on `list_tasks`, so nothing is lost if a
wake is missed or the agent restarts mid-ticket. This is the same reconcile-loop
discipline the pancake-controller uses against the cluster.

Write it in the imperative, addressed to the agent. A solid structure
(mirrored in [`template/agents/example-agent/HEARTBEAT.md`](../template/agents/example-agent/HEARTBEAT.md)):

1. **The non-negotiable** — *at least one ticket must be ADVANCED before the
   session closes.* `NO_REPLY` is only acceptable when nothing is actionable (every
   assigned ticket parked `needs_input`, no recurring duty due), and the reason must be
   logged to `memory/YYYY-MM-DD.md` first.
2. **Orient — reconcile the board first** — `list_tasks` (defaults to your own
   assigned tickets: `todo`, `in_progress`, `needs_input`). *This*, not the wake
   message, is what you act on. Then read `MEMORY.md` and skim recent daily logs.
3. **Pick and claim a ticket** — claim the oldest/highest-priority `todo`
   (`update_task_status(in_progress)` → `get_task` for the brief, which names the
   **workflow** to run), resume an `in_progress` one, or resume a `needs_input` one whose
   answer just arrived (read the thread via `list_events({ task_id })`).
4. **Run the ticket — self-cert or ask** — execute the workflow, then either
   `complete_task(result)` (you **self-certify** the outcome), or — when blocked on intent
   only the cofounder has — `add_task_comment(question)` + `update_task_status(needs_input)`
   (never guess, never message the user), or `fail_task` on a hard blocker.
5. **Recurring duty** — heartbeat-pulse work when no ticket is assigned. Most recurring
   duty is better driven by a cron that files a `routine`/`digest` ticket — see
   [*Crons through the board*](#crons-through-the-board).
6. **Digest** — append a one-paragraph digest to `memory/YYYY-MM-DD.md`: *what you did,
   what changed, what's still open (esp. `needs_input` you're waiting on), the next
   wake's first move.* Material news reaches the cofounder **through the ticket**, never
   by DMing the user. A wake without a digest is an unfinished wake.
7. **Close the loop** — `complete_task` / `add_task_comment` + `needs_input` / `fail_task`.

If `heartbeat` is omitted from `agent.json`, `HEARTBEAT.md` is optional and the pod's
default wake template is used when the agent does wake.

## `MEMORY.md` — seed memory

A thin **index of pointers**, not a notebook. It is seeded into the agent's workspace at
install and gives the agent its bearings: where its identity lives, its reporting line,
which squad and skills it has, which vault keys it uses, where it files its outputs.

- Keep every entry a one-line pointer. Detailed findings belong in the shared wiki.
- A bundle may ship a squad-wide `MEMORY.md` (used by any agent without its own) and/or a
  per-agent `agents/<id>/MEMORY.md`. **The agent-specific file overrides the squad-wide
  one.** If neither exists, the pod's own memory template is used.

See [`template/MEMORY.md`](../template/MEMORY.md).

## Skills

A skill is a procedure an agent can load — a method written as steps, not reference docs.
Skill files are in **SKILL.md format**: a YAML frontmatter block with `name` and
`description`, then a Markdown body.

```markdown
---
name: my-skill
description: One or two sentences on what the skill does and when to load it.
---

# My skill

...the procedure...
```

Two levels:

- **Squad-wide skills** — listed in the top-level `manifest.skills[]`, files under
  `skills/<name>.md`. Copied into **every** agent of the squad at install.
- **Agent-specific skills** — listed in `agents/<id>/agent.json#/skills`, files under
  `agents/<id>/skills/<name>.md`. Deployed only into that one agent.

**Skill isolation:** at install, every referenced skill is deployed into each agent's *own*
folder, `workspace/agents/<id>/skills/<name>/SKILL.md`, and the agent's skill allowlist is
`["<agent-id>", "shared"]`. Squad agents never inherit the main co-founder's skills, and a
squad-wide skill is *duplicated* into each agent — not shared by reference.

## `crons/jobs.json` — native cron jobs

Optional. Native OpenClaw cron jobs registered at install.

```json
{
  "version": 1,
  "jobs": [
    {
      "id": "daily-citation-audit",
      "name": "Daily GEO citation audit",
      "enabled": true,
      "schedule": { "kind": "cron", "expr": "0 18 * * *", "tz": "America/Los_Angeles" },
      "sessionTarget": "atlas",
      "payload": { "kind": "systemEvent", "text": "<instructions for the agent>" },
      "failureAlert": false,
      "state": {}
    }
  ]
}
```

- **`sessionTarget` must be an agent id declared in `manifest.agents`.** Squad crons may
  only target the squad's own agents — this is the *squad-only targeting* invariant, and it
  is enforced at install (and by `validate.mjs`).
- At install, job ids are namespaced `<squad-name>__<id>` so two squads cannot collide.
- A cron run that intentionally produces no output must instruct the agent to reply with
  the single literal token **`NO_REPLY`** — OpenClaw's silent-turn sentinel. Never write
  "do not respond"; that trips a false-positive failure alert.

### Crons through the board

Crons are how a squad becomes **autonomous** — each one runs a workflow on a schedule
(daily triage, weekly report) without anyone asking. But a cron must **not** do silent work
the user can't see, and it must **not** page the user. Route cron output through the board:

The cron payload instructs the agent to run its workflow and then **file the result as a
ticket assigned to itself** with `kind: "routine"` (recurring operational output) or
`kind: "digest"` (periodic summaries), and **no `notify_channel`**:

```
create_task({ kind: "routine", assigned_to: "<this agent>", title: "<job> — <date>",
              context: "<the result/digest>", priority: "later" })   // NO notify_channel
→ complete_task(...)   // self-cert; lands on the board, quiet
```

Because there's no `notify_channel`, the plugin never wakes the cofounder — the ticket just
appears on the board. The cofounder's daily report rolls up `routine`/`digest` tickets;
only `task` / `needs_input` / `failed` interrupt the user. A genuinely urgent finding (a P0)
the agent still surfaces explicitly in the ticket so the cofounder raises it now.

This keeps the board the single pane for *both* delegated work and autonomous cron output,
without burying the user in daily noise.

### Self-managed crons

A squad may also create its own crons at runtime (e.g. to add a per-source fetch the user
asked for). Declare `"cron"` in `manifest.required_tool_permissions`; the agent then uses
the `cron` tool, and its job ids should stay namespaced under the squad. No approval gate —
the board's audit trail is the safety net.

## Dispatchable work

Squads do not ship task templates. The agent's recurring wake procedure lives in
`HEARTBEAT.md`, and ad-hoc work is dispatched by the co-founder at runtime via the
tasks plugin (`create_task`) — there is no per-bundle template file. A `tasks/` directory
inside a bundle has no meaning to the runtime; do not create one.

## Forbidden files

These filenames are **pod-managed by Pancake Cloud** and live at the pod workspace root
(alongside `CLAUDE.md`), not inside any bundle. The validator rejects them at any depth
inside a bundle directory (case-insensitive):

- `AGENTS.md`
- `USER.md`
- `BOOTSTRAP.md`
- `BOOT.md`

A bundle's `MEMORY.md` is allowed (and idiomatic) to *reference* these files by relative
path (e.g. `../../USER.md` as the user-pointer in an agent's MEMORY) — the validator only
forbids the *files themselves*, not references to them.

`TOOLS.md` is explicitly **allowed** inside a bundle — it is bundle-authored documentation
of the squad's tool surface, distinct from the pod-level files above.

## Tool permissions

`manifest.required_tool_permissions` is the list of Pancake-shipped tools the squad needs
access to. The marketplace will not grant a permission for a tool Pancake does not ship, so
the validator rejects anything outside this list.

Each tool has one or more **accepted keys**. Either snake_case or kebab-case variants are
accepted where listed; pick one and stick with it. Duplicates within the same array are
rejected.

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

Slack Block Kit and Voice / TTS are intentionally **not** authorable from a squad
bundle — those are user-facing channels owned by the pod's co-founder agent. Squad agents
report to the co-founder, which relays to the user; routing through Slack or voice from
inside a sub-agent breaks that contract.

When Pancake ships a new tool, this list — and the validator's `ACCEPTED_TOOL_PERMISSIONS`
table in `scripts/validate.mjs` — are updated together.

## Deprecated fields

The validator emits an error if it finds any of these:

- `token_intensity` in `manifest.json` or in `SQUAD.md` frontmatter. Pancake Cloud now
  computes token usage automatically from the model, tools called, and crons declared —
  the author-declared field is no longer trusted.

## Naming conventions

- **Squad name** — kebab-case, globally unique, ≤ 64 chars.
- **Agent id** — kebab-case, unique within the squad. Becomes the OpenClaw sub-agent id.
- **Skill files** — kebab-case `<name>.md`, in SKILL.md format.
- **`version`** — semver. Bump it on every release; the marketplace keeps version history.

## Validating

Run the validator before publishing — it mirrors marketplace ingestion exactly:

```sh
node scripts/validate.mjs                      # every squads/* bundle and template/
node scripts/validate.mjs squads/<bundle-name> # one bundle
```

It exits non-zero on any error; warnings (e.g. a missing `tags` line) never fail the run.
Error categories the validator emits:

| Category | Example |
|---|---|
| Manifest schema | `agents[0]  "Geo Agent" must be kebab-case` |
| `agent.json` missing | `agents/foo/agent.json  not found` |
| `agent.json` schema | `agents/foo/agent.json#/model  must be one of: haiku, sonnet, opus` |
| Referenced file | `agents/foo/HEARTBEAT.md  referenced by the manifest but not found` |
| Cron targeting | `crons/jobs.json  cron job "x" sessionTarget "y" is not a declared agent id` |
| Forbidden file | `agents/foo/USER.md  forbidden filename — …` |
| Deprecated field | `SQUAD.md  frontmatter has a deprecated 'token_intensity:' line` |
| Unresolved TODO | `SQUAD.md  unresolved TODO marker on line 12` |

Next: [`creating-a-squad.md`](./creating-a-squad.md) for the step-by-step authoring guide,
and [`publishing.md`](./publishing.md) for getting your squad into the marketplace.
