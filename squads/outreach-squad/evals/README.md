# Squad workflow evals — replay tier

Replay-eval traces for `outreach-squad`. Mirrors the layout every official squad adopts; see `/Users/Shared/squads/lib/eval-runner.mjs` for the shared runner.

```
evals/
└── replay/
    └── <workflow-id>/
        ├── happy-path.trace.json
        ├── regression-<short-description>.trace.json
        └── …
```

## Why this tier

`outcome_schema` validation, the marketplace ingestion schema, and `scripts/validate.mjs` cover the static contract — what the bundle *declares*. Replay traces cover what a workflow run actually *does*: the qualified id the cofounder stamps, the tool calls the squad agent makes, the terminal it closes with, the digest it writes. They are the deterministic tier between schema validation and live-LLM e2e.

Use them to catch:

- The cofounder stamping a hallucinated workflow id (`<squad>.<verb>` instead of `<squad>.<workflow>` — the exact bug the posthog audit found on 2026-06-11).
- A workflow drift that lets the assignee call tools outside its granted surface — particularly load-bearing here, because `outreach.weekly_report` declares `tools: []` and must run on board tools alone, and the whole squad declares **no vault secrets**, so any `vault_get` in a trace is a contract violation.
- A squad agent closing a terminal without a `digest` (the wasted-spend failure mode).
- Inputs at dispatch that don't match the workflow's declared inputs.

## Run

```sh
node /Users/Shared/squads/scripts/eval.mjs                                  # every bundle
node /Users/Shared/squads/scripts/eval.mjs squads/outreach-squad            # this bundle
node /Users/Shared/squads/scripts/eval.mjs path/to/case.trace.json
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
| `dispatch.assigned_to` | Must equal the workflow's owning agent (`outreach-agent` for all four workflows here). |
| `events[]` | Ordered tool calls. Each has `{kind: "tool", name, args}`. Pipeline-ledger updates in `MEMORY.md` are file work, not tool calls — they don't appear as events. |
| `terminal` | Which of `complete_task` / `fail_task` closes the run. Exactly one terminal event, and it must be last — the daily digest routine ticket is *created* mid-trace but not completed in-trace, so it doesn't double the terminal. |
| `assertions.tools_must_include` | Tools that *must* appear (positive coverage). |
| `assertions.tools_must_exclude` | Tools that *must not* appear (red flags — `vault_get` is on every exclude list because this squad declares no secrets). |

## Negative traces — living regression markers

Recorded bugs are committed alongside the happy paths. Set `expected: "FAIL"` plus `expected_failures: [...]` listing the check names that *must* trip. The runner inverts:

- Exactly the predicted checks failed → trace passes.
- None failed, or different checks failed → the suite goes red — exactly the signal we want, because it means the contract check this trace guards has regressed.

Each negative case is the durable institutional memory of one production incident. Don't delete them — they earn their keep on the day someone refactors the validator and forgets the original failure mode.

## What this tier does NOT catch

- LLM behavioural regressions (Tier 3 sandbox e2e + judge).
- External-service contract drift (Tier 3 cassettes / recorded HTTP).
- In-tree plugin behaviour changes (Tier 2.5: drive the real tasks plugin in-process).

For those, the trace format is the same — the runner upgrades.
