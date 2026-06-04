---
name: pancake-meta-ads-09-policy-and-privacy
description: Special Ad Categories, GDPR and CCPA requirements, Consent Mode, ad review traps, and restricted content rules. Load before any compliance audit or when shipping ads in regulated verticals.
---

# Compliance and Policy

Compliance failures can shut an account down with little warning and a slow appeal process. This file is about catching the issues before Meta does — Special Ad Categories, privacy regulations, ad policies, and data handling.

## Where compliance rules come from

```
Legal requirements (GDPR, CCPA, LGPD, etc.)
  ── supersede all other requirements
  ── penalties: up to 4% of global revenue (GDPR), $7,500/violation (CCPA)
  ── non-negotiable

Meta platform policies
  ── ad content rules
  ── Special Ad Categories
  ── data use policies
  ── account-level enforcement

Industry self-regulation
  ── NAI/DAA guidelines
  ── IAB frameworks (TCF 2.2)
```

## Special Ad Categories

Meta requires advertisers to declare a Special Ad Category for ads related to housing, credit, employment, and in some markets social issues/elections/politics. Declaring imposes targeting restrictions designed to prevent discriminatory advertising.

### Category definitions

**Housing:** sale or rental of housing, mortgages, home insurance, apartment rentals, real estate broker services. Not housing: real estate SaaS, home improvement products, property management software, brand awareness for a construction company.

**Credit:** credit cards, loans, BNPL, insurance products, investment opportunities with return claims. Not credit: accounting software, banking app brand awareness, financial education content, payment processing tools.

**Employment:** specific job openings, career opportunities, job boards, staffing services. Not employment: HR software, job-board brand awareness, employer branding without specific jobs, career coaching.

**Social Issues / Elections / Politics:** political candidates and parties, advocacy for/against legislation, defined social issues. Available in: US, EU, UK, AU, IL, and expanding. Extra requirements: "Paid for by" disclosure, identity verification, 7-year Ad Library retention.

### Targeting restrictions when declared

| Feature | Available? |
| --- | --- |
| Age targeting | No |
| Gender targeting | No |
| ZIP/postal code targeting | No — minimum 15-mile radius |
| Detailed targeting (interests) | Limited — many categories removed |
| Standard Lookalikes | No — replaced by "Special Ad Audiences" |
| Lookalike audiences | Limited to Special Ad variant |
| Custom Audiences | Yes (with source restrictions) |
| Advantage+ Audience | Limited with automatic compliance restrictions |
| Geographic targeting | Yes, with 15-mile minimum radius |
| Language targeting | Yes |
| Placement selection | Yes |

### Special Ad Audiences (lookalike replacement)

For Special Categories, standard Lookalikes aren't available. Special Ad Audiences use a similar concept but exclude age, gender, and ZIP-level precision. They have broader reach, less precision, and typically perform 20–30% below standard Lookalikes on CPA.

Best practices:
- Use your highest-quality source audience (actual customers, not just visitors)
- Source minimum: 100 people; 1,000+ recommended
- Create multiple from different sources and test
- Combine with strong creative to compensate for broader targeting
- Expect higher CPA and adjust targets accordingly

### When it's ambiguous

If your ad could be interpreted as housing, credit, or employment, err on declaring. The performance cost of declaring is less than the cost of an account restriction.

Distinctions:
- SaaS for real estate agents: not housing — the ad is for the tool
- "Get a business loan": credit
- Accounting software: not credit
- Specific job posting: employment
- Company employer branding without specific jobs: not employment

### Consequences of not declaring

- Ad rejected by automated review
- Account restriction after repeated violations
- Retroactive enforcement — ads can be pulled mid-flight
- Legal liability: housing/employment discrimination is a federal civil rights issue in the US (Fair Housing Act, Title VII)

### Optimization within restricted categories

With targeting restricted, performance optimization shifts to other levers:

- **Creative is king:** your creative must self-select the right audience because targeting can't
- **Landing page optimization:** stronger LPs compensate for broader targeting; use forms to qualify leads
- **Geographic strategy:** 15-mile radius circles strategically placed to cover service area; multiple overlapping circles can approximate metro-level targeting
- **Cost Cap is essential:** broader targeting means more low-quality impressions; Cost Cap ensures you only pay for efficient ones; start at 2× target CPA, tighten as data accumulates

## GDPR (EU/EEA/UK)

Applies to anyone targeting EU/EEA residents, regardless of where your company is based. Penalties up to 4% of global revenue or 20M EUR.

### Core requirements

| Requirement | What it means | Implementation |
| --- | --- | --- |
| Lawful basis | Legal basis for processing data for advertising | Consent (most common) or Legitimate Interest (harder to defend for tracking) |
| Explicit consent | Active opt-in before tracking | CMP with granular controls |
| Granular permissions | Separate consent per purpose | Purpose-level toggles in CMP |
| Right to erasure | Users can request data deletion | Process to remove from Custom Audiences within 30 days |
| Right to access | Users can request what data you hold | Document data flows to Meta |
| Data minimization | Only collect data necessary for the stated purpose | Don't send unnecessary CAPI parameters |
| Privacy policy | Must disclose Meta tracking and advertising | Reference Meta Pixel, CAPI, advertising purposes |

### Consent Management Platform (CMP)

Recommended CMPs: OneTrust (enterprise, full TCF 2.2), Cookiebot (mid-market, easy setup), Osano (SMB-friendly), Termly (budget), Didomi (EU-focused).

Configuration for Meta:
1. Block Meta Pixel from firing until consent is granted
2. Pass consent signal to Meta via Consent Mode API
3. On denial, Meta uses modeled conversions
4. On grant, full pixel + CAPI activates
5. Store consent records minimum 3 years for audit

### TCF 2.2

Meta is registered as an IAB TCF vendor. With a TCF-compliant CMP, Meta automatically respects the consent signal. Required purposes:
- Purpose 1: store/access device info (required for pixel)
- Purpose 3: create profiles for personalized advertising
- Purpose 4: use profiles to select personalized advertising
- Purpose 5: create profiles to personalize content
- Purpose 7: measure advertising performance
- Purpose 10: develop and improve services

### GDPR performance impact

- 20–40% fewer reported conversions in EU markets without consent
- Modeled conversions fill some of the gap (60–80% typically)
- Adjust EU CPA targets upward by 10–20% to account for measurement loss
- CAPI helps — server events can fire regardless of cookie consent with appropriate data processing controls

## CCPA / CPRA (California)

Applies if you serve California residents AND meet at least one threshold:
- Annual revenue over $25M, OR
- Process data of 100,000+ California consumers/households, OR
- Derive 50%+ revenue from selling/sharing personal information

### Core requirements

| Requirement | What it means | Implementation |
| --- | --- | --- |
| Right to know | Users can request what data you share with Meta | Document all data flows |
| Right to opt out | "Do Not Sell or Share" link required | Implement GPC signal handling |
| Right to delete | Users can request deletion | Remove from Custom Audiences within 45 days |
| Limited Data Use (LDU) | Flag data as California-restricted | Send LDU via CAPI |
| Privacy policy | Disclose sharing with Meta for advertising | List Meta as advertising partner |

### CAPI Limited Data Use implementation

For opted-out California users:
1. Set `data_processing_options` to `['LDU']` in the CAPI event payload
2. Set `data_processing_options_country` to `1` (US)
3. Set `data_processing_options_state` to `1000` (California)

Meta processes the event with restrictions (no cross-site tracking, limited optimization).

When to apply LDU:
- User has opted out via your "Do Not Sell/Share" mechanism
- Global Privacy Control (GPC) signal detected in the browser
- California resident who hasn't explicitly consented

Don't apply LDU universally — only for opted-out California users. Typical impact: affects 5–15% of California traffic (varies by opt-out rate).

### Global Privacy Control (GPC)

Your site should detect `Sec-GPC: 1` header or `navigator.globalPrivacyControl` JavaScript API. When detected:
- Do not fire Meta Pixel
- Do not send CAPI events with PII
- Apply LDU if sending any events
- Do not prompt for re-consent — GPC is legally binding

## Meta Consent Mode

Bridges privacy compliance and advertising measurement. When users decline cookie consent, Consent Mode enables modeled attribution.

How modeling works:
- Meta estimates the denied user's likelihood of converting
- Based on aggregate patterns from consented users
- Modeled conversions appear in reporting, flagged as modeled
- Accuracy improves with higher consent rates and more CAPI data

Modeled conversion accuracy:
- Improves with data (more consented conversions = better models)
- Accounts with 100+ weekly conversions see higher accuracy
- Fills roughly 60–80% of the consent gap
- 10–20% variance vs actual is normal
- Directionally accurate for optimization; less reliable for financial reporting

### Improving consent rates

- Non-intrusive CMP design (bottom bar beats full-screen overlay)
- Clear hierarchy on "Accept" button (not dark pattern, but visible)
- Concise explanations of data use
- Genuine value exchange ("personalize your experience")
- Average rates: 70–85%

## Ad review and disapproval

All ads go through automated review before delivery, some flagged for manual review. Typical review under 24 hours, up to 72 hours for new accounts or flagged content.

### Common disapproval reasons

| Reason | Triggers | Resolution |
| --- | --- | --- |
| Personal attributes | "Are you struggling with X?" implying knowledge of personal traits | Reframe to be about the product, not the person |
| Before/after | Side-by-side transformations | Remove transformation imagery |
| Unsubstantiated claims | "Best," "#1," specific ROI claims without evidence | Add disclaimers, use qualified language ("up to") |
| Misleading content | Clickbait, sensationalized copy, fake UI | Make ads accurate representations |
| Non-functional LP | 404s, broken pages, mismatched domains | Test all URLs before launching |
| Restricted content | Alcohol, gambling, supplements without authorization | Apply for authorization or adjust |
| Low quality | Excessive text on image, grammar errors, all caps | Follow creative best practices |
| Circumventing systems | Cloaking, misleading text | Never do this — can lead to permanent ban |
| Special category not declared | Housing/credit/employment without flag | Declare the category |

### Account Quality

Check Business Manager → Account Quality regularly:
- Score below 3/5: at risk of restrictions
- Multiple disapprovals in short timeframe: increased scrutiny on new ads
- Pattern of violations: may trigger manual review on all new ads

### Appeal process

1. Account Quality → select rejected ad → Request Review
2. Provide brief explanation of compliance
3. Review typically completes within 24–48 hours
4. If denied: modify the ad to address the specific issue
5. For systematic issues: contact your Meta Business Partner rep

### Pre-launch compliance checklist

- Ad copy avoids "you" + personal attribute phrasing
- No before/after transformation imagery
- Claims are qualified and substantiated
- Landing page is functional and matches ad content
- Special Ad Category declared if applicable
- No restricted content without authorization
- Text-to-image ratio is reasonable (ideally <20%)
- Grammar correct, no all caps
- Privacy policy accessible from landing page
- CMP functioning correctly for EU/CA traffic

## Custom audience and data handling

### Customer list policies

| Requirement | Detail |
| --- | --- |
| Data source | First-party data only (customers who interacted with your business) |
| Consent | Users must have consented to data use for marketing |
| Hashing | PII must be SHA-256 hashed before upload (Meta hashes automatically in Ads Manager UI) |
| Retention | Custom Audiences auto-expire after 180 days without refresh |
| Refresh cadence | Update lists at least monthly, weekly recommended |
| Removal requests | Honor opt-out within 30 days (GDPR) or 45 days (CCPA) |
| Source disclosure | Be prepared to answer where data came from |

### Audience refresh requirements

- Customer-list audiences refresh every 30 days minimum
- Website Custom Audiences auto-refresh via pixel
- Engagement audiences auto-maintained
- Stale audiences degrade in performance even before 180-day expiry
- Calendar reminder: 1st and 15th of each month

### Data minimization for CAPI

Always send (required for matching):
- em (hashed email)
- fn (hashed first name)
- ln (hashed last name)
- client_ip_address
- client_user_agent
- fbc (Facebook click ID)
- fbp (Facebook browser ID)

Send when available (improves matching):
- ph (hashed phone)
- external_id (hashed user ID)
- ge (hashed gender)
- db (hashed date of birth)
- ct, st, zp (hashed city, state, ZIP)

Do not send:
- Sensitive health information
- Financial account numbers
- Social security numbers
- Anything not covered by your privacy policy
- Racial or ethnic origin, religious beliefs, sexual orientation, genetic or biometric data, political opinions
- Precise geolocation (fine-grained GPS)

## Restricted content

### Requires special authorization

| Category | Notes |
| --- | --- |
| Alcohol | Local law compliance, age-gating required |
| Online gambling | Written permission from Meta, licensed operator |
| Cryptocurrency | Written permission, licensed exchange/wallet |
| Political/social issues | "Paid for by" disclaimers, authorization |
| Pharmaceuticals | No prescription drugs to consumers in US |
| Supplements | No health claims, no before/after |
| Financial products | APR/fee disclosures, no guaranteed returns |
| Dating | Approved advertisers only |
| Weight loss | No before/after, no unrealistic claims |

### Prohibited content

- Illegal products/services
- Discriminatory practices
- Tobacco (vapes in most markets)
- Weapons and ammunition
- Spyware/surveillance equipment
- Payday loans (many markets)
- MLM with income claims
- Misleading health claims
- Counterfeit goods

## Compliance audit checklist

### Monthly

**Measurement and tracking:**
- Pixel firing on all key pages
- CAPI active, EMQ above 6.0
- CMP blocking pixel until consent (EU/CA)
- LDU applied for opted-out California users
- Domain verified in Business Settings
- Consent Mode functioning

**Audience and data:**
- Customer lists refreshed within last 30 days
- Opt-out/deletion requests processed
- All Custom Audiences built from consented first-party data
- No audience lists older than 180 days
- Data minimization: only necessary CAPI parameters

**Ad content:**
- No personal attribute phrasing in active ads
- Special Ad Categories declared where applicable
- Restricted content has proper authorization
- Landing pages functional, match ad promises
- Claims qualified and substantiated
- Privacy policy current and accessible

**Account health:**
- Account Quality page clean
- No pending ad disapprovals
- Business verification current
- Payment method valid
- 2FA enabled on all admin accounts

### Quarterly

- Privacy policy reviewed and updated
- CMP configuration verified (new features, new vendors)
- DPAs with Meta current
- CAPI implementation reviewed for new events/parameters
- Team training on compliance requirements
- Competitor compliance reviewed via Ad Library

## Quick reference: what to do when...

| Situation | Action |
| --- | --- |
| User requests data deletion | Remove from Custom Audiences + CRM + CAPI within 30 days (GDPR) or 45 days (CCPA) |
| User opts out via GPC | Apply LDU flag, stop PII sharing immediately |
| New EU market launch | Verify CMP covers the market, check local GDPR nuances |
| Meta requests DPA update | Review with legal, sign within 30 days |
| Ad disapproved for personal attributes | Rephrase to be about the product |
| Audit finds non-compliant Custom Audience | Delete immediately, investigate source |
| CAPI sending unsanctioned data | Audit, remove unnecessary parameters, document the fix |
