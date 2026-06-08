# RFC: Workflows as the primary unit (agents become opt-in)

**Status:** Draft — **deferred, pick up in a new session**
**Author:** Théophile Cousin (+ Claude)
**Extends:** [`workflows-architecture.md`](./workflows-architecture.md) (squads-as-workflows)
**Scope:** `manifest.schema.json`, `scripts/validate.mjs`, `docs/`, the `.claude/skills/create-squad` + `validate-squad` skills, and (companion) `apps/pancake-claw/plugins/squad-store` in the infrastructure repo.

---

## 0. New-session start here

This is a design + migration plan, written to be executed later. To resume cold:

1. Read this doc top to bottom.
2. Read the current contract it changes: [`bundle-reference.md` → *workflows*](./bundle-reference.md#workflows--the-squads-published-interface) and [`creating-a-squad.md` §0](./creating-a-squad.md).
3. Read the current executor it extends: `apps/pancake-claw/plugins/squad-store/src/deploy.ts` (how agents/skills/crons are deployed today) and `index.ts` (the `squad_install` / tool surface).
4. Start at **§7 Phase 0** (the feasibility spike). Do not write schema/validator changes until Phase 0 answers whether OpenClaw can run a per-workflow tool/skill-scoped ephemeral sub-agent.

The motivating question (from the session that produced this): *if the real work lives in workflows + skills, why pre-define many agents that mostly overlap? Shouldn't a workflow just link the tools it needs and run?* The answer below: **yes for the reactive majority; keep agents only for standing autonomy + state.**

---

## 1. Problem with the current model

The squads-as-workflows RFC gave us four nested layers: **squad → agent → workflow → skill**. In practice:

- Most squads are **single-agent** (ai-seo, outreach, community). The agent is a thin wrapper; squad/agent/workflow/skill is three layers of nesting for "a domain and its jobs."
- Much of `IDENTITY.md`/`SOUL.md` is now **framework boilerplate** — mute-to-user, the reconcile loop, self-cert. Board-as-bus standardized it, so it's identical across agents and carries no agent-specific information.
- Multi-agent squads **overlap**. `google-ads-agent` and `meta-ads-agent` are ~90% the same role ("operate one ad account to a KPI, hold spend flat, escalate budget"). The only real differences are the *skill/tool set* (Google API vs Meta MCP) and the *identity*. They were split into two agents purely for skill-context isolation — which per-workflow scoping would handle more cleanly.

The agent has become the default unit when it should be the exception.

## 2. What an agent irreducibly provides (and what it doesn't)

Strip the boilerplate and a persistent agent buys exactly three things a workflow cannot:

1. **Proactivity** — a heartbeat. It wakes on its own, decides what's highest-leverage now, pushes the mission deeper, and reclaims orphaned tickets (the self-heal). Workflows are reactive entrypoints.
2. **Accumulated state/judgment** — outreach's pipeline ledger, meta's approval queue, account maturity, weekly learnings. Durable domain memory across runs. Workflows are stateless.
3. **A judgment router for fuzzy work** — which workflow fits an ambiguous ask; the case that fits no workflow; escalation. Without an agent this falls back to the cofounder, re-bloating it.

**If a domain needs none of those three, the agent is dead weight.** That's the whole thesis.

## 3. The reframing

> Make the **workflow the primary, self-describing unit**: it declares the skills, tools, identities, and secrets it needs, and can run on a thin **ephemeral executor** with no standing agent. Mint a **persistent agent only** when a domain genuinely needs proactivity, accumulated state, or a judgment router — and then the agent *publishes* workflows and *also* runs autonomously.

This isn't a new tier — it formalizes the cofounder's existing "one-off temp agent" path (`sessions_spawn`) into a first-class, catalogued, reusable thing.

| Unit | Runs when | Holds state? | Proactive? | Cost |
|---|---|---|---|---|
| **Ephemeral workflow** (new default) | dispatched or cron-fired | no (board/wiki only) | no | ~0 — a scoped transient sub-agent per run |
| **Standing agent** (opt-in) | heartbeat + dispatch | yes (its memory) | yes | an `agents.list` entry, IDENTITY/SOUL, heartbeat |

## 4. Schema sketch — `workflows[]` with tools

Extend each `manifest.workflows[]` entry. `agent` becomes optional; new fields make the workflow self-contained.

```json
{
  "id": "google.optimize_account",
  "summary": "Run a full Google Ads optimization sweep and ship every reversible fix.",
  "inputs": { "scope": "string (optional — campaign/type to focus; default whole account)" },
  "outcome": "Reversible fixes shipped; budget-raise surfaced on the board; sweep filed.",

  "runtime": "ephemeral",                          // "ephemeral" | "agent:<id>"
  "skills": [                                       // per-WORKFLOW skill scope (not per-agent)
    "skills/google/optimization-sweep.md",
    "skills/google/account-foundations.md",
    "skills/google/orchestrator.md",
    "skills/google/root-cause-lab.md"
  ],
  "tools": ["vault", "browser", "web_fetch"],       // subset of the Pancake tool keys
  "identities": ["google.com"],                     // what onboarding must connect
  "secrets": [                                      // what onboarding must collect
    "google_ads.developer_token",
    "google_ads.oauth_refresh_token",
    "google_ads.customer_id"
  ]
}
```

| Field | Type | Req | Rules |
|---|---|---|---|
| `id`, `summary`, `inputs`, `outcome` | — | as today | unchanged |
| `runtime` | string | · | `"ephemeral"` (default) or `"agent:<id>"` where `<id> ∈ manifest.agents`. |
| `agent` | string | · | **Deprecated alias** for `runtime: "agent:<id>"`. Keep accepted for one release for backward-compat, then drop. |
| `skills` | string[] | ·* | bundle-relative skill paths loaded for this workflow. **Required when `runtime: ephemeral`** (an ephemeral run has no agent skill-folder to inherit). |
| `tools` | string[] | ·* | accepted Pancake tool keys (same table as `required_tool_permissions`). The executor scopes the run to exactly these. Required for `ephemeral`. |
| `identities` | string[] | · | eTLD+1 sites this workflow needs connected. Drives per-workflow onboarding/preflight. Subset of `manifest.required_identities`. |
| `secrets` | string[] | · | vault keys this workflow reads. Drives onboarding/preflight. Subset of `manifest.required_vault_secrets`. |

Squad-level `required_*` become the **union/superset** (what the whole squad could need); per-workflow `tools`/`secrets`/`identities` are the **exact slice** a given run scopes to. Validator checks each workflow's slice is a subset of the squad-level declarations.

`manifest.agents` may now be **empty** (a squad of pure ephemeral workflows). Validator: allow `agents: []` iff every workflow is `runtime: ephemeral`.

## 5. Executor model — the ephemeral runtime

The companion change in `squad-store` (or a small new `workflow-run` plugin):

- On dispatch of a ticket whose workflow is `runtime: ephemeral`, the runtime `sessions_spawn`s a **transient sub-agent** (runtime: subagent, mode: run) configured with **only** that workflow's `skills` + `tools`, seeded with the ticket brief + inputs, told to self-cert on the board and exit. No `agents.list` entry, no heartbeat, no persona file.
- Board-as-bus is unchanged: the transient run reconciles the ticket, `complete_task`s (self-cert) or `needs_input`s, and the cofounder relays. Crons fire ephemeral workflows the same way (file a `routine`/`digest` ticket).
- **The three lost agent-properties, relocated:**
  - *Proactivity* → crons fire the workflow on schedule. (No self-directed "what's worth doing now" — accepted for reactive domains.)
  - *State* → lives on the **board** (e.g. an approval queue becomes `needs_input` tickets) and the **wiki** (durable findings), keyed by domain, not by an agent memory. This is *more* board-as-bus-pure, not less.
  - *Judgment router* → the cofounder's delegation skill matches intent → workflow id (it already does this). Genuinely fuzzy domains are the signal you *do* want a standing agent.

## 6. Worked example — paid-ads re-modeled

**Today:** 2 agents (`google-ads-agent` 24h heartbeat, `meta-ads-agent` no heartbeat), 33 agent-specific skills split across two agent folders, 8 workflows pointing at the two agents, 5 crons, two IDENTITY/SOUL/MEMORY sets. The overlap the question flagged.

**Under this RFC (Option A — collapse to ephemeral workflows):**

```json
{
  "name": "paid-ads-squad",
  "agents": [],
  "workflows": [
    { "id": "google.optimize_account", "runtime": "ephemeral",
      "skills": ["skills/google/optimization-sweep.md", "skills/google/orchestrator.md", "skills/google/account-foundations.md", "..."],
      "tools": ["vault","browser","web_fetch"],
      "identities": ["google.com"],
      "secrets": ["google_ads.developer_token","google_ads.oauth_refresh_token","google_ads.customer_id"] },
    { "id": "google.daily_digest",  "runtime": "ephemeral", "skills": ["skills/google/daily-digest.md"], "tools": ["vault"] },
    { "id": "google.root_cause",    "runtime": "ephemeral", "skills": ["skills/google/root-cause-lab.md","..."], "tools": ["vault","web_fetch"] },
    { "id": "google.scale_budget",  "runtime": "ephemeral", "skills": ["skills/google/budget-engine.md"], "tools": ["vault"] },
    { "id": "meta.daily_operations","runtime": "ephemeral",
      "skills": ["skills/meta/account-foundations.md","skills/meta/root-cause.md","skills/meta/operational-routines.md","..."],
      "tools": ["vault","mcp-installer"],
      "secrets": ["team.meta_api_token","team.meta_ad_account_id","..."] },
    { "id": "meta.daily_digest",    "runtime": "ephemeral", "skills": ["skills/meta/review-cadence.md"], "tools": ["vault"] },
    { "id": "meta.weekly_review",   "runtime": "ephemeral", "skills": ["skills/meta/review-cadence.md","..."], "tools": ["vault"] },
    { "id": "meta.investigate",     "runtime": "ephemeral", "skills": ["skills/meta/root-cause.md"], "tools": ["vault"] }
  ]
}
```

What changes: skills move from `agents/<id>/skills/` to subdomain folders `skills/google/*`, `skills/meta/*`, referenced per-workflow. No agents.list entries, no personas. The daily sweeps become crons firing `google.optimize_account` / `meta.daily_operations` ephemerally. Meta's **approval queue** stops being agent memory and becomes `needs_input` board tickets — the cofounder sees pending budget approvals on the board directly.

**What you lose:** continuous "watching" of the account between cron runs, and the per-account learned judgment that accreted in agent memory. **If that loss matters for ad ops**, choose **Option B**: keep *one* lightweight standing `ad-ops-agent` for proactive monitoring + state, and make the heavy operations ephemeral workflows it dispatches — but that's a deliberate "this domain earns an agent" call per §0, not the default.

This worked example is also the **first migration target** in the plan (Phase 4) — it's the highest-overlap squad, so it's the best proof.

## 7. Implementation plan (phased)

### Phase 0 — Spike (do first; gates everything)
Determine empirically in `pancake-claw` whether an **ephemeral, per-workflow tool/skill-scoped sub-agent** is runnable: can `sessions_spawn` (or a new runtime path) start a transient sub-agent that sees *only* a given skill set + tool set, work a ticket, self-cert, and exit cleanly — with board wake/notify intact? Mirror the squads-as-workflows Phase 0 (literal vs instructional scoping). **Output:** ephemeral-executor is feasible (build it) vs not (fall back to a thin always-on "runner" agent that loads per-ticket scope). This was also the unresolved `#gtm`-class risk — tool scoping being instructional, not literal.

### Phase 1 — Schema + validator
Extend `manifest.workflows[]` (§4) in `manifest.schema.json` and `scripts/validate.mjs`: `runtime`, `skills`, `tools`, `identities`, `secrets`; make `agent` an optional deprecated alias; allow `agents: []` iff all workflows are ephemeral; validate per-workflow slices ⊆ squad-level declarations; validate `skills`/`tools` files/keys resolve. Update `bundle-reference.md`. Keep additive/backward-compatible (existing `{…, agent}` workflows still pass).

### Phase 2 — Executor (companion, infrastructure repo)
Build the ephemeral runner in `plugins/squad-store` (or a sibling): given a workflow id + ticket, spawn the scoped transient, run, self-cert. Wire cron payloads to fire ephemeral workflows. Reuse the existing board/notify path. Add to the offline e2e harness (`benchmarks/squad-install-e2e`).

### Phase 3 — Authoring model
Rewrite `creating-a-squad.md §0` and the `create-squad` skill: the decision tree gains a concrete leaf — **ephemeral workflow with tools** (the new default) vs **standing agent** (opt-in for the §2 three) vs **squad** (the domain envelope). Skills reorganize by subdomain (`skills/<tool>/…`), referenced per-workflow. `validate-squad` "what validation does NOT cover" gains the runtime choice.

### Phase 4 — Re-model paid-ads (first migration)
Convert `paid-ads-squad` to §6 Option A. Measure: cofounder context delta, lines of boilerplate removed, whether the lost "watching" matters. This is the go/no-go evidence for rolling further.

### Phase 5 — Roll the rest, per §0 test
For each remaining squad decide ephemeral-workflows vs keep-a-standing-agent:
- **ai-seo / community**: likely ephemeral workflows + crons (reactive, low state) — but ai-seo's daily mission-deepening is a mild argument for a thin agent.
- **outreach**: the pipeline ledger is real accumulated state → likely *keeps* a standing agent (a clean example of "this domain earns one").
- **github-triage**: read-mostly, reactive → ephemeral workflows.

### Phase 6 — Per-workflow onboarding/preflight
Because workflows now declare `secrets`/`identities`, onboarding derives per-workflow: the cofounder collects exactly what the dispatched workflow needs, and a **preflight** check fails a dispatch fast if a required secret/identity is missing (turns today's mid-run `needs_input` into an up-front, precise ask). This also structurally kills the `#gtm`-class bug: a channel is never a workflow/agent field — it's a cofounder relay concern, full stop.

### Phase 7 — Docs + cleanup
README roster, deprecate the bare `agent` field, update `how-squads-work.md` (the unit-of-capability section) to lead with the workflow.

## 8. Open questions / risks

- **Ephemeral cold-start cost & latency** — spawning a scoped sub-agent per dispatch vs a warm standing agent. Measure in Phase 0/4.
- **Where exactly state lives** — board `needs_input` for queues is clean; multi-week learned judgment (maturity, A/B history) is awkward without an agent. May force a per-domain "domain memory" wiki convention. Decide before Phase 5.
- **Judgment router load on the cofounder** — pushing all "which workflow?" decisions to the cofounder partially re-bloats it. Mitigation: keep the catalog compact; a standing agent is the pressure-release for genuinely fuzzy domains.
- **Backward-compat window** — how long the bare `agent` field stays accepted; the currently-deployed squads (incl. the live Preview pod) use it.
- **Tool-scoping reality** (Phase 0) — if OpenClaw can't literally scope tools per ephemeral run, "mute-to-user / least-tool" stays instructional, and the value is mostly *not growing* the agent count rather than literal isolation.

## 9. Relationship to what's deployed

The live Preview pod (`9fd5e50b…`) currently runs the **agent-based** model (5 squad agents injected). This RFC supersedes that model but is **additive**: ephemeral workflows and standing agents coexist, so migration is squad-by-squad with no flag day. paid-ads (Phase 4) is the first candidate.
