# RFC: Squads-as-Workflows on a Company Task Board

**Status:** Draft
**Author:** Théophile Cousin
**Scope:** `apps/pancake-claw` (cofounder, `plugins/tasks`, `plugins/squad-store`) + `/Users/Shared/squads` (bundle schema)

---

## 1. Problem

The cofounder is a single agent that is **both the router and the executor**. It holds the
user conversation, understands intent, *and* carries ~55–60 tools to do the work itself. Two
symptoms follow from that one root cause:

1. **Context overflow / tool confusion.** Every new capability is another tool on the
   cofounder. The tool list grows without bound, schemas crowd the context window, and the
   agent gets confused about which tool serves the user's intent.
2. **Under-delegation.** Squads are meant to be the autonomous parts of the tenant's company,
   but the cofounder has no incentive to hand off — every tool is already in its own belt.

## 2. The reframing

> Demote the cofounder to a **conductor**. Move the tools out to the **squads**. Make the
> **task board the bus** between them.

Once a squad owns the SEO tools, the cofounder *can't* do SEO itself — it must delegate, and
its tool surface shrinks at the same time. The two symptoms fall to the same change. New
capability is added by **installing a squad, never by adding a tool to the cofounder** — that
is what structurally caps the cofounder's context.

## 3. Primitives

| Primitive | Lifecycle | Owns |
|---|---|---|
| **Cofounder** | persistent, conversational | conversation, intent, memory, routing, reporting. One voice to the user. Does not execute domain work. |
| **Squad** | persistent, autonomous (heartbeat + crons) | a *domain*, ongoing. Publishes outcome-typed **workflows**. Mute to the user. |
| **Workflow** | a declared, catalogued, outcome-typed **entrypoint** the squad runs via its own skills | one *input → outcome* |
| **Ticket** | the bus | a workflow-contract *instance*; the only squad↔cofounder channel; durable, observable, auditable |

A squad both *owns a domain* (persistent, with its own crons) **and** *publishes a catalog of
workflows* as its public interface. The cofounder calls the catalog (a compact menu), never the
squad's internal tools — encapsulation like a microservice API.

## 4. Key decisions (locked)

- **Squads stay persistent and publish workflows.** Not replaced by ephemeral jobs — layered.
- **Squads manage their own crons.** Each cron compounds company autonomy. Crons route their
  results **through the board** as tickets, not silent work.
- **Self-certification.** A squad self-certifies an outcome to `done`. If the user says it's
  wrong, the cofounder **reopens** the ticket back to the same squad.
- **No gating anywhere.** The credit-aware creation gate and destructive-action gate are
  removed. No user approval for cron creation or any action. *Accepted tradeoff:* irreversible
  external actions (Reddit posts, ad-budget changes, outreach DMs) ship unsupervised; the
  board's audit trail (ticket + event log) is the after-the-fact safety net, and reopen is the
  correction path.
- **Everything delegated is fully async.** The cofounder keeps conversational intents: one-shot,
  conversational, sub-~2-minute work is handled inline to stay in the flow; everything else is
  delegated via a ticket.
- **One company-wide board.** A single board per tenant (the existing pod-wide `tasks.db`),
  shared by the cofounder and all squads.

## 5. The board is (mostly) already the bus

The `tasks` plugin is already a SQLite board with assignment, a status machine, an append-only
event log, parent/child links, and wake-on-assign. We extend it; we do not rebuild it.

| Capability | Status | Where |
|---|---|---|
| Task board: assignment, states, events, parent/child | **exists** | `plugins/tasks` → `~/.tasks/tasks.db` |
| Wake-on-assign (push) | **exists** | `notify_session_key`/`notify_channel` → `dispatchInbound` |
| Squad bundles: agents, skills, crons, heartbeat | **exists** | `/Users/Shared/squads` + `plugins/squad-store` |
| Cron → agent wake | **exists** | `~/.openclaw/cron/jobs.json` (`agentTurn`/`systemEvent`) |
| Workflow catalog + contract | **new** | manifest schema + cofounder catalog file |
| Board comments (squad↔cofounder thread) | **new** | `plugins/tasks` |
| Heartbeat reconcile of assigned tickets (pull) | **new** | squad `HEARTBEAT.md` |
| Crons file results as tickets, not silent work | **new** | squad cron payloads + ticket `kind` |
| Slim cofounder / strip gates / one-voice | **new** | `TOOLS.md`, routing/delegation skills |

### Ticket = workflow-contract instance

```
ticket:
  brief:    "<freeform intent the cofounder wrote>"
  workflow: outreach.run_campaign     # optional structured handle into the squad's catalog
  inputs:   { icp, volume }
  assignee: outreach-squad            # the SQUAD, not an agent inside it
  kind:     task | routine | digest
  state:    todo → in_progress → (needs_input ↔ in_progress) → done | failed
  thread:   [ ...comments... ]        # the entire squad↔cofounder conversation
  outcome:  null                       # filled on completion
```

(In the `tasks` schema: `brief`+`workflow`+`inputs` live in `context`; `assignee` = `assigned_to`;
`thread` = `comment` events; `outcome` = `result`.)

### State machine

```
backlog(todo) → in_progress → done
                    ↓   ↑        ↓
              needs_input     reopened(todo)
```

The backward edges carry the value: **`needs_input`** lets a squad ask a clarifying question on
the ticket instead of guessing (the briefing-fidelity fix); **reopen** is "self-cert until the
user objects." Because there are no gates, there is no `in_review`/approval state — self-cert
goes straight to `done`.

### Reconcile loop (crash-safe, controller-style)

The board is the source of truth. **Push:** assignment wakes the squad immediately. **Pull:**
every squad heartbeat scans its open assigned tickets and reconciles. A ticket whose squad died
mid-run is re-claimed on the next pulse — same discipline as `pancake-controller` reconciling
CRs against cluster state.

## 6. One voice out

Squads are **mute to the user**: they write tickets and comments only, never message the user,
never DM the cofounder out of band. The cofounder reads the board and narrates to the user in
its own voice. This preserves the single-voice UX and keeps a full audit trail underneath.

Crons route through the board too: a daily-triage cron mints a `kind:'routine'`/`digest` ticket
rather than doing silent work, so autonomous activity shows up on the same board the user
watches. Noise control: `routine`/`digest` tickets are browsable but never interrupt the user;
only `task`/`needs_input`/`failed` surface. The cofounder's `daily-report` cron rolls the board
into one digest.

## 7. Implementation phases

### Phase 0 — Spike (do first)

**Is per-agent tool visibility real in OpenClaw?** Plugins load pod-wide and
`agents.list[].skills` allowlisting is unreliable. Determine empirically whether a squad's
domain tools can be hidden from the cofounder.

- **Literal scoping possible:** squad domain plugins are invisible to the cofounder.
- **Not possible (likely):** encapsulation is **instructional + catalog-based** — the
  cofounder's prompt simply doesn't describe domain tools and is told to delegate via the board;
  the real win is that the pod's plugin set **stops growing** (new capability = squad skills,
  which already isolate per-agent).

**Output:** literal vs. instructional encapsulation. Also confirm: a workflow is a lightweight
catalogued entrypoint the squad runs via its own skills — not a new runtime.

### Phase 1 — Board becomes the bus (`plugins/tasks`)

1. **Squad-level assignment.** `assigned_to` accepts a squad name; resolves to the squad's
   primary agent. The cofounder never addresses an agent inside a squad. Internal fan-out via
   `parent_task_id`.
2. **Comments.** Add `add_task_comment(caller_id, id, body)` + a `comment` `event_type`. This is
   the squad↔cofounder conversation channel; render via `list_events`.
3. **`needs_input` status.** Add to the status enum; set with a comment when blocked on intent;
   answering flips back to `in_progress` and wakes the squad.
4. **Ticket `kind`.** `kind: 'task' | 'routine' | 'digest'` (default `task`). Drives noise
   control.
5. **Reopen.** `update_task_status(id,'todo')` + comment, or a child task. No new mechanism.

*Migration:* additive columns with backfilled defaults. Existing calls keep working.

### Phase 2 — Squad reconcile loop (pull side)

- Standard opening step in every squad `HEARTBEAT.md`: `list_tasks(assigned_to=self, …)` → claim
  oldest → `in_progress` → run workflow → `complete_task`.
- Push (wake-on-assign) + pull (heartbeat) dual. Add to `/Users/Shared/squads/template` and
  `bundle-reference.md`.

### Phase 3 — Workflow catalog + contract

1. **Extend `manifest.json`** with `workflows[]`:
   ```json
   { "id": "outreach.run_campaign",
     "summary": "Find ICP-matched leads and run a sequenced outreach.",
     "inputs": { "icp": "string", "volume": "int" },
     "outcome": "N leads contacted, replies triaged, digest filed.",
     "agent": "outreach-agent" }
   ```
   Update `manifest.schema.json`, `scripts/validate.mjs`, `docs/bundle-reference.md`.
2. **Generate a compact catalog on install.** `squad_install`/uninstall writes
   `~/.openclaw/workspace/squads-catalog.md` — ~3 lines per workflow across all installed
   squads. The only thing the cofounder carries about squad internals.
3. **Delegation = a ticket, no new tool.** Cofounder calls `create_task({ assigned_to: squad,
   kind:'task', context: brief naming workflow id + inputs })`.

### Phase 4 — Slim the cofounder + "capabilities are squads" doctrine

1. Rewrite `routing` + `delegation` skills: default to delegating domain work to a squad via a
   ticket; handle inline only for one-shot/conversational/sub-~2-min work.
2. **Doctrine:** new capability ships as a squad, not a cofounder plugin. Write it into
   `CLAUDE.md` and squad authoring docs.
3. Trim `TOOLS.md`: keep comms, memory/wiki, vault, board (create/comment/list), delegate-by-
   ticket, `sessions_spawn` for ad-hoc. Move domain guidance out. If Phase 0 = literal scoping,
   also drop domain plugins from the cofounder.
4. **Strip the gates:** remove the credit-aware creation gate and destructive-action gate from
   `TOOLS.md`; retire the `pancake-danger-gate` path.

### Phase 5 — Crons through the board

1. Squad cron payload → "run workflow X; file the result as a `routine`/`digest` ticket."
2. Noise control: only `task`/`needs_input`/`failed` surface to the user; `daily-report` rolls
   up the rest.
3. Squad agents self-manage namespaced crons (`<squad>__<id>`) via a `cron` skill — no gate.

### Phase 6 — One voice out

- Enforce mute-to-user in every squad `SOUL.md`.
- Cofounder narrates from the board on `done`/`needs_input` wakes and the daily digest.

## 8. Pilot & sequencing

1. Phase 0 spike → encapsulation decision.
2. Phase 1+2 → bus live, no behavior change yet.
3. Phase 3 + convert **one squad** (`eng-squad` was the read-mostly pilot; the
   job-shaped `outreach-squad` / `paid-ads-squad` followed) to publish 3–5 workflows and run on
   tickets. Measure cofounder context drop.
4. Phases 4–6, then roll the remaining squads onto the contract, deleting cofounder surface as
   each migrates.

**Status (this repo):** all official squads now publish `workflows[]` and run board-as-bus —
`ai-seo-squad`, `outreach-squad`, `community-squad` (formerly `reddit-squad`), `paid-ads-squad`
(merged from `google-ads-squad` + `meta-ads-squad`), and the `eng-squad` pilot.

Existing squads keep working throughout — `workflows[]`, comments, `kind`, and the reconcile
step are all additive.

## 9. Open risks

- **Encapsulation reality** (Phase 0) — gates how much we prune vs. just stop growing.
- **Briefing fidelity** — the ticket `context` is the only intent transfer; lean on
  `needs_input` so squads ask instead of guessing.
- **Board flooding** — `kind` + digest rollup must land in the same milestone as squad crons, or
  daily noise buries real tickets.
- **Unsupervised external actions** — accepted consequence of no-gating; mitigated only by the
  audit trail and reopen.
