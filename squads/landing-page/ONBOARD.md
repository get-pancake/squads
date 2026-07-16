---
required_tools:
  - vault_request
  - browser_identity_add
required_identities:
  - github.com
estimated_setup_minutes: 10
---

## Onboarding — landing-page squad

You are the co-founder running the install. The mechanical deploy is done (agent files written, crons registered, skills deployed). Run the steps below, then dispatch each agent's first task. The user was promised about 10 minutes — keep it tight.

**1 — Confirm the landing page repo.** Ask the user for the GitHub repo that hosts the landing page (default: `basalt-ai/pancake-landing`). Store it with `vault_request` at key `team.landing_repo`, label "Landing page GitHub repo". Also write it to `agents/conversion-optimizer/MEMORY.md` and `agents/design-system/MEMORY.md` under "## Repo" so agents have it without a vault read each run.

**2 — Connect GitHub identity.** Check whether a `github.com` identity already exists on this pod (`browser_profile_status`). If one exists, reuse it. If not, connect one with `browser_identity_add { site: "github.com" }` — this gives all three agents the ability to open PRs.

**3 — Collect analytics settings.** Ask the user which analytics tool they use or want to use: Google Analytics, Plausible, PostHog, or something else. Store the answer with `vault_request` at key `team.analytics_tool`. If they already have a Google Analytics Measurement ID, store it at `team.ga_measurement_id`. If they use Google Tag Manager, store the container ID at `team.gtm_container_id`. Write all non-sensitive answers to `agents/traffic-analyst/MEMORY.md` under "## Analytics setup".

**4 — Ask one conversion question.** Ask: "What's the single action you most want visitors to take on the landing page?" (e.g. sign up, book a call, download a resource). Write their answer to `agents/conversion-optimizer/MEMORY.md` under "## Primary conversion goal". This anchors all copy work.

**5 — Dispatch first tasks.** Create and dispatch one task per agent immediately — don't wait for the cron:

- **conversion-optimizer**: "Audit the current landing page at [repo URL]. Read the homepage copy end-to-end, identify the top 3 conversion weaknesses, and open a PR with one concrete copy improvement (headline or CTA). Report back with the PR link and your reasoning."
- **traffic-analyst**: "Read the analytics settings in your MEMORY.md. If analytics is not yet set up, produce a step-by-step setup guide for the user's chosen tool and a PR that adds the tracking snippet to the landing page. If already set up, pull last 7 days of traffic data and produce a brief source/conversion summary."
- **design-system**: "Audit the landing page repo for existing design tokens (CSS variables, Tailwind config, or equivalent). Document what exists in `wiki/Projects/LandingPage/DesignSystem.md`. If nothing exists, draft a minimal token set (colors, type scale, spacing) based on what you see in the codebase and open a PR proposing it."

Mark all three tasks `in_progress`. Tell the user the agents are already working and will report back within the day.
