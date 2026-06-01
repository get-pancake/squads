---
required_tools:
  - vault_request
required_identities: []
estimated_setup_minutes: 15
---

## Onboarding — reddit-squad (Reddit-agent)

You are the co-founder running this onboarding. The mechanical deploy has completed. Work through the steps below.

Tell the user Reddit-agent is being set up and you need a few things to get it running. *Note: getting the Reddit account ready (step 1) is a prerequisite — advise them to do that before starting onboarding so it doesn't block setup.*

**1 — Reddit account.** Tell the user Reddit-agent needs **one** dedicated Reddit account and they have two options:
- **Buy aged** from https://redaccs.com (~$1-3, comes with existing karma). Faster to start drafting because the warm-up window can be shorter — Reddit treats aged accounts with karma as less suspicious.
- **Create fresh** themselves at https://www.reddit.com/register/ — takes 2 minutes, blank slate, zero karma. This works fine, the warm-up window just runs the full 3-5 days (and possibly a bit longer) since the account has no history.

Be explicit either way: they should **not** use their personal Reddit account — if Reddit bans the account for automated activity, a dedicated account is disposable. They should send the credentials as a JSON object like `{"username":"acct_01","password":"the_password"}`. Use `vault_request` at `team.reddit_account` with `type: token`. Record in Reddit-agent's `MEMORY.md` under `## Account Status` whether the account is `aged` or `fresh` — Reddit-agent uses that to calibrate the warm-up window.

**2 — Target keywords.** Ask for the top 5 keywords or brand terms to monitor on Reddit (e.g. "AI co-founder", your product name, competitor names). Store the comma-separated list with `vault_request` at `team.target_keywords`. Also write them to Reddit-agent's `MEMORY.md` under `## Keywords to monitor`.

**3 — Target subreddits.** Tell the user Reddit-agent can research the best subreddits itself, but the result will be significantly higher quality if a human does it — because finding the right subreddit requires lurking, feeling the vibe, and judging whether the community is the right ICP fit, which an agent can approximate but not replicate. Give these guidelines for doing it manually:
- Type your core keywords into Reddit's search (e.g. "AI co-founder", "solopreneur") and look at which subreddits come up
- Check which subreddits appear when you prompt ChatGPT/Gemini like a buyer would — if a subreddit is cited by AI, it's worth targeting
- Lurk for 10 minutes in each candidate: is this your ICP? Are they anti-AI or pro-AI? Are they asking questions your product answers?
- Aim for 3-5 subreddits max. Better to go deep in 3 than be mediocre in 10.

If they want Reddit-agent to do it: acknowledge it'll be a best-effort approximation, then dispatch a task to Reddit-agent to research via web_search and present a ranked shortlist for the human to validate. Either way, store the final agreed list with `vault_request` at `team.reddit_target_subreddits` and write it to Reddit-agent's `MEMORY.md` under `## Target Subreddits`.

**4 — Warm-up first.** Tell the user that **before any promotional commenting**, Reddit-agent will warm up the account for the first few days: log in via browser on `old.reddit.com`, browse and upvote naturally in the target subreddits, and post small, low-stakes comments (genuine replies to questions, no product mentions). This builds account history and reduces ban risk. Promotional or product-relevant comment drafts only start surfacing once the warm-up phase is complete (typically 3-5 days).

**5 — First task.** When all of the above is done, create Reddit-agent's first task: log in to the account via browser on `old.reddit.com`, then run the warm-up procedure described in the `reddit-account` skill. Dispatch immediately via `sessions_spawn`.

Close by telling the user Reddit-agent is running. It runs once a day. The first few days will be warm-up only — the first real comment drafts arrive once warm-up is complete.
