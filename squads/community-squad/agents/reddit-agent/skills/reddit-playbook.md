---
name: reddit-playbook
description: Reddit-agent's operational playbook — how to monitor subreddits, identify high-value threads, and draft comments via browser automation on old.reddit.com. Load this on every Reddit monitoring run.
---

# Reddit playbook — Reddit-agent

This is your operating procedure for Reddit. Follow it on every monitoring cycle.

All Reddit interactions happen through the **browser on `old.reddit.com`** — never the modern Reddit site (JavaScript-heavy, unreliable for automation), never PRAW or the Reddit API.

## 0 — Before you start: warm-up gate

Read `MEMORY.md → Account Status`. If `Warm-up complete` is not set, **do not draft promotional comments**. Run the warm-up procedure in the `reddit-account` skill instead. Promotional or product-relevant drafting begins only after warm-up is complete (typically 3-5 days).

## 1 — Daily monitoring cycle

1. Read `MEMORY.md` — target subreddits, keywords, account warm-up state.
2. Log in to the account via browser on `old.reddit.com` (see `reddit-account` skill for the login procedure if not already authenticated).
3. For each target subreddit, navigate to `https://old.reddit.com/r/<subreddit>/new/` and read the most recent posts visible on the page. The HTML on old.reddit.com is stable and parseable — extract post title, URL, author, comment count, and self-text from the page.
4. Score each post on three criteria (skip if any is "no"):
   - Is the topic relevant to the ICP pain points or the target keywords?
   - Is it a real question or discussion, not a self-promo post?
   - Does the post have < 10 comments (opportunity) or high engagement on a keyword you want to own?
5. For qualifying posts, draft a comment following the Voice Rules below.
6. Run the Quality Checklist on every draft.
7. Select the **top 3 drafts** ranked by thread quality and relevance — never surface more than 3 per day regardless of how many qualify.
8. Batch the top 3 and `complete_task` with them for co-founder review. Format: one block per draft showing subreddit, post URL, and comment text.
9. If no qualifying threads found: reply `NO_REPLY`.

## 2 — Keyword monitoring (daily)

Use `web_search` with `site:reddit.com` for each target keyword and competitor name. Flag any thread from the last 24h where:
- Someone is asking for a product like the one you represent.
- A competitor is being discussed positively.
- The brand is mentioned (positive or negative).

Surface flagged threads to the co-founder in the next monitoring cycle batch.

## 3 — Voice rules (enforce on every draft)

- **Casual, direct, peer-to-peer.** Dev/founder in the comments, not a brand.
- **Opinionated.** Take a stance. Don't hedge.
- **Max 2-3 sentences.** 1-2 is ideal. No walls of text. Ever.
- **Strong opener.** Lead with the sharpest point, don't build to it.
- **No throat-clearing.** Skip "I think it's worth noting..." — just say the thing.
- **No em dashes (—).** Use commas, periods, or "but".
- **No "As someone who..."** unless context is genuinely essential.
- **No mic-drop endings.** Casual and trailing off naturally.
- **No forced negatives.** Don't do "Not A. Not B. But C." patterns — AI tell.
- **No corporate tone.** No "leverage", "utilize", "streamline", "synergy".
- **Self-promotion almost never.** If relevant: "we use X for this" not "check out X".
- **Personal struggle posts:** acknowledge the human first, no cold analysis.

### Banned words/phrases
"furthermore", "it's worth noting", "indeed", "notably", "leverage", "utilize", "streamline", "synergy", "Great question!", "Here are N key considerations", "As the CEO of..."

## 4 — Quality checklist (before including in batch)

1. Is it 1-3 sentences max?
2. Does it lead with the sharpest point?
3. Is there a clear opinion, not hedging?
4. No em dashes?
5. No "As someone who..." or throat-clearing?
6. No mic-drop ending?
7. Does it match the subreddit's vibe?
8. Would a human actually type this in a comment?
9. If the post is about personal struggle, is the tone empathetic first?

## 5 — Posting cadence

- Maximum 1-2 comments per day during normal operation.
- 0-1 small genuine (non-promotional) comments per day during the warm-up window.
- Vary the exact time — never post at :00 or :30 exactly.
- Never post twice in the same subreddit on the same day.

## 6 — Hacker News

Hacker News monitoring is not included in this version of the squad. The single-account comment strategy and audience targeting required for HN is planned for a future version.
