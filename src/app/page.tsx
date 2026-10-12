import Experience from "@/components/Experience";
import JoinForm from "@/components/JoinForm";

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M4 12 14 4l10 8v12H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M1 16h26" stroke="var(--yellow)" strokeWidth="2.5" />
    </svg>
  );
}

function Arrow({ down }: { down?: boolean }) {
  return (
    <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true" style={down ? { transform: "rotate(90deg)" } : undefined}>
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Known() {
  return <svg className="tick" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="currentColor" /></svg>;
}
function Guessed() {
  return <svg className="tick" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 1.6" /></svg>;
}

function DragIcon() {
  return (
    <svg className="drag-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h14M3 10l3-3M3 10l3 3M17 10l-3-3M17 10l-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

const CHAPTERS = [
  ["top", "Say it once"], ["scan", "How it finds"], ["results", "Sample matches"], ["live", "Ways to live"], ["areas", "Featured areas"],
  ["how", "How it works"], ["rank", "How it ranks"], ["try", "Try it"], ["founding", "Founding 100"], ["faq", "Questions"], ["join", "Claim your place"],
];

const NAV = [["scan", "How it finds"], ["live", "Ways to live"], ["how", "How it works"], ["rank", "How it ranks"], ["contact", "Contact Us"]];

// Each row of the funnel is one more clause of the brief; the count is what's left of London.
const FUNNEL = [
  ["every listing in London", "All London listings", "4,812"],
  ["three bedrooms and a garden", "+ 3+ bed with garden", "1,126"],
  ["under £450k", "+ Under £450,000", "214"],
  ["near an Outstanding school", "+ Near Outstanding school", "3"],
];

const BRIEF = "3 bedrooms, a garden, under £450k, 40 min to King’s Cross, near an Outstanding school.";

// Illustrative results: the format of a match, not real listings.
const RESULTS: { street: string; fit: number; label?: string; meta: string; confirmed: string[]; unsure: string[] }[] = [
  { street: "Hemingford Road, Islington N1", fit: 97, label: "Best match", meta: "£449,950 · 3 bed · 1,120 sq ft", confirmed: ["South-facing garden", "9 min walk to an Outstanding primary", "38 min to King’s Cross"], unsure: ["Kitchen needs updating"] },
  { street: "Albion Road, Stoke Newington N16", fit: 95, meta: "14 min to King’s Cross · 2 Outstanding schools", confirmed: ["Garden"], unsure: ["Loft included?"] },
  { street: "Mapledene Road, Hackney E8", fit: 90, meta: "Illustrative match", confirmed: ["6 min to an Outstanding primary"], unsure: ["Garden orientation"] },
];

const RANKED = [
  ["Hemingford Road, Islington N1", "97%", "Best match"],
  ["Albion Road, Stoke Newington N16", "95%", "Strong match"],
  ["Mapledene Road, Hackney E8", "90%", "Good match"],
  ["Riverside Tower, E14", "41%", "Promoted listing, lower relevance"],
];

type Roof = "gable" | "flat" | "block" | "mews";
// Made-up readings: they show the format, never real data about a real place.
const AREAS: { name: string; type: string; roof: Roof; accent: string; sky: [string, string]; facades: string[]; readings: [string, string, boolean, number?][] }[] = [
  { name: "Blackheath", type: "Heath on the doorstep", roof: "gable", accent: "#5cbf86", sky: ["#5fa6cf", "#c8ead9"], facades: ["#cdb27a", "#94452f", "#ece6d6", "#a65a3e", "#d9c08c", "#7a3a2a"],
    readings: [["Heath, a few minutes’ walk", "map data", false], ["Village-style high street", "map data", false], ["Quiet side roads", "traffic data", true, 75], ["Station on the doorstep", "map data", false]] },
  { name: "Islington", type: "Outstanding schools nearby", roof: "gable", accent: "#ef8fa6", sky: ["#8fc8ee", "#e4f2fb"], facades: ["#d9a3a0", "#9dc7b4", "#a7bfdc", "#bba7cf", "#e8cf9a", "#d9a3a0"],
    readings: [["Outstanding primaries within a walk", "inspection record", false], ["Georgian terraces", "from listings", false], ["Walk to school", "estimated on real routes", true, 85], ["Gardens on the squares", "map data", false]] },
  { name: "Peckham", type: "A high street with feel", roof: "flat", accent: "#e8b84a", sky: ["#6f7fc0", "#d6b6c9"], facades: ["#e3dccb", "#e3dccb", "#b9a88a", "#e3dccb", "#e3dccb", "#b9a88a"],
    readings: [["Independent high street", "map data", false], ["Cafés on the quiet side street", "map data", false], ["Evening feel", "local reviews", true, 65], ["Rail and Overground", "map data", false]] },
  { name: "Southwark", type: "Door to desk under 30 min", roof: "block", accent: "#6aa6f0", sky: ["#2d3b78", "#c88a9b"], facades: ["#7f6a58", "#8a4636", "#7f6a58", "#7f6a58", "#8a4636", "#7f6a58"],
    readings: [["Tube and rail within minutes", "map data", false], ["Under 30 min door to desk", "measured on real routes", true, 90], ["Thames path nearby", "map data", false], ["Balconies on newer blocks", "from listings", false]] },
];
const DOORS = ["#c8102e", "#1d3a6b", "#1f5a3a", "#141414", "#e0b43c", "#6b2d5c"];

const LIVE = [
  { n: "1", place: "Parks and heaths", said: "Somewhere I can walk to Greenwich Park, Blackheath or Hampstead Heath.", read: "Park or heath ≤ 10 min walk" },
  { n: "2", place: "Outstanding schools", said: "Outstanding primary and secondary schools within walking distance.", read: "Outstanding school ≤ 10 min walk" },
  { n: "3", place: "High streets", said: "A quiet street, but near the cafés. A proper high street feel.", read: "Quiet street · high street ≤ 5 min" },
  { n: "4", place: "Door to desk", said: "Under thirty minutes to the office, on the real route.", read: "≤ 30 min door to door by transit" },
];

const STEPS = [
  { n: "1", rail: "Tell us", title: "Tell us your lifestyle.", line: "Say it in your own words, typed or spoken." },
  { n: "2", rail: "Understand", title: "We understand your priorities.", line: "Not just bedrooms and price: your commute, schools, the street you’d want to live on." },
  { n: "3", rail: "Search", title: "We search continuously.", line: "New properties are checked every day, so you never have to refresh." },
  { n: "4", rail: "Match", title: "You get homes that match.", line: "No endless scrolling, and every match tells you why it made the list." },
  { n: "5", rail: "One app", title: "One app, not five.", line: "No need to install five different property apps and refresh every search every day. We watch them all for you." },
];

const SUGGESTIONS = [
  "Two-bed flat with a balcony, 20 min to Canary Wharf",
  "Family house near a park and a good primary, under £800k",
  "Somewhere quiet with lots of light, close to a station",
];

const BENEFITS = [
  ["Early access before everyone else", "See new matches before anyone else does."],
  ["Priority property matching", "Tell us once what you’re after. We’ll take it from there."],
  ["Help shape what we build next", "Vote on features, test new tools early and talk directly with the team."],
  ["Exclusive events and insights", "Members-only London market briefings and first look at new listings in your areas."],
  ["Invite friends, earn rewards", "Every founding member gets a personal referral code. Earn points each time someone you invite joins."],
];

const CLAIMED = 37;

const FAQ = [
  ["How is this different from a normal property portal?", "Most portals make you guess the right combination of filters. With Property Scanner, you describe what you want in plain English, like “2-bed house in Greenwich under £500k with a garden”, and we translate that into a search for you. Then we keep running it, so you don’t have to."],
  ["Which areas do you cover?", "We’re starting in London. Tell us where you’re looking when you sign up, and founding members help decide where we go next."],
  ["Can I trust what the AI tells me about a property?", "Every match shows its source, the reason it was picked, and what we’re still unsure about. You can always check the original listing."],
  ["Does AI decide the final match score?", "The score measures how well a home matches the brief you gave us, and every match lists the reasons behind it, so you can judge for yourself. Nobody can pay to change it."],
  ["Will you contact an agent on my behalf?", "No. We find and explain the matches; you decide who to contact and when."],
];

const ASK = encodeURIComponent("Answer in short: what is Property Scanner (propertyscanner.com), how does it work, and who is it for?");
const ASK_AI = [
  ["ChatGPT", `https://chatgpt.com/?q=${ASK}`], ["Claude", `https://claude.ai/new?q=${ASK}`], ["Perplexity", `https://www.perplexity.ai/search?q=${ASK}`],
  ["Gemini", `https://www.google.com/search?udm=50&q=${ASK}`], ["Grok", `https://grok.com/?q=${ASK}`],
];
const SOCIAL = [
  ["Instagram", "https://www.instagram.com/propertyscannerltd"], ["LinkedIn", "https://www.linkedin.com/company/property-scanner-ltd/"],
  ["Facebook", "https://www.facebook.com/profile.php?id=61592898344753"], ["TikTok", "https://www.tiktok.com/@propertyscannerltd"],
];

/** A small street scene for each card: the facades in its palette, lit windows, trees, a passing car. */
function StreetArt({ id, roof, sky, facades }: { id: number; roof: Roof; sky: [string, string]; facades: string[] }) {
  const G = 128;
  return (
    <svg viewBox="0 0 360 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
      </defs>
      <rect width="360" height="170" fill={`url(#sky${id})`} />
      <circle className="sun" cx={id % 2 ? 70 : 292} cy="38" r="15" fill="#fff3c4" />
      <path d="M0 112h22v-26h14v14h18v-30h12v42h30v-18h20v-12h16v30h26v-22h18v28h30v-36h14v36h24v-20h22v26h30v-16h18v22h26v10H0z" fill="rgb(255 255 255 / 0.18)" />
      {facades.map((c, i) => {
        const x = 6 + i * 58, w = 54;
        const h = (roof === "block" ? 92 : roof === "mews" ? 44 : roof === "flat" ? 74 : 58) + ((i * 37) % 22);
        const top = G - h;
        const rows = Math.max(1, Math.floor((h - 26) / 22));
        return (
          <g className="house" key={i} style={{ "--d": i } as React.CSSProperties}>
            <rect x={x} y={top} width={w} height={h} fill={c} />
            <rect x={x} y={top} width={w * 0.18} height={h} fill="rgb(0 0 0 / 0.08)" />
            {roof === "gable" || roof === "mews" ? (
              <>
                <rect x={x + w - 14} y={top - 22} width="7" height="16" fill="#5a3a30" />
                <path d={`M${x - 3} ${top}L${x + w / 2} ${top - 17}L${x + w + 3} ${top}z`} fill={roof === "mews" ? "#55606e" : "#4a3f3b"} />
              </>
            ) : (
              <rect x={x - 2} y={top - 5} width={w + 4} height="6" fill="rgb(255 255 255 / 0.55)" />
            )}
            {Array.from({ length: rows }, (_, r) =>
              [0, 1].map((k) => (
                <rect key={`${r}${k}`} className={`win${(i + r + k) % 3 ? "" : " lit"}`} style={{ "--w": r * 2 + k + i } as React.CSSProperties}
                  x={x + 9 + k * 24} y={top + 10 + r * 22} width="12" height="14" rx={roof === "mews" ? 6 : 1} />
              )),
            )}
            {roof === "block" && Array.from({ length: rows }, (_, r) => <rect key={`b${r}`} x={x + 4} y={top + 23 + r * 22} width={w - 8} height="2.5" fill="rgb(255 255 255 / 0.6)" />)}
            <rect x={x + (i % 2 ? 8 : w - 20)} y={G - 20} width="12" height="20" rx={roof === "mews" ? 6 : 0} fill={DOORS[(i + id) % DOORS.length]} />
          </g>
        );
      })}
      <rect y={G} width="360" height="7" fill="#9b968a" />
      <rect y={G + 7} width="360" height="40" fill="#2a2926" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 42 + 8} y={G + 25} width="20" height="2.5" fill="#d9d3c3" opacity="0.6" />)}
      {[[118, 1], [252, 0.85]].map(([tx, sc], i) => (
        <g className="tree" key={i} style={{ "--d": i + 3 } as React.CSSProperties}>
          <rect x={tx - 2} y={G - 30 * sc} width="4" height={30 * sc} fill="#4b3a2a" />
          <circle cx={tx} cy={G - 34 * sc} r={15 * sc} fill="#3f7a4a" />
          <circle cx={tx - 8 * sc} cy={G - 28 * sc} r={10 * sc} fill="#4f8f55" />
          <circle cx={tx + 7 * sc} cy={G - 40 * sc} r={9 * sc} fill="#5fa062" />
        </g>
      ))}
      <g className="car">
        <rect x="0" y={G + 12} width="46" height="12" rx="4" fill={id === 2 ? "#141414" : "#c8102e"} />
        <path d={`M8 ${G + 12}l6-8h18l7 8z`} fill={id === 2 ? "#141414" : "#c8102e"} />
        <rect x="15" y={G + 6} width="7" height="5" fill="#bcd7ea" /><rect x="24" y={G + 6} width="8" height="5" fill="#bcd7ea" />
        <circle cx="11" cy={G + 25} r="4.5" fill="#111" /><circle cx="36" cy={G + 25} r="4.5" fill="#111" />
        <rect x="43" y={G + 15} width="3" height="3" fill="#fff2c0" />
      </g>
    </svg>
  );
}
export default function Home() {
  return (
    <>
      <canvas id="stage" aria-hidden="true" />
      <div className="scrim" aria-hidden="true" />
      <Experience />

      <div className="hud3d" aria-hidden="true">
        {RANKED.slice(0, 3).map(([, fit, label], i) => (
          <div className={`rank ${i ? "" : "best"}`} key={i}><div><b>{i + 1}</b>{label} · {fit}</div></div>
        ))}
        <div className="branch"><div><i />12+ sources<em>One feed</em></div></div>
      </div>

      <nav className="dock" aria-label="Sections">
        <a href="#top" className="dock-brand" aria-label="Property Scanner, back to top"><Mark /></a>
        <ol className="dock-track">
          {CHAPTERS.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} data-chapter={id} aria-label={label}><span className="dock-label">{label}</span><i /></a></li>
          ))}
        </ol>
        <a href="#join" className="btn btn-sm">Claim your place</a>
      </nav>

      <main>
        <section id="top" className="hero">
          <div className="hero-top">
            <span className="brand"><Mark />Property Scanner</span>
            <nav className="hero-nav" aria-label="Page">
              {NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            </nav>
            <span className="drag-hint" aria-hidden="true"><DragIcon />Drag the city to look around</span>
          </div>
          <div className="spots" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => <div className="spot" key={i}><span className="spot-label" /></div>)}
          </div>
          <div className="hero-copy">
            <p className="hero-status"><i aria-hidden="true" /><span>London. Founding member access is open. <b>{CLAIMED} of 100</b> places claimed</span></p>
            <h1 className="hero-title" data-reveal>
              <span className="line"><span>Say it once.</span></span>
              <span className="line voice"><span>We find your home.</span></span>
            </h1>
            <p className="hero-sub">
              Describe the home you want in your own words. Property Scanner keeps watching every London listing and tells you the moment something matches.
            </p>
            <div className="hero-cta">
              <a href="#join" className="btn">Claim your free founding place <Arrow /></a>
              <a href="#scan" className="link">Watch it scan <Arrow down /></a>
            </div>
          </div>

          <figure className="console" aria-label="Example search">
            <div className="console-row">
              <span className="console-label">Your words</span>
              <span className="tag">Illustrative</span>
            </div>
            <p className="console-words" id="q-text">{BRIEF}</p>
            <div className="console-rule" aria-hidden="true"><span id="q-bar" /></div>
            <span className="console-label">Read as</span>
            <ul className="chips" id="q-parse">
              <li>3 beds</li><li>Garden</li><li>Under £450k</li><li>≤ 40 min to King&rsquo;s Cross</li><li>Outstanding school</li>
            </ul>
            <p className="console-count" id="q-count" aria-live="off">
              <b>—</b> homes scanned · <b className="y">—</b> match
            </p>
          </figure>
        </section>

        <section id="scan" className="problem">
          <div className="sticky">
            <h2 className="problem-title">
              <span className="voice">Watch one sentence</span>
              <span>narrow down London.</span>
            </h2>
            <div className="feelings" aria-hidden="true">
              {FUNNEL.map(([feel, label, value], i) => (
                <div className="feeling" key={i} style={{ "--i": i } as React.CSSProperties}>
                  <span className="feel"><i />&ldquo;{feel}&rdquo;</span>
                  <span className="filt"><span>{label}</span><b>{value}</b></span>
                  <span className="sweep" />
                </div>
              ))}
              <p className="keep"><span>Listings still in the search</span><b id="keep-n">{FUNNEL[0][2]}</b></p>
            </div>
            <ul className="sr-only">
              {FUNNEL.map(([, label, value]) => <li key={label}>{label}: {value}</li>)}
            </ul>
            <p className="problem-coda">
              Every dot is a London listing. <span className="voice">The brief switches off the rest.</span>
            </p>
          </div>
        </section>

        <section id="results" className="compare">
          <h2>One sentence in. <span className="voice">Three homes out.</span></h2>
          <div className="compare-grid">
            <div className="side ours">
              <h3>Your brief</h3>
              <p className="voice said">&ldquo;{BRIEF}&rdquo;</p>
              <ul className="chips">
                <li>3 beds</li><li>Garden</li><li>Under £450k</li><li>≤ 40 min to King&rsquo;s Cross</li><li>Outstanding school</li>
              </ul>
              <p className="side-note">Each match says what it confirmed and what it could not. Examples are illustrative.</p>
            </div>
            <ol className="results">
              {RESULTS.map((r) => (
                <li className={`result${r.label ? " best" : ""}`} key={r.street}>
                  <div className="result-head">
                    <h3>{r.street}</h3>
                    <span className="fit">{r.fit}%{r.label && <em>{r.label}</em>}</span>
                  </div>
                  <p className="result-meta">{r.meta}</p>
                  <ul>
                    {r.confirmed.map((c) => <li key={c}><Known />{c}<em>confirmed</em></li>)}
                    {r.unsure.map((c) => <li key={c}><Guessed />{c}<em>uncertain</em></li>)}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="live" className="how live">
          <div className="sticky">
            <h2 className="how-title"><span className="voice">Explore London</span> by the way you live.</h2>
            <p className="how-sub">Describe the life you want, from canal-side flats in Little Venice to family terraces in Stoke Newington. We find the neighbourhoods.</p>
            <ol className="rail" aria-label="Ways to live">
              {LIVE.map((s) => <li key={s.n} data-stop={s.n}><span>{s.n}</span>{s.place}</li>)}
            </ol>
            <div className="steps">
              {LIVE.map((s) => (
                <article key={s.n} className="step" data-stop={s.n}>
                  <h3><span className="num">{s.n}</span>{s.place}</h3>
                  <div className="ui ui-chat">
                    <p className="bubble you">{s.said}</p>
                    <p className="bubble sys">Read as <b>{s.read}</b></p>
                  </div>
                </article>
              ))}
            </div>
            <p className="footnote">Examples are illustrative. Landmarks are stylised.</p>
          </div>
        </section>

        <section id="areas" className="streets">
          <div className="sticky">
            <div className="streets-head">
              <h2>Featured areas. <span className="voice">Read them before you visit.</span></h2>
              <p>Facts are solid, guesses are dashed and come with a confidence score. These four readings are illustrative, to show the format.</p>
            </div>
            <div className="street-track">
              {AREAS.map((st, n) => (
                <article className="street-card" key={st.name} style={{ "--a": st.accent } as React.CSSProperties}>
                  <div className="street-art">
                    <StreetArt id={n} roof={st.roof} sky={st.sky} facades={st.facades} />
                    <span className="street-no">0{n + 1} / 0{AREAS.length}</span>
                  </div>
                  <div className="street-body">
                    <div className="street-title"><h3>{st.name}</h3><span className="street-type">{st.type}</span></div>
                    <ul>
                      {st.readings.map(([what, src, guess, conf], k) => (
                        <li key={what} className={guess ? "guess" : ""} style={{ "--k": k } as React.CSSProperties}>
                          {guess ? <Guessed /> : <Known />}
                          <span>{what}<em>{src}{conf ? ` · ${conf}% sure` : ""}</em></span>
                          {conf ? <i className="conf" style={{ "--v": `${conf}%` } as React.CSSProperties} aria-hidden="true" /> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="how">
          <div className="sticky">
            <h2 className="how-title">You don&rsquo;t need to <span className="voice">search for a home anymore.</span></h2>
            <p className="how-sub">Tell us once. We take care of the searching, the refreshing and the sorting.</p>
            <ol className="rail" aria-label="Steps">
              {STEPS.map((s) => <li key={s.n} data-step={s.n}><span>{s.n}</span>{s.rail}</li>)}
            </ol>

            <div className="steps">
              <article className="step" data-step="1">
                <h3><span className="num">1</span>{STEPS[0].title}</h3>
                <p>{STEPS[0].line}</p>
                <div className="ui ui-chat">
                  <p className="bubble you">{BRIEF}</p>
                  <p className="bubble sys">Got it. Scanning London for that.</p>
                </div>
              </article>
              <article className="step" data-step="2">
                <h3><span className="num">2</span>{STEPS[1].title}</h3>
                <p>{STEPS[1].line}</p>
                <div className="ui ui-chat">
                  <p className="bubble you">And a quiet street, not a main road.</p>
                  <p className="bubble sys">Read as <b>3 beds · garden · under £450k · ≤ 40 min to King&rsquo;s Cross · Outstanding school · quiet street.</b></p>
                </div>
              </article>
              <article className="step" data-step="3">
                <h3><span className="num">3</span>{STEPS[2].title}</h3>
                <p>{STEPS[2].line}</p>
                <div className="ui ui-sheet">
                  <div className="sheet-head"><b>Scanning London</b><span>12 sources</span></div>
                  <p className="sheet-meta">Checking new listings across 12 sources in real time</p>
                  <ul>
                    <li><Known /> Best matches <em>ranked by your brief</em></li>
                    <li><Known /> New today <em>checked daily</em></li>
                    <li><Known /> All matches <em>nothing to refresh</em></li>
                  </ul>
                </div>
              </article>
              <article className="step" data-step="4">
                <h3><span className="num">4</span>{STEPS[3].title}</h3>
                <p>{STEPS[3].line}</p>
                <div className="ui ui-sheet">
                  <div className="sheet-head"><b>Hemingford Road, Islington N1</b><span>97%</span></div>
                  <p className="sheet-meta">£449,950 · 3 bed · 1,120 sq ft</p>
                  <ul>
                    <li><Known /> South-facing garden <em>confirmed</em></li>
                    <li><Known /> 9 min walk to an Outstanding primary <em>confirmed</em></li>
                    <li><Guessed /> Kitchen needs updating <em>uncertain</em></li>
                  </ul>
                </div>
              </article>
              <article className="step" data-step="5">
                <h3><span className="num">5</span>{STEPS[4].title}</h3>
                <p>{STEPS[4].line}</p>
                <div className="ui ui-sheet">
                  <div className="sheet-head"><b>Alerts</b><span>12+ sources</span></div>
                  <p className="sheet-meta">One feed instead of five apps</p>
                  <ul>
                    <li><Known /> 12 new matches <em>2m ago</em></li>
                    <li><Known /> Price drop <em>1h ago</em></li>
                    <li><Known /> New listing <em>3h ago</em></li>
                    <li><Known /> School catchment <em>5h ago</em></li>
                  </ul>
                </div>
              </article>
            </div>
            <p className="footnote">Listings, prices and alerts shown are illustrative.</p>
          </div>
        </section>

        <section id="rank" className="truth">
          <div className="sticky">
            <div className="truth-copy">
              <h2>
                <span>Ranked by match.</span>
                <span className="voice">Never by fees.</span>
              </h2>
              <p>
                Homes are ranked only by how well they fit your brief. Every listing shows its source, why it matched, and what we&rsquo;re still unsure about. Nobody can pay to change the order.
              </p>
              <ol className="ranked">
                {RANKED.map(([street, fit, label], i) => (
                  <li key={street} className={i === 3 ? "promoted" : ""}><span>{street}</span><em>{label}</em><b>{fit}</b></li>
                ))}
              </ol>
              <ul className="legend">
                <li><Known /> <b>Solid</b> means confirmed from the listing or a record.</li>
                <li><Guessed /> <b>Dashed</b> means uncertain, and we say so.</li>
              </ul>
            </div>
            <div className="tags" aria-hidden="true">
              <div className="tag3d known" data-anchor="-0.35,2.05,0"><Known /><span>3 bedrooms<em>from the listing</em></span></div>
              <div className="tag3d known" data-anchor="-0.35,0.55,1.25"><Known /><span>£449,950 asking<em>from the listing</em></span></div>
              <div className="tag3d guessed" data-anchor="0.5,1.4,0.2"><Guessed /><span>Kitchen needs updating<em>uncertain</em></span></div>
              <div className="tag3d guessed" data-anchor="0.45,0.25,2.0"><Guessed /><span>9 min walk to an Outstanding primary<em>estimated from map data</em></span></div>
            </div>
          </div>
        </section>

        <section id="try" className="try">
          <div className="try-panel">
            <h2>Try it in <span className="voice">your own words.</span></h2>
            <p className="try-lede">Type what you&rsquo;d tell a friend. See how it reads, then watch London scan for it.</p>
            <form className="try-form" id="try-form">
              <label className="sr-only" htmlFor="try-input">Describe the home you want</label>
              <textarea id="try-input" rows={3} maxLength={240} placeholder="A bright flat near a park, two beds, under £500k, 25 minutes to King's Cross." />
              <button className="btn">Scan London <Arrow /></button>
            </form>
            <div className="try-suggest">
              <span>Or try</span>
              {SUGGESTIONS.map((t) => <button type="button" key={t} data-suggest={t}>{t}</button>)}
            </div>
            <div className="try-out" aria-live="polite">
              <span className="console-label">Read as</span>
              <ul className="chips" id="try-chips"><li className="ghost">Waiting for your words</li></ul>
              <p className="console-count" id="try-count">&nbsp;</p>
            </div>
            <p className="try-note">This demo only matches keywords, and the results are illustrative.</p>
          </div>
        </section>

        <section id="founding" className="founding">
          <div className="founding-head">
            <h2>Be one of the first 100 in London.</h2>
            <p>Joining is free for the first 100 members. <b>{CLAIMED} of 100</b> places claimed.</p>
          </div>
          <div className="founding-body">
            <ol className="slots" aria-label={`${CLAIMED} of 100 founding places claimed`}>
              {Array.from({ length: 100 }, (_, i) => (
                <li key={i} className={i < CLAIMED ? "taken" : i === CLAIMED ? "next" : ""} style={{ "--s": i } as React.CSSProperties}>{i + 1}</li>
              ))}
            </ol>
            <ul className="benefits">
              {BENEFITS.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
            </ul>
          </div>
        </section>

        <section id="faq" className="faq">
          <h2>Questions buyers ask.</h2>
          <div className="faq-list">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="join" className="launch">
          <div className="launch-copy">
            <h2 className="swap">
              <span className="pre">Claim your<br />founding place.</span>
              <span className="post" aria-hidden="true">You&rsquo;re in.<br /><span className="voice">Welcome to the 100.</span></span>
            </h2>
            <p className="swap">
              <span className="pre">London first. Be one of the first 100, tell us what you&rsquo;re after once, and we&rsquo;ll take it from there.</span>
              <span className="post" aria-hidden="true">Look up: your place just landed in London. We&rsquo;ll be in touch when something genuinely matches.</span>
            </p>
          </div>
          <JoinForm />
        </section>
      </main>

      <footer className="foot" id="contact">
        <div className="foot-main">
          <span className="brand"><Mark />Property Scanner</span>
          <p>Greenwich, London · © 2026 Property Scanner Ltd</p>
          <p><a href="mailto:info@propertyscanner.com">info@propertyscanner.com</a></p>
        </div>
        <nav className="foot-links" aria-label="Footer">
          <a href="https://www.propertyscanner.com/privacy">Privacy</a>
          <a href="https://www.propertyscanner.com/terms">Terms</a>
          {SOCIAL.map(([n, href]) => <a key={n} href={href} rel="noopener">{n}</a>)}
          <a href="#top">Back to top</a>
        </nav>
        <p className="foot-ask">Ask AI about us:
          {ASK_AI.map(([n, href]) => <a key={n} href={href} rel="noopener">{n}</a>)}
        </p>
        <p className="foot-note">Listings, prices and alerts on this page are illustrative examples.</p>
      </footer>
    </>
  );
}
