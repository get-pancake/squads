---
name: daily-digest
description: The procedure for compiling the last 24h of Google Ads activity into a 3-section digest and handing it to the co-founder via a pending task. Load on every `daily-digest` cron wake. The squad does NOT post to Slack or any external surface — delivery (channel, timing, voice/Slack/email) is the co-founder's call at the pod level.
---

# Daily digest

## When to use this

Every 18:00 PT, the `daily-digest` cron wakes the agent and points it here. Also load it if the co-founder dispatches "give me today's digest" out of band. Never load it on a regular sweep or heartbeat wake — those have their own procedures.

## The procedure

1. **Pull the day's record.** Read today's `memory/YYYY-MM-DD.md` and the entries appended by the day's optimization sweep. Collect: KPI vs target (current vs configured), every action shipped (with the one-line reason), every escalation task already opened for the co-founder (budget-raise asks, off-cycle recalibration recommendations), anything queued for tomorrow.

2. **Silent-default check.** If the last 24h produced **no actions, no KPI movement, and no open escalation**, reply with the single literal token `NO_REPLY` after logging the reason in today's `memory/YYYY-MM-DD.md`. Do not create a co-founder task for an empty day — that trains the co-founder (and the user) to ignore the digest.

3. **Compose the digest.** Three sections max, ~200 words total. Plain Markdown, no charts, no tables, no emojis. This text will be the body of the task you hand to the co-founder, so write it as something the co-founder can paste into Slack/voice/email with minimal editing.

   ```
   *State* — one line on the account's trajectory vs the KPI target (e.g.
   "CPA $42 vs target $45 — on track; ROAS 3.1 vs target 2.8 — beating").

   *Actions shipped today*
   • <action> — <one-line reason tied to KPI>
   • <action> — <one-line reason tied to KPI>
   • <action> — <one-line reason tied to KPI>

   *Open items*
   • <escalation awaiting co-founder, e.g. budget-raise ask with link to its task>
   • <biggest queued investigation for tomorrow>
   • <maturity-stage recalibration recommendation, if today's sweep flagged one>
   ```

4. **Hand off via `create_task`.** Create a task assigned to the co-founder:
   - **Title**: `Relay Google Ads digest — <YYYY-MM-DD>`.
   - **Body**: the 3-section digest text from step 3, verbatim.
   - **Brief**: "Review the digest below and relay it to the user via whichever channel is configured at the pod level. Nothing in here is time-critical — handle on your next wake."

   Do **not** pick a Slack channel. Do **not** call any external API. The squad's job ends at the task hand-off.

5. **Log the hand-off.** Append a `## Daily digest` heading to today's `memory/YYYY-MM-DD.md` with the new task ID and a one-line summary of what the digest covered. Future-you (and any future audit) needs the trail.

6. **Close the cron's task.** `complete_task` on the cron-dispatched task with a one-line outcome: "Digest compiled, handed off to co-founder as task #<id>."

## Notes

- Length budget is firm: ~200 words. If the day truly needs more, hand off the standard digest and `create_task` a second time for the co-founder with the longer-form narrative — don't let the digest task sprawl.
- The digest body is user-facing prose written for the eventual recipient. Write it for a busy operator, not for archival completeness — the daily log already has the full record.
- Budget-raise asks are **not** rolled into the digest body. Each one is its own co-founder task created at the moment the sweep surfaced it; the digest's "Open items" section just *references* those tasks by ID so the co-founder can connect them.
- Maturity-stage recalibration recommendations, if today's sweep flagged one (30+ days above the next threshold), belong in the "Open items" section as a one-liner with the threshold crossed.
