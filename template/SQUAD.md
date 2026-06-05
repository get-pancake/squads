---
tags: [example, growth]
preview_image: https://squads.getpancake.ai/avatars/astronaut.png
---

<!-- TODO: SQUAD.md is the marketplace catalog card. The marketplace ingest
     reads ONLY `tags` and the optional `preview_image` from the frontmatter
     above — every other package-level field lives in manifest.json. The body
     below renders as the squad's store detail page, and is where each agent
     must be described in user-facing prose (the catalog reads agent
     descriptions from this body, not from manifest.json). Strip every TODO
     before publishing. -->

## What this squad does

<!-- TODO: 2-3 sentences. What does installing this squad deploy, and what
     problem does it solve? Name each agent and the one job it owns —
     this is the prose the marketplace surfaces per agent. -->

Placeholder body — replace before publishing.

## What you'll need

<!-- TODO: bullet list — identities to connect, secrets to provide, accounts
     the user must already have. Mark optional items as optional. -->

- Placeholder requirement — replace before publishing.

## What you get

<!-- TODO: bullet list of the concrete, recurring outcomes the user receives. -->

- Placeholder outcome — replace before publishing.

## How it works

<!-- TODO: a short paragraph on the operating rhythm — which crons fire and
     when, and how the user interacts with the squad through the co-founder
     (the user never talks to a squad agent directly). All recurring wakes go
     through `crons/jobs.json` — per-agent `agent.json#/heartbeat` doesn't
     fire for squad sub-agents in OpenClaw today. -->

Placeholder operating rhythm — replace before publishing.
