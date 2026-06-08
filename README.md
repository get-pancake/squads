# squads

**Agent Squads for Pancake** — installable bundles that deploy one or more proactive
sub-agents into a Pancake pod in a single command.

This repo is the home of Pancake's official squads, the source the Pancake marketplace
seeds its catalog from, and the canonical public reference for anyone building their own
squad.

## What's in here

- **`squads/`** — the official squads (one directory per squad bundle).
- **`template/`** — a complete, valid skeleton bundle to copy from.
- **`docs/`** — the full contract and authoring guides.
- **`scripts/validate.mjs`** — a zero-dependency validator that mirrors marketplace ingestion.
- **`scripts/test-validator.mjs`** — self-tests for the validator: builds known-bad bundles in a temp dir and asserts each is rejected with the expected error. CI runs it alongside the validator so a weakened check turns red.
- **`manifest.schema.json`** + **`agent.schema.json`** — JSON Schemas for editor validation of `manifest.json` and per-agent `agent.json`.
- **`.claude/skills/`** — Claude Code skills to author and validate squads.

## Official squads

Each squad publishes a catalog of outcome-typed **workflows** and reports only through the
company task board — the co-founder delegates by matching intent to a workflow, and relays.

| Squad | What it does | Agents | Workflows |
|---|---|---|---|
| [`ai-seo-squad`](./squads/ai-seo-squad/) | AI-SEO / GEO — daily citation audits, blog posts, and GEO engineering PRs (self-merging). | `geo-agent` | `seo.audit_citations`, `seo.write_article`, `seo.ship_technical_fix`, `seo.weekly_report` |
| [`community-squad`](./squads/community-squad/) | Community presence — Reddit channel: monitors subreddits, drafts value comments, runs a multi-account karma strategy. | `reddit-agent` | `reddit.scan_and_draft`, `reddit.monitor_keywords`, `reddit.account_health`, `reddit.post` |
| [`outreach-squad`](./squads/outreach-squad/) | Daily outbound — finds leads, runs sequences, handles replies, files a digest on the board. | `outreach-agent` | `outreach.run_campaign`, `outreach.find_leads`, `outreach.triage_replies`, `outreach.weekly_report` |
| [`paid-ads-squad`](./squads/paid-ads-squad/) | Paid advertising — Google Ads + Meta Ads operators, each running one account end to end; holds spend flat, surfaces budget raises on the board. | `google-ads-agent`, `meta-ads-agent` | `google.optimize_account`, `google.daily_digest`, `google.root_cause`, `google.scale_budget`, `meta.daily_operations`, `meta.daily_digest`, `meta.weekly_review`, `meta.investigate` |
| [`github-triage-squad`](./squads/github-triage-squad/) | GitHub issue triage — classifies issues P0–P3, labels them, sweeps daily, reports weekly. | `triage-agent` | `github.triage_issue`, `github.sweep_open_issues`, `github.weekly_report` |

## How squads work

An Agent Squad installs proactive specialist sub-agents — their identity, skills, crons,
and seed memory — under a pod's main co-founder agent, with no manual file editing. Start
with [`docs/how-squads-work.md`](./docs/how-squads-work.md) for the concepts and the
install lifecycle.

## Build your own

Read [`docs/creating-a-squad.md`](./docs/creating-a-squad.md), then either:

- **In Claude Code:** run the [`create-squad`](./.claude/skills/create-squad/SKILL.md) skill
  — it interviews you, scaffolds the bundle, and validates it.
- **By hand:** copy [`template/`](./template/) and fill it in.

The exact file contract is in [`docs/bundle-reference.md`](./docs/bundle-reference.md).

## Validate

```sh
node scripts/validate.mjs                      # every squads/* bundle and template/
node scripts/validate.mjs squads/<bundle-name> # one bundle
```

Zero dependencies — just Node. It mirrors marketplace ingestion exactly, so a bundle that
passes here passes ingestion. CI runs it on every push and pull request, alongside
`node scripts/test-validator.mjs` which self-tests the validator against negative
fixtures (forbidden files, wrong heartbeat shape, etc.) — both must pass for a merge.

## Publish

See [`docs/publishing.md`](./docs/publishing.md).

- **Official squads** (Pancake team) are added to this repo as a `squads/<name>/` directory.
- **Third-party squads** are **self-hosted**: external authors keep their bundle in their
  own public GitHub repo and submit the URL to the marketplace. This repo is Pancake-curated
  and not open to outside squad PRs — it is an example to copy, not a place to contribute.

## Repo layout

```
squads/                          ← this repo
├── README.md
├── LICENSE                       MIT
├── CLAUDE.md                     orientation for Claude Code sessions
├── CONTRIBUTING.md               curation policy
├── manifest.schema.json          JSON Schema for manifest.json
├── agent.schema.json             JSON Schema for agents/<id>/agent.json
├── .github/                      CI validator workflow + PR template
├── .claude/skills/               create-squad, validate-squad
├── docs/                         how-squads-work, bundle-reference, creating-a-squad, publishing
├── scripts/validate.mjs          zero-dependency validator
├── template/                     a complete, valid skeleton bundle
└── squads/                       official squad bundles, one directory each
```

## License

[MIT](./LICENSE) — Copyright (c) 2026 Basalt AI.
