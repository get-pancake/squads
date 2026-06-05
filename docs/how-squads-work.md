# How Agent Squads work

This is the conceptual map. Read it before [`bundle-reference.md`](./bundle-reference.md)
(the exact file contract) and [`creating-a-squad.md`](./creating-a-squad.md) (the
step-by-step build).

## What an Agent Squad is

An **Agent Squad** is an installable bundle that, in one command from a Pancake user,
deploys one or more **proactive sub-agents** into a Pancake pod — their identity,
personality, skills, crons, and seed memory — with no manual file editing.

A Pancake pod has one main **co-founder** agent. A squad adds specialists *under* it. The
user asks the co-founder (in Slack) to install a squad; the co-founder does the rest.

## What a squad agent is at runtime

Each agent in a squad becomes a **real, persistent OpenClaw sub-agent** — not a prompt, not
a transient task. Once installed it has:

- its **own workspace** at `workspace/agents/<agent-id>/`;
- an **`IDENTITY.md`** (who it is — name, role, scope) and a **`SOUL.md`** (how it behaves
  — personality, principles, boundaries), deployed verbatim from the bundle;
- its **own isolated skill collection** at `workspace/agents/<agent-id>/skills/`;
- **cron-driven recurring wakes** — every recurring schedule the squad needs (a daily
  duty, a Monday digest, a 2-hour self-driven pulse) is a job in `crons/jobs.json` whose
  `payload.text` is the wake procedure the agent runs. (OpenClaw's per-agent
  `agents.list[].heartbeat` does not fire for squad sub-agents today, so the heartbeat
  pattern is implemented as a `0 */2 * * *`-style cron pointing at the agent.) Outside of
  these crons, the agent also wakes on dispatched tasks from the co-founder;
- a **reporting line**: it reports to the co-founder. The user never talks to a squad agent
  directly — the co-founder dispatches work to it and relays results.

A squad agent is a focused contributor: one role, clear edges. Work outside its lane it
routes back to the co-founder rather than handling itself.

## The two halves of the system

A squad travels through two separate pieces of infrastructure:

1. **The marketplace** — a public registry and the **verification boundary**. It ingests a
   bundle (from this repo's seed, or from a self-hosted third-party repo), validates the
   manifest, verifies every referenced file, rejects symlinks and path-traversal, archives
   a verified `.tar.gz`, and lists the squad in a catalog. Nothing reaches a pod without
   passing through here.

2. **The in-pod `squad-store` plugin** — the **installer**. Running inside a Pancake pod, it
   pulls a marketplace-verified bundle, re-validates it defensively, and performs the
   mechanical deploy: creating agents, wiring `openclaw.json`, deploying skills, merging
   crons, and seeding memory.

**This repo feeds the marketplace.** It is not the marketplace and it is not the installer
— it is the *source of bundles* the marketplace seeds its catalog from, plus the public
contract documentation.

## The install lifecycle

When a user asks the co-founder to install a squad, four things happen:

1. **Discovery + confirmation gate.** The co-founder looks the squad up (`squad_get`) and
   shows the user exactly what will happen — which agents will be created, which identities
   and secrets will be requested, which crons will be registered — and waits for an
   explicit yes. Nothing is deployed before consent.

2. **Mechanical deploy.** The `squad-store` plugin downloads the marketplace-verified
   `.tar.gz`, extracts it, re-validates the manifest, and for each agent: creates
   `workspace/agents/<id>/` (with `IDENTITY.md` + `SOUL.md` from the bundle), reads the
   per-agent `agents/<id>/agent.json` to add an `agents.list` entry to `openclaw.json`
   (model, skills, and the rest of the runtime config), deploys the agent's skills into
   its own skills folder, merges the bundle's crons (these crons carry the recurring wake
   procedures, since per-agent heartbeats don't fire for sub-agents), and seeds memory.
   The marketplace catalog also surfaces each agent's user-facing description from
   `SQUAD.md` body prose — `manifest.json` and `agent.json` are runtime config, not
   catalog copy.

3. **Onboarding.** The co-founder runs the bundle's [`ONBOARD.md`](./bundle-reference.md#onboardmd)
   **as a script** — not as documentation. `ONBOARD.md` tells the co-founder what to ask the
   user, which secrets to collect (via `vault_request`), which identities to connect (via
   `browser_identity_add`), where to save the answers (usually the agent's `MEMORY.md`), and
   what first task to create.

4. **First task.** The first task is created and dispatched immediately, so the squad starts
   working while the user is still there — rather than waiting for the agent's next cron
   wake. (A step can opt out with `dispatch: later` to defer to the next cron run.)

The key idea in step 3: **`ONBOARD.md` is a runnable script.** You are not writing docs for
a human to read — you are writing instructions for the co-founder agent to execute.

## Two invariants every author must respect

These are enforced at install time. A bundle that violates them fails — so the validator in
this repo checks them too.

- **Skill isolation.** A squad agent's skill allowlist is `["<agent-id>", "shared"]`. Squad
  agents do **not** inherit the main co-founder's skills (`cofounder`, `system`, or the
  managed `~/.openclaw/skills/` tier). A squad-wide skill is **copied into every agent** of
  the squad — not shared by reference. Each agent gets its own copy under
  `workspace/agents/<id>/skills/`.

- **Squad-only targeting.** A squad's crons may target **only the agents that the squad
  itself declares** in `manifest.agents`. A cron cannot target the co-founder or
  another squad's agent.

## Where this repo sits

There are two ways a squad reaches the marketplace, and this repo is the model for both:

- **Official squads** (built by the Pancake team) live in this repo under `squads/<name>/`.
  The marketplace seeds its catalog from this repo's inner `squads/` directory. To add an
  official squad: add a `squads/<name>/` directory here and open a PR.

- **Third-party squads** (built by external authors) are **self-hosted**: the author keeps
  the bundle in *their own* public GitHub repo and submits the repo URL to the marketplace.
  This repo is **not** open to outside PRs — it is an example to copy, not a place to
  contribute. See [`publishing.md`](./publishing.md).

The file contract is **identical** either way. The only difference is packaging: in this
repo a bundle is a `squads/<name>/` subdirectory; in a self-hosted repo the bundle *is the
repo root*. Everything in [`bundle-reference.md`](./bundle-reference.md) applies to both.
