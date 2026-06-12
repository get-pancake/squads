# Squad scorecard — rating a bundle against the quality bar

The validator and the eval runner tell you a bundle is *valid*. This scorecard tells you
how *good* it is. Use it to review an official squad before release, audit the existing
roster, or grade an external submission. Every criterion is drawn from the contract
([`bundle-reference.md`](./bundle-reference.md)), the authoring principles
([`creating-a-squad.md` §7](./creating-a-squad.md)), and the install-time invariants
([`how-squads-work.md`](./how-squads-work.md)).

## How to score

- Each criterion scores **0, 1, or 2**:
  - **2** — meets the bar, with evidence.
  - **1** — partial: present but thin, stale, or inconsistent.
  - **0** — missing or violates the principle.
- Fill the **Evidence** column with a file path or a quoted line — a score without
  evidence is a guess.
- Criteria marked **⛔** are invariants. Any ⛔ scored 0 caps the overall grade at **C**
  regardless of the total: a chatty squad that DMs the user is broken even if everything
  else is polished.
- Sections 3 (workflows) and 4 (agents) are scored **per workflow / per agent**, then
  averaged into the section subtotal. List each one — weak members hide inside good
  averages.

**Grade bands** (total as % of maximum):

| Grade | % | Meaning |
|---|---|---|
| **A** | ≥ 90 | Ship it; cite it as an example. |
| **B** | 75–89 | Solid; fix the 1s before the next version bump. |
| **C** | 50–74 | Works, but needs a quality pass before promotion. |
| **D** | < 50 | Re-read `creating-a-squad.md` §0 — the problem is likely scope, not polish. |

---

## Scorecard

```
Squad:            <name> v<version>
Rated by:         <who>            Date: <YYYY-MM-DD>
Validator:        ✔/✖ errors   ✔/✖ zero warnings
Eval suite:       ✔/✖ green    <N> traces / <M> workflows
Overall:          <points> / <max>  =  <%>  →  Grade <A–D>   ⛔ violations: <none | list>
```

### 1. Scope & naming (max 8)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1.1 | **Domain, not tool** ⛔ — the squad owns a persistent goal and is named for it; tools appear only as workflow namespaces (`analytics-squad` with `posthog.*`, never `posthog-squad`). | /2 | |
| 1.2 | **Smallest unit that fits** — nothing here should have been a workflow or agent added to an existing squad; no overlap with another squad's domain (run the §0.4 pre-flight). | /2 | |
| 1.3 | **Right number of agents** — split only on genuinely distinct lanes (cadence, skills, identity); when in doubt, one agent. | /2 | |
| 1.4 | **Naming conventions** — kebab-case squad name; job-shaped agent names (`triage-agent`, not `Atlas`); workflow ids `<namespace>.<verb_object>`. | /2 | |

### 2. Manifest & contract hygiene (max 10)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 2.1 | **Validator clean with zero warnings** ⛔ — `node scripts/validate.mjs squads/<name>` reports no errors *and* no warnings. | /2 | |
| 2.2 | **Secrets scoped to workflows** — every `required_vault_secrets` key is referenced by exactly the workflows that use it; no dead keys, no everything-on-every-workflow. | /2 | |
| 2.3 | **Tools scoped to workflows** — every `required_tool_permissions` key is referenced by the workflows that use it, or declared in `infra_tool_permissions` if it is genuinely an onboarding/heartbeat-time tool. No parked grants. | /2 | |
| 2.4 | **Honest registries** — no permission or secret "just in case"; the install grants the minimum surface the squad's published jobs need. | /2 | |
| 2.5 | **Versioning discipline** — semver bumped on every release; breaking the public interface (workflow ids, agent ids) is a major bump. | /2 | |

### 3. Workflows — the published interface (max 10, scored per workflow then averaged)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 3.1 | **Outcome-typed** — `outcome` names a verifiable done-state (artifact path, board record), not an activity ("digest filed to wiki/.../YYYY-MM-DD.md", not "runs the digest"). | /2 | |
| 3.2 | **Summary matches intent** — one line a cofounder can match a user request to without reading anything else; inputs typed and minimal. | /2 | |
| 3.3 | **Complete catalog** — every recurring job the squad performs is a published workflow; crons and heartbeat dispatch *through* the catalog, not around it. | /2 | |
| 3.4 | **Skill-backed** — each workflow id maps to a skill section the agent actually executes (by convention, a skill named after the workflow). | /2 | |
| 3.5 | **Minimal grants** — the workflow's `secrets`/`tools` are exactly what its skill uses — compare against the skill text, not the author's intent. | /2 | |

### 4. Agents (max 10, scored per agent then averaged)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 4.1 | **One lane** — a focused specialist; no agent doing two unrelated jobs. | /2 | |
| 4.2 | **Three files, three concerns** — wake procedure in `HEARTBEAT.md`, behaviour in `SOUL.md`, pointers in `MEMORY.md`; no wake steps buried in SOUL, no notebook in MEMORY. | /2 | |
| 4.3 | **Inviolable boundaries written down** ⛔ — `SOUL.md` bakes in mute-to-user / board-only / no out-of-band DMs under *Boundaries (Inviolable)*. | /2 | |
| 4.4 | **Heartbeat earns its cadence** — `agent.json` heartbeat matches the lane's real tempo; `HEARTBEAT.md` reconciles the board first; cron used only when clock time matters to someone outside the agent. | /2 | |
| 4.5 | **Skills are executable** — imperative, deterministic procedures with concrete tool calls; no placeholder text, no "use your judgment" hand-waving where a rubric belongs. | /2 | |

### 5. Autonomy & board discipline (max 10)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 5.1 | **Board is the bus** ⛔ — all output lands as board records (`complete_task`, `routine`/`digest` tickets, `needs_input` + comment); no `notify_channel` on cron-filed records; no channel ids anywhere in the bundle. | /2 | |
| 5.2 | **Default to autonomous** — reversible outcomes are self-certified; escalation reserved for out-of-scope, hard blockers, irreversible commitments, user-facing decisions. | /2 | |
| 5.3 | **Quiet crons** — every scheduled job replies `NO_REPLY` when nothing changed; no "nothing to report" noise. | /2 | |
| 5.4 | **Squad-only targeting** ⛔ — crons target only `manifest.agents`; never the co-founder or another squad's agent. | /2 | |
| 5.5 | **State lives in the task system** — no parallel to-do lists or kanban tables in markdown; daily memos carry context and decisions only. | /2 | |

### 6. Onboarding & catalog card (max 8)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 6.1 | **ONBOARD.md is a script** — numbered steps the cofounder can execute verbatim; reuses existing identities/connections before asking; honest `estimated_setup_minutes`. | /2 | |
| 6.2 | **Vault discipline** — secrets collected via `vault_request` against keys that actually exist; vault URLs shared exactly as returned, never composed; optional secrets clearly skippable. | /2 | |
| 6.3 | **First ticket dispatched** — onboarding ends by dispatching a real workflow ticket (with relay coordinates on that ticket only) so the user sees it work live. | /2 | |
| 6.4 | **SQUAD.md sells honestly** — what it does, what you'll need, what you get, how it works; matches the manifest (workflows, secrets, identities) with no drift. | /2 | |

### 7. Evals (max 6)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 7.1 | **Happy-path coverage** — at least one `*.trace.json` per published workflow replaying the canonical run. | /2 | |
| 7.2 | **Regression traces** — every production incident that surfaced in a workflow is committed as a negative trace (`expected: "FAIL"` + `expected_failures`). | /2 | |
| 7.3 | **Traces are current** — `node scripts/eval.mjs squads/<name>` is green; traces reference the current squad name, workflow ids, and version. | /2 | |

---

**Maximum: 62 points.** Subtotals: scope 8 · manifest 10 · workflows 10 · agents 10 ·
autonomy 10 · onboarding 8 · evals 6.

## Reviewing a roster

When grading every squad in `squads/`, keep one scorecard per squad and a one-line
summary table:

| Squad | Version | Score | Grade | ⛔ | Top fix |
|---|---|---|---|---|---|
| `eng-squad` | 2.0.0 | — | — | — | — |

File the per-squad scorecards wherever the review lives (a PR description, a wiki page,
a board ticket) — the repo intentionally does not store point-in-time review artifacts.
