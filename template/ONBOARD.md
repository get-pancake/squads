---
required_tools:
  - vault_request
  - browser_identity_add
required_identities:
  - github.com
estimated_setup_minutes: 5
---

<!-- TODO: ONBOARD.md is a SCRIPT the co-founder agent executes right after the
     mechanical deploy — it is instructions, not documentation. Write it in the
     imperative, addressed to the co-founder. Keep it short enough to finish
     within `estimated_setup_minutes`. Collect secrets only via `vault_request`,
     connect identities via `browser_identity_add`, and save answers to the
     agent's MEMORY.md. End by creating and dispatching a first task. Strip
     every TODO before publishing. -->

## Onboarding — example-agent

You are the co-founder running the install skill. The mechanical deploy is done
(agent files written, crons registered, skills deployed). Run the short
onboarding conversation below, then dispatch the first task. The user was
promised about 5 minutes — keep it tight.

**1 — Collect the required settings.** For each `required_vault_secret` in the
manifest, ask the user for the value and store it with `vault_request` at its
manifest key (e.g. `team.example_setting`). Never echo a secret back to Slack.
If the value is not actually sensitive, also record it in example-agent's
`MEMORY.md` so the agent has it without a vault read on every run.

<!-- TODO: replace the line above with one explicit step per required_vault_secret. -->

**2 — Connect an identity (optional).** Ask whether the user wants TODO. If yes,
connect a `github.com` identity with `browser_identity_add` — but first check
whether a matching identity already exists on this pod and reuse it. If the
squad needs no identity, delete this step.

**3 — Ask one setup question.** Ask the user TODO, and write their answer to
example-agent's `MEMORY.md` under a clear heading. Adapt the agent's behaviour
to the answer; don't push for more than you need.

When the above is done, confirm the cron is registered. Then create
example-agent's first task — TODO: describe the first task — and dispatch it
immediately: `sessions_spawn` example-agent on the task, then mark it
`in_progress`. Don't leave it waiting for the cron; the user is here now. Close
by telling the user the agent is already working and will report back shortly.

<!-- TODO: to defer the first task to the agent's next cron wake instead of
     running it now, tag the step `dispatch: later`. -->
