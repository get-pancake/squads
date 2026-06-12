---
name: pancake-meta-ads-11-guardian-rules
description: Guardian-rule categories, threshold defaults, and a workflow for auditing what is already running. Load when adding or reviewing automated rules.
---

# Automated Rules

Automated rules run 24/7. They protect campaigns from blowing up overnight, enforce budget discipline, and trigger scaling actions without a human checking the dashboard every hour. This file covers the six rule categories every account should have coverage in, how to set thresholds, and how to audit what's already running.

## Why automated rules

The Ads Manager dashboard is reactive — you see a problem after spend has already happened. Rules are proactive: define what "out of bounds" means once, and let the platform pause, scale, or alert you when it happens.

## Categories of guardian rules

Every active campaign should have coverage in these six categories. Priorities indicate which to set up first.

| Category | Description | Priority |
| --- | --- | --- |
| Kill switches | Auto-pause when CPA, CTR, or frequency exceeds threshold | P1 |
| Budget pacing guards | Adjust daily budget based on ROAS/CPA performance | P1 |
| Creative fatigue alerts | Notify when frequency exceeds safe thresholds | P2 |
| Learning phase protection | Alert if ad set exits learning unexpectedly | P2 |
| Spend anomaly alerts | Notify if daily spend deviates from expected pace | P2 |
| Scale triggers | Increase budget when CPA is consistently below target | P3 |

## P1: Kill switches

### CPA kill switch

**Entity:** Ad set
**Trigger:** Cost per result over the last 3 days exceeds 2× target CPA
**Action:** Pause
**Schedule:** Daily

**Why:** prevents a fatigued or misfiring ad set from burning budget for days before a human notices.

### Frequency kill switch (prospecting)

**Entity:** Ad set
**Trigger:** Frequency (last 7 days) over 4.0 on prospecting campaigns
**Action:** Pause
**Schedule:** Daily

### Frequency kill switch (retargeting)

**Entity:** Ad set
**Trigger:** Frequency (last 7 days) over 10.0 on retargeting campaigns
**Action:** Pause
**Schedule:** Daily

### Zero-conversion spend cap

**Entity:** Ad
**Trigger:** Spend over 2× target CPA in last 48 hours with zero conversions
**Action:** Pause
**Schedule:** Semi-hourly

**Why:** catches obviously broken ads before they spend their way past the daily budget.

### CTR collapse alert

**Entity:** Ad
**Trigger:** CTR over the last 3 days is below 50% of the account average
**Action:** Notify
**Schedule:** Daily

## P1: Pacing guards

### Daily spend cap protection

**Entity:** Campaign
**Trigger:** Daily spend reaches 90% of intended daily budget before 4 PM local time
**Action:** Notify
**Schedule:** Semi-hourly

**Why:** catches budgets that will exhaust before the day ends, leaving you missing evening/late-night conversions.

### ROAS pacing guard

**Entity:** Campaign
**Trigger:** ROAS over last 7 days falls below target ROAS minus 30%
**Action:** Reduce daily budget by 15%
**Schedule:** Daily

### CPA pacing guard

**Entity:** Campaign
**Trigger:** CPA over last 7 days exceeds target CPA by 30%+
**Action:** Reduce daily budget by 15%
**Schedule:** Daily

**Note:** budget reductions count as 20%+ change if they exceed that — keep adjustments under 20% to avoid resetting learning.

## P2: Creative fatigue alerts

### Prospecting frequency warning

**Entity:** Ad set
**Trigger:** Frequency (last 7 days) over 2.5 on prospecting
**Action:** Notify
**Schedule:** Daily

### Retargeting frequency warning

**Entity:** Ad set
**Trigger:** Frequency (last 7 days) over 5.0 on retargeting
**Action:** Notify
**Schedule:** Daily

### CTR decline alert

**Entity:** Ad
**Trigger:** CTR drops 10%+ comparing last 7 days to previous 7 days
**Action:** Notify
**Schedule:** Daily

### CPA trend alert

**Entity:** Ad
**Trigger:** CPA rises 15%+ comparing last 7 days to first 14 days
**Action:** Notify
**Schedule:** Daily

## P2: Learning phase protection

### Learning Limited persists

**Entity:** Ad set
**Trigger:** "Learning Limited" status persists for 7+ days
**Action:** Notify
**Schedule:** Daily

### Learning phase reset detected

**Entity:** Ad set
**Trigger:** Ad set re-enters learning phase (Active → Learning)
**Action:** Notify
**Schedule:** Daily

**Why:** catches accidental learning resets from significant edits. Often the team doesn't realize a budget change triggered re-learning.

## P2: Spend anomaly alerts

### Spend deviation

**Entity:** Campaign
**Trigger:** Daily spend deviates more than 40% from previous 7-day average
**Action:** Notify
**Schedule:** Semi-hourly

### Zero spend alert

**Entity:** Campaign
**Trigger:** Zero spend for 6+ hours during normal delivery window
**Action:** Notify
**Schedule:** Semi-hourly

**Why:** catches policy issues, payment failures, and audience-size-zero situations within hours.

## P3: Scale triggers

### CPA-based scale up

**Entity:** Campaign
**Trigger:** CPA over last 7 days is below 80% of target AND daily budget utilization above 90%
**Action:** Increase daily budget by 15%
**Schedule:** Daily

### ROAS-based scale up

**Entity:** Campaign
**Trigger:** ROAS over last 7 days exceeds target ROAS by 20% AND daily budget utilization above 90%
**Action:** Increase daily budget by 15%
**Schedule:** Daily

**Note:** keep budget increases under 20% to stay within the safe scaling envelope.

## Threshold calibration

The defaults above are reasonable starting points but should be tuned to your account. Two principles:

1. **Less mature accounts get looser thresholds** because variance is naturally higher with smaller volumes
2. **Higher-volume accounts get tighter thresholds** because statistical reliability is higher

Concrete adjustments:

| Account stage | Kill switch CPA over target | Fatigue frequency | Spend deviation |
| --- | --- | --- | --- |
| Nascent | +75% | 3.5 | 60% |
| Developing | +60% | 3.0 | 50% |
| Established | +40% | 2.5 | 40% |
| Advanced | +30% | 2.0 | 30% |

## Auditing existing rules

Before adding new rules, audit what's already running. Common findings:

- Rules created for campaigns that no longer exist
- Rules with thresholds set too tight, firing constantly
- Rules with thresholds set too loose, never firing
- Rules that were appropriate at the account's earlier maturity but are now wrong
- Rules created during an incident and never cleaned up
- Two rules contradicting each other (one tries to pause, another tries to scale)

### Audit workflow

1. **List all active and disabled rules:** name, status, entity, trigger, action, schedule, applied campaigns
2. **Pull rule execution history:** when did each rule last fire? How many times in the last 30 days?
3. **Flag rules that:**
   - Have never fired (may be misconfigured or threshold too high)
   - Fire too frequently (threshold too sensitive)
   - Failed to execute (API or permission issues)
   - Fired but shouldn't have (threshold misconfigured)
4. **Gap analysis:** compare existing rules against the six categories to identify missing coverage
5. **Classify each proposed rule by budget impact:**
   - Kill switches, pacing guards that reduce budget, fatigue alerts, learning-phase alerts, anomaly alerts, and any "notify" or "pause" or "reduce" action: create or update autonomously
   - Scale triggers (rules that raise budgets or caps automatically): queue for approval — these delegate budget-commitment decisions to the rule, so they need explicit sign-off before activation
6. **Apply autonomous changes immediately**, queue scale-triggers in the digest, document the final inventory in the audit log

## Rule lifecycle hygiene

- Review the full ruleset quarterly
- Disable rules tied to campaigns that no longer exist
- Update thresholds when target CPA/ROAS changes
- After running for 3 months, look at firing frequency:
  - Rule has fired 0 times: threshold too loose or rule misconfigured
  - Rule fires 1–3 times per week: probably tuned correctly
  - Rule fires 5+ times per week: threshold too sensitive

## Limits of automated rules

What rules cannot do:

- React faster than their schedule (semi-hourly is the floor)
- Make creative judgments (which ad is fatigued vs which is being saturated)
- Distinguish learning phase volatility from real performance decline
- Replace human review for nuanced decisions (audience expansion, creative strategy)
- Fix structural problems (over-fragmentation, wrong objective)

Rules are a safety net, not a strategy. Build them so the team can focus on the work that requires judgment.

## When to set up rules

- **New account setup:** baseline ruleset from scratch — all P1 categories
- **Post-launch:** add guardian rules after campaigns go live
- **Weekly review:** check if existing rules are firing as expected
- **Incident response:** if a campaign overspent or paused unexpectedly, audit rules to find the cause
- **Scaling phase:** add scale triggers when campaigns perform above target
- **After maturity transition:** revise thresholds to match the new stage

## Proposed rule template

When proposing a new rule, document it fully before activating:

```
Name: [descriptive name]
Type: Kill switch / Pacing guard / Fatigue alert / Learning alert / Anomaly alert / Scale trigger
Entity: CAMPAIGN / ADSET / AD
Applied to: [specific campaigns/ad sets, or "all active prospecting"]
Schedule: DAILY or SEMI_HOURLY

Trigger condition:
  Metric: [metric name]
  Operator: GREATER_THAN / LESS_THAN
  Value: [threshold]
  Time range: LAST_7_DAYS / LAST_3_DAYS / YESTERDAY / TODAY
  Attribution window: [per account config]

Action:
  Type: PAUSE / SEND_NOTIFICATION / ADJUST_BUDGET
  Parameters: [recipient, percentage, etc.]

Notification message: [what the alert will say]
Recipient: [admin email]

Rationale: [why this rule is needed, what it protects against]
Risk: [unintended consequences to be aware of]
```
