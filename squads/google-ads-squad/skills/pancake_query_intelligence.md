---
name: pancake_query_intelligence
description: Unified search-term intelligence skill for Google Ads — combines the analytical framework (the five-bucket taxonomy, the three-axis relevance test, the n-gram decomposition, the negative match-type and placement logic, the PMax adaptation, the review cadence) with the procedural pipeline that executes it (data pull through GAQL or CSV, classification, n-gram pass, negative placement, conflict audit, gray-area triage, and Google Ads Editor CSV outputs). Use whenever a search-term report needs to be mined, a negative-keyword list needs to be built, expansion candidates need surfacing, or the waste-vs-opportunity split needs an honest accounting. Defers to pancake_pmax_workshop for full PMax deep-dives and pancake_orchestrator for routine performance metrics.
triggers:
  - "mine search terms"
  - "search term mining"
  - "search term report"
  - "search term cleanup"
  - "search term waste"
  - "search term methodology"
  - "search term evaluation"
  - "search term framework"
  - "negative keyword list"
  - "find negative keywords"
  - "keyword expansion"
---

# Pancake Query Intelligence

## How to read this document

This skill is two things in one file. The first half is the conceptual framework — how to think about a search term, what label to give it, and what action that label implies. The second half is the operational pipeline — the sequenced steps and artifact specs that turn a raw search-term report into a decision-ready set of CSVs and Markdown briefs. The framework is referenced by the pipeline; the pipeline does not duplicate the framework's reasoning.

Two questions divide the responsibility:

- "Given a search term in front of me, how do I think about it?" → see Part I (Framework).
- "Pull the report and execute the analysis end-to-end." → see Part II (Pipeline).

Apply the framework consistently across accounts, campaign types, and reviewers so that two practitioners looking at the same term reach the same conclusion. Apply the pipeline in fixed order so that two runs against the same data produce the same artifacts.

---

# Part I — The Framework

## 1. The Five-Bucket Classification System

Every term that gets reviewed lands in exactly one of five labelled buckets. The label *is* the unit of output — the deliverable of search-term review is a list of terms, each with a classification and the evidence that supports it. The five categories, in order of urgency:

### 1.1 URGENT_NEGATIVE — block today

A term lands here when **either**:

- It is irrelevant to the campaign's strategic purpose **and** has spent more than 2× the campaign's target CPA without producing a conversion, **or**
- It is irrelevant on its face regardless of spend — the obvious "jobs / careers / salary in a product campaign" pattern. Irrelevance is structural; no spend threshold needed.

Also include any term with 10+ clicks, 0 conversions, that fails all three relevance checks in §2.

**Action:** add as a negative; pick match type and placement using §3 and §4. Log addition with date and rationale.
**Priority:** same business day.

### 1.2 EXPAND — promote to a dedicated keyword

A term already converting through phrase or broad matching. Promoting it to its own keyword unlocks per-term bid control and improves Quality Score.

All required:

- 3+ conversions inside the evaluation window
- CPA at or below target (or ROAS at or above target for ROAS-driven accounts)
- Passes all three relevance checks
- Not already present as an exact or phrase keyword anywhere in the account
- 5+ clicks per week — enough to justify management overhead

A term clearing every criterion *except* volume reclassifies to COVERED_BY_PARENT — the broader keyword is handling it fine.

**Action:** add as exact or phrase in the appropriate ad group (match-type rubric in §3). Decide separately whether to pause the originating broader keyword (if this term was most of its volume) or keep it running. Consider whether the new keyword warrants its own ad group with tailored copy.
**Priority:** weekly batch.

### 1.3 COVERED_BY_PARENT — no action; parent is doing its job

The term is relevant and may even convert, but is already being served well by a healthy parent keyword. Adding it as its own keyword would create overhead without measurable benefit.

Conditions:

- Parent keyword (the broad or phrase that triggered the term) has 70%+ relevance rate across its triggered terms
- Parent's CPA / ROAS is within target
- This specific term is under 5 clicks per week individually, *or* it converts but adding it as exact wouldn't materially improve bid control

**Action:** tag and move on. Do not re-surface unless parent health changes (§11.6).

### 1.4 MONITOR_NEGATIVE — irrelevant but small; batch it

Clearly irrelevant but hasn't done meaningful damage yet. Don't let it slide, don't interrupt the day either.

Conditions:

- Under $10 total spend in the window
- 0 conversions
- Under 10 clicks
- Fails at least one relevance check unambiguously

**Action:** add to a staging list. Process the staging list at the next scheduled maintenance window. As you build the list, scan for repetition — if six different terms all contain "tutorial," promote "tutorial" to a single broader negative rather than stacking six exact negatives.
**Priority:** monthly batch.

### 1.5 REVIEW_MANUALLY — human judgment required

The framework refuses to classify because the signals are mixed, the data is thin, or the implications are strategic rather than tactical.

Triggers:

- Partial relevance — passes some checks, fails others
- Conflicting signals — relevant term with bad CPA, irrelevant term that converted
- Insufficient data — fewer than 10 clicks
- Strategic terms — competitor names, adjacent categories, new-market signals
- Significant spend on a term whose relevance is debatable

**Action:** send to a practitioner with the full diagnostic package (§5.5). Always run the four-step diagnostic in §5 before escalating — the human reviews a pre-diagnosed term, not raw data.
**Priority:** weekly review session, grouped by confidence band.

### 1.6 Decision matrix at a glance

When you have clicks, conversions, and a relevance verdict in front of you, this table resolves most cases. `T` is the per-account minimum-clicks threshold (default 5; scaled by account maturity, §6.2 of Part II); `C_min` is the conversion floor for EXPAND (default 3).

| Click volume | Conversions | Relevant? | Classification |
|---|---|---|---|
| ≥ 4T (high, ~20+) | 0 | No | URGENT_NEGATIVE |
| ≥ 4T | 0 | Yes | REVIEW_MANUALLY — diagnose before acting |
| ≥ 4T | ≥ C_min | Yes | EXPAND |
| ≥ 4T | ≥ C_min | No | REVIEW_MANUALLY — why is an irrelevant term converting? |
| T ≤ clicks < 4T (medium, ~5–19) | 0 | No | URGENT_NEGATIVE if spend > 2× CPA, else MONITOR_NEGATIVE |
| medium | 1–2 | Yes | REVIEW_MANUALLY — conversion data still thin |
| medium | 0 | Yes | REVIEW_MANUALLY — diagnose ad, LP, attribution |
| < T (low, <5) | 0 | No | MONITOR_NEGATIVE |
| < T | 0 | Yes | REVIEW_MANUALLY — insufficient data |
| < T | ≥ 1 | Yes | REVIEW_MANUALLY — lucky or legitimate? |

---

## 2. The Three-Axis Relevance Test

Relevance is not a single judgment — it is the conjunction of three independent checks. A term must pass **all three** to be considered fully relevant. Failing any one disqualifies the term from EXPAND and pushes it toward a negative bucket or manual review.

### 2.1 Check A — Term vs. Matched Keyword

Does the term actually express the intent the keyword was meant to capture? Literal word overlap is not enough.

**Passes when:** the core intent matches, additional words refine rather than redirect, and close variants preserve rather than flip meaning.

**Fails when:**

- Modifier words flip intent (jobs, salary, DIY, free, how to)
- A close variant has slid meaning — keyword "yoga teacher" matching "yoga teacher certification programs" (now researching qualifications, not booking a class)
- Term sits at a different funnel stage than the keyword was designed for

Modifier patterns that flip intent: employment (jobs, careers, salary, hiring, internship), freebie (free, open source, DIY, homemade), academic (definition, meaning, examples, essay), informational (how to, what is, tutorial, can I).

### 2.2 Check B — Term vs. Campaign / Ad Group Theme

Even if the keyword match looks right, does the term belong in this campaign's strategic territory?

**Passes when:** the term fits the campaign's customer segment, aligns with geo targeting, and brand intent matches campaign type.

**Fails when:** the term implies a different customer segment, has location intent outside target geo, a brand term has leaked into a non-brand campaign (or vice versa), or the term belongs to a different product line owned by another campaign.

This check catches "individually relevant but strategically misplaced."

### 2.3 Check C — Term vs. Landing Page

Would a user landing on the destination page feel they had been routed to the right place?

**Passes when:** the page directly addresses the query, the conversion action matches the term's funnel stage, and page specificity roughly matches term specificity.

**Fails when:** the page covers a different product, is too generic for a very specific query, too specific for a broad one, or omits information a searcher would expect.

**Important:** A landing-page failure alone does not make the term a negative. It may instead mean the term needs a different page, or the page needs updating. Only convert to a negative when the term itself is wrong for the business — not when it is merely misrouted. If a landing-page analysis skill has run previously, use its alignment scores and Quality Score data. Otherwise, infer from the ad group and campaign context, and flag the assessment as inferred (not data-driven).

### 2.4 Combining the checks

| Outcome | Implication |
|---|---|
| All three pass | Eligible for EXPAND (subject to thresholds in §1.2) or for COVERED_BY_PARENT |
| Any one fails clearly | Cannot be EXPAND — route to URGENT_NEGATIVE / MONITOR_NEGATIVE / REVIEW_MANUALLY based on spend and severity |
| Mixed / borderline | REVIEW_MANUALLY; run the §5 diagnostic |

### 2.5 Supporting lenses

The three checks need raw inputs. Build them by classifying:

- **Intent** — transactional, commercial-investigation, informational, navigational. Mismatch doesn't automatically demand a negative; an informational query in a transactional campaign might be better solved by a top-of-funnel campaign.
- **Product/service fit** — does the term describe something you actually sell? At a price point or quality tier that matches your positioning?
- **Geographic relevance** — location modifiers vs. campaign geo targeting; national vs. local intent.
- **Brand status** — brand / non-brand / competitor / semi-brand (use Levenshtein ≤ 2 for misspellings, see §3.4).

Default routing dictionary for common modifiers (starting point — most patterns recur across industries):

| Modifier | Signal | Default routing |
|---|---|---|
| jobs / careers / salary / hiring / internship | Employment | URGENT_NEGATIVE |
| free / open source / DIY / homemade | Non-paying | URGENT_NEGATIVE for paid products |
| review / comparison / best / top | Commercial investigation | REVIEW_MANUALLY |
| near me / in [city] | Local intent | Check geo alignment |
| wholesale / bulk | B2B intent | Check campaign audience |
| used / refurbished / cheap | Budget intent | Check brand positioning |
| how to / what is / tutorial | Informational | REVIEW_MANUALLY |
| login / support / contact / dashboard | Existing customer | MONITOR_NEGATIVE on acquisition campaigns |

---

## 3. Match Type Selection

### 3.1 For expansion (positive) keywords

Promote the smallest unit that captures the pattern.

| Signal | Recommended match type | Rationale |
|---|---|---|
| Highly specific long-tail term close to an existing phrase match | Exact | Per-term bid control without disturbing the broader keyword |
| The core n-gram converts across multiple variants | Phrase on the core phrase | Capture the whole pattern, not a single instance |
| Converting through broad-match discovery, proven at volume | Exact in core campaign, then add as negative in the broad campaign | Graduate from discovery to core, prevent overlap |
| Single converting instance at low volume (<5 clicks/week) | Do not expand — reclassify as COVERED_BY_PARENT | Not enough signal |

**N-gram link:** before recommending exact on an individual term, check whether the n-gram analysis (§4) shows the term's core bigram or trigram appearing in 5+ converting search terms. If so, recommend phrase on the core phrase rather than exact on every variant. One phrase keyword covering 12 variants is preferable to 12 exact keywords.

### 3.2 For negative keywords — and why they are NOT symmetric with positives

The single biggest source of mistakes: negative match types are strictly more literal than positive match types. They do **not** include close variants, synonyms, or intent expansion.

**Negative broad** — blocks any query containing *all* words from the negative, in any order. Use when the entire concept is irrelevant. Example: `accountant internship` blocks "internship for accountant," "remote accountant internship summer," and "internship at accountant firm" — but does *not* block plain "accountant" nor "accountant apprenticeship."

**Negative phrase** — blocks queries containing the exact phrase, in order; can have extra words before or after. Use when a specific multi-word phrase is the problem. Example: `"is it legal to"` blocks "is it legal to break a lease" but not "legal to work weekends is it."

**Negative exact** — blocks only the exact query (with very limited close-variant behavior). Use for surgical exclusions. Example: `[dental hygienist salary]` blocks only that — not "average dental hygienist salary."

### 3.3 Decision sequence

Walk this in order; stop at the first match:

1. Is the **entire concept** irrelevant? → negative broad
2. Is a **specific phrase** the problem? → negative phrase
3. Is **only this exact query** the problem? → negative exact
4. Unsure? → default to exact and broaden later. Gaps are easier to diagnose than overly broad negatives that silently block traffic.

### 3.4 Brand proximity detection (Levenshtein)

Misspellings slip past straight string matching. Use Levenshtein edit distance ≤ 2 from any term in the brand list to flag potential brand traffic:

- `Stripe` → `Stipe` (distance 1)
- `HubSpot` → `HubSpott` (distance 1)
- `Notion` → `Notiom` (distance 1)

Apply this both when classifying terms (so brand terms route correctly) and when proposing negatives (so a misspelled brand isn't accidentally added as a negative).

---

## 4. N-Gram Analysis

### 4.1 What and why

An n-gram is a contiguous sequence of n words from a query. For "affordable dentist downtown chicago," decomposition yields 4 unigrams, 3 bigrams, 2 trigrams, 1 four-gram. Each metric (impressions, clicks, cost, conversions, value) on the parent term is credited to every one of its component n-grams.

The reason this matters: the long-tail nature of search queries means most individual terms are nearly unique. A medium account easily generates several thousand distinct queries in a month — line-by-line review is prohibitive. The *patterns inside* those queries recur constantly, and n-gram analysis pulls them up to the surface.

Instead of evaluating "24 hour locksmith near me," "24 hour locksmith pricing," and "24 hour locksmith chicago" as three separate decisions, the bigram "24 hour" aggregates all three. This unlocks pattern-level negative discovery (the unigram "internship" surfacing across 38 terms with $190 in zero-conv spend — one negative takes out the whole category), theme discovery (a bigram converting at 2.5× the account average across 17 terms), and a review surface of hundreds of patterns rather than thousands of queries.

### 4.2 Decomposition procedure

1. Pull every search term in the window with full metrics.
2. Normalize: lowercase, squeeze whitespace, optionally strip a stop-word list (articles, prepositions, conjunctions, common auxiliaries). Apply stop-word removal carefully — short words sometimes carry semantic load. Compare "near me" vs. "me near" or "open now" vs. "now open." Only enable stop-word removal on a run after confirming the surviving n-grams still mean what you expect.
3. Split each term into unigrams, bigrams, trigrams, 4-grams.
4. For each n-gram, aggregate metrics across every parent term containing it.
5. Count frequency: how many unique parent terms contain each n-gram.
6. Derive conversion rate, CPA, and ROAS at the n-gram level.

### 4.3 Volume thresholds

Below these floors, noise overwhelms signal:

| Threshold | Standard | Low-volume floor |
|---|---|---|
| Minimum clicks on an n-gram before acting | 20 | 10 |
| Minimum unique terms containing the n-gram | 5 | 3 |
| Minimum impressions for zombie detection | 100 | 50 |

Also drop any n-gram appearing in only a single term — it adds noise without adding pattern evidence.

### 4.4 N-gram buckets

| Bucket | Definition | Implication |
|---|---|---|
| Zero-Conv High-Spend | Multiple terms; aggregate spend > high-spend flag; zero aggregate conversions | Strong candidate for an n-gram-level negative (more efficient than negating individual terms) |
| High-Converting | Multiple terms; aggregate conversions strong; ROAS at or above target | Theme worth expanding — build dedicated ad groups, tailored copy, raise bids |
| Brand-Adjacent | Contains a brand term or Levenshtein-close variant | Route to brand-specific analysis; verify brand campaign coverage |
| Mixed Signal | Both converting and non-converting parent terms | Manual review needed; the n-gram itself may be relevant but specific surrounding words may be the issue |
| Zombie | Impressions but 0 clicks | Visibility waste — if irrelevant, negate; if relevant, investigate ad copy and positioning |

For "high" / "low" cutoffs inside buckets: use the account's median clicks-per-n-gram as the dividing line for clicks; use 1 as the conversion floor on low-volume accounts, 3 for statistical confidence on high-volume.

### 4.5 What to act on

**Negative candidates** — 20+ clicks, $50+ spend, 0 conversions, recurring pattern. Sanity check: is the n-gram a *core* term that *should* be converting? If so, the issue is LP or ad copy, not relevance.

**Expansion candidates** — conversion rate at 2× account average or higher; CPA at 50% below target or lower. Build dedicated ad groups, tailored copy, expand keyword coverage, raise bids.

**Diagnostic targets** — high CPC + low conversion rate. Either a relevance issue (negative candidate) or an optimization issue (LP, ad). Diagnose before acting.

**Brand n-grams in non-brand campaigns** — segmentation issue. Route to brand campaigns; add as negatives in non-brand.

### 4.6 Output format

| N-gram | Type | Frequency | Clicks | Cost | Conv | Conv Rate | CPA | Conv Value | ROAS | Bucket | Brand Proximity |
|---|---|---|---|---|---|---|---|---|---|---|---|
| same day delivery | trigram | 19 | 142 | $980 | 9 | 6.3% | $109 | $2,820 | 2.9× | Hclicks_Hconv | None |
| internship | unigram | 38 | 71 | $185 | 0 | 0% | N/A | $0 | 0× | Zeroconv | None |
| stipe | unigram | 4 | 16 | $52 | 2 | 12.5% | $26 | $208 | 4.0× | Lclicks_Lconv | "stripe" (d=1) |

Default sort: cost descending (highest waste first), then conversion rate ascending. Offer alternate views by bucket, by n-gram type, by brand proximity.

---

## 5. Diagnosing Ambiguous Terms

When a term is classified REVIEW_MANUALLY, the wrong move is to add it as a negative "just in case." Premature negatives are how accounts quietly lose revenue. The right move is a structured four-step diagnostic that identifies *why* the term is ambiguous before any action.

### 5.1 Step 1 — Keyword diagnostic

- How did the term match — broad, phrase, exact?
- If broad: is the keyword itself too broad? The problem may be the keyword, not the term.
- If phrase: has Google's meaning-based matching stretched too far?
- Is there a better keyword that *should* have caught this term?

Outcomes: keyword appropriate → continue. Keyword too broad → tighten match type, add more specific keywords, restructure. Term belongs to a different campaign's territory → negate here and ensure the right campaign captures it.

### 5.2 Step 2 — Ad diagnostic

- Did the RSA pick headlines and descriptions aligned with the term's intent?
- Is the ad group narrow enough that any assembled ad combination would be relevant?
- Ad copy gap — relevant term but no asset speaks to it?

Outcomes: aligned → continue. Misaligned → add RSA assets that speak to the term, or spin up a new ad group with tailored copy. RSA selection is the issue → pin critical headlines.

### 5.3 Step 3 — Landing page diagnostic

- If a landing-page analysis tool is available, pull content-keyword alignment and Quality Score landing-page experience. Use data, not inference.
- If no LP data, infer from the ad group's final URL and term's intent, and **flag the output as "landing page alignment inferred, not measured."**
- Does the page address the search?
- Is the conversion action appropriate for the funnel stage of this term? A "buy now" page won't convert an informational query — but the query may not be irrelevant.
- Would a different page convert this traffic?

Outcomes: aligned → continue. Misaligned → change the LP for this keyword/ad group, or build a new page. Do **not** negate a term just because it lands on the wrong page. Funnel-stage mismatch → consider a different campaign with a different conversion goal.

### 5.4 Step 4 — Attribution diagnostic

A gate: assisted-conversion path data requires API-tier access. CSV-tier may have it if attribution reports were exported. Manual-tier typically doesn't. **If attribution data is unavailable, output "Attribution: INCONCLUSIVE — data not available at current tier."** Missing data is *not* evidence of no contribution.

Checks:

- Does the term appear in assisted conversion paths?
- Is the term a first-touch or mid-funnel interaction whose conversions get credited to direct, email, or brand search?
- How long does this campaign's path typically take to close? Long lags mean recent terms haven't had the window to register.

Outcomes: term has assists → contributing value even at 0 direct conversions. Do **not** negate. Term appears in multi-touch paths → weigh its role. No attribution data, or absent from paths → inconclusive, not negative. Proceed using the rest of the diagnostic.

### 5.5 Output package for a REVIEW_MANUALLY term

```
TERM: [the search term]
MATCHED KEYWORD: [keyword that triggered it]
MATCH TYPE: [broad / phrase / exact]
CAMPAIGN / AD GROUP: [full path]

METRICS:
  Impressions: [X]
  Clicks: [X]
  Cost: [$X]
  Conversions: [X]
  Conversion Value: [$X]
  CPA: [$X or N/A]

DIAGNOSTICS:
  1. Keyword:      [PASS / FAIL] — [one-line explanation]
  2. Ad Copy:      [PASS / FAIL] — [one-line explanation]
  3. Landing Page: [PASS / FAIL] — [one-line explanation]
  4. Attribution:  [PASS / INCONCLUSIVE / FAIL] — [one-line explanation]

SEASONALITY: [Not seasonal / Possibly seasonal — details]
ASSISTED CONVERSIONS: [X assists / No data available]

RECOMMENDED CLASSIFICATION: [category]
CONFIDENCE: [HIGH / MEDIUM / LOW]
REASONING: [1–2 sentences]
```

Group the queue by confidence so review time goes where it matters:

- **LOW first** — strategic terms, high-spend ambiguity, conflicting diagnostics.
- **MEDIUM** — diagnostics mostly aligned but one is borderline or data is thin.
- **HIGH** — framework is fairly certain but the term landed in REVIEW_MANUALLY on a technicality. Often batch-approvable.

### 5.6 Insufficient-data handling

Most REVIEW_MANUALLY terms are there because there isn't enough data to decide. Rules to prevent premature permanent decisions:

| Clicks | Conv. | Rule |
|---|---|---|
| <5 | 0 | Do nothing. Tag for revisit in 2 weeks. 5 clicks is noise. **Exception:** unambiguously irrelevant on all three checks → MONITOR_NEGATIVE anyway. |
| 5–10 | 0 | Run the four-step diagnostic. All pass + irrelevant → MONITOR_NEGATIVE. Any fail → fix the issue, reset clock, revisit in 2 weeks. |
| 10–20 | 0 | Approaching actionable. All pass + irrelevant + spend > target CPA → URGENT_NEGATIVE. All pass + relevant → this is a *conversion* problem, not a *relevance* problem. Investigate LP conv rate, offer, positioning. |
| 20+ | 0 | Main framework handles it. If it can't, you have a genuinely ambiguous case for human judgment. |

### 5.7 Seasonality check

Before locking in any term as a negative, confirm it is not seasonal traffic that will become relevant later.

**Suspect seasonality when:** the term contains seasonal language (holidays, "back to school," "summer," "gift," "valentines"); appeared suddenly after a quiet period; performed well last year in the same window but is weak now.

**Verify with:** prior-year data (12+ months of history) — also check the *opposite* season (a Valentine's gift term in January is pre-season, not irrelevant); Google Trends for cyclical patterns; industry calendar.

**If seasonal:** use scheduled negatives, a reminder to remove before the season returns, or campaign scheduling rather than a permanent negative.

### 5.8 Assisted conversion check

Last-click models systematically discount queries that play an introductory role. A term sitting at zero direct conversions can still rack up real assist counts.

| Pattern | Read |
|---|---|
| 0 direct, 5+ assists | Introducer. Not a negative candidate. Consider expanding coverage. |
| 0 direct, 1–4 assists | Promising but inconclusive. Tag for monitoring. |
| 0 direct, 0 assists | No evidence of contribution. Use standard diagnostic. |

Caveats: not all accounts have term-level path data; long conversion windows (30+ days) mean recent terms may not have shown assists yet; cross-device paths are often incomplete. Missing assist data is a data gap, not proof of no contribution.

### 5.9 Cross-run classification memory

Terms a practitioner has reviewed and intentionally left as-is should not be force-fed back through the queue every week. Record decision, date, and key metrics. **Re-flag only when:** spend has doubled since last review, conversion count has materially changed, parent keyword's health has shifted, or 90 days have passed (periodic refresh). **Do not re-flag** when the term reappears with similar metrics and no new information.

### 5.10 Always-escalate categories

Some terms always go to a human regardless of framework confidence:

- **High-spend gray area** (>$50 of ambiguous spend) — financial exposure justifies review.
- **Competitor brand terms** — strategic business decision, never auto-negate or auto-expand.
- **Adjacent category terms** — queries for things the business doesn't currently sell but conceivably could (pipe-repair plumber getting drain-cleaning queries). Product strategy, not search-term optimization.
- **New market or product signals** — surface as intelligence; do not filter as irrelevant.
- **Legal/compliance implications** — regulated claims, trademark-adjacent comparisons, regulated-industry language.

---

## 6. Negative Keyword Architecture

Adding a negative correctly involves two decisions: what match type (covered in §3.2–§3.3) and at what level of the account hierarchy. Get either wrong and you create either gaps or collateral damage.

### 6.1 The four-level placement hierarchy

| Level | Limit | Scope | Best for |
|---|---|---|---|
| Account-level | 1,000 negatives | Every campaign (Search, Shopping, PMax) | Universal exclusions that no campaign should ever serve |
| Shared list | 5,000 per list, 20 lists per account | All campaigns attached to the list | Thematic groups shared across some but not all campaigns |
| Campaign-level | 10,000 per campaign | Only that campaign | Terms relevant to the business but not this campaign |
| Ad group-level | 10,000 per ad group | Only that ad group | Sculpting traffic between ad groups in the same campaign |

Behavior rules:

- Account-level negatives are **absolute** — no lower-level setting can re-enable a term. Treat as last resort.
- Attaching a campaign to a shared list applies the *entire* list. Audit before attaching to a new campaign.
- An ad group negative blocks a query even if a positive keyword in the same ad group would have matched it. Negative trumps positive at the same level.

### 6.2 Placement decision tree

Walk in order; stop at the first "yes":

1. Should *no* campaign in the account ever serve this term? → account level.
2. Should a defined *group* of campaigns sharing some characteristic avoid it? → shared list.
3. Is it relevant to *some* campaigns but not this one? → campaign level.
4. Is it relevant to *some* ad groups in this campaign but not this one? → ad group level (sculpting, not exclusion).
5. None of the above? → reconsider whether it should be a negative at all.

### 6.3 Examples by level

- **Account-level**: "jobs," "careers," "salary," explicit terms, wrong-language terms, "free" / "DIY" for paid service businesses
- **Shared list**: a "Competitor Brands" list attached to every non-brand campaign; an "Enterprise-only Terms" list attached to SMB-focused campaigns; a "Top-of-Funnel Research" list (how-to, definitions, comparisons) attached to conversion-goal campaigns; a "Customer Support Queries" list (account, login, billing, help) attached to acquisition campaigns
- **Campaign-level**: brand terms in non-brand campaigns; geo terms in campaigns targeting other regions; Product A terms in a Product B campaign
- **Ad group-level**: when a campaign has both an "office chairs" and an "executive office chairs" ad group, add "executive" as a negative in "office chairs" so matching is clean; tier-specific terms as negatives in the other tiers

### 6.4 Conflict detection

Before adding any negative, check:

1. **Same-level and below positives** — a campaign-level negative can shadow an ad group positive; an account-level negative shadows everything.
2. **Across campaigns** when adding to a shared list — does the negative conflict with positives in any attached campaign?
3. **Close variants** — a negative `run` may catch `running` in some cases.
4. **Compound effects** — two negative broads do not chain. Negative broad requires all words from a *single* negative. A broad `red` and a broad `shoes` will each block their patterns but will *not* jointly block "red shoes."

Conflict simulation:

- **Negative broad** flags any positive keyword that contains all the words in the negative
- **Negative phrase** flags any positive keyword that contains the phrase
- **Negative exact** flags any positive keyword that exactly matches

Resolution options:

1. **Narrow the negative match type** (broad → phrase, or phrase → exact)
2. **Move the placement closer** (account → campaign, or campaign → ad group)
3. **Drop the negative** (the conflict is unresolvable without harming legitimate traffic)
4. **Accept the conflict** (with explicit reasoning recorded)

Schedule a monthly audit: staleness sweep (remove negatives added for now-irrelevant seasonal patterns, discontinued products, or capabilities the business has since added); conflict scan against any positives added since the last audit; gap scan via n-gram analysis on the past 30 days; PMax brand-exclusion check; changelog with date/term/match-type/level/reason for every addition and removal.

### 6.5 PMax constraints on negatives

PMax does not currently support traditional campaign-level or ad-group-level negatives via the standard interface. What works:

- **Account-level negatives** apply to PMax — the most reliable mechanism.
- **Shared negative lists** can be attached to PMax (since 2024).
- **Brand exclusion lists** are the primary lever for brand control inside PMax.
- Some limited negative keyword support is rolling out but availability varies.

Practical strategy: use account-level negatives for universal exclusions; maintain a dedicated PMax shared negative list; use brand exclusion lists to stop PMax from cannibalizing brand Search campaigns; for high-volume irrelevant patterns inside PMax, consider extracting the *relevant* terms into dedicated Search campaigns and letting PMax handle the rest; watch the PMax search-term report closely — the control surface is small, so detection has to make up for it.

---

## 7. Current Match Type Behavior (2025–2026)

Match types have drifted far from their original literal definitions. By 2025–2026 all three use intent-based matching to some degree. Operating on old assumptions produces systematic errors.

### 7.1 Exact match

- **Today:** matches meaning and intent, including close variants — plurals, misspellings, abbreviations, rewordings, implied words, same-intent queries.
- **No longer literally "exact."** `[meal delivery service]` can match "service for meal delivery," "delivered meal service," "prepared food delivery."
- **Failure mode:** semantic drift — close variants that change meaning. Monitor.

### 7.2 Phrase match

- **Today:** matches queries that include the keyword's meaning in correct conceptual order, with extras allowed before or after. Google may reword or reorder slightly if meaning is preserved.
- **Example:** `personal trainer austin` can match "best personal trainers in austin," "austin personal trainer for women," "personal trainer near austin tx."
- **Failure mode:** generous "meaning" reads. `golf gloves` legitimately catches "leather gloves for golfers" but can stretch to "golf accessories gloves bags equipment."

### 7.3 Broad match

- **Today:** picks up queries thematically connected to the keyword — synonyms, adjacent searches, inferred intent. Shaped heavily by Smart Bidding inputs (location, recent search history, other ad group keywords, landing-page content).
- **Example:** `low carb diet plan` may match "keto meal subscription," "ketogenic eating guide," "weight loss food box."
- **Critical dependency:** broad is *designed for* Smart Bidding (tCPA, tROAS, Max Conversions). Without Smart Bidding, broad produces poor relevance.
- **Failure mode:** insufficient conversion data → poor matching. New campaigns and keywords with no history are most vulnerable.

### 7.4 Close variants in detail

Today's close variants cover spelling errors ("electricain" ↔ "electrician"), plural ↔ singular, stem forms ("painted" ↔ "paint"), abbreviations ("LA" ↔ "Los Angeles"), diacritics ignored ("résumé" ↔ "resume"), equivalent rewordings ("photos of dogs" ↔ "dog pictures"), meaning-preserving reordering ("delivery meal" → "meal delivery"), function words quietly added/dropped ("dentist Brooklyn" ↔ "dentist in Brooklyn").

**Reporting implication:** several Google Ads reports roll close variants together under the parent keyword. To judge true performance, sum the variants — the search-term report exposes which underlying variants are actually doing the work.

**Meaning-changing close variants** are matcher errors on Google's side. Recurring patterns:

- Negation drop: "alcohol-free skincare" matched as "alcohol skincare"
- Part-of-speech shift: "detector smoke" (verb usage) collapsed onto "smoke detector" (product)
- Reordering that changes role: "lawyer hires assistant" interpreted as "assistant hires lawyer"

When you spot one, add the incorrect variant as a negative exact to prevent recurrence.

### 7.5 AI Max for Search (2025–2026 rollout)

AI Max is a Search-campaign-level opt-in that turns off conventional keyword targeting. Matching is driven by:

- Landing-page content
- Text and asset library attached to the campaign
- Audience definitions and uploaded first-party data
- Accumulated conversion history
- Live behavioral signals (location, device, recent browsing)

**Difference from broad match:** broad still uses a keyword as the anchor; AI Max removes the keyword anchor entirely.

**Implication for search-term analysis:** AI Max terms cannot be mapped to a triggering keyword. The three-axis test adapts:

- Term vs. landing page (kept)
- Term vs. ad copy theme (replaces "term vs. keyword")
- Term vs. business offering (replaces "term vs. campaign theme" in a broader sense)

**AI Max fits when:** the account has 100+ conversions/month for the algorithm to learn from; LP coverage spans the catalog with reasonable depth; the campaign explicitly wants new query patterns; first-party audience segments are built out.

**AI Max is a poor fit when:** a fresh account with no conversion track record; thin or generic LP inventory; brand-safety-sensitive categories; tight budgets where mismatches can't be absorbed.

Traditional keyword campaigns remain on the menu and remain the right choice whenever fine-grained control matters more than reach expansion.

### 7.6 The three-lane campaign structure

A recommended architecture that balances control and discovery. Most accounts benefit from running all three lanes in parallel rather than picking one.

**Lane 1: Brand** — exact for core brand terms; phrase for brand + modifier. Manual CPC or tCPA. Add all brand terms as negatives in non-brand campaigns.

**Lane 2: Non-Brand Core** — phrase and exact on proven high-intent keywords. tCPA or tROAS once conversion data supports it. Negatives: brand, competitor (unless conquesting), informational intent.

**Lane 3: Broad Match Discovery** — broad paired with Smart Bidding (mandatory). tCPA or Max Conversions. Heavy negative management; brand negatives, terms already covered by Lane 2, rapid URGENT_NEGATIVE additions from ongoing review. Typically 15–25% of non-brand budget.

**Lane interactions:** Lane 3 surfaces new converting patterns → winners promote to Lane 2 as exact/phrase → after promotion, the term is added as a negative in Lane 3 to prevent overlap. Lane 1 runs independently.

### 7.7 Match type migrations

Migrating an existing campaign's match types is risky.

**Exact → Phrase:** expands reach via modifier variations. Risk: reduced precision, informational/low-intent queries. Mitigation: bump search-term review to daily for 2 weeks; pre-build a negative list for expected irrelevant modifiers.

**Phrase → Broad:** large expansion via synonyms and intent matching. Risk: substantial precision loss without Smart Bidding. Prerequisites: Smart Bidding active; 30+ conversions in past 30 days. Mitigation: run broad as a *separate* campaign (Lane 3) rather than converting existing keywords.

**Migration discipline:** one campaign at a time, never account-wide simultaneously; daily search-term review for the first 2 weeks; keep original exact/phrase in their own campaigns; define success criteria up front (CPA ceiling, minimum conversion volume, timeline); have a rollback plan.

---

## 8. Adapting the Methodology for Performance Max

PMax requires modifications because the structural assumptions of Search don't hold:

- **No keyword-level attribution** — a search term cannot be traced to a triggering keyword.
- **Multi-channel blending** — PMax serves on Search, Shopping, Display, YouTube, Gmail, Discover. Reports show only Search + Shopping.
- **Asset groups, not ad groups** — themes, final URLs, audience signals replace keyword lists as the organizational unit.
- **Limited negative control** — see §6.5.

### 8.1 Asset group themes as the evaluation anchor

In Search, the matched keyword is the primary reference. In PMax, the asset group theme replaces that anchor. The theme is defined by asset group name, final URLs, text assets, audience signals, and (for Shopping-eligible PMax) product feed titles and descriptions.

Evaluation question: "Does this term align with what this asset group is designed to attract and convert?"

### 8.2 Three-axis test, PMax version

- **Check A — Term vs. Asset Group Theme.** Does the term match the strategic purpose? Common failures: generic terms hitting specific asset groups (or vice versa); cross-product bleed; brand terms in non-brand asset groups.
- **Check B — Term vs. Product Category (Shopping-eligible PMax).** Product titles/descriptions act as quasi-keywords. Common failures: broad product titles attracting irrelevant queries; missing attributes (no color/size in titles); competitor product searches matching your products when categories overlap.
- **Check C — Term vs. Landing Page / Final URL.** Common failures: PMax picking a generic homepage over a product page; final URL expansion sending users to irrelevant pages; category pages shown for specific product queries.

### 8.3 Brand vs. non-brand segmentation in PMax

This matters more in PMax than anywhere else — the economics are wildly different. Brand clicks typically convert at 3–10× the non-brand rate; brand CPCs are 50–80% lower. Mixing them produces metrics that look better than the underlying non-brand performance actually is.

When 70% of PMax conversions trace back to brand terms, what reads as "PMax performance" is largely the platform re-harvesting existing demand rather than expanding it. Call this out explicitly in any reporting.

Method: build a comprehensive brand list (brand name, product names, common misspellings, abbreviations, branded campaign names); use Levenshtein ≤ 2 for misspellings; classify each PMax term as brand/non-brand/competitor; report PMax metrics separately for brand vs. non-brand.

Segmentation actions: brand terms in non-brand PMax → flag for brand exclusion review (belong in dedicated brand Search campaigns); non-brand in brand-focused asset groups → re-examine theme clarity; competitor → always human review.

### 8.4 Extracting PMax terms to dedicated Search campaigns

Extraction = pulling high-value search terms out of PMax into keyword-controlled Search campaigns. All criteria required:

- **Volume:** 50+ clicks/week in PMax. Below this, dedicated management isn't justified.
- **Proven conversion performance:** demonstrated conversion history with CPA at or below target. Not just clicks.
- **Bid control need:** you want bids that differ from PMax's automated bidding.
- **Landing page control need:** the ideal LP differs from PMax's choice.
- **Brand protection:** brand terms in PMax should almost always be extracted to brand Search campaigns.

Process: identify candidates → build Search campaign with appropriate keywords, match types, LPs → add extracted terms as account-level or shared-list negatives (PMax doesn't support campaign-level negatives) → monitor both campaigns for 2–4 weeks → verify PMax performance didn't degrade disproportionately.

Risks of over-extraction: pull too aggressively and PMax runs on residue — the lower-value queries no one extracted. PMax's bidding model trains on the entire signal pool; strip out the strongest converters and you weaken its ability to recognize comparable users elsewhere. Only extract where dedicated management clearly adds value.

### 8.5 N-gram analysis for PMax

Standard methodology applies, with wider windows and PMax-specific focus.

**Windows:** standard 4-week rolling (vs. 1–2 weeks for Search); low-volume PMax extends to 8 weeks.

**Focus:** negative pattern identification (since PMax negatives are account-level / shared-list only, identify *patterns* not individual terms); expansion candidates (high-performing PMax n-grams are strong Search-campaign extraction candidates); product feed alignment (lay top n-grams next to feed titles — where user language diverges from feed language, the feed has room to be optimized).

**PMax-specific patterns to watch:** Shopping queries (product-attribute terms — color, size, material — evaluate against feed quality); informational patterns ("how to," "what is" in PMax Search suggests Display/YouTube intent matching onto Search — often a too-broad asset group theme); location patterns (whether PMax is reaching the intended service area or leaking).

### 8.6 PMax vs. Search threshold reference

| Threshold | Search | PMax |
|---|---|---|
| Min clicks before term classification | 5 | 10 |
| Min clicks on n-gram before action | 20 | 15 (with 4-week window — similar confidence) |
| Min unique terms per n-gram | 5 | 3 |
| Standard evaluation window | 1–2 weeks | 4 weeks minimum |
| Low-volume evaluation window | 4 weeks | 8 weeks |
| URGENT_NEGATIVE spend threshold | 2× target CPA | 3× target CPA — higher bar due to multi-channel attribution lag |

The higher PMax thresholds exist because per-term data is sparser and multi-channel attribution lags. Acting too quickly produces premature negative classifications.

---

## 9. Review Cadence

How often you look depends on how much money is moving through the account.

| Account spend tier | Frequency | Focus |
|---|---|---|
| High ( > $10K / month ) | Daily spot-checks + full weekly review | URGENT_NEGATIVE identification, budget protection |
| Standard ( $2K – $10K / month ) | Full weekly review | All five categories; n-gram analysis monthly |
| Low ( < $2K / month ) | Bi-weekly or monthly | URGENT_NEGATIVE focus; batch other categories |

### 9.1 Intensive review after changes

Increase to daily review for 2 weeks after: match type changes (exact → phrase, phrase → broad); new keyword additions; new campaign launches; bid strategy changes; significant budget increases. The 2-week window catches the bulk of new matching patterns before they accumulate enough spend to do real damage.

---

## 10. Common Edge Cases

### 10.1 Long-tail terms that are technically relevant but extremely niche

"Ergonomic office chair for tall person with lower back pain under 400" is genuinely relevant to an office furniture campaign, but its specificity almost guarantees it never reaches meaningful volume. → REVIEW_MANUALLY. Actual question: leave alone, or mine it for landing page copy and FAQ content even without bidding directly?

### 10.2 Competitor brand terms in non-brand campaigns

When a competitor's name comes through broad match, always REVIEW_MANUALLY. Whether to negate or pursue as conquesting is strategic — driven by competitive position, CPA tolerance for competitor traffic, and brand policy.

### 10.3 Close variants that change meaning

"Tax preparation" (service) vs. "tax preparation training" (education); "smoke detector" (product) vs. "detector smoke" (verb form in vape detection contexts); "wedding planner" (vendor) vs. "planner for wedding" (DIY tools). Each must be assessed individually. Don't assume a close variant carries the original intent forward.

### 10.4 Seasonal or event-driven terms

Run the §5.7 seasonality check before adding any permanent negative. Use scheduled negatives, reminders, or campaign scheduling.

### 10.5 Terms that convert despite looking irrelevant

Occasionally a term that fails all three relevance checks still produces conversions. Don't reflexively negate. Investigate: is the conversion real and valuable, or noise? Does the user journey make sense? Could the landing page be serving a need you didn't anticipate? If conversions are legitimate, the term is in fact relevant — and your cross-reference understanding is the thing that needs updating, not the data.

### 10.6 Parent keyword health changes

COVERED_BY_PARENT rests on the assumption that the parent is healthy. Re-evaluate when:

| Parent state | Implication for covered terms |
|---|---|
| Healthy — 70%+ relevance, CPA within target | Covered terms stay COVERED_BY_PARENT, no action |
| Leaking — under 70% relevance | Parent needs more negatives, not more expansions. Fix the keyword, not the terms. |
| Exhausted — declining volume, rising CPA | Parent may need restructuring. Evaluate whether high-performing triggered terms should be promoted to EXPAND before the parent collapses. |

---

# Part II — The Pipeline

The pipeline below applies the framework above to a specific account in a specific window. It runs in fixed order; steps are not skippable, not collapsible, not parallelizable. Each step ends in a checkpoint where the practitioner signs off before the next step begins.

The pipeline is data-source agnostic — it works equally well with live API pulls, copy-pasted tables, or downloaded reports — but always produces the same standardized outputs.

## Operating Notes

### Dependencies pulled at boot

One companion skill supplies context this skill needs:

- **`pancake_account_foundations`** — per-account brand vocabulary, KPI targets, business model, campaign naming, account maturity grade, pre-known negative signal patterns, and the rules for scaling all numeric thresholds to the account's statistical confidence

If it is unavailable, halt at Step 0 and instruct the user to install or configure.

### Invoking the Google Ads API

The agent drives Google Ads by writing short async Python scripts that import from the project's SDK module. Function inventory lives in the Google Ads client module — open that file to confirm a signature.

```python
import asyncio
from sdk.google_ads_client import google_ads_run_gaql_query

async def main():
    rows = await google_ads_run_gaql_query(
        customer_id="1234567890",
        query="""
            SELECT campaign.name,
                   metrics.impressions,
                   metrics.clicks,
                   metrics.conversions,
                   metrics.cost_micros
            FROM campaign
            WHERE segments.date DURING LAST_30_DAYS
        """,
    )
    print(rows)

asyncio.run(main())
```

Run any such script with `uv run python script.py`.

Functions most relevant to this skill:

| Function | What it does |
|---|---|
| `google_ads_run_gaql_query(customer_id, query)` | Executes any GAQL string. The workhorse. |
| `google_ads_list_campaigns(customer_id, ...)` | Lists campaigns in the account. |
| `google_ads_get_campaign_performance(customer_id, ...)` | Returns campaign-level metrics. |
| `google_ads_get_keyword_performance(customer_id, ...)` | Returns keyword-level metrics. |

Two things to remember every time:

1. Any mutation creates a **draft**. It must be approved via `submit_draft(draft_id)` before reaching the live account.
2. Cost values come back in **micros**. Divide by 1,000,000 to recover account currency.

### Verbose mode during onboarding

For the first five runs against a given account, every checkpoint expands into a longer explanation: why the methodology made the choice it made, which signals tipped a borderline term, how to interpret each artifact. After the fifth run, checkpoints contract to concise confirmations. The practitioner can re-enter verbose mode at any time by saying "explain your reasoning."

---

## Step 0 — Establish the Analytical Foundation

This is configuration, not data — nothing about the account's traffic is touched yet.

### 0.1 Load account conventions

Default path: `pancake_account_foundations/config.yaml`. Extract:

- Brand-term variants
- Competitor terms
- Universal negative signal patterns (apply to any account)
- Account-specific negative signal patterns
- KPI targets (CPA, ROAS, or both)
- Account maturity grade
- Business model (lead-gen, eCommerce, B2B, etc.)
- Campaign naming conventions
- Special handling notes (multi-currency, multi-language, seasonal patterns)

If the config is absent, halt and instruct the user to run `pancake_account_foundations` to bootstrap.

### 0.2 Load the framework

The framework above (Part I) provides the reasoning machinery the pipeline applies. Hold these pieces in working memory: the five-bucket taxonomy (§1), the three-axis relevance test (§2), the classification decision matrix (§1.6), the match-type decision sequence (§3.3), the negative placement decision tree (§6.2), and the n-gram bucket definitions (§4.4).

### 0.3 Calibrate thresholds to account maturity

Different accounts demand different evidentiary bars. A brand-new account with 8 conversions/month cannot afford the same significance thresholds as a mature account with 8,000. Apply the maturity grade to fix the numeric thresholds for this run:

| Threshold | Nascent | Developing | Established | Advanced |
|---|---|---|---|---|
| Minimum clicks before a term is eligible for action | 5 | 10 | 15 | 20 |
| Minimum aggregate clicks before an n-gram is analyzed | 10 | 20 | 30 | 50 |
| Minimum conversions to qualify a term for EXPAND | 2 | 3 | 3 | 5 |
| High-spend flag (multiplier of target CPA) | 1.5× | 2× | 2× | 2.5× |

These four numbers are referenced by every subsequent step. Fix once, do not re-derive.

### 0.4 Checkpoint — confirm context

Surface and wait for go/no-go:

- Account name and customer ID
- Maturity grade
- Primary KPI and numeric target
- Count of brand terms loaded
- Count of negative signal patterns (split universal vs. account-specific)
- Analysis date range. Default is trailing 30 days; ask whether to change.

---

## Step 1 — Pull Search Term Data

The skill is deliberately agnostic about source. Inspect `data_source.method` in the conventions file and route to one of four paths.

### Path A: Direct API via SDK (preferred)

Use the SDK's GAQL helper with the search-term query in §R1 below. Remember `cost_micros / 1,000,000`.

### Path B: Direct GAQL via `google_ads_run_gaql_query`

If a custom query is needed (non-standard date window, campaign filter), pass directly. Parse rows into the standardized column schema (§1.5).

### Path C: Practitioner-supplied CSV

When the practitioner exports from the Google Ads UI:

- Direct them to Keywords → Search terms, set date range, download as CSV
- Strip the UTF-8 BOM before parsing
- Detect comma vs. tab separator
- Use a real CSV parser (field values contain commas and quoted strings)
- Drop the summary/total row at the bottom

### Path D: Pasted text

Accept TSV or CSV pasted directly. Apply the same column normalization.

### 1.5 Standardized columns

Regardless of source, normalize to:

**Required:** `search_term`, `campaign`, `ad_group`, `matched_keyword`, `match_type`, `impressions`, `clicks`, `cost`, `conversions`, `conv_value`

**Optional but useful:** `search_term_status`, `quality_score`, `impression_share`

### 1.6 Checkpoint — confirm load

Report total rows imported, date range actually covered (verify it matches the request), unique-term count, campaign count, total spend, total conversions, any parsing warnings (missing columns, encoding issues, currency mismatch).

---

## Step 2 — Pre-Process and Pre-Tag

Before the classifier runs, normalize the data, compute derived metrics, and pull three groups aside for special handling.

### 2.1 Normalize and derive

Apply the column-name map. Convert any cost still in micros. Standardize match types to the four-valued set: `EXACT`, `PHRASE`, `BROAD`, `AUTO` (the last for PMax).

For each row:

- `cpa = cost / conversions` (null when conversions = 0)
- `roas = conv_value / cost` (null when cost = 0)
- `conv_rate = conversions / clicks` (null when clicks = 0)
- `cpc = cost / clicks` (null when clicks = 0)

Fractional conversion counts are valid. Data-driven attribution often produces values like 0.4 conversions; these must not be rounded. A term with 0.4 conversions and $50 cost has a meaningful $125 CPA.

### 2.2 Separate brand terms

Compare each term against the brand vocabulary using fuzzy matching (catches misspellings, spacing variants, hyphenation — Levenshtein ≤ 2 per §3.4 of Part I). Any match → tag `BRAND`. Brand terms exit the pipeline here — they are neither candidates for negation nor expansion (should already be handled by a dedicated brand campaign). Report the count and aggregate metrics of the separated block.

### 2.3 Pre-tag known negative signals

Compare every non-brand term against the universal and account-specific signal lists. Any match → tag `PRE_TAGGED_NEGATIVE` with the reason. These terms still flow through Step 3 (the classifier still needs to assign placement and match type), but their relevance evaluation is short-circuited — the config has already declared them irrelevant.

### 2.4 Separate PMax terms

PMax terms cannot be analyzed with the same machinery — no matched keyword, account-level-only negatives. Tag any term from a PMax campaign as `PMAX_SOURCE` and route to Step 6. Skip this sub-step if no PMax campaigns are present.

### 2.5 Pre-processing summary

| Bucket | Term count | Spend | % of total spend |
|---|---|---|---|
| Brand (separated) | … | … | … |
| Pre-tagged negatives | … | … | … |
| PMax (separated) | … | … | … |
| Entering classification | … | … | … |

### 2.6 Checkpoint — confirm brand identification

The single most consequential error here is a false-positive brand match — it would silently exclude a term that should have been classified. Walk the practitioner through every term tagged BRAND and confirm. Also ask whether any brand terms appear to have been missed.

---

## Step 3 — Classify Each Term

For every non-brand, non-PMax term, apply the three-axis relevance test (Part I §2) and then the decision matrix (Part I §1.6).

### 3.1 Apply the decision matrix with maturity-calibrated thresholds

Using `T` (Step 0.3 minimum clicks) and `C_min` (Step 0.3 minimum conversions for EXPAND):

| Click volume | Conv. | Relevant? | Bucket |
|---|---|---|---|
| ≥ 4T | 0 | No | URGENT_NEGATIVE |
| ≥ 4T | 0 | Yes | REVIEW_MANUALLY |
| ≥ 4T | ≥ C_min | Yes | EXPAND |
| ≥ 4T | ≥ C_min | No | REVIEW_MANUALLY |
| T ≤ clicks < 4T | 0 | No | URGENT_NEGATIVE if spend > high-spend flag, else MONITOR_NEGATIVE |
| T ≤ clicks < 4T | 1–2 | Yes | REVIEW_MANUALLY |
| T ≤ clicks < 4T | 0 | Yes | REVIEW_MANUALLY |
| < T | 0 | No | MONITOR_NEGATIVE |
| < T | 0 | Yes | REVIEW_MANUALLY |
| < T | ≥ 1 | Yes | REVIEW_MANUALLY |

### 3.2 Fast-track for pre-tagged negatives

`PRE_TAGGED_NEGATIVE` terms don't need a relevance check — the config already adjudicated them. Drop them straight into a negative bucket based on spend:

- Spend > high-spend flag → `URGENT_NEGATIVE`
- Otherwise → `MONITOR_NEGATIVE`

### 3.3 EXPAND gates

A term is only promoted to `EXPAND` when all are true:

- Not already an exact-match keyword somewhere in the account
- CPA meets target (or ROAS meets target for ROAS-driven accounts)
- All three relevance checks pass
- Conversion count meets `C_min`

Any failure routes back to `REVIEW_MANUALLY`.

### 3.4 Evaluate parent keyword health

For each phrase-match keyword that triggered search terms in the window, compute:

- **Relevance rate** — fraction of triggered terms passing all three axes
- **Aggregate CPA** — total cost / total conversions across all triggered terms
- **Volume concentration** — one term dominating, or volume spread across many?

Classify each parent:

- **Healthy** — relevance rate ≥ 70% and aggregate CPA at or below target. Sub-volume triggered terms below the per-term action threshold are tagged `COVERED_BY_PARENT`; no further action.
- **Leaking** — relevance rate < 70%. Keyword is attracting noise; prioritize adding negatives rather than expanding what it triggers.
- **Exhausted** — declining volume, rising CPA. May be approaching obsolescence; consider extracting strongest triggered terms as exact-match expansions before the parent degrades further.

### 3.5 Roll-up

| Bucket | Terms | Spend | Conversions | Conv. value |
|---|---|---|---|---|
| URGENT_NEGATIVE | … | … | … | … |
| EXPAND | … | … | … | … |
| MONITOR_NEGATIVE | … | … | … | … |
| COVERED_BY_PARENT | … | … | … | … |
| REVIEW_MANUALLY | … | … | … | … |
| BRAND (separated) | … | … | … | … |
| PMAX (separate path) | … | … | … | … |

### 3.6 Checkpoint

Surface the top five `URGENT_NEGATIVE` by spend (largest immediate savings) and the top five `EXPAND` by conversion volume. Ask whether to drill into any specific term before n-gram analysis.

---

## Step 4 — N-Gram Pattern Detection

Individual-term analysis misses patterns that emerge only when many low-volume terms share a common substring. The n-gram pass closes that gap. Methodology in Part I §4.

### 4.1 Decompose

For every classified term except brand terms, generate unigrams, bigrams, trigrams (4-grams optional for very large datasets).

### 4.2 Aggregate per n-gram

Sum impressions, clicks, cost, conversions, conv. value across every term containing the n-gram. Count distinct parent terms. Derive CPA (when conv > 0) and ROAS (when cost > 0).

### 4.3 Apply the maturity-scaled volume floor

Drop any n-gram below the minimum-aggregate-click threshold from Step 0.3. Also drop n-grams appearing in only one term.

### 4.4 Bucket each surviving n-gram

Apply the bucket definitions in Part I §4.4 (Zero-Conv High-Spend / High-Converting / Brand-Adjacent / Mixed Signal / Zombie).

### 4.5 Surface new negative patterns

The valuable output is finding waste patterns the term-level pass missed. Common case: twenty terms each spent $5 with zero conversions and so were each below the action threshold, but the shared bigram spent $100 — clearly actionable. Add these n-gram-level negatives to the recommendation set built in Step 5.

### 4.6 Checkpoint

Present the top ten n-grams by spend in each bucket. Highlight newly discovered negative patterns. Ask whether to investigate a specific theme before placement begins.

---

## Step 5 — Place and Match Each Negative

Every term in `URGENT_NEGATIVE` or `MONITOR_NEGATIVE`, plus every new negative recommended by Step 4, needs two decisions: where to apply it, what match type to use.

### 5.1 Choose the placement

Walk the placement decision tree (Part I §6.2). Quick reference:

| If the term is… | Place at… |
|---|---|
| Irrelevant to the whole business | Account |
| Irrelevant to a campaign cluster sharing a theme | Shared list |
| Relevant to other campaigns but not this one | Campaign |
| Relevant to the campaign but not this ad group | Ad group |

### 5.2 Choose the match type

Walk the match-type decision sequence (Part I §3.3). Default to exact when uncertain.

### 5.3 Conflict detection

Simulate every proposed negative against the universe of positive keywords in the account (extract from the `matched_keyword` column). Apply the rules in Part I §6.4. Also check whether a campaign-level negative would block traffic another campaign legitimately wants to serve.

### 5.4 Conflict audit

Every conflict becomes a row in the audit:

- Proposed negative (keyword, match type, placement)
- Conflicting positive (campaign, ad group, match type)
- Recommended resolution (narrow match type / move placement closer / drop / accept with reason)

### 5.5 Checkpoint

Walk the entire conflict audit with the practitioner. **No conflict may remain unresolved before Step 8 generates the import CSV.** Record the resolution chosen for each.

---

## Step 6 — Performance Max Path

Skip if Step 2.4 produced no PMax-tagged terms. Methodology in Part I §8.

### 6.1 Evaluate against asset-group themes

For each PMax term, judge alignment against the asset group's inferred theme (use campaign and asset group names). Segment brand vs. non-brand. Flag any case where PMax is serving on terms the Brand Search campaign should be capturing exclusively — that is cannibalization.

### 6.2 Identify extraction candidates

PMax terms that have proven themselves (apply Part I §8.4 criteria — at least 5 conversions in the window for low-volume accounts, 50+ clicks/week and proven CPA for standard) and have no matching exact-match keyword in Search become **extraction** candidates. Promoting unlocks three things PMax cannot offer: controllable bid for the query, ad copy written for the query, landing page chosen for the query.

### 6.3 PMax-specific negatives

Irrelevant PMax terms become account-level negatives. Because account-level scope affects every campaign, every proposed PMax negative must clear conflict detection against every Search positive keyword. This is the most error-prone class of negative.

### 6.4 PMax summary

Produce: brand vs. non-brand split by impressions and cost; extraction candidates with metrics; account-level negative recommendations sourced from PMax; cannibalization flags.

### 6.5 Checkpoint

Extraction and cannibalization are strategic decisions, not mechanical ones. Surface to the practitioner and wait for direction before acting.

---

## Step 7 — Triage the Gray Area

Every term in `REVIEW_MANUALLY` needs structured presentation so the practitioner can move through the queue quickly. Methodology in Part I §5.

### 7.1 Run the four-part diagnostic

For each gray-area term, apply Part I §5.1–§5.4: keyword diagnostic, ad diagnostic, landing page diagnostic, attribution diagnostic.

### 7.2 Assign confidence and group

Sort terms into high / medium / low confidence per Part I §5.5.

### 7.3 Present each gray-area term

Each entry shows: the search term, triggering keyword and match type, campaign and ad group, full metrics, which diagnostics raised flags, confidence band and reasoning, recommended action. Use the output template in Part I §5.5.

### 7.4 Checkpoint

Walk the practitioner through high-confidence first (fastest decisions), then medium, then low. Low-confidence may be deferred to the next review cycle by mutual agreement. Record every decision — feeds Step 8.

---

## Step 8 — Generate the Deliverables

Five artifacts. CSV import files conform exactly to Google Ads Editor format (R5 below). The three Markdown reports are practitioner documentation.

### Artifact 1: Negative Keyword CSV

- File pattern: `{account_slug}_negative_keywords_{YYYY-MM-DD}.csv`
- Columns: `Campaign, Ad Group, Keyword, Criterion Type, Status`
- Contents: every confirmed negative from Steps 3 (URGENT_NEGATIVE, MONITOR_NEGATIVE) and 4 (new n-gram patterns), with placement and match type from Step 5
- Exclusions: any negative removed during conflict resolution
- Sort: account-level first, then shared-list, then campaign-level, then ad-group-level. Within each tier, sort by original term spend descending.

### Artifact 2: Expansion Keyword CSV

- File pattern: `{account_slug}_expansion_keywords_{YYYY-MM-DD}.csv`
- Columns: `Campaign, Ad Group, Keyword, Match Type, Max CPC, Final URL, Status`
- Contents: every confirmed EXPAND term, assigned to the campaign and ad group where it converted (or to a recommended new ad group if the theme warrants it)
- Special handling: leave `Max CPC` blank when the target campaign uses Smart Bidding. Set `Status` to `Paused` for any expansion the practitioner wants to inspect first.

### Artifact 3: N-Gram Report (Markdown)

- File pattern: `{account_slug}_ngram_analysis_{YYYY-MM-DD}.md`
- Columns: N-gram | Type | Bucket | # of terms | Clicks | Cost | Conversions | ROAS or CPA | Recommended action
- Sorted by spend descending within each bucket
- Sections: Zero-Conv High-Spend, High-Converting, Brand-Adjacent, Mixed Signal

### Artifact 4: Conflict Audit (Markdown)

- File pattern: `{account_slug}_conflict_audit_{YYYY-MM-DD}.md`
- Lists every conflict found in Step 5: proposed negative, conflicting positive, resolution applied, practitioner's recorded reasoning.

### Artifact 5: Summary Dashboard (Markdown)

A single-page executive brief. File pattern: `{account_slug}_search_term_summary_{YYYY-MM-DD}.md`.

```markdown
# Search Term Mining Summary: {Account Name}
## Analysis Window: {start_date} to {end_date}
## Maturity Grade: {maturity_level}

### Classification Overview
| Category | Terms | Spend | % of total | Conversions | Conv. value |

### Immediate Savings Opportunity
- Spend on URGENT_NEGATIVE: ${amount} ({percent}% of total)
- Estimated monthly recurring savings if applied today: ${amount}

### Expansion Opportunity
- Number of EXPAND terms: {n}
- Aggregate conversions across them: {n}

### Top 5 Negatives by Spend
### Top 5 Expansion Candidates

### N-Gram Discoveries
- Newly identified negative patterns: {n}
- Newly identified expansion themes: {n}

### PMax (when present)
- Brand cannibalization flagged: yes/no
- Extraction candidates surfaced: {n}

### Conflict Resolution
- Total conflicts: {n}
- Resolved by narrowing match type: {n}
- Resolved by changing placement: {n}
- Removed: {n}

### Gray Area Queue
- High confidence pending review: {n}
- Medium confidence pending review: {n}
- Low confidence pending more data: {n}
```

### Final Checkpoint

Present the dashboard. Confirm completeness. Offer four next moves:

1. Deep-dive any section
2. Reconsider any classification before the CSV files are finalized
3. Re-run the entire pipeline with adjusted parameters (different window, different thresholds)
4. Save the artifact set to a specified location

---

## Edge Cases and Error Handling

### Too little data

Fewer than 50 search terms in the chosen window → warn that pattern significance will be low. Run only Steps 0–3 and 7–8; skip n-gram analysis (Step 4) and PMax evaluation (Step 6). Recommend a wider date range.

### Missing required columns

If any of the five required columns (`search_term`, `campaign`, `clicks`, `cost`, `conversions`) is missing, stop immediately and identify which one. Do not attempt partial classification — both cost and conversions are mandatory for the matrix to function.

### Zero conversions across the entire dataset

Conversion-driven classification cannot run. Every term collapses to either `URGENT_NEGATIVE` (clearly irrelevant) or `REVIEW_MANUALLY` (potentially relevant). Suppress `EXPAND` entirely. Surface a high-priority warning that the account may have a conversion-tracking failure.

### Currency mismatch

When the data's currency differs from the conventions file, confirm with the practitioner before proceeding. Do not auto-convert. All numeric thresholds apply in the data's native currency.

---

# Reference Material

## R1 — GAQL Queries

### Search and Shopping search terms

```sql
SELECT
  search_term_view.search_term,
  search_term_view.status,
  campaign.name,
  campaign.id,
  ad_group.name,
  ad_group.id,
  segments.keyword.info.text,
  segments.keyword.info.match_type,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.all_conversions,
  metrics.all_conversions_value
FROM search_term_view
WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND metrics.impressions > 0
ORDER BY metrics.cost_micros DESC
```

- Date format: ISO-8601 (`YYYY-MM-DD`)
- `cost_micros` is millionths of the account currency. Divide by 1,000,000 to recover spend. `cost_micros = 12480000` → $12.48.
- `search_term_view.status` values: `ADDED`, `EXCLUDED`, `ADDED_EXCLUDED`, `NONE`.

### PMax search-term insights

PMax does not expose individual queries through `search_term_view`. Use `campaign_search_term_insight` — it returns a hierarchical category label (e.g., `Home & Garden > Furniture > Office Chairs`) rather than the literal query.

```sql
SELECT
  campaign_search_term_insight.category_label,
  campaign.name,
  campaign.id,
  metrics.clicks,
  metrics.impressions,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM campaign_search_term_insight
WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND campaign.advertising_channel_type = 'PERFORMANCE_MAX'
  AND metrics.impressions > 0
ORDER BY metrics.cost_micros DESC
```

For some accounts, exact PMax search terms are available in the UI under Insights → Search terms. If exportable, parse that CSV via Path C in Step 1.

## R2 — Pulling Data From the UI

1. Sign in at ads.google.com
2. Select the target account
3. Open Insights and reports → Search terms (or Keywords → Search terms)
4. Set the date range
5. Apply campaign or ad-group filters if you want a subset
6. Click the download icon → CSV → save

Before downloading, confirm: "All campaigns" selected unless filtering on purpose; date range matches the analysis window; the Columns picker exposes Search term, Campaign, Ad group, Keyword, Match type, Impressions, Clicks, Cost, Conversions, Conv. value.

## R3 — CSV Parsing Gotchas

- **Byte-order mark** — UTF-8 BOM (`\xef\xbb\xbf`) often prefixes the file; corrupts the first column header. In Python, open with `encoding='utf-8-sig'`.
- **Separator detection** — most exports are comma-separated; some locales export tab-separated. Use `csv.Sniffer().sniff()` on the first line.
- **Quoted fields** — campaign and ad-group names can contain commas. Always use a proper CSV parser, never naive splitting.
- **Currency formatting** — values may contain currency symbols, thousands separators (commas in US, periods in EU), and locale-specific decimal separators. Strip non-numeric characters except the decimal separator. Use the account's currency setting to know which separator means what.
- **Summary rows** — exports include a trailing total row, usually with an empty search-term field or the literal "Total." Drop any row where `search_term` is empty or contains "Total"/"Summary."
- **Currency mismatch** — if the export's currency disagrees with the conventions file, surface to the practitioner; do not auto-convert.

## R4 — Column Normalization Map

| Standard name | UI label | GAQL field | Notes |
|---|---|---|---|
| `search_term` | Search term | `search_term_view.search_term` | The literal user query |
| `search_term_status` | Search term status | `search_term_view.status` | `ADDED`, `EXCLUDED`, `ADDED_EXCLUDED`, `NONE` |
| `campaign` | Campaign | `campaign.name` | Campaign name as displayed |
| `campaign_id` | Campaign ID | `campaign.id` | Numeric ID |
| `ad_group` | Ad group | `ad_group.name` | Ad group name |
| `ad_group_id` | Ad group ID | `ad_group.id` | Numeric ID |
| `matched_keyword` | Keyword | `segments.keyword.info.text` | Triggering keyword |
| `match_type` | Match type | `segments.keyword.info.match_type` | `EXACT`, `PHRASE`, `BROAD` |
| `impressions` | Impr. | `metrics.impressions` | Integer |
| `clicks` | Clicks | `metrics.clicks` | Integer |
| `cost` | Cost | `metrics.cost_micros / 1,000,000` | Currency value |
| `conversions` | Conversions | `metrics.conversions` | Fractional values are valid |
| `conv_value` | Conv. value | `metrics.conversions_value` | Currency value |
| `all_conversions` | All conv. | `metrics.all_conversions` | Includes non-primary conversion actions |
| `all_conv_value` | All conv. value | `metrics.all_conversions_value` | Value of all conversions |

UI headers vary by language, account UI version, and currency. Common variants:

| Standard | Variant A | Variant B | Variant C |
|---|---|---|---|
| `impressions` | Impr. | Impressions | Impr |
| `cost` | Cost | Avg. cost | Cost (USD) |
| `conversions` | Conversions | Conv. | Conversions (by conv. time) |
| `conv_value` | Conv. value | Conversion value | Total conv. value |
| `matched_keyword` | Keyword | Search keyword | — |
| `match_type` | Match type | Keyword match type | Search term match type |

When parsing, try all known variants. If a required column cannot be matched, report which and stop.

## R5 — Output CSV Specifications

All CSV outputs target Google Ads Editor's import format. Conform exactly:

- Field separator: comma
- Encoding: UTF-8 without BOM
- Quote any field containing commas, double quotes, or newlines
- Escape embedded double quotes by doubling them
- Header row first; no trailing blank line
- Line endings: CRLF (`\r\n`) for Editor compatibility on Windows

### Negative Keyword CSV

```csv
Campaign,Ad Group,Keyword,Criterion Type,Status
```

| Column | Rule |
|---|---|
| Campaign | Empty for account-level or shared-list; populated for campaign- and ad-group-level |
| Ad Group | Empty unless ad-group-level |
| Keyword | Match-type-encoded: exact `[brackets]`, phrase `"quotes"`, broad no wrapping |
| Criterion Type | `Negative exact`, `Negative phrase`, or `Negative broad` |
| Status | Always `Active` |

Both the bracket/quote convention and the explicit `Criterion Type` column are required — different Editor import paths read different ones; populating both prevents mapping errors.

Sort order: account-level first; campaign-level (Campaign filled, Ad Group blank) sorted by campaign name; ad-group-level (both filled) sorted by campaign then ad group. Within any tier, secondary sort by original term spend descending.

Editor import sequence: Account → Import → From file (or Paste text) → choose CSV → confirm column-mapping prompts → review Proposed changes (verify account-level negatives land under Account > Negative keywords, campaign-level under right campaigns) → Post.

### Expansion Keyword CSV

```csv
Campaign,Ad Group,Keyword,Match Type,Max CPC,Final URL,Status
```

| Column | Rule |
|---|---|
| Campaign | Must match existing campaign exactly, or specify new |
| Ad Group | Must match existing or new |
| Keyword | Same `[brackets]` / `"quotes"` / no-wrap convention |
| Match Type | `Exact`, `Phrase`, `Broad` |
| Max CPC | Blank for Smart Bidding campaigns (tCPA, tROAS, Max Conversions, Max Conv. Value). Populate for Manual CPC and eCPC. |
| Final URL | Optional. Use when intent maps to a non-default landing page. |
| Status | `Active` for immediate go-live, `Paused` when the practitioner wants to inspect first |

Sort: `Active` first then `Paused`; within each, by conversion volume descending.

### Shared Negative Keyword List CSV

```csv
Shared Set,Keyword,Criterion Type
```

| Column | Rule |
|---|---|
| Shared Set | Existing shared-list name, or new name to create |
| Keyword | Same match-type encoding as the other negative file |
| Criterion Type | `Negative exact`, `Negative phrase`, or `Negative broad` |

Editor's shared-list import path can be flaky. If it fails, the practitioner can paste keywords directly into Tools and Settings → Shared Library → Negative keyword lists in the web UI.

### Output file summary

| Artifact | File pattern | Format | Import target |
|---|---|---|---|
| Negative keywords | `{slug}_negative_keywords_{date}.csv` | CSV | Editor → Keywords → Negative keywords |
| Expansion keywords | `{slug}_expansion_keywords_{date}.csv` | CSV | Editor → Keywords → Keywords |
| Shared negatives | `{slug}_shared_negatives_{date}.csv` | CSV | Editor → Shared library → Negative keyword lists |
| N-gram analysis | `{slug}_ngram_analysis_{date}.md` | Markdown | Reference only |
| Conflict audit | `{slug}_conflict_audit_{date}.md` | Markdown | Reference only |
| Summary dashboard | `{slug}_search_term_summary_{date}.md` | Markdown | Reference only |

## R6 — Data Minimums

Non-negotiable: `search_term`, `campaign`, `clicks`, `cost`, `conversions`. Without any of them the pipeline halts at Step 1.

Strongly recommended but not strictly required:

- `matched_keyword` — without it, the three-axis test degrades to two axes. Flag this and lower stated confidence.
- `ad_group` — needed for ad-group-level placement decisions
- `conv_value` — required for ROAS-driven KPI targets
- `match_type` — useful for diagnosing broad-match waste

---

# Worked Walkthrough: A Fictional Knife Retailer

The following end-to-end example uses an invented eCommerce account ("EdgeCraft Knives") to demonstrate every step. All numbers, campaign names, and keywords are fictional.

## Account Profile

- **Business:** EdgeCraft Knives — fictional DTC premium kitchen knife brand on Shopify
- **Maturity:** Developing (roughly 25 conversions/month)
- **Primary KPI:** ROAS, target 4.0×
- **Brand vocabulary:** `edgecraft`, `edge craft`, `edgecraft knives`
- **Universal negative signals:** jobs, careers, salary, free, DIY, how to, reddit, quora
- **Account-specific negative signals:** wholesale, used, rental
- **Campaign topology:**
  - Brand Search (brand-term coverage)
  - Non-Brand Search: Product Terms (chef knives, knife sets)
  - Non-Brand Search: Gift Terms (knife gifts, kitchen gifts)
  - PMax: All Products

Applying the "Developing" row of the threshold matrix:

- Minimum clicks for term action: 10
- N-gram volume floor: 20 clicks
- Minimum conversions for EXPAND: 3
- High-spend flag: 2× target CPA. At a 4× ROAS target and implied $50 CPA, the flag triggers at $100 in zero-conv spend.

## Raw Input (20 Synthetic Terms)

| # | Search Term | Campaign | Ad Group | Matched Keyword | MT | Impr | Clicks | Cost | Conv | Value |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | best japanese chef knife | NB: Product | Chef Knives | japanese chef knife | Phrase | 1,240 | 87 | $174.00 | 5 | $745.00 |
| 2 | edgecraft knives review | Brand Search | Brand Core | edgecraft knives | Phrase | 320 | 48 | $24.00 | 8 | $1,120.00 |
| 3 | knife sharpening jobs near me | NB: Product | Chef Knives | knife sharpening | Broad | 890 | 34 | $108.80 | 0 | $0.00 |
| 4 | 8 inch chef knife | NB: Product | Chef Knives | chef knife | Broad | 960 | 62 | $130.20 | 4 | $596.00 |
| 5 | cheap knife set walmart | NB: Product | Knife Sets | knife set | Broad | 540 | 18 | $36.00 | 0 | $0.00 |
| 6 | professional knife set for chefs | NB: Product | Knife Sets | professional knife set | Phrase | 780 | 55 | $126.50 | 3 | $537.00 |
| 7 | how to sharpen a knife at home | NB: Product | Chef Knives | knife sharpening | Broad | 1,600 | 42 | $84.00 | 0 | $0.00 |
| 8 | knife block | NB: Product | Knife Sets | knife set | Broad | 620 | 28 | $64.40 | 1 | $89.00 |
| 9 | free kitchen knife set | NB: Gift | kitchen knife gift | (broad) | Broad | 310 | 12 | $30.00 | 0 | $0.00 |
| 10 | best gift for home chef | NB: Gift | kitchen gifts | (broad) | Broad | 440 | 22 | $55.00 | 2 | $298.00 |
| 11 | knife sharpening service cost | NB: Product | Chef Knives | knife sharpening | Broad | 380 | 15 | $48.00 | 0 | $0.00 |
| 12 | damascus steel chef knife | NB: Product | Chef Knives | chef knife | Broad | 520 | 38 | $83.60 | 3 | $594.00 |
| 13 | kitchen knives reddit | NB: Product | Chef Knives | kitchen knives | Broad | 290 | 8 | $16.00 | 0 | $0.00 |
| 14 | edge craft coupon code | Brand Search | Brand Core | edge craft | Phrase | 180 | 26 | $13.00 | 3 | $387.00 |
| 15 | wholesale knife supplier | NB: Product | Knife Sets | knife set | Broad | 150 | 6 | $13.80 | 0 | $0.00 |
| 16 | knife set for culinary students | NB: Product | Knife Sets | knife set | Broad | 280 | 14 | $32.20 | 1 | $149.00 |
| 17 | premium kitchen knives | PMax | All Products | (n/a) | Auto | 2,100 | 95 | $199.50 | 6 | $948.00 |
| 18 | best knife for cutting vegetables | NB: Product | Chef Knives | chef knife | Broad | 360 | 19 | $41.80 | 1 | $139.00 |
| 19 | used chef knives for sale | NB: Product | Chef Knives | chef knives | Broad | 210 | 9 | $20.70 | 0 | $0.00 |
| 20 | knife careers culinary school | NB: Product | Chef Knives | knife | Broad | 170 | 5 | $11.50 | 0 | $0.00 |

Totals: 12,340 impressions, 647 clicks, $1,313.00 cost, 37 conversions, $5,751.00 conv. value.

## Step 2 in Action

**Brand separations:** terms #2 and #14. Aggregate: $37.00 spend, 11 conversions, $1,507.00 value — 26.2% of total conv. value but only 2.8% of spend, exactly the brand-campaign profile you would expect.

**Pre-tagged negatives:** seven matches against the signal lists.

| Term # | Trigger | Signal source |
|---|---|---|
| 3 | "jobs" | Universal |
| 7 | "how to" | Universal |
| 9 | "free" | Universal |
| 13 | "reddit" | Universal |
| 15 | "wholesale" | Account-specific |
| 19 | "used" | Account-specific |
| 20 | "careers" | Universal |

These seven total $284.00 — 21.6% of non-brand spend, all producing zero conversions.

**PMax separation:** term #17 routes to Step 6.

| Bucket | Count | Spend | % of total |
|---|---|---|---|
| Brand | 2 | $37.00 | 2.8% |
| Pre-tagged negatives | 7 | $284.00 | 21.6% |
| PMax | 1 | $199.50 | 15.2% |
| Entering classification | 10 | $792.50 | 60.4% |

## Step 3 in Action

### Fast-track for pre-tagged negatives

Spend-based split (high-spend flag = $100):

| Term | Spend | Bucket | Why |
|---|---|---|---|
| #3 knife sharpening jobs near me | $108.80 | URGENT_NEGATIVE | Above the $100 flag and clearly irrelevant |
| #7 how to sharpen a knife at home | $84.00 | MONITOR_NEGATIVE | Below the flag |
| #9 free kitchen knife set | $30.00 | MONITOR_NEGATIVE | Below the flag |
| #13 kitchen knives reddit | $16.00 | MONITOR_NEGATIVE | Below the flag |
| #15 wholesale knife supplier | $13.80 | MONITOR_NEGATIVE | Below the flag |
| #19 used chef knives for sale | $20.70 | MONITOR_NEGATIVE | Below the flag |
| #20 knife careers culinary school | $11.50 | MONITOR_NEGATIVE | Below the flag |

### Full classification on the remaining ten

- **#1 "best japanese chef knife"** — 87 clicks, 5 conv., ROAS 4.28×. All axes align. → **EXPAND**.
- **#4 "8 inch chef knife"** — 62 clicks, 4 conv., 4.58× ROAS. Variant of an existing chef knife keyword. → **EXPAND**.
- **#5 "cheap knife set walmart"** — 18 clicks, 0 conv., $36 spend. Intent mismatch (price-led + competing channel). Below high-spend flag. → **MONITOR_NEGATIVE**.
- **#6 "professional knife set for chefs"** — 55 clicks, 3 conv., 4.24× ROAS. All axes align. → **EXPAND**.
- **#8 "knife block"** — 28 clicks, 1 conv., 1.38× ROAS. Loose keyword match (a knife block isn't a knife set); answer depends on whether the brand sells knife blocks. → **REVIEW_MANUALLY**.
- **#10 "best gift for home chef"** — 22 clicks, 2 conv., 5.42× ROAS. Strong signal but conversions just below the 3-conv. EXPAND floor. → **REVIEW_MANUALLY**.
- **#11 "knife sharpening service cost"** — 15 clicks, 0 conv., $48 spend. Service intent, not product intent. → **MONITOR_NEGATIVE**.
- **#12 "damascus steel chef knife"** — 38 clicks, 3 conv., 7.10× ROAS. → **EXPAND**.
- **#16 "knife set for culinary students"** — 14 clicks, 1 conv., 4.63× ROAS. Audience uncertain. → **REVIEW_MANUALLY**.
- **#18 "best knife for cutting vegetables"** — 19 clicks, 1 conv., 3.33× ROAS. Relevant but underperforming. → **REVIEW_MANUALLY**.

### Classification rollup

| Bucket | Terms | Spend | Conv. | Value |
|---|---|---|---|---|
| URGENT_NEGATIVE | 1 | $108.80 | 0 | $0.00 |
| EXPAND | 4 | $514.30 | 15 | $2,472.00 |
| MONITOR_NEGATIVE | 7 | $212.00 | 0 | $0.00 |
| REVIEW_MANUALLY | 4 | $193.40 | 5 | $675.00 |
| BRAND | 2 | $37.00 | 11 | $1,507.00 |
| PMAX | 1 | $199.50 | 6 | $948.00 |

## Step 4 in Action

Unigrams worth surfacing:

| N-gram | Terms | Clicks | Cost | Conv. | ROAS | Bucket |
|---|---|---|---|---|---|---|
| knife | 16 | 551 | $1,070.50 | 26 | 4.86× | Mixed Signal (too broad to act on) |
| chef | 7 | 287 | $589.60 | 16 | 4.55× | High-Converting |
| sharpening | 3 | 91 | $240.80 | 0 | 0.00× | Zero-Conv High-Spend |
| set | 5 | 82 | $198.40 | 4 | 3.79× | Mixed Signal |
| kitchen | 3 | 42 | $100.50 | 2 | 4.35× | Mixed Signal (low volume) |

Bigrams:

| N-gram | Terms | Clicks | Cost | Conv. | ROAS | Bucket |
|---|---|---|---|---|---|---|
| chef knife | 5 | 225 | $471.40 | 13 | 5.11× | High-Converting |
| knife set | 4 | 60 | $118.00 | 4 | 5.85× | High-Converting |
| knife sharpening | 3 | 91 | $240.80 | 0 | 0.00× | Zero-Conv High-Spend |
| how to | 1 | 42 | $84.00 | 0 | 0.00× | Already tagged |

Trigrams:

| N-gram | Terms | Clicks | Cost | Conv. | ROAS | Bucket |
|---|---|---|---|---|---|---|
| knife sharpening jobs | 1 | 34 | $108.80 | 0 | 0.00× | Already tagged |
| knife sharpening service | 1 | 15 | $48.00 | 0 | 0.00× | Zero-Conv |

**Pattern surfaced:** the bigram "knife sharpening" totals $240.80 across three terms with zero conversions. Two were already pre-tagged, but term #11 was only at MONITOR. The n-gram view tells a sharper story than the term view: the concept itself is bad. Recommend a campaign-level **negative phrase** on `"knife sharpening"` rather than individually negating the terms.

**Expansion theme confirmed:** the bigram "chef knife" appears across 5 terms with 5.11× aggregate ROAS — the Chef Knives ad group is correctly themed.

## Step 5 in Action

Proposed negatives:

| Keyword | Match Type | Placement | Reason | Source |
|---|---|---|---|---|
| jobs | Negative broad | Account | Universal negative | Pre-tag + n-gram |
| careers | Negative broad | Account | Universal | Pre-tag |
| free | Negative phrase | Account | Universal | Pre-tag |
| how to | Negative phrase | Account | Universal | Pre-tag |
| reddit | Negative broad | Account | Universal | Pre-tag |
| wholesale | Negative broad | Account | Account-specific | Pre-tag |
| used | Negative broad | Account | Account-specific | Pre-tag |
| knife sharpening | Negative phrase | Campaign: NB Product | Concept-level waste, $240.80 | N-gram |
| [cheap knife set walmart] | Negative exact | Ad Group: Knife Sets | Channel/price mismatch | Classification |

**Conflict detected.** Proposed negative phrase `"knife sharpening"` in NB Product would block the positive broad-match keyword `knife sharpening` in the Chef Knives ad group.

That conflict is informative, not problematic. The positive keyword `knife sharpening` has burned 91 clicks and $240.80 with zero conversions — it is itself the problem. Recommended resolution: add the negative AND pause the positive. (Option B: keep the positive and only negate the specific bad terms via exact-match negatives. Less aggressive, but the data argues for Option A.)

No other conflicts arise. The account-level broad negatives (jobs, careers, free, wholesale, used, reddit) do not collide with any positive keyword.

## Step 6 in Action

**Term #17 "premium kitchen knives":** 95 clicks, $199.50 spend, 6 conversions, $948 value, 4.75× ROAS.

- Strategic fit: strong, on-theme for a premium knife retailer
- Search coverage: not currently bid on as exact match in NB Product
- Verdict: **extraction candidate.** Recommend adding `[premium kitchen knives]` as exact-match keyword in NB Product / Chef Knives. PMax retains broader thematic coverage; Search gets bid control, ad-copy specificity, and landing-page alignment for the high-value query.

No brand cannibalization in this one-term sample. In a real run, check whether PMax serves on `edgecraft knives` — that would be a serious leak from Brand Search.

## Step 7 in Action

**Group 1 (high confidence).** Term #10 "best gift for home chef" — 2 conv. at 5.42× ROAS, one conversion short of the EXPAND threshold. Recommend two more weeks of monitoring; if conversion #3 arrives, promote.

**Group 2 (medium confidence).**

- Term #8 "knife block": loose keyword match. If EdgeCraft sells knife blocks, this is a landing-page problem — give it its own ad group with the right LP. If it doesn't, add `[knife block]` as a negative exact. Practitioner input required.
- Term #18 "best knife for cutting vegetables": relevant but 3.33× ROAS is below the 4.0× target with only one conversion. Could be undersampled or an LP issue. Monitor; if ROAS stays under 3× after 30+ more clicks, treat as a LP candidate.

**Group 3 (low confidence).** Term #16 "knife set for culinary students" — 14 clicks, 1 conv., 4.63× ROAS. Real but undersampled. Recommend waiting until 20+ clicks before deciding.

## Step 8 in Action

### Negative Keyword CSV (excerpt)

```csv
Campaign,Ad Group,Keyword,Criterion Type,Status
"","",jobs,"Negative broad","Active"
"","",careers,"Negative broad","Active"
"","","free","Negative phrase","Active"
"","","how to","Negative phrase","Active"
"","",reddit,"Negative broad","Active"
"","",wholesale,"Negative broad","Active"
"","",used,"Negative broad","Active"
"Non-Brand Search: Product Terms","","knife sharpening","Negative phrase","Active"
"Non-Brand Search: Product Terms","Knife Sets","[cheap knife set walmart]","Negative exact","Active"
```

### Expansion Keyword CSV (excerpt)

```csv
Campaign,Ad Group,Keyword,Match Type,Max CPC,Final URL,Status
"Non-Brand Search: Product Terms","Chef Knives","[best japanese chef knife]","Exact","","","Active"
"Non-Brand Search: Product Terms","Chef Knives","[8 inch chef knife]","Exact","","","Active"
"Non-Brand Search: Product Terms","Knife Sets","[professional knife set for chefs]","Exact","","","Active"
"Non-Brand Search: Product Terms","Chef Knives","[damascus steel chef knife]","Exact","","","Active"
"Non-Brand Search: Product Terms","Chef Knives","[premium kitchen knives]","Exact","","","Active"
```

(The final row is the PMax extraction.)

### N-Gram Report (top entries)

| N-gram | Type | Bucket | Terms | Clicks | Cost | Conv. | ROAS | Action |
|---|---|---|---|---|---|---|---|---|
| knife sharpening | Bigram | Zero-Conv High-Spend | 3 | 91 | $240.80 | 0 | 0.00× | Add campaign-level negative phrase + pause positive keyword |
| chef knife | Bigram | High-Converting | 5 | 225 | $471.40 | 13 | 5.11× | Theme confirmed; expand top variants to exact match |
| knife set | Bigram | High-Converting | 4 | 60 | $118.00 | 4 | 5.85× | Expand strongest variants to exact match |
| knife | Unigram | Mixed Signal | 16 | 551 | $1,070.50 | 26 | 4.86× | Too broad to act on; defer to bigram/trigram level |

### Summary Dashboard

```markdown
# Search Term Mining Summary: EdgeCraft Knives
## Analysis Window: 2026-02-25 to 2026-03-26
## Maturity Grade: Developing

### Classification Overview
| Category | Terms | Spend | % of total | Conv. | Conv. value |
|---|---|---|---|---|---|
| URGENT_NEGATIVE | 1 | $108.80 | 8.3% | 0 | $0.00 |
| EXPAND | 4 | $514.30 | 39.2% | 15 | $2,472.00 |
| MONITOR_NEGATIVE | 7 | $212.00 | 16.1% | 0 | $0.00 |
| REVIEW_MANUALLY | 4 | $193.40 | 14.7% | 5 | $675.00 |
| BRAND | 2 | $37.00 | 2.8% | 11 | $1,507.00 |
| PMAX | 1 | $199.50 | 15.2% | 6 | $948.00 |
| **TOTAL** | **20** | **$1,313.00** | **100%** | **37** | **$5,751.00** |

### Immediate Savings Opportunity
- URGENT_NEGATIVE spend: $108.80 (8.3%)
- MONITOR_NEGATIVE spend: $212.00 (16.1%)
- Combined waste: $320.80 (24.4% of total)
- Estimated monthly recurring savings: $320.80

### Expansion Opportunity
- 5 EXPAND terms (including 1 PMax extraction), 21 conversions combined
- Combined ROAS on expansion candidates: 4.81×

### Top 5 Negatives by Spend
| Term | Campaign | Spend | Clicks | Reason |
|---|---|---|---|---|
| knife sharpening jobs near me | NB Product | $108.80 | 34 | Employment intent ("jobs") |
| how to sharpen a knife at home | NB Product | $84.00 | 42 | Informational intent ("how to") |
| cheap knife set walmart | NB Product | $36.00 | 18 | Price/channel mismatch |
| free kitchen knife set | NB Gift | $30.00 | 12 | Freebie-seeking ("free") |
| used chef knives for sale | NB Product | $20.70 | 9 | Secondhand intent ("used") |

### Top 5 Expansion Candidates
| Term | Campaign | Conv. | Value | ROAS |
|---|---|---|---|---|
| best japanese chef knife | NB Product | 5 | $745.00 | 4.28× |
| premium kitchen knives | PMax (extract) | 6 | $948.00 | 4.75× |
| 8 inch chef knife | NB Product | 4 | $596.00 | 4.58× |
| professional knife set for chefs | NB Product | 3 | $537.00 | 4.24× |
| damascus steel chef knife | NB Product | 3 | $594.00 | 7.10× |

### N-Gram Patterns Discovered
- New negative patterns: 1 ("knife sharpening" elevated to concept-level negative)
- New expansion themes confirmed: 2 ("chef knife", "knife set")

### PMax Findings
- Brand cannibalization detected: No (in this sample)
- Extraction candidates: 1 ("premium kitchen knives", 6 conv., 4.75×)

### Conflicts Detected and Resolved
- Total: 1
- Resolved by pausing the conflicting positive keyword: 1
- Resolved by narrowing match type: 0
- Removed: 0

### Gray Area Queue
- High confidence: 1
- Medium confidence: 2
- Low confidence: 1
```

## Lessons This Example Surfaces

1. **The configuration carried most of the negative identification.** Seven of the eight final negatives came directly from the universal and account-specific signal lists. Only `cheap knife set walmart` required the classification matrix. Investment in a thorough signal list pays back on every run.

2. **N-gram analysis caught what term-level missed.** The bigram `knife sharpening` revealed that the *parent keyword* — not just its triggered terms — was the leak. The recommendation to pause the positive keyword came from pattern-level evidence; no individual term carried that signal on its own.

3. **PMax extraction surfaces hidden high-value keywords.** `premium kitchen knives` was buried inside PMax with no dedicated Search coverage. Pulling it into a Search campaign gives the query its own bid lever, its own ad copy, and its own landing page — three knobs PMax simply does not expose.

4. **Some terms cannot be classified without business context.** `knife block` is unanswerable without knowing whether the catalog includes knife blocks. The framework correctly refused to guess and routed it to manual review.

5. **24.4% of spend was waste.** For a Developing account running roughly $1,300/month, recovering $320.80 is a meaningful first-week deliverable — and most of it required only configuration, not deep analysis.
