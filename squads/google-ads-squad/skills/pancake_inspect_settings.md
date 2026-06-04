---
name: pancake_inspect_settings
description: Action skill that audits Google Ads account and campaign settings, conversion tracking configuration, privacy compliance, and data connections. Produces settings audit reports, compliance checklists, and data connection status. Loads pancake_settings_playbook as its analytical foundation. Use when auditing account settings, checking conversion tracking, verifying compliance, or reviewing data connections. Do NOT use for bidding strategy review (use pancake_inspect_bidding) or local business-specific audits (use pancake_inspect_local).
triggers:
  - "audit settings"
  - "settings audit"
  - "account settings review"
  - "conversion tracking audit"
  - "compliance check"
  - "data connections check"
  - "tracking audit"
---

# Settings Audit Skill

## What this skill does

This is an executable audit routine for Google Ads. It pulls live settings from the API, evaluates them against best-practice rules, and emits a set of structured reports a practitioner can review and act on. The audit covers five surface areas:

1. Account-level configuration
2. Per-campaign configuration
3. Conversion action setup
4. Privacy and consent compliance
5. External data linkages

It does not evaluate bidding strategy choice (that lives in `pancake_inspect_bidding`) and it does not cover the location-business specifics that `pancake_inspect_local` handles.

## Skills this one depends on

Two reference skills must be loaded before the audit runs:

- `pancake_settings_playbook` — the rule set, checklists, and compliance definitions
- `pancake_account_foundations` — per-account metadata (business type, KPI targets, exceptions, etc.) and the maturity grade used to calibrate how strictly findings are scored

If `pancake_account_foundations` has not been configured, halt and instruct the practitioner to run that skill first. Without it, audit expectations cannot be calibrated.

---

## Onboarding behavior

For the first five executions against a given account, every checkpoint should be verbose: explain the rule being applied, the reasoning that produced each finding, and how the output is meant to be consumed. From run six onward, default to terse confirmations. At any point, the practitioner can re-enable the long-form mode by asking you to "explain your reasoning."

---

## Execution sequence

The audit is divided into discrete steps. Each step ends with a checkpoint where you pause, surface what was found, and wait for confirmation before continuing. Steps must run in order; they cannot be merged or reordered.

### Step 0 — Prime the context

Before any data is pulled, load the analytical scaffolding.

1. Open `pancake_account_foundations/config.yaml` (default location). Pull the target account from the practitioner's instruction and read its business type, KPI targets, maturity level, and any special handling flags. Use the maturity grade to set the curve — newer accounts should expect a high finding count; mature accounts will tend to surface drift from previous configurations.
2. Load `pancake_settings_playbook`. You will need: the account-level checklist, the campaign-level checklist, the conversion-tracking framework, the privacy/consent rules (including Consent Mode V2 and enhanced conversions), and the connections matrix keyed by business type.
3. State the loaded context back to the practitioner: account name, CID, business type, maturity level. Confirm whether you should run every section or scope to a subset. Capture any constraints they mention up front (no GA4 admin access, account doesn't serve the EEA, etc.).

**Checkpoint:** Lock the context before any queries fire.

### Step 1 — Pull the data

Reference `references/data_requirements.md` for the canonical queries. You need four buckets of data:

- **Account-level:** auto-tagging on/off, the tracking template and final URL suffix, account-level conversion goals, and the status of auto-apply recommendations.
- **Campaign-level (all campaigns):** the geographic targeting method (`geo_target_type_setting`), network configuration (search partners, content network), ad rotation, dayparting schedule, device bid modifiers, campaign type and sub-type.
- **Conversion actions:** for each action, capture name, category, counting type, attribution model, click-through lookback window, the include-in-conversions flag, and value settings. Pull conversion volumes from a separate query at the customer or campaign level — the `conversion_action` resource will not accept `metrics.conversions` in a SELECT.
- **Linked accounts:** GA4, Merchant Center, YouTube, and anything else the API exposes. Many linkages must be confirmed manually in the UI; flag those clearly.

**Checkpoint:** Confirm the pulls succeeded. Surface any permission errors or empty responses.

### Step 2 — Account-level evaluation

Run each account-level setting against the rule set and assign a severity:

- **Auto-tagging:** must be ON. OFF is **Critical**.
- **Tracking template / final URL suffix:** confirm UTMs are present and well-formed. Missing or malformed → **Warning**.
- **Auto-apply recommendations:** if categories like "Add keywords," "Adjust bids," or "Adjust budgets" are enabled, treat as **Critical** — these can ship structural changes without review. If only low-risk auto-applies are on (e.g., removing redundant keywords), grade as **Warning**.
- **Account-level negatives:** if no shared negative list exists, that's a **Warning**. If lists exist but aren't attached to campaigns, also a **Warning**.
- **Default conversion goals:** secondary or observation-only actions appearing in the default goal set is a **Warning**. Goals that are misaligned with the business model are **Critical**.

**Checkpoint:** Walk through the account-level findings before moving on.

### Step 3 — Campaign-level evaluation

For every active campaign:

1. **Location targeting** (`positive_geo_target_type`):
   - "Presence or interest" on a local-only business → **Critical**
   - "Presence or interest" on any geographically bounded campaign → **Critical**
   - "Presence" on a tourism or relocation campaign → **Warning** (likely too restrictive)
2. **Network settings:**
   - Display Network enabled inside a Search campaign → **Warning** by default. If Display consumes more than 10% of the campaign budget → **Critical**.
   - Search Partners enabled → flag for performance segmentation. Not automatically wrong, but should be reviewed by partner separately.
3. **Ad rotation:** "Do not optimize" without an active ad test → **Warning**.
4. **Ad schedule:**
   - No schedule on a call-driven business → **Warning**.
   - Schedule that doesn't align with stated business hours → **Warning**.
5. **Device modifiers:** if mobile conversion rate is materially worse than desktop and no negative mobile bid adjustment exists → **Warning**.
6. **Final URL expansion (Performance Max):**
   - Enabled with no exclusion list → **Warning**.
   - Driving traffic to clearly off-target pages (careers, blog index, etc.) → **Critical**.
7. **Brand restrictions (PMax):** PMax running alongside branded Search with no brand exclusions on the PMax campaign → **Warning**.

**Checkpoint:** Present the campaign-level findings. Call out any campaigns that accumulated several issues, since they're likely candidates for a deeper rebuild.

### Step 4 — Conversion tracking evaluation

For each conversion action:

- **Count:** "One" for leads, "Every" for purchases. The wrong setting is **Critical** because it corrupts the optimization signal.
- **Attribution model:** should be data-driven (DDA). Deprecated models that Google didn't auto-migrate are **Warning**.
- **Lookback window:** must match the sales cycle. A 30-day window on a 90-day B2B cycle is a **Warning** because conversions outside the window won't be attributed.
- **Include in Conversions:** only true business outcomes should be flagged Primary. Secondary or observation events marked Primary is **Critical** — they pollute Smart Bidding.
- **Value:** dynamic values for ecommerce, sensible static values for leads. No values present when value-based bidding is feasible → **Warning**.
- **Duplicate detection:** if the same underlying event is captured by two conversion actions both marked Primary (a classic case: the Google Ads tag and a GA4 import both firing on the same purchase), grade as **Critical**.

**Checkpoint:** Surface conversion-tracking findings with the specific click path needed to remediate each one.

### Step 5 — Privacy compliance

Check the requirements that apply to the account's traffic mix.

- **Consent Mode V2** (applies if any EEA/UK traffic exists):
  - Look for consent-mode signals in tag configuration.
  - Distinguish Advanced from Basic Consent Mode.
  - Verify a CMP is in place.
  - EEA/UK traffic with no Consent Mode at all → **Critical**.
  - Basic Consent Mode only (no modeling enabled) → **Warning**.
- **Enhanced Conversions:**
  - Web enhanced conversions not enabled → **Warning**.
  - Lead enhanced conversions not enabled on lead-gen accounts → **Warning**.
- **U.S. privacy:** if there's California traffic, confirm Restricted Data Processing is enabled and Global Privacy Control is being honored. RDP off → **Warning**.

If the account has no EEA/UK exposure, mark Consent Mode "Not applicable" rather than failing the check.

**Checkpoint:** Walk through compliance findings with the regulatory rationale alongside each item.

### Step 6 — Data connections

Cross-reference the connections matrix against the business type loaded in Step 0.

- **Required** connections that are missing → **Critical**.
- **Recommended** connections that are missing → **Warning**.
- **Optional** connections that are missing → log as an opportunity; no severity.

For every connection that does exist, verify:

- The link is Active (not "Needs attention" or stale).
- The correct property/account is attached (the right GA4 property, the right Merchant Center, etc.).
- Note any downstream features that are unavailable because the connection is missing (e.g., no Shopping ads without Merchant Center; no Customer Match without Data Manager).

**Checkpoint:** Present the connections table with explicit impact notes.

### Step 7 — Compose the deliverables

Use `references/output_specs.md` for the exact layouts. Five outputs are produced.

---

## Output catalogue

### 1. Settings audit report

A markdown document with three blocks:

- **Account-level table** — columns: Setting / Current Value / Recommended / Status (OK | Warning | Critical) / Notes.
- **Campaign-level tables** — one per campaign when the campaign count is small; group by issue type when there are many. Same column schema as the account-level table.
- **Counts roll-up** — total settings checked plus the breakdown by severity.

### 2. Conversion tracking report

Includes:

- A row per conversion action with: Name, Category, Count, Model, Window, Include flag, Value setting, Status, Notes.
- A duplicate-detection section listing any events captured twice with both flagged Primary.
- A numbered remediation list — each step naming the exact UI path so the practitioner can execute without searching.

### 3. Compliance checklist

A single table with: Requirement, Current Status, Impact if Not Addressed, Priority. Append implementation steps for every item flagged non-compliant.

### 4. Data connections report

Connections table: Connection, Status (Linked | Not Linked | Needs Attention), Tier (Required | Recommended | Optional), Impact if Missing. Linking instructions follow for anything that needs to be wired up.

### 5. Summary dashboard

Short, scannable, designed to be the top of the deliverable bundle. Include:

- Severity counts (Critical / Warning / OK).
- The three findings that would have the largest positive impact if fixed.
- A recommended remediation order with one-line reasons.
- A short paragraph estimating the impact of clearing every Critical item (e.g., "Fixing the three Critical findings would stop roughly $X/month of wasted spend and correct conversion reporting that is currently inflated by Yx.").

**Final checkpoint:** Present every output and offer to drill into any finding the practitioner wants to expand.

---

## Severity scale (quick reference)

| Level | When to apply | Indicative examples |
|---|---|---|
| Critical | Active budget waste, data corruption, or regulatory exposure. Must be fixed now. | Auto-apply adding keywords; "Every" count inflating leads; Display Network draining a Search budget |
| Warning | Suboptimal — measurable quality or performance cost. Fix inside the current optimization cycle. | Enhanced conversions disabled; Search Console unlinked; lookback too short for the sales cycle |
| OK | No action required. | Auto-tagging on; DDA in use; count setting matches the conversion type |

---

## Edge cases worth handling explicitly

- **PMax-only accounts.** Ad rotation and network settings don't apply. Concentrate on URL expansion, brand exclusions, and asset-group URL configuration instead.
- **Single-campaign accounts.** Campaign and account checks overlap heavily — call out the overlap in the report so findings don't read as duplicates.
- **Accounts with no EEA/UK traffic.** Skip the Consent Mode V2 block entirely. Mark it "Not applicable" on the compliance checklist.
- **Brand-new or empty accounts.** Defaults will dominate. Frame the audit as a pre-launch checklist rather than a list of broken settings.
- **Third-party tracking integrations** (Search Ads 360, Kenshoo, etc.). The tracking template is probably owned by the third-party platform. Verify it but don't grade it as wrong until you understand the integration.

---

## Reference: data_requirements.md

# Data Requirements for the Settings Audit

This file documents the GAQL queries and data-collection rules the `pancake_inspect_settings` skill relies on.

### A known API limitation

The `conversion_action` resource will reject `metrics.conversions` in the SELECT clause. The following query will fail:

```
-- This is not valid:
SELECT
  conversion_action.name,
  metrics.conversions
FROM conversion_action
```

To retrieve per-action conversion volumes, query at the customer (or campaign) level and segment by conversion action:

```
SELECT
  segments.conversion_action_name,
  metrics.conversions,
  metrics.conversions_value
FROM customer
WHERE segments.date DURING LAST_30_DAYS
```

### Query group 1 — account-level

**Auto-tagging:**

```
SELECT
  customer.auto_tagging_enabled,
  customer.descriptive_name,
  customer.id
FROM customer
```

**Tracking template / final URL suffix:**

```
SELECT
  customer.tracking_url_template,
  customer.final_url_suffix
FROM customer
```

Note: auto-apply recommendations status is not exposed through GAQL directly. Either check the UI (Settings → Recommendations → Auto-apply) or inspect the `Recommendation` resource for recent auto-applied entries.

### Query group 2 — campaign settings

```
SELECT
  campaign.name,
  campaign.id,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.advertising_channel_sub_type,
  campaign.geo_target_type_setting.positive_geo_target_type,
  campaign.geo_target_type_setting.negative_geo_target_type,
  campaign.network_settings.target_search_network,
  campaign.network_settings.target_content_network,
  campaign.network_settings.target_partner_search_network,
  campaign.ad_serving_optimization_status,
  campaign.bidding_strategy_type,
  campaign.target_cpa.target_cpa_micros,
  campaign.target_roas.target_roas
FROM campaign
WHERE campaign.status != 'REMOVED'
```

Field reminders:

- `positive_geo_target_type` will be PRESENCE_OR_INTEREST or PRESENCE. This is the value that drives the location-targeting finding.
- `target_content_network = TRUE` means Display Network is on — flag it for Search campaigns.
- `ad_serving_optimization_status` will be OPTIMIZE or ROTATE_INDEFINITELY.

**Ad schedule:**

```
SELECT
  campaign.name,
  campaign.id,
  ad_schedule.day_of_week,
  ad_schedule.start_hour,
  ad_schedule.start_minute,
  ad_schedule.end_hour,
  ad_schedule.end_minute,
  ad_schedule.bid_modifier
FROM ad_schedule
WHERE campaign.status != 'REMOVED'
```

An empty result for a campaign means no schedule is set — i.e., the campaign serves 24/7.

**Device bid modifiers:**

```
SELECT
  campaign.name,
  campaign.id,
  campaign_criterion.device.type,
  campaign_criterion.bid_modifier
FROM campaign_criterion
WHERE campaign_criterion.type = 'DEVICE'
  AND campaign.status != 'REMOVED'
```

**Campaign-level negatives:**

```
SELECT
  campaign.name,
  campaign.id,
  campaign_criterion.keyword.text,
  campaign_criterion.keyword.match_type,
  campaign_criterion.negative
FROM campaign_criterion
WHERE campaign_criterion.type = 'KEYWORD'
  AND campaign_criterion.negative = TRUE
  AND campaign.status != 'REMOVED'
```

### Query group 3 — conversion actions

**Configuration:**

```
SELECT
  conversion_action.name,
  conversion_action.id,
  conversion_action.status,
  conversion_action.category,
  conversion_action.counting_type,
  conversion_action.attribution_model_settings.attribution_model,
  conversion_action.attribution_model_settings.data_driven_model_status,
  conversion_action.click_through_lookback_window_days,
  conversion_action.view_through_lookback_window_days,
  conversion_action.include_in_conversions_metric,
  conversion_action.value_settings.default_value,
  conversion_action.value_settings.always_use_default_value,
  conversion_action.type,
  conversion_action.origin
FROM conversion_action
WHERE conversion_action.status != 'REMOVED'
```

**Volume (run separately):**

```
SELECT
  segments.conversion_action_name,
  segments.conversion_action,
  metrics.conversions,
  metrics.all_conversions,
  metrics.conversions_value
FROM customer
WHERE segments.date DURING LAST_30_DAYS
```

This gives you the last 30 days of volume per action, which is useful for spotting actions that are configured but receiving zero data.

### Query group 4 — shared negative keyword lists

```
SELECT
  shared_set.name,
  shared_set.id,
  shared_set.type,
  shared_set.status,
  shared_set.member_count
FROM shared_set
WHERE shared_set.type = 'NEGATIVE_KEYWORDS'
  AND shared_set.status = 'ENABLED'
```

To map lists back to campaigns:

```
SELECT
  campaign.name,
  campaign.id,
  shared_set.name,
  shared_set.id
FROM campaign_shared_set
WHERE shared_set.type = 'NEGATIVE_KEYWORDS'
```

### Query group 5 — linked accounts

The API only partially exposes external account links. For MCC structure:

```
SELECT
  customer_client.descriptive_name,
  customer_client.id,
  customer_client.status
FROM customer_client
```

Most product linkages (GA4, Merchant Center, YouTube, Search Console, Google Business Profile) are most reliably verified in Tools → Data Manager. When an automated audit cannot confirm a linkage via API, raise a "Verify in UI" note rather than asserting a status.

### Settings that are UI-only

Some settings cannot be checked through the API at all. Always separate API-verified findings from items that require a manual look at the UI.

| Setting | Where to verify |
|---|---|
| Auto-apply recommendations | Settings → Recommendations → Auto-apply |
| Enhanced Conversions | Goals → Conversions → Settings → Enhanced conversions |
| Consent Mode | Google Tag settings (Tag Assistant or GTM) |
| IP exclusions | Campaign Settings → Additional settings → IP exclusions |
| Final URL expansion (PMax) | PMax Campaign Settings → Final URL expansion |
| Brand restrictions (PMax) | PMax Campaign Settings → Brand restrictions |
| GA4 link | Tools → Data Manager → Google Analytics |
| Merchant Center link | Tools → Data Manager → Google Merchant Center |
| YouTube link | Tools → Data Manager → YouTube |
| Search Console link | Tools → Data Manager → Search Console |

---

## Reference: output_specs.md

# Output Specifications

The five deliverables described above each have a defined shape. The skeletons below should be used verbatim and filled in with audit data.

### Output 1 — Settings audit report

**Account-level block:**

```markdown
## Account-Level Settings

| Setting | Current Value | Recommended | Status | Notes |
|---|---|---|---|---|
| Auto-tagging | ON | ON | OK | |
| Tracking template | Not set | UTM suffix configured | Warning | No UTM parameters for third-party analytics |
| Auto-apply recommendations | ON (3 categories) | OFF or selective | Critical | "Add keywords" is auto-applying |
| Negative keyword lists | 2 lists, applied to 4/8 campaigns | Applied to all campaigns | Warning | 4 campaigns have no shared negatives |
| Default conversion goals | 5 primary actions | Review for accuracy | Warning | Includes page_view as primary |
```

**Per-campaign block:**

```markdown
## Campaign: [Campaign Name]

| Setting | Current Value | Recommended | Status | Notes |
|---|---|---|---|---|
| Location targeting | Presence or interest | Presence | Critical | Local service business, ads showing to distant users |
| Display Network | ON | OFF | Warning | 8% of budget going to Display placements |
| Ad rotation | Do not optimize | Optimize | Warning | No active ad test running |
| Ad schedule | None set | Business hours with bid adjustments | Warning | Call-driven campaign, no dayparting |
| Mobile bid adj. | +0% | -30% to -50% | Warning | Mobile conv rate 40% below desktop |
```

**Counts roll-up:**

```markdown
## Settings Audit Summary

- **Total settings checked:** [N]
- **Critical:** [N] (fix immediately)
- **Warning:** [N] (fix this cycle)
- **OK:** [N] (correctly configured)
```

### Output 2 — Conversion tracking report

```markdown
## Conversion Actions

| Name | Category | Count | Model | Window | Include | Value | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Purchase | Purchase | Every | DDA | 30d | Yes | Dynamic | OK | |
| Contact Form | Lead | Every | DDA | 30d | Yes | None | Critical | Count should be "One" |
| Newsletter Signup | Signup | One | DDA | 30d | Yes | None | Warning | Should be Secondary |
| Page View | Other | One | DDA | 30d | Yes | None | Critical | Should not be Primary |
```

Duplicate-detection block:

```markdown
## Duplicate Conversion Actions

| Event | Action 1 | Action 2 | Both Primary? | Resolution |
|---|---|---|---|---|
| Purchase | Google Ads tag - Purchase | GA4 Import - purchase | Yes | Set GA4 Import to Secondary, or remove one |
```

Remediation list (numbered, with UI paths):

1. Change "Contact Form" count from "Every" to "One" (Goals → Conversions → Contact Form → Edit → Count).
2. Demote "Newsletter Signup" from Primary to Secondary (Goals → Conversions → Newsletter Signup → Edit → Primary/Secondary).

### Output 3 — Compliance checklist

```markdown
## Privacy Compliance Status

| Requirement | Status | Impact if Not Addressed | Priority |
|---|---|---|---|
| Consent Mode V2 (EEA/UK) | Not implemented | Loss of remarketing + conversion tracking for EEA users | Critical |
| Enhanced Conversions for Web | Enabled | N/A | OK |
| Enhanced Conversions for Leads | Not enabled | Missing offline conversion attribution | Warning |
| Restricted Data Processing (CA) | Not enabled | Non-compliant with CPRA for California users | Warning |
```

### Output 4 — Data connections report

```markdown
## Data Connections

| Connection | Status | Required/Recommended | Impact if Missing |
|---|---|---|---|
| GA4 | Linked (GA4-123456789) | Required | N/A |
| Merchant Center | Not linked | Required (eCommerce) | Shopping campaigns cannot run |
| YouTube | Not linked | Recommended | No video remarketing audiences |
| Search Console | Linked (example.com) | Recommended | N/A |
| GBP | Not applicable | N/A | N/A |
| CRM | Not linked | Required (lead gen) | No offline conversion data |
| Data Manager | Not configured | Recommended | No Customer Match audiences |
```

### Output 5 — Summary dashboard

```markdown
## Settings Audit: Summary Dashboard

**Account:** [Account Name] (CID: XXX-XXX-XXXX)
**Audit Date:** [Date]
**Business Type:** [Type]
**Maturity Level:** [Level]

### Findings Overview

| Severity | Count |
|---|---|
| Critical | [N] |
| Warning | [N] |
| OK | [N] |
| **Total Checked** | **[N]** |

### Top 3 Highest-Impact Issues

1. **[Issue]:** [One-sentence description and estimated impact]
2. **[Issue]:** [One-sentence description]
3. **[Issue]:** [One-sentence description]

### Recommended Priority Order

1. [First fix, with reason]
2. [Second fix]
3. [Third fix]
...

### Estimated Impact

[Short paragraph describing what fixing every Critical item would accomplish, e.g., "Resolving the 3 Critical findings would stop roughly $X/month in wasted spend and correct conversion reporting that is currently inflated by ~2x."]
```

---

## Reference: worked_example.md

# Worked Example: DataPulse (Fictional B2B SaaS)

A complete end-to-end walkthrough so practitioners can see how findings get identified, classified, and resolved.

### Account snapshot

- **Company:** DataPulse — B2B analytics platform.
- **Business model:** product-led growth with a sales-assisted enterprise tier.
- **Maturity:** Developing (15–30 conversions per month).
- **Spend:** $18,000/month.
- **Primary conversion:** free-trial signup.
- **Secondary goal:** demo request (enterprise tier).
- **Sales cycle:** 14-day free trial; 30–60 day enterprise cycle.
- **Geography:** U.S. only.
- **CRM:** HubSpot.

### Account-level findings

| Setting | Current Value | Recommended | Status | Notes |
|---|---|---|---|---|
| Auto-tagging | ON | ON | OK | Configured correctly |
| Tracking template | Not set | UTM suffix | Warning | HubSpot attribution missing UTMs |
| Auto-apply recommendations | ON (5 categories) | OFF | Critical | "Add keywords" and "Adjust budgets" active |
| Negative keyword lists | 1 list, 12 terms | Expand and apply to all campaigns | Warning | List only on 2 of 5 campaigns |
| Default conversion goals | 4 Primary actions | 2 Primary, 2 Secondary | Critical | Page view and newsletter signup are Primary |

**Drilling into auto-apply (Critical):** Over the last 90 days, Google introduced 23 new keywords on its own. Eight of those — placeholder examples like "spreadsheet templates download" or "office admin clerical work" — sit completely outside the analytics-software topic. On top of that, Google quietly raised the daily budget on two campaigns by a combined $45/day without anyone approving it.

Remediation:
1. Settings → Recommendations → Auto-apply.
2. Disable all categories, or restrict to "Remove redundant keywords" and "Remove conflicting negative keywords."
3. Remove the eight irrelevant auto-added keywords.
4. Reset the bumped budgets to their intended levels.

### Campaign-level findings

**Campaign: "US — Search — Analytics Software — Broad"**

| Setting | Current Value | Recommended | Status | Notes |
|---|---|---|---|---|
| Location targeting | Presence or interest | Presence | Critical | U.S.-only company showing ads to international researchers |
| Display Network | ON | OFF | Warning | 12% of spend ($216/mo) flowing to Display at 0.02% CTR |
| Ad rotation | Optimize | Optimize | OK | |
| Ad schedule | None | Business hours + buffer | Warning | B2B SaaS — trials cluster in work hours |
| Mobile bid adj. | +0% | -25% | Warning | Mobile trial completion is 60% below desktop |

**Drilling into location targeting (Critical):** The campaign is geo-targeted to "United States" but with the "Presence or interest" mode active. DataPulse only sells inside the U.S. The "or interest" half of that mode broadens reach to anyone abroad whose searches reference the U.S. market — a researcher in Lisbon investigating American analytics vendors, for example, will see the ad. Geographic reports put roughly 22% of clicks on users outside the U.S. With this campaign drawing about $6,000/month of spend, that translates to roughly $1,320/month landing on clicks that have no path to becoming customers.

Remediation:
1. Campaign Settings → Locations → Location options.
2. Switch to "Presence: People in or regularly in your targeted locations."
3. Watch the geo report for the next week to confirm international clicks stop.

**Campaign: "US — Search — Demo Request — Enterprise"**

| Setting | Current Value | Recommended | Status | Notes |
|---|---|---|---|---|
| Location targeting | Presence | Presence | OK | |
| Display Network | OFF | OFF | OK | |
| Ad rotation | Do not optimize | Optimize | Warning | No active test — wastes impressions on weak ads |
| Ad schedule | 9am–6pm M–F | 8am–7pm M–F | OK | Reasonable for enterprise B2B |

*(The remaining three campaigns came back clean on the Critical settings.)*

### Conversion tracking findings

| Name | Category | Count | Model | Window | Include | Value | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Free Trial Signup | Signup | Every | DDA | 30d | Yes | None | Critical | Count should be "One" |
| Demo Request | Lead | Every | DDA | 30d | Yes | None | Critical | Count should be "One" |
| Page View — Pricing | Page View | One | DDA | 30d | Yes | None | Critical | Should be Secondary |
| Newsletter Signup | Other | One | DDA | 30d | No | None | OK | Correctly set as Secondary |

**Drilling into count settings (Critical):** Both Free Trial Signup and Demo Request are using "Every." Reconciling against the CRM:

- Free Trial Signup: 47 reported in the last 30 days; CRM shows 31 unique signups. Inflation: 1.52x.
- Demo Request: 12 reported; CRM shows 8 unique. Inflation: 1.5x.

Reported CPA looks like $305 across 59 conversions. With duplicates removed (39 unique), the true CPA is $462 — the account is under-reporting cost-per-acquisition by 51%. Worse still, the bidder is being trained to favor people who happen to hit submit several times rather than people who convert once and don't.

Remediation:
1. Goals → Conversions → Free Trial Signup → Edit settings.
2. Change Count from "Every" to "One."
3. Repeat for Demo Request.
4. Warn stakeholders before flipping: reported conversion volume will drop ~35%. That drop is the correction, not a regression.

**Drilling into pricing page view as Primary (Critical):** "Page View — Pricing" is set Primary. That tells Smart Bidding to treat a pricing page visit with the same weight as a completed trial signup. The bidder ends up chasing a blend of pricing-page visitors and real signups, which dilutes its ability to find users who will actually convert.

Remediation:
1. Goals → Conversions → Page View — Pricing.
2. Move from Primary to Secondary.
3. The action will keep appearing in "All conversions" but will stop influencing Smart Bidding.

### Privacy compliance

| Requirement | Status | Impact if Not Addressed | Priority |
|---|---|---|---|
| Consent Mode V2 | Not applicable (U.S. only) | N/A | N/A |
| Enhanced Conversions for Web | Not enabled | Losing ~5–10% of trial signup attributions | Warning |
| Enhanced Conversions for Leads | Not enabled | Cannot tie HubSpot closed-won back to ad clicks | Warning |
| Restricted Data Processing (CA) | Not enabled | Non-compliant with CPRA for California users | Warning |

### Data connections

| Connection | Status | Required/Recommended | Impact if Missing |
|---|---|---|---|
| GA4 | Linked (GA4-987654321) | Required | N/A |
| Merchant Center | Not applicable | N/A | N/A |
| YouTube | Not linked | Recommended | Cannot build video remarketing audiences |
| Search Console | Not linked | Recommended | No paid-vs-organic keyword visibility |
| GBP | Not applicable | N/A | N/A |
| CRM (HubSpot) | Not linked | Required | No offline conversion data feeding Smart Bidding |
| Data Manager | Not configured | Required | No Customer Match audiences |

**Drilling into the missing CRM connection (Critical for this account):** DataPulse runs its full pipeline in HubSpot but never pushes offline conversions back into Google Ads. As a result, Smart Bidding chases raw trial-signup volume with no feedback on which of those signups eventually pays. An enterprise procurement team kicking off a vendor evaluation is treated by the bidder identically to an undergrad poking at a free analytics tool for an afternoon class project.

Remediation:
1. Enable Enhanced Conversions for Leads (hashes email at signup so it can be matched later).
2. Set up the HubSpot offline conversion import — either the native integration or via Zapier.
3. Create "Qualified Lead" and/or "Closed Won" as offline conversion actions.
4. Mark the offline action Primary with a value based on average deal size.
5. After 30 days of data, switch the bid strategy to optimize for qualified leads rather than raw trial signups.

### Summary dashboard

**Account:** DataPulse (CID: 123-456-7890)
**Audit Date:** 2026-03-15
**Business Type:** SaaS (PLG + Enterprise)
**Maturity Level:** Developing

| Severity | Count |
|---|---|
| Critical | 6 |
| Warning | 7 |
| OK | 9 |
| **Total Checked** | **22** |

**Top 3 highest-impact issues:**

1. **Conversion count settings (Critical):** The "Every" setting on the trial and demo actions is overstating reported conversions by roughly 52%, which pulls reported CPA down by $157 versus the real figure ($305 vs. $462). The bidder is currently learning from duplicate form fills rather than unique leads.
2. **Auto-apply recommendations (Critical):** Inside the last 90 days, Google has self-added 23 keywords and raised budgets without sign-off. At least 8 of the keywords are off-strategy, and the unauthorized budget increases total around $1,350/month.
3. **Location targeting (Critical):** "Presence or interest" on the lead Search campaign is routing ~22% of clicks to overseas users who have no realistic path to becoming customers — roughly $1,320/month of pure waste.

**Recommended priority order:**

1. Fix the conversion count settings — biggest impact on data quality and Smart Bidding signal.
2. Turn off auto-apply and clean up the auto-added keywords — stops the bleeding of unauthorized changes.
3. Switch location targeting to "Presence" — removes the geographic waste.
4. Move "Page View — Pricing" to Secondary — stops diluting Smart Bidding.
5. Stand up the HubSpot offline conversion import — unlocks lead-quality optimization.
6. Enable Enhanced Conversions — recovers lost attribution.
7. Work through the remaining Warning items.

**Estimated impact:** Resolving the six Critical items should recover on the order of $2,670/month that is currently being burned, bring conversion reporting back in line (it's overstating volume by about 52% today), and start feeding Smart Bidding a clean training signal. Item 5 — the HubSpot integration — also flips the optimization target from raw trial volume to qualified-lead value, a change that has historically improved downstream SQL conversion in the 15–30% range across the two to three months that follow.
