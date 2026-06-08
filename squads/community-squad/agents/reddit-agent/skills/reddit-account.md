---
name: reddit-account
description: How to operate the single Reddit account via browser automation on old.reddit.com — login, warm-up procedure, and weekly health checks. Load this when logging in, warming up the account, or running health checks.
---

# Reddit account — Reddit-agent

This squad uses **one** dedicated Reddit account — either bought aged from REDAccs (~$1-3, comes with karma) or created fresh by the user at reddit.com/register (blank slate, no karma). Either works. The credentials live in vault at `team.reddit_account`. The Reddit API (PRAW) is **not** used here — Reddit's API access for new "script" apps is unreliable for posting from server IPs, and creating apps requires phone verification on most accounts. Everything happens through the browser on `old.reddit.com`, which is the stable, parseable, automation-friendly version of Reddit.

> **Why a single dedicated account (not personal).** A dedicated account is disposable: if Reddit bans it, you've lost nothing — at worst a few dollars and 2 minutes of setup, not your reputation. The user's personal account is never touched. Multi-account coordination is explicitly out of scope — it violates Reddit's User Agreement and Reddit's 2023+ detection makes it a fast path to bans.

## Login (every session that needs an authenticated action)

1. Load credentials from `vault_get` at `team.reddit_account` → `{"username": "...", "password": "..."}`.
2. Open the browser and navigate to `https://old.reddit.com/login`.
3. Fill `#user_login` with the username and `#passwd_login` with the password. Click the submit button.
4. Confirm login succeeded: after redirect, the page should show the username in the top-right (`.user a` element). If a CAPTCHA appears or login fails, `fail_task` with the reason — do not retry in a loop.
5. Reuse the same browser session for the rest of the wake when possible.

## Warm-up procedure (first 3-5 days after first login)

Reddit's anti-bot systems flag new account behavior that looks immediately promotional. The warm-up window builds normal-account history first.

On the first login ever:
- Record today's date in `MEMORY.md → Account Status → Warm-up start date`.
- Set `Warm-up complete` to **no**.

During the warm-up window (≈ 3-5 days), every daily cron run does this **instead** of promotional drafting:

1. **Browse and upvote.** Navigate to 2-3 target subreddits, scroll the front page (`/r/<subreddit>/`), and upvote 3-5 posts that genuinely deserve it. Vary which subreddits each day.
2. **Read threads.** Open 2-3 individual posts. Scroll. Open one comment thread. This generates normal account activity.
3. **Small comments (optional).** If a thread has a clearly answerable question that does **not** relate to the product, draft a short helpful reply (1-2 sentences, no product mention, no link). Surface it to the co-founder as a warm-up comment for sign-off. Max 1 warm-up comment per day.
4. **Log the warm-up day** to `wiki/Knowledge/Reddit/AccountHealth.md` and `memory/YYYY-MM-DD.md`.

End the warm-up window when **all** of the following are true:
- At least **3 days** have passed (aged account from REDAccs) **or at least 5 days** (fresh account created from scratch with no prior karma) since the warm-up start date.
- At least 2 small comments have been posted and accumulated ≥ 1 net karma each without removal.
- No CAPTCHA, rate limit, or shadowban signal has appeared during warm-up.

If the account is fresh and Reddit shows the new-account posting restriction (some subreddits block accounts with < N karma or < N days old), extend warm-up until the restriction lifts — comment in less restrictive subreddits in the meantime.

When warm-up ends, set `MEMORY.md → Account Status → Warm-up complete` to **yes (YYYY-MM-DD)** and tell the co-founder the account is ready for promotional drafting.

## Posting a comment (after sign-off)

After the co-founder signs off on a specific draft:

1. Log in (above) if not already authenticated.
2. Navigate to the post URL on `old.reddit.com` (rewrite any `www.reddit.com/...` URL to `old.reddit.com/...`).
3. Click the "reply" / comment textarea below the post.
4. Type the approved comment text into the `textarea[name="text"]` element.
5. Click "save" / submit.
6. Confirm the comment appeared on the page. If a CAPTCHA appears or submission fails, stop and `fail_task` with the reason.
7. Log the posted comment to `wiki/Knowledge/Reddit/Drafts/YYYY-MM-DD.md`.

## Posting cadence

- Maximum 1-2 comments per day during normal operation.
- 0-1 warm-up comments per day during the warm-up window.
- Vary the exact minute — never post at :00 or :30 exactly.
- Never post two comments in the same subreddit on the same day.

## Weekly health check (every Monday)

1. Log in via the browser as above.
2. Navigate to `https://old.reddit.com/user/<username>/`.
3. From the page, read:
   - `comment karma` (visible in the sidebar)
   - `link karma` (visible in the sidebar)
   - Account age (in the sidebar)
4. Check for shadowban signals: open one of the account's recent comments in a logged-out window (incognito or a separate session). If the comment is **not** visible while logged out, the account is shadowbanned.
5. Check for suspension: if `/user/<username>/` shows "This account has been suspended", flag it.

Log results to `wiki/Knowledge/Reddit/AccountHealth.md` in this format:

```
## Health check YYYY-MM-DD
| Metric | Value |
|---|---|
| Comment karma | 142 |
| Link karma | 12 |
| Shadowban | no |
| Suspended | no |
| Status | ok |
```

Escalate to the co-founder immediately if the account shows banned, suspended, or shadowbanned status. The remediation is to buy a fresh account from REDAccs — the existing comment history is gone, but the strategy continues with the new account after a fresh warm-up.
