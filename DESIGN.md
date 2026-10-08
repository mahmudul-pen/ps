---
name: Property Scanner
description: AI property search for London buyers. Feelings in, scan out.
colors:
  ink: "#0a0a09"
  ink-2: "#11110f"
  ink-3: "#1b1a17"
  line: "rgb(244 240 229 / 0.14)"
  line-2: "rgb(244 240 229 / 0.26)"
  paper: "#f4f0e5"
  muted: "#b2ac9e"
  yellow: "#ffd400"
  yellow-2: "#ffe55c"
  on-yellow: "#141100"
  on-yellow-2: "#3b3300"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 6.4vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 4.4vw, 4.4rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.3
  voice:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.015em"
rounded:
  tag: "3px"
  control: "4px"
  panel: "6px"
  bubble: "14px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  panel: "16px"
  form: "28px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.yellow-2}"
    textColor: "{colors.on-yellow}"
  button-small:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  link-underlined:
    textColor: "{colors.paper}"
  input:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "48px"
  panel:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "16px"
  chip-read-as:
    textColor: "{colors.paper}"
    rounded: "{rounded.tag}"
    padding: "4px 10px"
  step-number:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.control}"
    size: "38px"
  drenched-section:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
---

# Design System: Property Scanner

## Overview

**Creative North Star: "The Scan"**

A night survey of London. The ground is ink black; the only light in the world is signal yellow, and it behaves like light: it sweeps a 3D diorama as a scanning beam, glows under the primary button, underlines the console as it reads, and once per page floods an entire section. Everything else is warm off-white paper text and hairline rules on near-black panels.

Two voices carry every surface. Outfit is the machine: headings, filters, readouts, counts, labels. Newsreader italic is the buyer: their own words, quoted wishes, typed queries, the enquiry they send. The visual system is the product promise made literal: feelings (serif italic) go in, a scan (sans, yellow) comes out.

Truth is drawn, not just written. A solid line or filled dot means a fact from a source; a dashed line or dashed ring means an estimate. This stroke grammar runs from the 3D wireframe (dashed yellow lines) down to 12px legend ticks.

**Key Characteristics:**
- Ink ground, one light source (signal yellow), warm paper text.
- Outfit for the machine, Newsreader italic for the buyer's words.
- Solid = known, dashed = guessed, at every scale.
- Full-bleed WebGL stage behind pinned, scroll-scrubbed chapters; copy sits on directional ink scrims.
- One drenched yellow chapter per page.

## Colors

A two-colour world: ink black and signal yellow, with warm paper text and translucent paper hairlines.

### Primary
- **Signal Yellow** (yellow): the light. Primary buttons, active step markers, the scan beam, the console read-bar, the `.voice` line inside headlines, focus rings, selection, and the one drenched section.
- **Lamp Yellow** (yellow-2): hover state of yellow controls only.

### Neutral
- **Ink** (ink): page ground, WebGL clear colour, form field fill, 3D tag fill, footer.
- **Ink Raised** (ink-2): panels: console, UI mockups, filter rows, the demo form.
- **Ink Lifted** (ink-3): inner fills: the buyer's chat bubble, inactive step-number discs.
- **Paper** (paper): primary text on ink.
- **Dust** (muted): secondary copy, labels, nav links, captions, meta.
- **Hairline** (line) and **Hairline Strong** (line-2): borders and dividers; strong for input and filter strokes and link underlines.
- **Yellow Ink** (on-yellow) and **Yellow Ink Soft** (on-yellow-2): text and rules on yellow; soft for secondary copy inside the drenched section.

### Named Rules
**The One Light Rule.** Yellow is the only chromatic colour. It is used as light (beam, glow, focus, active state) or as a full drench, never as a decorative tint on neutral UI. Translucent yellow (`rgb(255 212 0 / 0.06–0.6)`) is reserved for chip fills, scan-result borders and glows.

**The One Drench Rule.** Exactly one section per page inverts to a yellow ground with ink text. It carries the human content (who it is for), not a CTA banner.

## Typography

**Display Font:** Outfit (with system-ui, sans-serif)
**Voice Font:** Newsreader italic, optical sizing on (with Georgia, serif)

**Character:** A tight geometric sans set heavy and tightly tracked plays the instrument; a soft editorial italic plays the person talking to it.

### Hierarchy
- **Display** (600, clamp(2.9rem, 6.4vw, 6rem), 0.96, -0.04em): hero headline only. Lines reveal from a clipped mask.
- **Headline** (600, clamp(2.3rem, 4.4vw, 4.4rem) to clamp(3rem, 7vw, 6rem), ~1, -0.04em): chapter headings. Short, often two stacked lines.
- **Title** (600, clamp(1.6rem, 2.4vw, 2.2rem), 1.1, -0.03em): step headings beside a yellow number tile.
- **Body** (400, 17px, 1.55): base. Lead copy runs 18–19px in Dust at 40–44ch with `text-wrap: pretty`.
- **Label** (500, 13–15px): console labels, filter names, meta, captions, nav links. Sentence case; numbers use tabular figures.
- **Voice** (Newsreader italic 400, -0.015em): the buyer's words. 22px in the console, 18px in chat and mail, 20–26px for floating feelings, and inline inside Outfit headlines at 0.86em in yellow.

### Named Rules
**The Two Voices Rule.** Newsreader italic is only ever a human speaking (the buyer, a persona quote, an enquiry, the textarea they type into). System replies, data and UI are always Outfit. If the machine is talking, it is never serif.

**The Voice Line Rule.** A chapter headline may pair one Outfit line with one yellow Newsreader italic line; the italic line is the feeling, the sans line is the scan.

## Layout

Full-bleed, gutter-driven (`spacing.gutter`), no centred container. A fixed WebGL canvas fills the viewport behind everything; HTML chapters scroll above it.

- **Hero**: min 100svh, two-column grid (1.3fr / 0.7fr, min 320px) aligned to the bottom: headline bottom-left, console bottom-right.
- **Pinned chapters**: tall sections (300–560vh) with a sticky 100svh frame; scroll scrubs both the 3D camera and the DOM. Copy hugs the left and sits on a horizontal ink scrim (`linear-gradient(90deg, ink 0.85–0.9 → transparent ~60%)`) so the scene stays visible on the right.
- **Drenched section and launch**: normal flow, large vertical padding (clamp(96px, 16vh, 180px); launch 30vh top), launch as copy + 320–440px form column aligned to the bottom.
- **Small screens (≤900px)**: single column; scrims flip to bottom-up; nav keeps only Book a demo; step rail collapses to number discs.
- Spacing is pragmatic px (6, 8, 10, 16, 22, 28, 32, 40) rather than a token scale; vertical rhythm in sections uses vh/svh clamps.

## Elevation & Depth

Depth comes from the 3D scene and from ink layering, not from a shadow scale. Panels sit one ink step up (ink-2) with a hairline border and a single long, soft drop shadow that only darkens what is beneath. The one coloured shadow is yellow glow: light, not elevation.

### Shadow Vocabulary
- **Panel drop** (`box-shadow: 0 30px 60px -30px rgb(0 0 0 / 0.9)`): console and UI mockups. The form uses the deeper `0 40px 80px -40px rgb(0 0 0 / 0.95)`.
- **Yellow glow** (`box-shadow: 0 10px 30px -12px rgb(255 212 0 / 0.55)`, hover `0 16px 36px -14px rgb(255 212 0 / 0.7)`): primary button only. The small nav button drops it.
- **Beam glow** (`box-shadow: 0 0 12px var(--yellow)`; `drop-shadow(0 0 6px rgb(255 212 0 / 0.7))`): the console read-bar and 3D tag ticks.
- **Focus halo** (`box-shadow: 0 0 0 3px rgb(255 212 0 / 0.2)`): form fields on focus.

### Named Rules
**The Light Not Lift Rule.** A yellow shadow means something is emitting or active; it never stands in for elevation. Neutral surfaces use only the dark long drop.

## Shapes

Mostly square with small, instrument-like radii: 3px for tags, chips and sent stamps; 4px for buttons, inputs, filter rows and number tiles; 6px for panels. Two softer exceptions are deliberate: chat bubbles (14px with one 4px tail corner pointing at the speaker) and the step rail (999px pills with circular number discs).

Stroke carries meaning. Solid 1px yellow borders mark known facts; 1px dashed yellow borders mark estimates and the Illustrative tag. In the drenched section, rows are divided by 1.5px Yellow Ink rules.

### Named Rules
**The Solid-Fact, Dashed-Guess Rule.** Solid stroke or filled dot = from the listing or an official record. Dashed stroke or dashed ring = estimated, shown with its confidence. Never use dashed strokes decoratively or solid strokes on an estimate.

## Components

### Buttons
Confident, lit from within.
- **Shape:** gently squared (4px).
- **Primary:** Signal Yellow fill, Yellow Ink text, Outfit 600 16px, 52px tall, 24px side padding, trailing 16px arrow, yellow glow.
- **Hover / Focus:** Lamp Yellow, lifts 2px, glow deepens, arrow slides 4px right (0.4s, `cubic-bezier(0.16, 1, 0.3, 1)`). Focus is a 2px yellow outline, 3px offset. Disabled: 0.6 opacity, progress cursor.
- **Small:** 40px, 16px padding, 15px, no glow (nav).
- **Text link:** Paper text, 500, with a Hairline Strong underline 3px below; hover turns text and rule yellow.

### Chips
- **Read-as chip:** 13px Paper on `rgb(255 212 0 / 0.06)`, 1px `rgb(255 212 0 / 0.4)` border, 3px radius. Shows how the buyer's words were parsed; appears staggered as the scan completes.
- **Illustrative tag:** 12px yellow on a dashed yellow border. Required wherever example data appears.

### Cards / Containers (panels)
- **Corner Style:** 6px.
- **Background:** Ink Raised.
- **Shadow Strategy:** Panel drop (see Elevation).
- **Border:** 1px Hairline.
- **Internal Padding:** 16px (mockups), 20–22px (console), 28px (form).

### Inputs / Fields
- **Style:** Ink fill, 1px Hairline Strong stroke, 4px radius, 48px tall, Paper 16px text, Dust 14px labels stacked above.
- **Textarea:** the buyer's wish, so it is Newsreader italic 18px.
- **Focus:** stroke turns yellow plus a 3px 20% yellow halo; no outline.
- **Error:** `:user-invalid` stroke and message in a warm coral; success replaces the form with a yellow Outfit 32px thank-you.

### Navigation
Fixed, transparent over the hero on an ink-to-clear gradient; becomes solid Ink with a Hairline bottom rule once scrolled. Brand mark (house outline crossed by a yellow horizon line) plus wordmark at 18px 600. Links are Dust 15px, Paper on hover; Book a demo is the small button. Under 900px only the button stays.

### The Console (signature)
"Your words" to "Read as": a panel with a Dust label, the query typed live in Newsreader italic with a blinking yellow caret, a hairline that fills yellow with a glow as the beam scans, read-as chips, and a tabular count where the match number is yellow.

### Fact Tags (signature)
Labels pinned to the 3D scene: Ink fill, 4px radius, Paper 15px with a Dust source line. Known tags have a solid yellow border and solid leader on the left; guessed tags a dashed border and dashed leader on the right. Each carries a dot tick (filled or dashed ring) with a yellow glow.

### Step Rail and Number Tile
Pill rail of the four steps; active pill gets a 60% yellow border and a yellow disc. Step headings lead with a 38px yellow tile holding the numeral in Yellow Ink.

## Do's and Don'ts

### Do:
- **Do** keep yellow the only hue; use it as light or as one full drench.
- **Do** set every buyer utterance in Newsreader italic and every system/data string in Outfit.
- **Do** draw facts solid and estimates dashed, and pair every estimate with its confidence or source.
- **Do** label example listings, prices and messages as illustrative (dashed Illustrative tag or footnote).
- **Do** put copy over the 3D stage on a directional ink scrim, never on a solid box.
- **Do** respect `prefers-reduced-motion`: no smooth-scroll, camera settles to its base pose, intro reveals skipped.

### Don't:
- **Don't** open with a portal hero: a search bar over a house photo with filter chips.
- **Don't** use Newsreader for system replies, UI labels or numbers.
- **Don't** use dashed strokes for decoration or for facts.
- **Don't** add a second accent colour or a yellow tint to neutral panels.
- **Don't** use yellow glow as generic elevation.
