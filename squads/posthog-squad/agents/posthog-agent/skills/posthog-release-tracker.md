---
name: posthog-release-tracker
description: PostHog-agent's procedure for tying product releases to metric movement. Polls a configured GitHub repo on every 2h heartbeat pulse, snapshots DAU / WAU / north-star metrics at T+0, T+24h, T+7d after each new release, and files a release-impact report. Load on every heartbeat pulse.
---

# PostHog release tracker — PostHog-agent

This skill connects what shipped to what moved. The agent watches one configured GitHub repo for new release tags; each new release becomes three queued metric snapshots (immediate, 24h later, 7 days later) and a written report.

## 0 — Pre-flight

1. Read `MEMORY.md`:
   - `RELEASE_REPO` = `team.posthog_release_repo` (e.g. `acme/web-app`). If blank, **stop**: release tracking is disabled on this tenant. Exit silently — do not log noise, do not surface anything.
   - `LAST_SEEN_RELEASE` = the latest release tag the agent has already processed, from `MEMORY → Release tracking → Last seen tag`. May be empty on first run.
   - `PENDING_SNAPSHOTS` = the queued snapshot list from `MEMORY → Pending release snapshots`. Each entry: `{ tag, kind: T+24h | T+7d, due_at: ISO8601 }`.
2. Confirm `PROBE_COMPLETE` is set in `MEMORY → PostHog shape`. If not, run `posthog-discovery §0.5` first — the release tracker's metric snapshots use the same shape (DISPLAY_HANDLE_PATH etc).

## 1 — Poll for new releases

```sh
gh api -X GET "repos/{RELEASE_REPO}/releases" --jq '[.[] | {tag: .tag_name, published: .published_at, name: .name, prerelease}] | .[0:10]'
```

Compare returned tags against `LAST_SEEN_RELEASE`. New releases = every entry returned with `published > LAST_SEEN_RELEASE.published` (or every entry if `LAST_SEEN_RELEASE` is empty, capped at the most recent 3 to avoid backfill spam on first run).

Skip releases tagged `prerelease: true` by default. The cofounder can opt in to prereleases later by setting a flag in MEMORY; for now, stable releases only.

For each new release, do steps 2 and 3.

## 2 — T+0 snapshot

The moment a new release is observed, capture the current state of the metrics that matter. This is the baseline every later snapshot is compared against.

```sql
-- Snapshot at T+0 for release {tag}
SELECT
  (SELECT count(DISTINCT person_id) FROM events WHERE timestamp >= now() - INTERVAL 1 DAY) AS dau,
  (SELECT count(DISTINCT person_id) FROM events WHERE timestamp >= now() - INTERVAL 7 DAY) AS wau,
  -- one row per north-star event:
  (SELECT count() FROM events WHERE event = '{ns_event}' AND timestamp >= now() - INTERVAL 7 DAY) AS ns_{ns_event}_7d,
  -- activation rate of the trailing 14-day cohort:
  (...) AS activation_rate_14d
```

Write the snapshot to `MEMORY → Release tracking → Snapshots → {tag}.T+0`. Also seed two pending snapshots in `MEMORY → Pending release snapshots`:

- `{ tag: <tag>, kind: "T+24h", due_at: <release.published + 24h> }`
- `{ tag: <tag>, kind: "T+7d",  due_at: <release.published + 7d> }`

Update `MEMORY → Release tracking → Last seen tag` to the most recent processed tag and its `published_at`.

## 3 — Due snapshots

Process every pending snapshot whose `due_at <= now()`. For each:

1. Re-run the same snapshot query from step 2.
2. Compute deltas against the corresponding `T+0` snapshot for that tag.
3. Append to the per-release report at `wiki/Knowledge/PostHog/Releases/YYYY-MM-DD-{tag}.md`.
4. Remove the entry from `MEMORY → Pending release snapshots`.

If a pending snapshot is overdue by more than 50% of its window (e.g. a T+24h snapshot that didn't run until T+36h because the heartbeat was busy), tag the report with `late: true` and note the actual elapsed time — late snapshots are still useful, just less precise.

## 4 — File the per-release report

Path: `wiki/Knowledge/PostHog/Releases/YYYY-MM-DD-{tag}.md`. Append-only: each snapshot adds a section, the file is never overwritten.

Skeleton:

```
# Release {tag} — published {published_at}

**Source:** {RELEASE_REPO}
**Release notes:** {release.name or first line of body, truncated to 200 chars}
**GitHub URL:** https://github.com/{RELEASE_REPO}/releases/tag/{tag}

## T+0 snapshot — {snapshot_time}
| Metric | Value |
…

## T+24h snapshot — {snapshot_time}
| Metric | T+0 | T+24h | Δ |
…

## T+7d snapshot — {snapshot_time}
| Metric | T+0 | T+7d | Δ | Δ% |
…

## Read
{One paragraph on what moved and what didn't. If nothing material moved, say so in one line — most releases don't move metrics in 24h.}

## HogQL
{Every query used, verbatim.}
```

## 5 — Surface (only when worth it)

Most releases don't move metrics noticeably in 24h. **Default behavior is silent**: file the report, don't DM the cofounder. The cofounder reads release reports asynchronously when they want to know "did the v1.4 push move anything".

DM the cofounder *only* when a T+24h or T+7d snapshot shows:

- Activation rate changed by ≥ 1pp absolute (in either direction), OR
- A north-star event volume changed by ≥ 25% AND prior week's volume was > 100 events, OR
- DAU dropped > 20% (any release that loses 1-in-5 daily actives within 24h is worth flagging immediately).

The DM template is two lines:

```
Release {tag} (shipped {hours_ago}h ago) moved {metric}: {before} → {after} ({Δ}).
Full report: wiki/Knowledge/PostHog/Releases/YYYY-MM-DD-{tag}.md
```

No emojis. No "🚀". Numbers + one line + a link.

## 6 — Failure modes

- **`gh api` 404** → repo doesn't exist or the token can't see it. Surface to cofounder once, then exit. Don't retry on every pulse.
- **`gh api` 403 rate-limited** → the `github` tool permission is fine but we hit the API limit. Skip this pulse, the next one will catch up.
- **Release has no published_at** (draft) → skip silently.
- **Release notes contain `[skip-tracker]` anywhere** → skip silently. Lets the user opt out of tracking specific releases (e.g. infra-only bumps that have no product impact).
- **More than 5 new releases in one pulse** → cap at the most recent 5 to avoid a snapshot stampede. Log the skipped tags to `memory/YYYY-MM-DD.md` and process the remainder on the next pulse.
