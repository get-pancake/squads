---
name: pancake_account_foundations
description: The foundational setup and calibration layer for the Google Ads Analysis Toolkit. This skill owns both the account configuration substrate — where agency, account, KPI, brand, negative, feed, local, reporting, and data-source data lives — and the maturity model that grades each account against four sophistication stages (nascent, developing, established, advanced). Every other skill in the toolkit reads its account context and its analysis depth from here, so this is the file you touch when onboarding an agency, registering a new account, refreshing KPI targets, editing brand or negative lists, reassessing maturity, or whenever a downstream skill complains that account context is missing. It is not an analysis skill — it produces no diagnostics of its own. For ongoing per-account analysis, hand off to pancake_orchestrator or the individual action skills.
triggers:
  - "account conventions"
  - "account setup"
  - "configure accounts"
  - "add google ads account"
  - "update account config"
  - "toolkit setup"
  - "account maturity"
  - "maturity model"
  - "maturity level"
  - "account sophistication"
---

# Account Foundations

This skill is the configuration substrate of the toolkit and the methodology that calibrates how each account is analysed. If a piece of information is specific to an agency, a client, an account, a location, a product feed, or a KPI, it belongs here. If a rule of thumb depends on how mature an account is — how much segmentation to recommend, which bidding strategies are appropriate, what counts as enough data — it also belongs here. Action skills are intentionally generic; they read what they need from this file at the start of every run.

## Where the Config Lives

You have two equally valid storage options:

1. **Inline inside this SKILL.md.** Append the YAML below the closing `---` marker of the frontmatter. The runtime preserves anything you add after the end marker through SDK regenerations, so the config survives upgrades.
2. **As a sibling file at `pancake_account_foundations/config.yaml`** inside the toolkit directory.

Pick one location per agency and stick with it. If an action skill is invoked and cannot find a config at either location, it should hand off to this skill and run the setup interview before continuing.

---

## What the Config Contains

The full schema follows. Optional sections (product feed, local config, business lines) only appear when the relevant capability flag is true.

```yaml
agency:
  name: <string>
  slug: <string>                # lowercase, hyphenated, derived from name
  mcc_id: <string>              # 10-digit Manager Account ID, optional

accounts:
  - name: <string>              # exactly as displayed in Google Ads
    slug: <string>              # lowercase, hyphenated
    cid: <string>               # 10-digit Customer ID, no dashes
    currency: <ISO 4217>        # USD, EUR, GBP, CAD, AUD, ...
    timezone: <IANA timezone>   # e.g. America/New_York
    business_model: <lead_gen | ecommerce | saas | local | dual>
    maturity_level: <nascent | developing | established | advanced>
    monthly_conversion_volume: <number>
    status: <active | paused | onboarding>

    # Capability flags — drive which action skills apply to this account
    has_offline_conversions: <boolean>
    has_gbp: <boolean>
    has_merchant_center: <boolean>
    has_youtube_campaigns: <boolean>
    has_demand_gen_campaigns: <boolean>
    campaign_types_active:
      - <search | pmax | shopping | display | demand_gen | youtube | local | lsa>

    # KPI configuration
    primary_kpi: <cpa | roas | cpl | cpv | cpm>
    primary_kpi_target: <number>
    secondary_kpi: <string>
    secondary_kpi_target: <number>
    flag_thresholds:
      critical: <number>        # red-flag boundary
      warning: <number>         # yellow-flag boundary

    # Naming and tracking
    campaign_naming_pattern: <regex or human description>
    campaign_naming_convention: <regex or human description>
    has_utm_tracking: <boolean>
    utm_enforcement: <required | recommended>
    special_handling_notes: <string>

    # Conversion action inventory
    conversion_actions:
      - name: <string>          # as displayed in Google Ads
        classification: <primary | secondary | micro>
        include_in_maturity: <boolean>
        include_in_reporting: <boolean>
        value: <dynamic | static | none>
        count: <one | every>

    # Only present when business_model = dual
    business_lines:
      - name: <string>
        identifier_type: <naming_convention | campaign_label>
        identifier_pattern: <string>   # substring or regex matched against campaign name
        primary_kpi: <cpa | roas | cpl | cpv | cpm>
        primary_kpi_target: <number>
        flag_thresholds:
          critical: <number>
          warning: <number>

brand_terms:
  global_protected:               # never negate these in any account
    - <term>
  per_account:
    <account_slug>:
      brand_terms: [<term>, ...]
      competitor_terms: [<term>, ...]

negative_signals:
  universal:                      # patterns that are almost never relevant anywhere
    - term: <string>
      reason: <string>
      match_type: <broad | phrase | exact>
  per_account:
    <account_slug>:
      - term: <string>
        reason: <string>
        match_type: <broad | phrase | exact>

product_feed:                     # only for accounts with Merchant Center
  <account_slug>:
    feed_source: <merchant_center | supplemental | both>
    title_optimization_status: <optimized | partial | raw>
    custom_labels_in_use: [<label>, ...]

local_config:                     # only for local or GBP-connected accounts
  <account_slug>:
    locations:
      - name: <string>
        address: <string>
        gbp_id: <string>
        radius_miles: <number>
        service_area: <boolean>
        timezone: <IANA timezone>
        operating_hours:
          weekday: <string>       # e.g. "8:00-18:00"
          saturday: <string>
          sunday: <string>
        campaign_separation: <boolean>
        tourism_relevant: <boolean>
        feeder_markets: [<string>]   # only if tourism_relevant = true
    offline_conversion_source: <crm | call_tracking | store_visits | none>
    lsa_active: <boolean>

reporting:
  period: <thu_wed | mon_sun | custom>
  custom_period_start: <day_of_week>
  comparison_method: <prior_period | prior_year | both>
  prior_year_alignment: <iso_week | calendar_date>
  output_path: <string>
  output_naming: <string>
  include_cross_account_summary: <boolean>

data_source:
  method: <api | csv | manual>
  api_endpoint_name: <string>
  developer_token: <string>
  login_customer_id: <string>     # MCC CID
  api_version: <string>
  export_path: <string>

merchant_center:
  available: <boolean>
  method: <python_api | api | csv | none>
  merchant_id: <string>
  api_endpoint_name: <string>

ga4:
  available: <boolean>
  method: <python_api | api | csv | none>
  property_id: <string>
  api_endpoint_name: <string>

usage_tracking:
  <skill_slug>:
    run_count: <number>
    last_run: <date>
    verbose_mode: <boolean>       # auto-flipped to false after 5 runs
```

---

## How Every Action Skill Reads This Config

Action skills should treat this skill as required input. The standard preamble looks like this:

```
Step 0 — Load configuration
  1. Open the config (path supplied by user or default location).
  2. Filter to the account(s) implicated by the user's request.
  3. Read maturity_level — and the maturity methodology lower in this file —
     to choose the right analysis depth, thresholds, and recommendation scope.
  4. Read capability flags to decide which sub-routines run.
  5. Pull brand_terms and negative_signals into working memory.
  6. If the file is missing, stop and instruct the user:
     "No account configuration found. Run pancake_account_foundations
      to set up your accounts first."
```

The pattern is identical across the toolkit so that any agency-specific decision is made once, here, and propagated everywhere else by reference. Anything that would require a higher maturity stage than the account currently sits at should be labelled "future consideration" rather than acted on today.

---

## Setup: The Ten-Phase Interview

When this skill is invoked directly (not delegated to by another skill), run the wizard. The flow is:

1. Detect whether a config already exists at the expected path.
2. If it exists, ask whether to update in place or start fresh.
3. If new, step through the ten phases below in order, confirming each section before moving on.
4. Write the completed YAML to the agreed location.
5. Run the maturity assessment for each account.

### Phase 1 — Agency Identity

Ask for the agency or organisation name and, if applicable, the MCC ID. Derive the slug automatically (lowercased, hyphenated).

### Phase 2 — Account Roster

For every account to be managed, capture: display name, 10-digit CID, currency (ISO 4217), IANA timezone, business model (`lead_gen`, `ecommerce`, `saas`, `local`, or `dual` — note both lines for dual), and status. Invite the user to paste a table or CSV-style list if convenient. Validate that the CID is 10 digits, the currency is a recognised ISO 4217 code, and the business model is one of the allowed values. Auto-derive each slug.

### Phase 3 — Maturity Assessment

For each account, run the five-question questionnaire described in the **Maturity Assessment Questionnaire** section below. Classify the account into nascent / developing / established / advanced. Read the implication back to the user and confirm: *"Based on your answers I'm classifying [Account Name] as [level]. That means [one-sentence implication]. Does that match your view?"*

### Phase 3b — Historical Baseline Pull

Only applicable when the data source is direct API access (Python with ADC or equivalent). Pull twelve months of:

- Account-level monthly performance (spend, conversions, CPA/ROAS, impression share).
- Campaign-type-level monthly performance segmented across Search, PMax, Shopping, Display, YouTube, Demand Gen, Local, and LSA.

Use the baseline to:

1. Identify seasonality — months that deviate by more than 25 % from the annual mean.
2. Validate the maturity assessment by comparing the user's stated volume against the trailing twelve-month average.
3. Establish a trailing 90-day average for the primary KPI as a baseline metric.

Present the findings and ask the user to confirm. If the historical data contradicts what the user said in Phase 3, ask which is more representative of the current state and reclassify accordingly. For CSV or manual data sources, skip the pull and tell the user which exports they would need (account-level monthly report, campaign-type monthly report, both covering the last twelve months) to unlock baseline validation later.

### Phase 4 — Campaign Types and Capabilities

For each account, capture which campaign types are active and which data integrations exist: Merchant Center, GBP, offline conversions (and source), YouTube, Demand Gen.

### Phase 5 — Brand Terms and Competitors

Ask first for global terms that must never be negated in any account (typically the agency's own brand, when the agency runs its own campaigns). Then for each account capture brand terms (including misspellings and variations) plus competitor brands to monitor.

### Phase 6 — Negative-Signal Libraries

Explain that negative signals are patterns that almost always indicate non-buyers. Offer the universal default set as a starting point:

```
jobs, careers, hiring, salary, glassdoor, indeed
free, cheap, DIY, how to, tutorial, course
reddit, quora, forum, review site
```

Ask which to keep, which to drop, and which vertical-specific terms to add per account (for example, "open source" or "free trial" for B2B SaaS, "pro bono" for a law firm, "wholesale" for a DTC ecommerce brand).

### Phase 7 — KPI Targets and Conversion-Action Mapping

For each account ask:

1. Primary KPI (CPA, ROAS, CPL, CPV, or CPM).
2. Target value.
3. The critical (red-flag) and warning (yellow-flag) thresholds.
4. Secondary KPI, if any.

For dual business models, repeat the four questions per business line.

Then inventory every conversion action in the account. For each one, classify it into one of three tiers:

- **Primary** — the headline outcome the account is judged on, and what Smart Bidding is allowed to optimise against. Purchases on the ecommerce side; on the lead-gen side, whichever lead event the business treats as qualified (form fill, sales-accepted lead, booked appointment).
- **Secondary** — genuine business outcomes that aren't the headline number but do track real progress toward it: qualified phone calls, add-to-cart, chat starts, etc.
- **Micro** — pure engagement (pageviews, scroll depth, video plays, dwell time). These must stay out of maturity counts and must never be exposed to the bidder.

For each action also record whether it should be included in maturity counting, included in reporting, whether its value is dynamic / static / none, and whether the count setting is "one" or "every".

Validate that whatever Google Ads currently includes in the "Conversions" column matches what was classified as Primary. If micro-conversions are included there, flag it as a configuration defect.

### Phase 8 — Reporting Preferences and Data Source

Reporting cadence: Thursday-to-Wednesday, Monday-to-Sunday, or custom (capture the start day). Comparison method: prior period, prior year, or both. If prior year is in scope, ask whether to align by ISO week number or by calendar date.

The toolkit supports the following comparison framings:

| Scenario                                                | Mechanic                       |
|---------------------------------------------------------|--------------------------------|
| Last 7 days vs. the previous 7 days                     | Rolling window                 |
| Last full week vs. the week before                      | Week boundaries                |
| Week-to-date vs. the matching days of last week         | Partial week, same days        |
| Last full month vs. the month before                    | Calendar month                 |
| Month-to-date vs. the same dates last year              | Partial month, YoY             |
| Last full month vs. the same month last year            | Full month, YoY                |

Capture the output directory and file naming pattern (default: `{client} - Analysis Week {week}.md`), and whether to emit a cross-account summary when multiple accounts are analysed in one pass.

Then capture the data source. The supported methods are direct API access, Python with Application Default Credentials, CSV exports, or manual paste. Capability scales with the source:

| Tier   | Source                          | What is possible                                                                                  |
|--------|---------------------------------|---------------------------------------------------------------------------------------------------|
| Tier 1 | API access (e.g., Python with ADC)      | Every action skill at full depth, the Phase 3b baseline pull, scheduled / automated runs.        |
| Tier 2 | CSV exports from Google Ads     | Most skills, limited to whatever reports the user exported. No live re-queries.                  |
| Tier 3 | Manual paste                    | Directional performance analysis only.                                                            |

Explain this tiering before the user picks — it affects every downstream skill.

### Phase 8b — Naming Conventions and UTMs

Ask whether campaigns follow a consistent naming convention. If yes, capture the pattern (or an example name to be reverse-engineered). If no, offer guidance:

- Minimum viable pattern: `{business_line}.{campaign_type}.{theme}`
- Recommended full pattern: `{region}.{country}.{business_line}.{campaign_type}.{bidding}.{audience}.{theme}.{funnel_stage}`

For dual business models a naming convention (or campaign label) is required, not optional — the toolkit needs a deterministic way to split the two lines.

Ask whether UTMs are present in tracking templates or final URLs. The enforcement rule the toolkit applies:

- `lead_gen`, `dual`, or `saas` → UTMs are required; flag absence as a priority setup item.
- `ecommerce` with GA4 only → auto-tagging is often sufficient, but UTMs are recommended for cross-platform attribution.

### Phase 9 — Product Feed (only if Merchant Center is connected)

Per account, capture: feed source (Merchant Center, supplemental, or both), title-optimisation status (optimised / partial / raw manufacturer titles), and which custom labels are in active use (margin tiers, seasonality flags, product lines, price tiers, etc.).

### Phase 10 — Local Business (only if local or GBP-connected)

Per account, walk through each location and capture: name, address, GBP ID, targeting radius, service-area vs. storefront, timezone, operating hours (weekday / Saturday / Sunday), whether the location needs its own campaigns for scheduling and budget control, and whether it serves significant tourist or destination traffic. If it does, capture the top feeder markets (cities, states, or countries). Also capture the source of offline conversion data (CRM, call tracking, Google store visits, or none) and whether LSAs are active.

### Wrap-Up

Present the assembled YAML, ask for corrections, save to the agreed path, and confirm: *"Configuration saved. All toolkit skills will now read from this file. Run `pancake_account_foundations` whenever you need to update it."*

---

## Updating an Existing Config

Common update flows:

- **Add account** — append to `accounts[]` and run the maturity assessment for it.
- **Update targets** — change `primary_kpi_target` / `flag_thresholds` for the specified account.
- **Update brand terms** — edit `brand_terms` entries.
- **Update negatives** — edit `negative_signals` entries.
- **Reassess maturity** — re-run the questionnaire for one or more accounts.

---

# Account Maturity Methodology

The remainder of this skill defines the maturity model that calibrates every action skill in the toolkit. The maturity level itself is set during the onboarding interview above and reviewed at the cadences described later in this section; the methodology here is what gives that level its operational meaning.

## Why a Maturity Lens Matters

The same diagnostic finding can call for very different actions depending on where the account sits. A few representative examples:

| Diagnostic finding                | At Nascent                                                                              | At Advanced                                                                                |
|-----------------------------------|------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| No Target CPA configured          | Correct posture. Stay on Maximize Conversions without a target until ~30 conv/month.    | A red flag. This account should already be on tCPA or VBB.                                 |
| PMax campaign is running          | Sanity-check that asset coverage and feed quality justify it at all.                    | Audit the 8-channel distribution, asset-group performance, and placement quality.          |
| Impression share is low           | Expected at small budgets. Worry about conversion quality first.                        | Break down Lost IS by Budget vs. Rank, then model the marginal efficiency of more budget.  |
| No negative keywords              | Add a basic universal-negative list and review it weekly.                               | Inventory the negatives at every level they're applied (account, list, campaign, ad group) and look for keyword conflicts.|
| Bidding is Manual CPC             | Appropriate when conversions are under 15/month.                                        | Only appropriate as a brand-defense or testing surface; otherwise it's leaving money down. |

The underlying principle: **calibrate every recommendation to what the account can realistically execute today — neither push for tactics it cannot yet support, nor offer baby steps to an operation that has long since grown past them.** Pushing VBB onto a nascent account burns weeks of work for nothing; handing an advanced account a vague "tighten up your negatives" note is professionally embarrassing.

---

## Maturity Assessment Questionnaire

Run this for every account in Phase 3 of the onboarding interview and any time you reassess. Each question contributes 1-4 points. Total the points across all five questions.

### Q1. Monthly conversion volume

> "Roughly how many conversions does this account produce per month?"

| Answer                     | Points |
|----------------------------|--------|
| Fewer than 15 per month    | 1      |
| 15-50 per month            | 2      |
| 50-100 per month           | 3      |
| 100 or more per month      | 4      |

Count primary conversions only — purchases, qualified leads, bookings. Do not count micro-conversions (page views, add-to-cart, scroll events) unless they have been formally elevated to the primary KPI.

### Q2. Account age under current structure

> "How long has the account been actively managed in its current shape?"

| Answer            | Points |
|-------------------|--------|
| Less than 3 months| 1      |
| 3-12 months       | 2      |
| 1-2 years         | 3      |
| 2 or more years   | 4      |

### Q3. Current bidding sophistication

| Answer                                                          | Points |
|-----------------------------------------------------------------|--------|
| Manual CPC, or Maximize Clicks only                             | 1      |
| Maximize Conversions with no target                             | 2      |
| Target CPA or Target ROAS                                       | 3      |
| Value-based bidding, portfolio strategies, or active experiments| 4      |

### Q4. Conversion-tracking quality

| Answer                                                              | Points |
|---------------------------------------------------------------------|--------|
| Basic setup, known gaps, or unverified                              | 1      |
| Standard setup, reasonably accurate                                 | 2      |
| Enhanced conversions enabled and validated regularly                | 3      |
| Full-stack: enhanced conversions + offline import + regular audits  | 4      |

### Q5. Campaign-structure complexity

| Answer                                                              | Points |
|---------------------------------------------------------------------|--------|
| 1-3 campaigns, basic structure                                      | 1      |
| 4-8 campaigns, separated by type or goal                            | 2      |
| 9-15 campaigns, segmented by product / service / audience           | 3      |
| 15 or more campaigns with active naming conventions and labels      | 4      |

### Scoring

| Total points | Maturity level | Plain-language meaning                                                              |
|--------------|----------------|--------------------------------------------------------------------------------------|
| 5-8          | **Nascent**    | Early-stage, sparse data, simple structure, basic tracking                          |
| 9-12         | **Developing** | Growing account, some automation, structure expanding                               |
| 13-16        | **Established**| Mature account, reliable data, target-based bidding, full structure                 |
| 17-20        | **Advanced**   | Sophisticated account, portfolio strategies, VBB, granular optimisation             |

### Override Rules (take precedence over the point total)

| Condition                                                                       | Forced classification     | Why                                                          |
|---------------------------------------------------------------------------------|---------------------------|--------------------------------------------------------------|
| Fewer than 15 conversions per month                                             | Cap at Developing         | Too little data for advanced strategies                      |
| Tracking has acknowledged gaps                                                  | Cap at Developing         | Unreliable data makes advanced optimisation unsafe           |
| 100+ conversions/month AND 2+ years history AND full-stack tracking             | Floor at Established      | The data foundation is there even if other answers were low  |
| Account age under 3 months                                                      | Cap at Developing         | Too short a track record to read trends reliably             |

### Watch Out For (False Positives)

Several patterns can artificially inflate the score:

- **Micro-conversion inflation.** A reported total of 100+ conversions where the vast majority are engagement signals — page views, scroll-depth events, video plays — rather than business outcomes. Always classify on primary-conversion volume.
- **Seasonal spikes.** A December surge or Black Friday week makes a normally Developing account look Established. Anchor the classification to the trailing-twelve-month mean, not the spike.
- **Every-count double counting.** A form submission set to count "every" rather than "one" can double-count multi-submissions. Verify before classifying.
- **Attribution-window distortion.** A 30-day window on a 90-day sales cycle will under-count. Check the window before downgrading.
- **Inherited complexity.** A 15-campaign structure may be a previous manager's mess rather than intentional sophistication. Evaluate whether the structure is actually functional.

After classification, record both fields in the config:

```yaml
maturity_level: <nascent | developing | established | advanced>
monthly_conversion_volume: <number>
```

Then read the result back to the user with the one-sentence implication and confirm before persisting.

---

## The Four Stages

Stages are defined by sustained monthly primary-conversion volume, tempered by tracking quality, account age, bidding sophistication, and structure. The volume bands are the headline:

- **Nascent** — fewer than 15 conversions per month
- **Developing** — 15 to 50
- **Established** — 50 to 100
- **Advanced** — 100 or more

What follows is the operating profile for each, with capabilities to use, capabilities to defer, common mistakes to avoid, the metrics that matter, and the graduation criteria for moving up.

### Nascent

**Profile.** A new account, a newly inherited account with sparse history, or an account in a low-volume vertical. Data is thin, automated bidding is unreliable, and the entire game is laying a clean foundation for the next stage.

**What it usually looks like.**
- Monthly primary conversions: fewer than 15
- Bidding: Manual CPC, Maximize Clicks, or Maximize Conversions without a target
- Structure: somewhere between one and five campaigns, minimal segmentation
- Tracking: basic, possibly with known gaps
- Budget: typically in the $500-$3,000/month range
- Few or no remarketing lists, no formal optimisation cadence

**Capabilities that are appropriate.**
- Manual CPC for direct control of bid levels
- Maximize Clicks while the account is still accumulating click and conversion history
- Maximize Conversions without a target once the account has at least 5 conversions for the algorithm to learn from
- A universal negative-keyword list
- Standard Search campaigns
- A simple PMax setup with a limited asset group, only if assets and feed justify it
- Location and language targeting
- Standard ad extensions (sitelinks, callouts)

**Capabilities to defer.**
- Target CPA or Target ROAS — Google's bidder needs roughly 15 conversions inside any rolling 30-day window before its optimisation is meaningful; underneath that floor, a target tends to choke delivery and produce erratic, lumpy serving.
- Portfolio bidding — the per-campaign signal isn't steady enough yet to pool campaigns together.
- Complex PMax segmentation — there's nothing close to enough per-channel data to draw conclusions from.
- Value-based bidding — needs both volume and trustworthy conversion values, and neither is here yet.
- Audience-only campaigns — list sizes typically sit below the platform minimums (around 1,000+ users for Search, 100+ for Display and YouTube).
- Campaign experiments and A/B tests — traffic is too sparse to reach significance within any reasonable horizon.

**Mistakes that crop up here.**
1. *Reaching for automation too early.* Setting tCPA with no signal and watching delivery collapse.
2. *Over-segmenting.* Standing up a dozen campaigns to chase a single-digit monthly conversion count, leaving each one perpetually starved of signal.
3. *Optimising before verifying.* Tuning bids and budgets before anyone has confirmed that the conversions feeding the algorithm reflect actual business outcomes.
4. *PMax by default.* Spinning up Performance Max with thin asset coverage and an unoptimised feed, then watching the spend leak into bottom-tier Display inventory.
5. *Broad match with no guardrails.* Trusting the algorithm to self-correct without a negatives list — a costly way to learn that broad needs scaffolding to behave.

**What to watch.**
- Is conversion tracking actually accurate?
- Are search terms relevant to the offer?
- Is click volume trending up over time?
- Are bids competitive enough to surface?
- Is the landing page converting the traffic that gets there?

**Promotion criteria (Nascent → Developing).**
- 15+ primary conversions/month sustained for two consecutive months, **plus** at least two of the following:
  - Conversion tracking is verified and stable
  - Brand and non-brand campaigns are separated
  - At least 3 months of active management history
  - A basic negative-keyword list is in place

### Developing

**Profile.** The account has proven it can convert consistently. Automated bidding becomes testable, but targets must stay loose. The work shifts from foundation-laying to careful expansion.

**What it usually looks like.**
- Monthly primary conversions: 15-50
- Bidding: Maximize Conversions running stably; tCPA/tROAS under test with conservative targets
- Structure: roughly 5-10 campaigns, separated by type or goal
- Tracking: standard, generally reliable
- Budget: typically $3,000-$10,000/month
- Remarketing lists are building, possibly small. Some PMax in test.

**Capabilities that are appropriate.**
- Maximize Conversions at scale
- Target CPA set ~15-20 % **above** the current CPA, so the algorithm has headroom and is not forced to choke volume
- Target ROAS set ~15-20 % **below** the current ROAS for the same reason
- PMax with standard asset groups
- Standard Shopping
- Demand Gen as a test channel
- Audience signals in PMax
- Expanded keyword strategy (phrase and broad with disciplined negatives)
- Feed optimisation, if Merchant Center is connected
- Basic remarketing (site visitors, converters)

**Capabilities to defer.**
- Aggressive targets at or below current CPA — chokes volume and pushes campaigns into perpetual learning.
- Value-based bidding — value signal isn't strong enough yet.
- Portfolio bidding — campaign-level stability isn't there yet.
- Complex audience segmentation — lists may still be below platform minimums.
- Multiple simultaneous experiments — traffic can't support concurrent tests.
- PMax channel-level optimisation — not enough per-channel data.

**Mistakes that crop up here.**
1. *Setting targets too tight.* tCPA at current CPA equals perpetual learning.
2. *Stacking campaign types.* Search + PMax + Shopping + Display + YouTube launched in parallel split already-limited conversion data into useless slices.
3. *Sitting on search-term data.* Click volume is now sufficient that recurring waste patterns become visible, but nobody is running the report.
4. *Refusing to test automation.* Holding onto Manual CPC long after the account has the signal to graduate to Maximize Conversions.
5. *Ignoring the feed.* The Merchant Center connection exists, yet product titles are still verbatim from the manufacturer with no rewriting for search demand.

**What to watch.**
- Is conversion volume trending toward 50/month?
- Is CPA / ROAS stabilising under automated bidding?
- What share of spend is on irrelevant search terms?
- Where does impression share sit?
- For PMax: is the channel distribution healthy?
- Are remarketing lists reaching the minimum sizes?

**Promotion criteria (Developing → Established).**
- 50+ primary conversions/month for two consecutive months, plus at least two of:
  - tCPA or tROAS has been running stably for 30+ days
  - Enhanced conversions are enabled
  - Structure fits the business model (neither over- nor under-segmented)
  - At least 6 months of active management history

### Established

**Profile.** A mature account with reliable data, proven structure, and stable target-based bidding. The job shifts from building to optimising for efficiency.

**What it usually looks like.**
- Monthly primary conversions: 50-100
- Bidding: tCPA or tROAS with defined targets
- Structure: 10-15 campaigns, segmented by product, service, or audience
- Tracking: enhanced conversions, validated regularly
- Budget: typically $10,000-$50,000/month
- Multiple campaign types running in coordinated fashion. Regular optimisation cadence (weekly search terms, monthly creative review).

**Capabilities now available.**
- The full Smart Bidding suite, with performance-based targets
- Portfolio bidding to pool related campaigns
- Campaign experiments (proper A/B tests)
- Full PMax optimisation: 8-channel analysis and asset-group testing
- Product-tier management — Heroes, Sidekicks, Zombies, and Villains
- Creative A/B testing with enough traffic to reach significance
- Audience expansion via lookalike and custom-intent
- Budget reallocation modelling
- Competitive analysis through auction insights and IS strategy
- Feed optimisation: title testing, custom-label strategy
- YouTube and Demand Gen with dedicated strategy, not just experimentation

**Still off the table (or proceed with care).**
- Value-based bidding — possible when approaching 100 conv/month with trustworthy value data, but test carefully.
- Incrementality testing — usually needs 100+ conversions and geographic diversity.
- Marginal-efficiency modelling — more useful once volume is higher.

**Mistakes that crop up here.**
1. *Coasting.* "It works" becomes the reason to stop improving it.
2. *Over-optimising.* Targets changed weekly leave the algorithm in constant learning. Hold a minimum 14-day window between changes.
3. *Ignoring cannibalisation.* Search, PMax, Shopping, and remarketing all bidding on the same audiences with nothing arbitrating between them.
4. *Stale creative.* Enough traffic for real tests, but the same RSAs have been running for months.
5. *Accepting the budget ceiling.* Constrained campaigns left capped, with no modelling of what extra budget would yield.

**What to watch.**
- Is CPA / ROAS trending in the right direction?
- Impression share, and Lost IS broken into Budget vs. Rank
- Creative performance: CTR trend, ad-strength scores, asset ratings
- PMax channel distribution over time
- Product-tier performance for Shopping accounts
- Audience performance by segment
- Auction-insights trends — what are competitors doing?

**Promotion criteria (Established → Advanced).**
- 100+ primary conversions/month sustained, plus at least two of:
  - Full-stack tracking — enhanced conversions and offline import where applicable
  - Stable target-based or portfolio bidding across primary campaigns
  - Active naming conventions and labels
  - At least 12 months of active management history

### Advanced

**Profile.** Sophisticated, high-volume account with rich signal across the board. The work is marginal gains, incrementality, and strategic expansion.

**What it usually looks like.**
- Monthly primary conversions: 100+
- Bidding: VBB, portfolio strategies, ongoing experiments
- Structure: 15+ campaigns with formal naming conventions and labels
- Tracking: full-stack — enhanced conversions, offline import, audited regularly
- Budget: often $50,000+/month
- Every relevant campaign type running and coordinated; data integrations are complete (GA4, Merchant Center, YouTube, CRM)

**Capabilities now in play.**
- Everything from prior stages, plus:
- Value-based bidding optimising for margin or pipeline value, not just conversion count
- Marginal-efficiency modelling — the diminishing-returns curve per campaign
- Incrementality testing through geo experiments and holdout groups
- Cross-channel attribution analysis
- Portfolio bidding optimisation (cross-campaign target balancing)
- Advanced PMax: channel-level efficiency, placement pruning, asset experiments
- Multivariate creative testing
- Custom scripts and automated rules
- Market-expansion modelling — new geos, audiences, channels
- Competitor conquest strategy
- Offline conversion optimisation with pipeline value weighting

**Things to keep watching even here.**
- *Tracking accuracy.* Never assume it's fine. Audit on a cadence — drift happens.
- *Negative-keyword conflicts.* Years of accumulated negatives often start blocking new keywords. Periodic conflict audits are essential.
- *PMax opacity.* Channel allocation needs periodic inspection rather than blind trust.
- *Learning-period cascade.* Changing several campaigns at once can park 30 %+ of the account in learning simultaneously.

**Mistakes that crop up here.**
1. *Trusting tracking by default.* Even sophisticated accounts develop tracking drift.
2. *Negative-keyword debt.* Old broad negatives quietly suppress new exact-match keywords. Run conflict audits.
3. *PMax black-boxing.* Channel allocations accepted without inspection.
4. *Learning cascades.* Coordinating too many simultaneous changes pushes a large share of budget into learning at once.
5. *Reading DDA as ground truth.* Data-driven attribution beats last-click handily, but it's a modelled estimate, not a measurement — treat it accordingly.

**What to watch.**
- Marginal CPA / ROAS — how productive each additional dollar of spend is at the current operating point
- Portfolio performance versus individual campaign targets
- For VBB: predicted conversion values benchmarked against the actuals (value accuracy)
- Incrementality signals — for example, brand-search lift attributable to upper-funnel activity
- Cross-campaign cannibalisation
- Share of budget currently in learning periods
- IS trends and CPC inflation indicating competitive pressure

**There is no level above Advanced**, but sophistication within Advanced varies enormously: a $50K/month advanced account and a $500K/month advanced account operate on the same principles but at very different testing velocities and margin-of-gain.

---

## Maturity-Aware Thresholds

Where action skills need numeric thresholds, they should scale them to the stage. These are the defaults the toolkit uses:

| Metric                                  | Nascent          | Developing  | Established | Advanced  |
|-----------------------------------------|------------------|-------------|-------------|-----------|
| Minimum clicks before search-term action| 5 clicks         | 10 clicks   | 15 clicks   | 20 clicks |
| Minimum conv. for bidding assessment    | not applicable   | 15          | 30          | 50        |
| N-gram volume threshold                 | 10 clicks        | 20 clicks   | 30 clicks   | 50 clicks |
| Creative-test sample size               | not recommended  | 100 clicks  | 200 clicks  | 500 clicks|
| Minimum meaningful budget reallocation  | $5/day           | $10/day     | $25/day     | $50/day   |

## Maturity-Aware Skill Scope

Each action skill also scales the *kind* of analysis it performs:

| Skill              | Nascent scope                       | Developing scope                       | Established scope                       | Advanced scope                              |
|--------------------|--------------------------------------|----------------------------------------|------------------------------------------|---------------------------------------------|
| `pancake_query_intelligence`| Basic negatives, brand protection    | + full classification, n-gram analysis | + statistical significance              | + cross-campaign patterns                   |
| `pancake_pmax_workshop`     | Asset completeness only              | + channel breakdown                    | + full 8-channel analysis                | + marginal channel efficiency               |
| `pancake_inspect_bidding`    | Strategy appropriateness             | + target evaluation                    | + portfolio opportunities                | + VBB readiness, experiments                |
| `pancake_creative_atelier`   | Basic RSA check                      | + ad-strength analysis                 | + A/B test planning                      | + multivariate testing                      |
| `pancake_budget_engine` | Basic pacing                         | + constrained-campaign identification  | + reallocation modelling                 | + marginal-efficiency curves                |

---

## The Progression Path

The typical journey, with rough timing:

```
Nascent ── 3-6 months ──> Developing ── 6-12 months ──> Established ── 6-12 months ──> Advanced
```

**Factors that accelerate progression.**
- Search demand is dense in the category
- Conversion measurement was set up correctly before launch
- Day-to-day management is experienced and consistent
- Budget is generous relative to the auction

**Factors that slow progression.**
- The vertical itself has thin query volume
- Measurement is shaky or partial
- Spend is constrained well below what the account could absorb
- The business has a deep off-season every year

**Things that can move an account backwards.**
- Conversion tracking breaks
- Major restructure that resets campaign history
- Budget cuts that drop volume below a stage threshold
- Platform-level changes that invalidate the current setup

---

## Upgrade Triggers (Detailed)

Each upward step has a primary volume trigger and a small set of supporting conditions. Require the primary trigger **and** at least two of the four supporting conditions before promoting.

### Nascent → Developing

- **Primary:** 15+ primary conversions/month for 2 consecutive months
- **Supporting (need 2 of 4):**
  - Conversion tracking verified and stable (no unexplained spikes or drops)
  - Brand and non-brand campaigns separated
  - 3+ months of active management
  - A basic negative-keyword list in place

When promoting, update `maturity_level` in the config and brief the user with something like: *"Volume has crossed into the Developing band, so it is now safe to start testing automated bidding here. The natural next move from [current strategy] is Maximize Conversions."*

### Developing → Established

- **Primary:** 50+ primary conversions/month for 2 consecutive months
- **Supporting (need 2 of 4):**
  - Automated bidding (tCPA or tROAS) running stably for 30+ days
  - Enhanced conversions enabled
  - Structure fits the business model (no over-segmentation)
  - 6+ months of active management

Tell the user something like: *"With sustained volume at this level, three new optimisation lanes open up here: setting and tuning explicit bidding targets, running creative tests with enough traffic to mean something, and modelling where additional budget would actually move the needle."*

### Established → Advanced

- **Primary:** 100+ primary conversions/month for 2 consecutive months
- **Supporting (need 2 of 4):**
  - Full-stack tracking (enhanced conversions + offline import where applicable)
  - Stable target-based bidding across primary campaigns
  - Naming conventions and labels actively in use
  - 12+ months of active management

Tell the user something like: *"At this volume and tracking depth, the account is now a candidate for value-based bidding evaluation, portfolio-level bidding tuning, and proper incrementality experiments — none of which were responsible to attempt before."*

---

## Downgrade Triggers

Less common than upgrades, but necessary when conditions deteriorate. The window for downgrades is deliberately longer than for upgrades to avoid over-reacting to noise.

### Anything → Nascent

Triggers (any one is sufficient):
- A non-seasonal drop that keeps monthly conversions below 15 across two consecutive months
- The conversion-tracking signal becomes unreliable or stops firing correctly
- The account is rebuilt from zero — fresh campaigns, fresh tracking
- The account sits paused for three or more months and is then turned back on

Warn the user with something like: *"Conversion volume has fallen under the floor that [current bidding strategy] needs to operate cleanly. The safer posture from here is [nascent-appropriate strategy] until volume recovers."*

### Advanced → Established

Triggers:
- Monthly conversions stay under 100 for three or more months, and the dip isn't a known seasonal trough
- The offline-conversion pipeline breaks or is disconnected from the account
- A large restructure wipes most of the campaign history the bidder was relying on

### Established → Developing

Triggers:
- Monthly conversions stay under 50 for three or more months
- Automated bidding loses its footing — stuck in perpetual learning, output noticeably erratic
- Enhanced conversions are turned off or have broken

---

## Signals That Look Like Triggers But Aren't

Avoid reassessing on the basis of any of the following:

| Apparent signal                                   | Why it's misleading                                | What to do instead                                |
|---------------------------------------------------|----------------------------------------------------|---------------------------------------------------|
| One month above or below the volume threshold     | Ordinary variance                                  | Require 2 consecutive months                      |
| Seasonal spike (Black Friday, holiday surge)      | Temporary, not the new normal                      | Use the annual average; record the seasonality    |
| Seasonal dip (e.g. January slump)                 | Temporary, expected                                | Hold the current level; note the pattern          |
| Volume rises while tracking is broken             | The number is inflated                             | Fix tracking, then reassess                       |
| Budget doubled and conversions doubled            | Volume may be purchased with spend, not earned through real account improvement | Check that CPA / ROAS held; reassess only if yes  |
| Client redefined the primary conversion action    | Apples-to-oranges comparison                       | Reset the baseline and wait 2 months              |

---

## Structural Changes That Force an Immediate Reassessment

| Event                                                       | Action                                                            |
|-------------------------------------------------------------|-------------------------------------------------------------------|
| Conversion-tracking overhaul                                | Full reassessment. Treat as a new baseline.                       |
| Bidding strategy migration (e.g. Manual → tCPA)             | Reassess after a 30-day stabilisation period                      |
| Major campaign restructure (>50 % of campaigns changed)     | Full reassessment. History is partially reset.                    |
| First launch of a new campaign type (e.g. first PMax)       | Update capability flags. Maturity may or may not change.          |
| Budget change of more than 50 %                             | Monitor for 2 months — volume may shift the stage                 |
| Business model change (e.g. ecom added on top of lead gen)  | Update business model and reassess for the new mix                |
| Agency transition (newly inherited account)                 | Full assessment. Do not trust the prior classification.           |

---

## Reassessment Cadence

| Cadence                | What to do                                                                |
|------------------------|---------------------------------------------------------------------------|
| **Quarterly**          | Full reassessment using the questionnaire above                           |
| **Monthly**            | Quick check — did conversion volume cross a threshold?                    |
| **On structural change**| Run the assessment as soon as the change settles                          |

Beyond the cadenced reviews, a re-run is also warranted whenever monthly conversion volume crosses one of the threshold boundaries (15, 50, or 100), a material structural change occurs, conversion tracking is upgraded, or account age crosses 3 months, 12 months, or 24 months.

---

## Handling Seasonal Accounts

Some businesses have genuine, dramatic seasonality:

| Quarter | Conversions/month | Apparent stage |
|---------|-------------------|----------------|
| Q1      | 22                | Developing     |
| Q2      | 70                | Established    |
| Q3      | 38                | Developing     |
| Q4      | 180               | Advanced       |

**Rule.** Assign the stage on the **rolling-twelve-month mean** of primary conversions — never on a peak month and never on a trough month. Document the seasonal shape in `special_handling_notes`. Then, inside any given quarter, scale specific recommendations to the volume that is actually available right now (for example: "we can run a meaningful creative test this quarter; we won't be able to next quarter").

**Exception.** When the trough sustains below 15 conversions/month for three or more consecutive months, the off-season effectively forces a Nascent operating posture for that window regardless of what the annual mean says — bidding algorithms react to the signal currently flowing through them, not to the signal the account expects to have when the season returns.

### Seasonality Cross-Reference for Promotions

When a promotion looks earned (the 2-consecutive-months criterion has been met), cross-check against the historical baseline pulled during account setup. The logic:

1. The account has sustained volume above the next stage's threshold for 2+ consecutive months.
2. Check the baseline: are those months historically more than 25 % above the annual mean?
3. **If yes**, lengthen the observation window before promoting. Phrase it back to the user along the lines of: *"The 2-month confirmation window for [stage] landed inside [months] — historically about [X %] richer than this account's normal monthly volume. I'd rather see the same volume hold through [next non-peak month] before reclassifying, so we don't pin a new bidding strategy to a seasonal high."*
4. **If no**, proceed with the standard promotion path.

Worked examples:
- An ecommerce account crosses the 50/month threshold in November and December — Q4 is its peak. Extend observation to January and February before promoting.
- A tax-preparation service crosses 15/month in March and April — Q1 is its peak. Wait until May and June.
- A non-seasonal account crosses 100/month in any random month — proceed with the standard 2-month confirmation.

**When the historical baseline isn't available** (CSV or manual data source), the toolkit should warn rather than block: *"No twelve-month baseline is loaded for this account, so I can't tell whether [N] months of higher volume reflect real growth or a seasonal peak. Before we change bidding strategy on the strength of this promotion, it's worth ruling out the seasonal explanation manually."*

---

## Logging a Maturity Change

When promoting or demoting, update the config and leave an audit trail:

```yaml
maturity_level: established   # Updated 2026-03-25, was developing
monthly_conversion_volume: 55 # 2-month average
```

Then tell the user what just changed, what new capabilities they now have access to, and what (if anything) should be adjusted in the current strategy as a result. A promotion is not just a label change — it's an invitation to revisit the active optimisation plan.

---

## Reference Files

| File                                   | Purpose                                                                                       |
|----------------------------------------|-----------------------------------------------------------------------------------------------|
| `references/setup_questionnaire.md`    | The ten-phase interview, expanded with sample prompts                                         |
| `references/example_config.md`         | An annotated fictional-agency example with four accounts                                      |
| `references/maturity_assessment.md`    | Standalone copy of the maturity questionnaire                                                 |
| `references/maturity_stages.md`        | Long-form definition of each stage with capabilities, restrictions, mistakes, and metrics     |
| `references/progression_triggers.md`   | Detailed upgrade, downgrade, false-signal, and structural-change rules                        |

### Reference: example_config.md (illustrative excerpt)

The full annotated example covers a fictional agency named *Apex Digital* managing four accounts that together exercise every section of the schema:

- **Meridian Law Group** — lead-gen + local, three offices, CRM-imported offline conversions, Demand Gen for lead acquisition. Demonstrates the GBP integration path.
- **Brightleaf Home** — DTC ecommerce, full Merchant Center feed, partially optimised titles, custom labels for margin tier and seasonality, YouTube and Demand Gen running. Demonstrates Q4 seasonality handling via `special_handling_notes`.
- **Summit Dental Group** — local, nascent, two locations, phone-only conversion tracking, LSAs active, no formal naming convention yet.
- **TechForge Solutions** — dual business model in GBP, ecommerce parts store plus enterprise lead-gen pipeline, distinguished via the `.ec.` / `.lg.` infixes in campaign names. Demonstrates the `business_lines` block and the rule that ecommerce and lead-gen metrics must never be blended.

No real client data appears in the example. The point of the example is to show how every field is exercised in realistic combinations.

### Reference: setup_questionnaire.md (high-level summary)

The questionnaire mirrors the ten phases above and includes the exact wording for each prompt. Use it verbatim when running the wizard interactively; use the structure here when scripting a non-interactive seed. Always confirm the captured values back to the user at the end of each phase before moving on.
