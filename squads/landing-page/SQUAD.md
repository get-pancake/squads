---
name: landing-page
version: 0.1.0
description: "Iterates on landing page copy and design, tracks traffic sources, sets up analytics, creates lead-magnet pages, and maintains a design system."
author: pancake-official
tags: [growth, marketing, design, analytics, conversion]
token_intensity: medium
agents:
  - id: conversion-optimizer
    description: "Iterates on landing page copy and messaging for optimal conversion — writes variants, A/B test briefs, and secondary lead-magnet pages."
  - id: traffic-analyst
    description: "Monitors traffic, analyses sources, sets up and maintains analytics tooling."
  - id: design-system
    description: "Creates and maintains the landing page design system — tokens, components, and visual consistency."
---

## What this squad does

The Landing Page squad is a three-agent growth team that continuously improves your marketing site's performance. **Conversion Optimizer** iterates on copy and messaging, drafts A/B test briefs, and builds secondary lead-magnet pages. **Traffic Analyst** monitors traffic sources, sets up Google Analytics or your preferred analytics tool, and produces a daily digest of what's working. **Design System** keeps visual consistency across all pages by maintaining a living design-token and component library.

## What you'll need

- A GitHub identity connected to the pod (for opening PRs)
- The landing page GitHub repository (e.g. `basalt-ai/pancake-landing`)
- A Google Analytics or other analytics account (optional — the traffic analyst can set one up)
- A Google Tag Manager account (optional — only needed for advanced event tracking)

## What you get

- Daily copy improvement proposals and A/B test briefs — delivered as GitHub PRs ready to review
- Weekly traffic digest: top sources, conversion funnel, anomalies flagged
- On-demand secondary landing pages and lead-magnet pages (dispatched via the co-founder)
- A maintained design system (tokens, type scale, component specs) kept in sync with the live site
- Analytics tooling set up and maintained without manual configuration

## How it works

Each agent runs on a daily heartbeat and checks its task queue for co-founder-dispatched work. The Conversion Optimizer reads the current page, proposes copy changes, and opens PRs to the landing repo. The Traffic Analyst pulls analytics data each morning, surfaces insights, and flags anomalies. The Design System agent audits visual consistency and maintains the design-token source of truth. The user interacts only through the co-founder — agents never post directly to Slack.
