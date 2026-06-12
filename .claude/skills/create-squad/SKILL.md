---
name: create-squad
description: Author a new Agent Squad bundle — scaffold it from the template, interview the author, fill every file, and validate. Use when the user wants to create, build, or add a new squad (a deployable bundle of proactive Pancake sub-agents).
---

# Create a squad

Author a complete, valid Agent Squad bundle with the user. Work through the steps in order
— later steps depend on earlier ones.

> **Nothing enforces scope at runtime.** The validator checks file *shape*, not whether you
> should have built a new squad at all, named it for a tool, or duplicated a domain another
> squad already owns. Those are design calls, and **this skill is the only place they're
> caught.** Do Step 0 before you scaffold — getting placement wrong ships a squad that
> fragments a domain or bloats the catalog, and there is no later gate to catch it.

## Step 0 — Scope & placement (decide BEFORE scaffolding)

A request for "a new squad" is usually a request for a *capability*. Find the smallest unit
that delivers it. Do **not** default to a new squad. Walk this in order:

1. **One-shot / conversational / sub-~2-min?** → Not a squad. The co-founder does it inline.
   A squad is for *persistent, proactive, recurring* domain ownership. (e.g. "summarize this
   thread" is not a squad.)

2. **Does an existing squad already own this domain?** Enumerate them first — `ls squads/`,
   and for each read the `SQUAD.md` "What this squad does" line and `manifest.workflows`. If
   one already owns the domain, **add to it; do not create a new squad**:
   - **New job/outcome inside the domain** → add a **workflow** (and the skill that runs it)
     to that squad. (e.g. a new Google Ads report → a `google.*` workflow on `paid-ads-squad`,
     not a new squad.)
   - **New channel/sub-domain with its own cadence, identity, or tools** → add an **agent** to
     that squad. (e.g. a Twitter channel → a `twitter-agent` in `community-squad`.) Remember
     agents don't share context — only split when the lane is genuinely distinct.

3. **Genuinely new domain, no existing squad covers it, and it's worth a persistent
   autonomous owner?** → *Now* create a new squad.

**Name the squad for the DOMAIN, never a tool.** The squad owns a goal; a tool is one way to
serve it. A tool-named squad (`posthog-squad`, `reddit-squad`, `google-ads-squad`) is a smell
— it blocks the obvious second tool. Name the domain and namespace the workflows by tool:
`analytics-squad` with `posthog.*`; `community-squad` with `reddit.*`; `paid-ads-squad` with
`google.*` + `meta.*`. **Test:** "could a second tool serve this same goal?" If yes, the squad
is the goal and the tool is a workflow namespace.

**Merge overlap — pre-flight, and fix it if you find it.** If two squads turn out to be the
same domain through different tools (two tools, one job), **merge them**, don't ship a third:
pick the domain name, move each tool's agent in, **demote each tool's squad-wide skills to
agent-specific** (squad-wide `manifest.skills[]` are copied into *every* agent — in a
multi-agent squad that cross-contaminates context), union the workflow catalog (`toolA.*` +
`toolB.*`), combine crons (board-routed), write one `SQUAD.md` + a branch-by-tool `ONBOARD.md`,
delete the old bundles, start a fresh `version`. `squads/paid-ads-squad/` is the worked
example (merged from `google-ads-squad` + `meta-ads-squad`).

The fuller decision tree, with worked examples, is
[`docs/creating-a-squad.md` §0](../../../docs/creating-a-squad.md). Read it if the call isn't obvious.

Only once Step 0 says "yes, a new squad" do you continue to Step 1.

## Step 1 — Load the contract

Before writing anything, read, in this order:

1. [`docs/bundle-reference.md`](../../../docs/bundle-reference.md) — the exact file contract.
2. [`docs/creating-a-squad.md`](../../../docs/creating-a-squad.md) — the public-grade
   authoring guide and principles.
3. The skeleton bundle [`template/`](../../../template/) — every file. Your output mirrors
   its structure.

Do not invent the contract from memory — read these files.

## Step 2 — Interview the author

Ask the user what they want, and don't scaffold until you have answers for all of it:

- **The squad** — its purpose, and a kebab-case `name` (globally unique, ≤ 64 chars).
- **Each agent** — `id` (kebab-case), role / `description`, `model` (`haiku`/`sonnet`/`opus`,
  string enum), `heartbeat` — a curated subset of [OpenClaw's
  `agents.list[].heartbeat`](https://docs.openclaw.ai/gateway/config-agents#agents-defaults-heartbeat).
  Only six sub-fields are accepted: `every`, `model`, `lightContext`,
  `isolatedSession`, `skipWhenBusy`, `timeoutSeconds`. `every` is an OpenClaw duration
  string in units `ms`/`s`/`m`/`h` (e.g. `"30m"`, `"2h"`, `"24h"`, `"0m"` to disable);
  named values like `"daily"` are invalid. `heartbeat.model` is the same `haiku`/`sonnet`/`opus`
  enum. Keep each agent single-lane and focused.
- **Workflows** — the squad's *published interface*: the outcome-typed entrypoints the
  co-founder delegates to. For each, get `{ id, summary, inputs, outcome, agent, secrets, tools }` — `id` is
  `<tool|subdomain>.<verb_noun>` (lower dotted, e.g. `seo.audit_citations`), `summary` ≤ 200
  chars (what the co-founder reads to match intent), `inputs` are rich descriptors
  (`{ type, description, example?, required?, default?, enum? }` per input — not type strings;
  a good `example` makes the co-founder's brief usable), `outcome` is the done-state, `agent` must
  be a declared agent. Aim for **3–5 per agent**; ten usually means one job parameterized.
  Every workflow must map to a skill the agent loads to run it (convention: a skill named after
  the workflow), and cron-driven routines count as workflows too. See
  [`docs/bundle-reference.md#workflows`](../../../docs/bundle-reference.md#workflows--the-squads-published-interface).
- **Skills** — which are squad-wide (every agent gets them) vs agent-specific. In a
  **multi-agent** squad, prefer **agent-specific** for anything tool/lane-specific — squad-wide
  skills are copied into *every* agent and pollute the others' context.
- **Required identities** — external sites the squad needs connected, each with a reason.
- **Required vault secrets** — each `{ key, label, type }`. This squad-level array is a
  *registry* (defined once so onboarding knows what to collect) — each workflow's `secrets`
  array references the keys it actually uses at runtime; the validator errors on undefined
  references and warns on registry entries no workflow references.
- **Required tool permissions** — must be drawn from the canonical Pancake tool list
  ([`docs/bundle-reference.md#tool-permissions`](../../../docs/bundle-reference.md#tool-permissions)).
  Accepted keys today: `browser`, `exa` / `web_search` / `web_fetch`, `github`,
  `google-workspace` / `google_workspace`, `notion`, `agentmail`, `vault`,
  `preview-host` / `publish_preview`, `mcp-installer`,
  `image-generation` / `image_generate` / `image`, `cron`. Anything else is rejected by
  the validator. Like vault secrets, this is a squad-level *registry* — each workflow's
  `tools` array references the permissions that workflow actually uses. Slack and voice/TTS are intentionally excluded — those are user-facing
  channels owned by the co-founder, not by a sub-agent.
- **Crons** — any scheduled jobs, and what each one does.
- **Catalog metadata** — `tags` for the marketplace card (no `token_intensity` — it is
  deprecated and Pancake Cloud computes token usage automatically).

## Step 3 — Scaffold

Copy [`template/`](../../../template/) to `squads/<name>/`, then fill every file:

- **`manifest.json`** — package descriptor only. `agents` is a string array of kebab ids.
  Add the **`workflows[]`** catalog from Step 2 (each
  `{ id, summary, inputs, outcome, agent, secrets, tools }`; `agent` must be one of
  `manifest.agents`; ids unique within the squad; `secrets`/`tools` reference keys defined in
  the squad-level `required_vault_secrets` / `required_tool_permissions` registries). No per-agent runtime
  config in this file. Delete optional sections the squad doesn't use.
- **`agents/<id>/agent.json`** for every agent — the per-agent runtime config (curated
  subset of OpenClaw's `agents.list[]`). Required: `id`, `description`. `model` is a
  string from `haiku`/`sonnet`/`opus`. `heartbeat` is an object with up to six allowed
  sub-fields: `every`, `model`, `lightContext`, `isolatedSession`, `skipWhenBusy`,
  `timeoutSeconds`. `every` is an OpenClaw duration in `ms`/`s`/`m`/`h` (e.g. `"30m"`,
  `"2h"`, `"24h"`); plain strings (`"daily"`) and named values are rejected. Pod-level
  fields like `prompt`, `target`, `directPolicy`, `session`, `to`, `ackMaxChars` are
  rejected. Top-level optional fields: `skills`, `contextInjection`, `bootstrapMaxChars`,
  `params`. Unknown fields anywhere are rejected.
- **`agents/<id>/IDENTITY.md`, `SOUL.md`, and `HEARTBEAT.md`** for every agent; add
  `agents/<id>/MEMORY.md` if useful. `HEARTBEAT.md` is **required** when `agent.json`
  declares a heartbeat — keep it out of `SOUL.md` (behaviour) and `MEMORY.md` (pointer
  index).
- **Every skill file** referenced by `manifest.skills` or `agent.json#/skills`, in
  SKILL.md format (frontmatter `name` + `description`, then a procedure written as steps).
- **`SQUAD.md`** — frontmatter is minimal: `tags` (recommended) and optional
  `preview_image`. The body is the marketplace catalog's source of truth for per-agent
  prose, so describe every agent here in user-facing language.
- **`ONBOARD.md`** — the runnable onboarding script the co-founder executes after deploy.
- Add or delete the optional `crons/jobs.json` and squad-wide `MEMORY.md` depending on
  Step 2.
- **Strip every `<!-- TODO -->` comment and placeholder** the template ships with. The
  validator errors on any unresolved TODO marker outside `template/`.

> If this repo has no `squads/` directory — i.e. it is a third-party self-host repo — scaffold
> at the **repo root** instead of under `squads/<name>/`. See
> [`docs/publishing.md`](../../../docs/publishing.md).

## Step 4 — Bake in the conventions

- Each agent is a **focused, single-lane specialist** that reports to the co-founder — not a
  generalist.
- **Bounded tool output is a hard default.** Any agent that runs queries (SQL / HogQL / API)
  or calls tools that can return large payloads must enforce result-size discipline in its
  skills **and** `SOUL.md`: aggregate over enumerate, put a small explicit `LIMIT` on every
  row-returning query, project named scalar fields (never `SELECT *` or a raw JSON blob), and
  send wide or row-level extracts to a file rather than into the conversation. State the
  rationale in the skill so it sticks: a single tool result over ~25k tokens overflows the
  model context, **cannot be compacted away** (it exceeds the summarizer's per-message limit),
  and wedges the agent in a fail→retry loop that burns the model fallback ladder until the
  session is manually reset. This is a real production failure mode, not a hypothetical — see
  `squads/analytics-squad/agents/analytics-agent/skills/posthog-mcp-toolkit.md → Result-size
  discipline` for the reference implementation.
- **The board is the bus; the squad is mute to the user.** Every agent communicates *only*
  through the company task board (the `tasks` plugin) — `complete_task` with a self-certified
  outcome, `add_task_comment` + `update_task_status(needs_input)` to ask, a `routine`/`digest`
  ticket for cron output. It **never** messages the user (directly or indirectly) and never DMs
  the co-founder out of band. Bake this into every `SOUL.md` *Boundaries (Inviolable)* and make
  the `HEARTBEAT.md` **reconcile the board first** (`list_tasks` your own tickets before acting).
  The template and `squads/eng-squad/` already do this — mirror them. There are no
  approval gates: self-certify reversible outcomes; the correction path is the co-founder
  *reopening* a ticket.
- **Each published workflow maps to a skill** the agent loads to run it, and the `HEARTBEAT.md`
  claims a `todo` ticket → reads the brief (which names the workflow) → runs that skill.
- **Crons route through the board.** A cron runs its workflow, then files the result as a
  `create_task({ kind: "routine" | "digest", assigned_to: "<self>", … })` with **no
  `notify_channel`**, then `complete_task`s it — never a Slack post, never silent work. Mirror
  `squads/eng-squad/crons/jobs.json`.
- `ONBOARD.md` is a **runnable script** the co-founder executes: collect secrets via
  `vault_request`, connect identities via `browser_identity_add`, save answers to the agent's
  `MEMORY.md`, and create + dispatch a first task. It must fit `estimated_setup_minutes`.
- `MEMORY.md` is a **thin index of pointers**, never a notebook.
- `HEARTBEAT.md` is the **imperative wake procedure** OpenClaw loads on every pulse —
  not behaviour (that's `SOUL.md`), not pointers (that's `MEMORY.md`). It must require
  the agent to **execute at least one task before closing the session** (no
  orient-and-bail), and to write a **digest** to `memory/YYYY-MM-DD.md` before ending
  the turn — what was done, what changed, what's still open, the next wake's first
  move. `NO_REPLY` is only acceptable when nothing is actionable, with the reason
  logged first.
- The **`SQUAD.md` body** is the catalog's per-agent prose surface — describe each
  agent in user-facing language there (not in `manifest.json`).
- **Forbidden files**: do not create `AGENTS.md`, `USER.md`, `BOOTSTRAP.md`, or `BOOT.md`
  inside the bundle — those are pod-managed by Pancake Cloud. `TOOLS.md` is allowed (it
  is bundle-authored documentation).
- Crons target **only this squad's own agents**.
- **Squad crons run in the agent's *persistent* session — they cannot be isolated.** OpenClaw
  has an ephemeral `sessionTarget: "isolated"` cron mode, but it requires the target *not* be a
  named agent and `payload.kind: "agentTurn"` — and the squad installer rejects any cron whose
  `sessionTarget` isn't one of the bundle's own agents (which it must be). So every squad cron
  runs as `payload.kind: "systemEvent"` in that agent's main session, which **persists and
  accumulates across runs**. Design for two consequences: (1) a cron run that emits an oversized
  tool result wedges that main session with no sandbox to fall back on — bounded tool output
  (above) is the only guard; (2) each cron run must **self-clean** — do the work, file results
  to the wiki, write the daily digest, and close — so the persistent session does not grow
  unbounded. `heartbeat.isolatedSession` gives *heartbeat wakes* a fresh session, but there is
  **no equivalent for crons** — never assume a cron is sandboxed.
- A cron run with nothing to report must reply with the single literal token `NO_REPLY`.

## Step 5 — Validate (mandatory gate)

Validation is a **blocking gate**, not advisory. The bundle is not finished until the
validator exits 0 with no errors.

```sh
node scripts/validate.mjs squads/<name>
```

- Run the validator **after every batch of edits**, not just at the end. The validator
  is your test loop — it catches forbidden files, unresolved TODOs, schema drift, and
  broken file references that compound if left until the end.
- Fix every error and re-run. Treat warnings the same way unless the user explicitly
  accepts them (e.g. a deliberately tag-less private bundle).
- **Do not declare the bundle finished** until you have run the validator at least once
  and seen it exit 0 on this specific bundle.

## Step 6 — Author one replay trace per workflow (mandatory gate)

Validation checks the bundle's *static* shape. The replay-eval suite checks what each
workflow actually *does* at the squad↔board contract level — the qualified id the
cofounder stamps, the tool calls the agent makes, the terminal it closes with, the
digest it writes. **Every published workflow ships with at least one happy-path trace.**
The runner (`scripts/eval.mjs`) is wired into CI alongside the validator; both must be
green.

For each workflow declared in `manifest.workflows[]`, create:

```
squads/<name>/evals/replay/<workflow-id>/happy-path.trace.json
```

The trace format is JSON, `version: 1`, documented in the per-bundle `evals/README.md`
(every bundle ships a copy). Mirror the worked examples in
`squads/eng-squad/evals/` and `squads/analytics-squad/evals/`:

- `squad` and `workflow` identify the run; `dispatch.workflow` MUST be the canonical
  qualified id `<squad>.<workflow>` — anything else is the cofounder-hallucinated-id
  failure mode the runner catches.
- `dispatch.assigned_to` must equal `workflow.agent`.
- `events[]` is the ordered tool calls: `create_task`, `claim_task`, the agent's tools
  in order, and exactly one terminal (`complete_task` or `fail_task`) as the final
  event. Squad-agent terminals MUST carry a `digest`.
- Tools used must be in `workflow.tools ∪ required_tool_permissions`; vault reads must
  reference `workflow.secrets ∪ required_vault_secrets`. The runner enforces both.
- `assertions.tools_must_include` and `tools_must_exclude` are how you encode positive
  and red-flag tool patterns.

If your squad is being created in response to a production incident, also commit a
**negative-case trace** of the failure (`expected: "FAIL"` + `expected_failures: [...]`)
so the bug stays caught forever. See the `regression-2026-06-11-*.trace.json` examples
in `squads/analytics-squad/evals/` and the per-bundle `evals/README.md` for the inverted-
expectation contract.

Run the suite scoped to your bundle until it goes green:

```sh
node scripts/eval.mjs squads/<name>
```

The bundle is not finished until `node scripts/eval.mjs squads/<name>` exits 0.

## Step 7 — Hand off

Tell the user the bundle is ready, summarize what was built (workflows declared,
agents, traces shipped), state both gate outcomes (the last exit-0 run of the
validator AND the replay-eval suite on this bundle), and point them to
[`docs/publishing.md`](../../../docs/publishing.md) for getting it into the marketplace.
