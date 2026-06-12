# Squad workflow evals — replay tier

Replay-eval traces for `product-squad`. Mirrors the layout every official squad adopts; see `lib/eval-runner.mjs` for the shared runner.

```
evals/
└── replay/
    └── <workflow-id>/
        ├── happy-path.trace.json
        ├── regression-<short-description>.trace.json
        └── …
```

## Why this tier

`scripts/validate.mjs` and the marketplace ingestion schema cover the static contract — what the bundle *declares*. Replay traces cover what a workflow run actually *does*: the qualified id the cofounder stamps, the tool calls the squad agent makes, the terminal it closes with, the digest it writes. They are the deterministic tier between schema validation and live-LLM e2e.

Use them to catch:

- The cofounder stamping a hallucinated workflow id (anything other than `product-squad.product.<verb>`).
- A workflow drift that lets the assignee call tools outside its granted surface.
- A vault read against a key the manifest doesn't declare (only `team.notion` is declared here).
- A squad agent closing a terminal without a `digest` (the wasted-spend failure mode).
- Inputs at dispatch that don't match the workflow's declared inputs.

## Run

```sh
node scripts/eval.mjs                                  # every bundle
node scripts/eval.mjs squads/product-squad             # this bundle
node scripts/eval.mjs path/to/case.trace.json          # one trace
```

Exit 0 when every trace passes; 1 otherwise.

## Authoring a trace

A trace records one workflow run at the squad↔board contract level. JSON, versioned (`version: 1`). See the existing `*.trace.json` for the full shape; the load-bearing fields are:

| Field | Why it matters |
|---|---|
| `squad` / `workflow` / `case` | Identity + a human-readable case slug. |
| `description` | One paragraph the next reader needs. Past incidents go here. |
| `inputs` | Must be a subset of the workflow's declared `inputs`. |
| `dispatch.workflow` | The qualified stamp the cofounder used. Must equal `<squad>.<workflow>` — anything else is the hallucination failure mode. |
| `dispatch.assigned_to` | Must equal the workflow's owning agent. |
| `events[]` | Ordered tool calls. Each has `{kind: "tool", name, args}`. Vault reads, terminal `complete_task`/`fail_task` are checked structurally. |
| `terminal` | Which of `complete_task` / `fail_task` closes the run. |
| `assertions.tools_must_include` | Tools that *must* appear (positive coverage). |
| `assertions.tools_must_exclude` | Tools that *must not* appear (red flags). |

## Negative traces — living regression markers

When a production bug surfaces in one of this squad's workflows, commit a negative trace alongside the fix: set `expected: "FAIL"` plus the exact `expected_failures: [...]` the contract check trips on. The runner inverts — exactly those checks must fail, and if a future refactor silently un-catches the bug, the suite goes red. Each negative case is the durable institutional memory of one incident; don't delete them.

## What this tier does NOT catch

- LLM behavioural regressions (Tier 3 sandbox e2e + judge).
- External-service contract drift (Tier 3 cassettes / recorded HTTP).
- In-tree plugin behaviour changes (Tier 2.5: drive the real tasks plugin in-process).

For those, the trace format is the same — the runner upgrades.
