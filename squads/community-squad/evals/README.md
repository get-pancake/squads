# Squad workflow evals — replay tier

Replay-eval traces for `community-squad`. Mirrors the layout every official squad adopts; see `/Users/Shared/squads/lib/eval-runner.mjs` for the shared runner.

```
evals/
└── replay/
    └── <workflow-id>/
        ├── happy-path.trace.json
        ├── regression-<short-description>.trace.json
        └── …
```

## Why this tier

`outcome_schema` validation, the marketplace ingestion schema, and `scripts/validate.mjs` cover the static contract — what the bundle *declares*. Replay traces cover what a workflow run actually *does*: the qualified id the cofounder stamps, the tool calls reddit-agent makes, the terminal it closes with, the digest it writes. They are the deterministic tier between schema validation and live-LLM e2e.

Use them to catch:

- The cofounder stamping a hallucinated workflow id (anything other than `community-squad.reddit.<workflow>`).
- A workflow drift that lets reddit-agent call tools outside its granted surface — e.g. `reddit.monitor_keywords` is `web_search`-only and must never open the browser.
- A vault read against a key the workflow doesn't declare (each workflow scopes its own secrets: `team.reddit_account`, `team.reddit_target_subreddits`, `team.target_keywords`).
- reddit-agent closing a terminal without a `digest` (the wasted-spend failure mode).
- Inputs at dispatch that don't match the workflow's declared inputs.

## Run

```sh
node /Users/Shared/squads/scripts/eval.mjs                            # every bundle
node /Users/Shared/squads/scripts/eval.mjs squads/community-squad     # this bundle
node /Users/Shared/squads/scripts/eval.mjs path/to/case.trace.json    # one trace
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
| `dispatch.assigned_to` | Must equal the workflow's owning agent (always `reddit-agent` here). |
| `events[]` | Ordered tool calls. Each has `{kind: "tool", name, args}`. Vault reads, terminal `complete_task`/`fail_task` are checked structurally. |
| `terminal` | Which of `complete_task` / `fail_task` closes the run. |
| `assertions.tools_must_include` | Tools that *must* appear (positive coverage). |
| `assertions.tools_must_exclude` | Tools that *must not* appear (red flags). |

Squad-specific invariants the happy paths encode:

- All authenticated Reddit work goes through the **browser on old.reddit.com** (login via `team.reddit_account`) — never the Reddit API.
- `reddit.monitor_keywords` uses **`web_search` only** (`site:reddit.com` queries); the browser is asserted absent.
- `reddit.post` runs **only after co-founder sign-off** — its happy path starts from approved `draft_ids` and files permalinks back on the ticket.
- Every terminal from reddit-agent carries a non-empty `digest` (HEARTBEAT contract).

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
