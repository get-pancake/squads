---
name: buffer-ideas-capture
description: Procedure to capture content ideas into Buffer's Create space via `buffer ideas create`, tagged to the right pillar where the CLI supports it. Use from the weekly audit, from research, or when the co-founder hands off a "save this for later" line.
---

# Buffer ideas capture — Buffer-agent

Buffer Ideas is the inbox for things worth posting later. Use it ruthlessly. An idea that lives in `memory/YYYY-MM-DD.md` rots; an idea in Buffer Ideas surfaces on the next drafting pass.

## When to capture

- The weekly audit surfaces an angle worth a deliberate post next week — capture it.
- Research (`web_search` / `web_fetch`) turns up a tweet / post / article worth riffing on — capture the angle.
- The co-founder forwards a thought ("we should post about X someday") — capture before doing anything else.
- The daily log surfaces a recurring theme — capture the distillation.

## When NOT to capture

- Half-finished posts. If it's nearly a draft, finish it via `buffer-post-drafter` and queue it. Buffer Ideas is for angles, not drafts.
- Reactions to current events that are time-sensitive (it'll be stale by the time you draft).
- Anything outside the agreed voice / audience / pillars. If it doesn't fit, it's not an idea for this account.

## Procedure

1. **Distill** to a single line — 1 to 2 sentences max. Include the angle and the channel(s) it suits if obvious.

2. **Pick the pillar tag.** From `MEMORY → Pillars`, choose the pillar this idea belongs to. Capture its `tagId`.

3. **Capture via the CLI:**

```sh
buffer ideas create --text "<distilled idea>" --tag-ids <pillar-tagId>
```

If `buffer schema` shows the ideas command doesn't accept `--tag-ids`, drop the flag and include the pillar name as a `[pillar: <name>]` prefix in the text so the user (or a future agent pass) can re-tag in the dashboard. For multi-line / complex ideas, use `--json`:

```sh
buffer ideas create --json '{
  "organizationId": "<from MEMORY>",
  "text": "<distilled idea>",
  "tagIds": ["<pillar tagId>"],
  "source": "buffer-squad/buffer-ideas-capture"
}'
```

(Verify the exact JSON shape against `buffer schema` once; update this skill if the live CLI uses different field names.)

4. **Verify** the returned idea id. Append to `wiki/Knowledge/Buffer/Ideas.md`:

```md
## <YYYY-MM-DD> — <pillar>
- **Idea id**: <id>
- **Pillar**: <name> (tagId: <id>)
- **Text**:
  > <distilled idea>
- **Source**: <weekly-audit / co-founder hand-off / research url / daily log>
```

The wiki log is a local audit trail in case Buffer's UI hides the idea later.

5. **Batch?** Yes — but one `buffer ideas create` call per idea. Do not concatenate multiple angles into one Idea; one angle, one Idea, one pillar.

## Format guidance

Good Idea texts read like a brief, not a draft:

- ✅ "LinkedIn long-form: 5 things we got wrong in our first 30 days, framed as lessons for other founders. Hook with the most embarrassing one." → pillar: Founder lessons.
- ✅ "X thread: how we built the queue audit, one tweet per design decision." → pillar: Engineering deep-dives.
- ❌ "Here are five things we learned: 1. ... 2. ..." → that's a draft. Queue it, don't Idea it.
- ❌ "Be more authentic on Instagram" → not an idea, a vague hope.

## What to tell the co-founder

When capturing in volume (e.g. at end of weekly audit):

> "Captured <N> ideas into Buffer's Create space, tagged by pillar: <pillar A>: <n>, <pillar B>: <n>, ... Full log: wiki/Knowledge/Buffer/Ideas.md. Each becomes a draft on demand."
