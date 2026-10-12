# Property Scanner — Landing Page Context

Source: https://www.propertyscanner.com/ (fetched 2026-10-12). This is the marketing/landing page only, not the product itself.

## What it is
A London property search product. The user describes their ideal home once in plain English (typed or spoken). The system continuously watches listings, scores them against that brief, and surfaces matches with reasoning. It replaces portal filters and manual refreshing.

Core promise: **"Say it once. We find your home."**

## Page structure (in order)

| # | Section | Anchor | Key content |
|---|---------|--------|-------------|
| 0 | Header | – | Logo (light/dark variants). Nav: How it finds · Ways to live · How it works · How it ranks · Contact Us. CTA: "Claim your place". |
| 1 | Hero | – | H1 "Say it once. We find your home." Hero London image. Status line: "London. Founding member access is open. 37 of 100 places claimed". |
| 2 | How it finds | `#scan` | "Watch one sentence narrow down London." Dots = listings, the brief eliminates non-matches. Funnel: 4,812 all London → 1,126 (3+ bed, garden) → 214 (under £450k) → 3 (near Outstanding school). Sample cards: Hampstead 94%, Islington 92%, Clapham 96%, Greenwich 88%. |
| 3 | Sample results | – | Brief: "3 bedrooms, a garden, under £450k, 40 min to King's Cross, near an Outstanding school." Top: Hemingford Rd, Islington N1, 97%, £449,950, 1,120 sq ft. Each result lists *Confirmed* and *Uncertain* facts. Others: Albion Rd N16 95%, Mapledene Rd E8 90%. |
| 4 | Ways to live | `#live` | "Explore London by the way you live." Lifestyle themes: parks/heaths, Outstanding schools in walking distance, high-street feel, door-to-desk commute on real routes (<30 min). Carousel: Blackheath, Islington, Peckham, Southwark. |
| 5 | How it works | `#how` | "You don't need to search for a home anymore." 5 steps (below) + app mockup. |
| 6 | How it ranks | `#rank` | "Ranked by match. Never by fees." Example list; a promoted listing (Riverside Tower E14, 41%) ranks last despite being promoted. |
| 7 | Founding 100 | – | "Be one of the first 100 in London." 37/100 claimed; grid of 100 slots (1–37 filled, 38 next). |
| 8 | Sign-up form | modal | See below. |
| 9 | FAQ | `#faq` | 5 questions (below). |
| 10 | Footer | – | Greenwich, London · © 2026 Property Scanner Ltd · info@propertyscanner.com · Privacy · Terms · Back to top · socials (Instagram, LinkedIn, X, Facebook, TikTok) · "Ask AI about us" (ChatGPT, Claude, Perplexity, Gemini, Grok). |

## How it works (the 5 steps)
1. **Tell us your lifestyle** — typed or spoken.
2. **We understand your priorities** — commute, schools, street type, beyond bedrooms/price.
3. **We search continuously** — new listings checked daily, no manual refresh.
4. **You get homes that match** — no endless scrolling; each match explains why.
5. **One app, not five** — consolidates 12+ sources.

### App mockup details
- Search field holds the natural-language brief, parsed into tags: `3 beds` · `Garden` · `Under £450k` · `≤ 40 min to King's Cross` · `Outstanding school`.
- Status: "Scanning London — Checking new listings across 12 sources in real time".
- Tabs: Best matches (46) · New today · All matches.
- Result rows: address, match %, price.
- Alerts feed: "12 new matches (2m ago)", "Price drop (1h)", "New listing (3h)", "School catchment (5h)".

## Ranking and trust model
- Score = alignment with the user's brief only. No paid placement can influence rank.
- Every listing shows its **source**, **match reasoning**, and **what is uncertain**.
- Match labels seen: Best match (97), Strong match (94), Good match (92).

## Founding member programme
- Free for the first 100 London members (37 claimed at fetch time).
- Perks: early access, priority matching, help shape features, events and London market briefings, referral rewards.

## Sign-up form
- Email (required)
- "What are you looking for?" (optional free text)
- Role: "I'm looking for a home" / "I'm an agent or agency"
- CTA: "Claim my founding place"
- Disclaimer: "We'll only email you when something genuinely matches. No agent spam, leave any time."

## FAQ (answers summarised)
- **vs. a normal portal?** Plain-English brief instead of filter guessing; search runs continuously.
- **Areas?** London only for now; founding members steer expansion.
- **Can I trust the AI analysis?** Every match shows source, reasoning, uncertainty.
- **Does AI decide the final score?** Score reflects brief alignment, reasoning is visible, no paid manipulation.
- **Will you contact agents for me?** No; the user decides when and whom to contact.

## Design cues
- Light and dark mode (separate logo/map assets for each).
- Sans-serif, modular headline hierarchy.
- Imagery: London property exteriors, day/night maps, orbit diagrams, notification icons.
- Interactions: dot-funnel animation, lifestyle carousel, re-rankable list, scrollable 1–100 slot grid, modal sign-up.
- Icons: chat bubble, sliders, search, star, home, heart, bell.

## Differentiators
1. Natural-language brief, no filters.
2. Continuous monitoring and alerts.
3. Transparent, source-backed scoring with stated uncertainty.
4. No paid placement.
5. One consolidated feed from 12+ sources.

## Caveats
- Extracted via a page-to-markdown summariser, so exact copy, layout, and animations are approximate. Verify visually before copying wording or styling.
- Data-source names (e.g. Rightmove, Zoopla) are not named on the page; any such names are inference. The page only says "12 sources".
- Counts (37/100, 4,812 etc.) are live or illustrative values at fetch time.
