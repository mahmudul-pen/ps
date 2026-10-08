# Property Scanner: 3D Landing Page Project Brief (v0.1, for approval)

## 1. The one-line idea
**"You think in feelings. Portals think in filters. Property Scanner bridges the gap."**
The landing page should *show* that idea in 3D, not just say it: vague human wishes go in, a scan runs over a real neighbourhood, and the right homes light up.

## 2. Goal and success metric
- **Primary goal:** get waitlist sign-ups from buyers in the first launch area.
- **Secondary goal:** a page people share ("have you seen this?") and that makes the product easy to pitch to investors and partners.
- **Success metric:** visit-to-signup rate of at least 8%, LCP under 2.5s, 60fps on a mid-range laptop.

## 3. Audience (from PRD 01)
| Persona | What they need to hear |
|---|---|
| The time-poor buyer | "Describe it once. Stop scrolling portals." |
| The detail-oriented first-time buyer | "We show what's known and label what's guessed." |
| The relocating family | "Search by feel (schools, commute, quiet) in an area you don't know." |

## 4. Creative concept: "The Scan"
A stylised, low-poly **miniature diorama of the launch area** (streets, terraced and semi-detached houses, a park, a school, a station), floating in a dark space. A glowing amber **scan beam** sweeps across it. Scrolling moves the camera through the story.

**Visual language** (matched to the PRD deck): near-black background, warm amber/yellow accent, off-white type, clean grotesk font. The look is precise and calm ("instrument panel"), not playful.

## 5. Scroll story (sections mapped to the PRD)
| # | Section | 3D moment | Copy direction |
|---|---|---|---|
| 1 | **Hero** | The diorama slowly rotates while the scan beam sweeps it. A fake search box types: *"3-bed, quiet street, near a good primary, under £450k, 30 min to the city"*. Matching houses glow amber. | "Describe the home. We'll scan the rest." + waitlist CTA |
| 2 | **The problem** (PRD 02) | Loose drifting particles ("feelings": *light*, *quiet*, *garden*) snap into a rigid grid of checkbox filters, then break free again. | "Buyers think in feelings. Portals think in filters." |
| 3 | **How it works** (PRD 04, happy path) | The camera flies down a street with four pinned stops: **Describe → Refine by chat → Decide → Send**. Each stop shows a floating UI card beside a house. | One short line per step |
| 4 | **Known vs guessed** (PRD 05) | One house rendered half **solid** (verified data) and half **wireframe** (estimates). Hovering a data tag shows its source or confidence. | "Show what's known. Label what's guessed." This is the trust message. |
| 5 | **Who it's for** (PRD 01) | Three persona cards, each with a small 3D vignette (clock, magnifier, moving box). | Persona one-liners |
| 6 | **Launch area** (PRD 03) | The camera pulls back to an extruded 3D map of the launch area with a pulsing pin. | "Launching first in [AREA]." + waitlist form |
| 7 | Footer | — | Links, legal |

## 6. Tech plan
| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) on Vercel** | SEO, fast first paint, and a built-in API route for the waitlist |
| 3D | **React Three Fiber + drei** | Three.js with React ergonomics |
| Scroll animation | **GSAP ScrollTrigger + Lenis** smooth scroll | Industry standard for scroll-driven camera paths |
| 3D assets | **Procedural geometry** (boxes, roofs, instanced houses), no GLTF files to start | Tiny bundle, no modelling work, easy to restyle. Hero models can be added later if needed. |
| Effects | Bloom on the scan beam and amber glow, one custom scan-line shader | The signature visual. Everything else stays restrained. |
| Styling | Tailwind CSS | Fast and consistent |

**Performance and accessibility rules (non-negotiable)**
- All text and CTAs live in the HTML, not in the canvas. The canvas is decorative (`aria-hidden`).
- The headline renders before the 3D loads. The canvas is lazy-loaded and fades in.
- Device pixel ratio capped at 1.5. On phones the scene is simpler (fewer houses, no post-processing).
- `prefers-reduced-motion` gets a static hero render and no camera flights.
- Budget: 3D chunk under 300KB gzipped.

## 7. Milestones
| # | Deliverable | Approval gate |
|---|---|---|
| M0 | This brief | **You approve** |
| M1 | Scaffold + hero diorama + scan beam (live preview link) | Look and feel sign-off |
| M2 | Full scroll story (sections 2–6) with placeholder copy | Story flow sign-off |
| M3 | Final copy, persona cards, working waitlist form | Content sign-off |
| M4 | Performance, mobile, reduced motion, a11y, SEO/OG image | — |
| M5 | Production deploy | Launch |

## 8. Out of scope (for now)
Real property data, a working search or chat demo, user accounts, a CMS, analytics beyond basic page views. Add these when the product MVP exists.

## 9. Open questions (need your answers)
1. **Launch area:** which town or city is the first area? It drives the diorama and the map.
2. **Brand:** do you have an existing logo, colours or font, or should I derive them from the PRD deck (black + amber)?
3. **CTA:** waitlist email only, or "Book a demo" as well?
4. **Waitlist storage:** where should sign-ups go (Resend audience, a database, a Google Sheet)?
5. **PRD access:** please share the Figma link. I can only partly read the screenshot, and exact copy and edge cases should come from the source.
