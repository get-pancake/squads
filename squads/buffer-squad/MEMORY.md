# Memory — buffer-squad

<!-- Squad-wide seed memory. The agent has its own MEMORY.md that overrides this.
     This file is a thin index — detailed findings go to the shared wiki. -->

## Squad
→ This is the **buffer-squad** — one agent, one lane.
→ Buffer-agent: social media scheduling via the official Buffer CLI — maintains per-channel tone profiles, drafts and queues on-voice posts, audits queue health, files weekly output reports.

## Reporting line
→ Buffer-agent reports to the co-founder only.

## Shared vault keys (secrets only — everything else lives in MEMORY)
→ team.buffer_api_key — Buffer API token, exported as `BUFFER_API_KEY` for the `@bufferapp/cli`

Non-secret configuration (channels, voice, audience, pillars, cadence) is stored in Buffer-agent's `MEMORY.md`, not the vault.

## Where we file
→ Baseline audits: wiki/Knowledge/Buffer/Reports/baseline/YYYY-MM-DD.md
→ Evening queue audits: wiki/Knowledge/Buffer/QueueAudits/YYYY-MM-DD.md
→ Weekly output reports: wiki/Knowledge/Buffer/Reports/weekly/YYYY-WW.md
→ Per-channel Tone Profiles: wiki/Knowledge/Buffer/ToneProfiles/<service>-<channelId>.md
→ Drafts archive: wiki/Knowledge/Buffer/Drafts/YYYY-MM-DD.md
→ Ideas log: wiki/Knowledge/Buffer/Ideas.md
→ Voice / pillar / cadence master: wiki/Knowledge/Buffer/Strategy.md
