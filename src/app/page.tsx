import Experience from "@/components/Experience";
import DemoForm from "@/components/DemoForm";

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

const FEELINGS = [
  ["somewhere with morning light", "Orientation", "Any"],
  ["a street that feels safe at night", "Radius", "1 mile"],
  ["quiet, but not dead", "Property type", "Any"],
  ["close enough to walk the kids to school", "Bedrooms", "3+"],
  ["a kitchen we'd actually cook in", "Keywords", "kitchen"],
  ["room for a desk that isn't the bed", "Max price", "£650,000"],
];

function DragIcon() {
  return (
    <svg className="drag-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h14M3 10l3-3M3 10l3 3M17 10l-3-3M17 10l-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

const CHAPTERS = [
  ["top", "The scan"], ["problem", "The problem"], ["compare", "One sentence"], ["how", "How it works"],
  ["commute", "Commute"], ["schools", "Schools"], ["quiet", "Quiet streets"], ["truth", "Facts and guesses"], ["streets", "Street readings"], ["around", "Around London"], ["try", "Try it"], ["people", "Who it's for"], ["faq", "Questions"], ["demo", "Book a demo"],
];

const PORTAL = [
  ["Location", "London"], ["Radius", "+1 mile"], ["Min price", "No min"], ["Max price", "£650,000"],
  ["Min beds", "3"], ["Max beds", "No max"], ["Property type", "Houses"], ["Added to site", "Anytime"],
  ["Include under offer", "No"], ["Must haves", "Garden"], ["Don't show", "Retirement homes"], ["Keywords", "quiet?"],
];

// Made-up streets: these readings only show the format, never real data about a real place.
type Roof = "gable" | "flat" | "block" | "mews";
const STREETS: { name: string; type: string; roof: Roof; accent: string; sky: [string, string]; facades: string[]; readings: [string, string, boolean, number?][] }[] = [
  { name: "Ashby Road", type: "Victorian terraces", roof: "gable", accent: "#e0714f", sky: ["#f4a46a", "#fbd9a8"], facades: ["#8a4636", "#9b5a42", "#8a4636", "#b9a88a", "#9b5a42", "#6e3b30"],
    readings: [["Mostly 3-bed terraces", "from listings", false], ["Quiet after 8pm", "traffic data", true, 70], ["Park, 4 min walk", "map data", true, 90], ["Freehold", "from the listing", false]] },
  { name: "Linden Grove", type: "Pastel terraces", roof: "gable", accent: "#ef8fa6", sky: ["#8fc8ee", "#e4f2fb"], facades: ["#d9a3a0", "#9dc7b4", "#a7bfdc", "#bba7cf", "#e8cf9a", "#d9a3a0"],
    readings: [["South-facing gardens", "from listings", false], ["Morning light at the front", "sun path", true, 80], ["Primary, 6 min walk", "map data", true, 85], ["Conservation area", "council record", false]] },
  { name: "Mercer Street", type: "Mansion flats", roof: "flat", accent: "#e8b84a", sky: ["#6f7fc0", "#d6b6c9"], facades: ["#e3dccb", "#e3dccb", "#b9a88a", "#e3dccb", "#e3dccb", "#b9a88a"],
    readings: [["Lift in the building", "from the listing", false], ["Busy road at the end", "traffic data", true, 75], ["Station, 5 min walk", "map data", true, 95], ["Leasehold, 120 years", "from the listing", false]] },
  { name: "Calder Terrace", type: "Ex-council blocks", roof: "block", accent: "#5cbf86", sky: ["#5fa6cf", "#c8ead9"], facades: ["#7f6a58", "#8a4636", "#7f6a58", "#7f6a58", "#8a4636", "#7f6a58"],
    readings: [["Balconies on every flat", "from listings", false], ["Green space behind", "map data", true, 90], ["Calm, family street", "local reviews", true, 60], ["Share of freehold", "from the listing", false]] },
  { name: "Wren Mews", type: "Converted stables", roof: "mews", accent: "#6aa6f0", sky: ["#2d3b78", "#c88a9b"], facades: ["#a7bfdc", "#e3dccb", "#9dc7b4", "#e3dccb", "#e8cf9a", "#e3dccb"],
    readings: [["Cobbled, car-free lane", "map data", true, 95], ["Small or no gardens", "from listings", false], ["Very quiet at night", "traffic data", true, 80], ["Freehold", "from the listing", false]] },
];
const DOORS = ["#c8102e", "#1d3a6b", "#1f5a3a", "#141414", "#e0b43c", "#6b2d5c"];

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

// Example wishes only: the readings show the format, not real journey or distance data.
const STOPS = [
  { n: "1", place: "Westminster", said: "Somewhere I can walk along the river after work.", read: "Thames path ≤ 10 min walk" },
  { n: "2", place: "The City", said: "Twenty minutes to the office, door to door. Bank, near St Paul's.", read: "≤ 20 min to Bank by Tube or on foot" },
  { n: "3", place: "Hyde Park", said: "A proper park for the dog, not a patch of grass.", read: "Large park ≤ 10 min walk" },
];

const SUGGESTIONS = [
  "Two-bed flat with a balcony, 20 min to Canary Wharf",
  "Family house near a park and a good primary, under £800k",
  "Somewhere quiet with lots of light, close to a station",
];

const FAQ = [
  ["Where does it work?", "London only, for now. We're launching in one city so we can do it properly before going anywhere else."],
  ["What do I actually type?", "Whatever you'd tell a friend who's helping you look. Budget, rooms, the commute, the feel of the street. No forms, no dropdowns."],
  ["How do I know what's real?", "Every fact carries its source, like the listing or an official record. Anything we estimate is labelled as an estimate, with how confident we are."],
  ["Does it replace estate agents?", "No. When you find a home you like, we draft the enquiry to the listing agent. You read it, change what you want, and send it yourself."],
  ["Can I see it working?", "Yes. Book a demo and we'll run a live scan for the home you're looking for."],
];

const STEPS = [
  { n: "1", title: "Describe it once.", line: "In your own words, the way you'd tell a friend. No dropdowns." },
  { n: "2", title: "Refine it by chat.", line: "Push back like you would with a good agent. The scan narrows as you talk." },
  { n: "3", title: "Decide on the few.", line: "A shortlist ranked by what you said matters, with the reasons shown." },
  { n: "4", title: "Send in one go.", line: "We draft the enquiry. You read it, tweak it, send it." },
];

export default function Home() {
  return (
    <>
      <canvas id="stage" aria-hidden="true" />
      <div className="scrim" aria-hidden="true" />
      <Experience />

      <div className="hud3d" aria-hidden="true">
        {[["best", "Best fit", "94%"], ["", "Second", "88%"], ["", "Third", "81%"]].map(([cls, label, fit], i) => (
          <div className={`rank ${cls}`} key={i}><div><b>{i + 1}</b>{label} · {fit}</div></div>
        ))}
        <div className="branch"><div><i />Leyton branch<em>Enquiry delivered</em></div></div>
      </div>

      <nav className="dock" aria-label="Sections">
        <a href="#top" className="dock-brand" aria-label="Property Scanner, back to top"><Mark /></a>
        <ol className="dock-track">
          {CHAPTERS.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} data-chapter={id} aria-label={label}><span className="dock-label">{label}</span><i /></a></li>
          ))}
        </ol>
        <a href="#demo" className="btn btn-sm">Book a demo</a>
      </nav>

      <main>
        <section id="top" className="hero">
          <div className="hero-top">
            <span className="brand"><Mark />Property Scanner</span>
            <span className="drag-hint" aria-hidden="true"><DragIcon />Drag the city to look around</span>
          </div>
          <div className="spots" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => <div className="spot" key={i}><span className="spot-label" /></div>)}
          </div>
          <div className="hero-copy">
            <h1 className="hero-title" data-reveal>
              <span className="line"><span>Say what home</span></span>
              <span className="line"><span>feels like.</span></span>
              <span className="line voice"><span>We&rsquo;ll scan London for it.</span></span>
            </h1>
            <p className="hero-sub">
              Property Scanner turns the way you actually talk about a home into a live search of London listings. Refine it by chat, see what&rsquo;s known and what&rsquo;s guessed, and send the enquiry.
            </p>
            <div className="hero-cta">
              <a href="#demo" className="btn">Book a demo <Arrow /></a>
              <a href="#problem" className="link">Watch it scan <Arrow down /></a>
            </div>
          </div>

          <figure className="console" aria-label="Example search">
            <div className="console-row">
              <span className="console-label">Your words</span>
              <span className="tag">Illustrative</span>
            </div>
            <p className="console-words" id="q-text">
              A quiet street, three beds, somewhere the kids can walk to a good primary. Under £650k.
            </p>
            <div className="console-rule" aria-hidden="true"><span id="q-bar" /></div>
            <span className="console-label">Read as</span>
            <ul className="chips" id="q-parse">
              <li>3 bed</li><li>Low-traffic street</li><li>Primary ≤ 10 min walk</li><li>≤ £650k</li>
            </ul>
            <p className="console-count" id="q-count" aria-live="off">
              <b>—</b> homes scanned · <b className="y">—</b> match
            </p>
          </figure>
        </section>

        <section id="problem" className="problem">
          <div className="sticky">
            <h2 className="problem-title">
              <span className="voice">Buyers think in feelings.</span>
              <span>Portals think in filters.</span>
            </h2>
            <div className="feelings" aria-hidden="true">
              {FEELINGS.map(([feel, label, value], i) => (
                <div className="feeling" key={i} style={{ "--i": i } as React.CSSProperties}>
                  <span className="feel"><i />&ldquo;{feel}&rdquo;</span>
                  <span className="filt"><span>{label}</span><b>{value}<svg viewBox="0 0 10 10"><path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg></b></span>
                  <span className="sweep" />
                </div>
              ))}
              <p className="keep"><span>Feelings still in the search</span><b id="keep-n">6</b></p>
            </div>
            <ul className="sr-only">
              {FEELINGS.map(([feel, label, value]) => <li key={feel}>&ldquo;{feel}&rdquo; becomes {label}: {value}</li>)}
            </ul>
            <p className="problem-coda">
              Light, noise, the walk to school. None of it fits in a dropdown, so you scroll. <span className="voice">For months.</span>
            </p>
          </div>
        </section>

        <section id="compare" className="compare">
          <h2>Same search. <span className="voice">One sentence.</span></h2>
          <div className="compare-grid">
            <div className="side portal">
              <h3>On a portal</h3>
              <ul className="filter-wall">
                {PORTAL.map(([label, value]) => (
                  <li key={label}><span>{label}</span><b>{value}</b></li>
                ))}
              </ul>
              <p className="side-note">Twelve dropdowns. Not one of them asks how the street feels.</p>
            </div>
            <div className="side ours">
              <h3>On Property Scanner</h3>
              <p className="voice said">&ldquo;Three-bed with a garden on a quiet road, ten minutes&rsquo; walk to a good primary, under £650k. Somewhere that feels friendly.&rdquo;</p>
              <ul className="chips">
                <li>3 bed</li><li>Garden</li><li>Low-traffic street</li><li>Primary ≤ 10 min walk</li><li>≤ £650k</li><li>Friendly street feel</li>
              </ul>
              <p className="side-note">One sentence. The scan reads the rest, and tells you which parts it had to guess.</p>
            </div>
          </div>
        </section>

        <section id="how" className="how">
          <div className="sticky">
            <h2 className="how-title">Four moves from a feeling to a viewing.</h2>
            <ol className="rail" aria-label="Steps">
              {STEPS.map((s) => <li key={s.n} data-step={s.n}><span>{s.n}</span>{s.title}</li>)}
            </ol>

            <div className="steps">
              <article className="step" data-step="1">
                <h3><span className="num">1</span>{STEPS[0].title}</h3>
                <p>{STEPS[0].line}</p>
                <div className="ui ui-chat">
                  <p className="bubble you">We&rsquo;re after a proper family house. Garden, three beds, quiet road, near a good primary. Zone 2 or 3, under £650k.</p>
                  <p className="bubble sys">Scanning 1,940 London listings for that.</p>
                </div>
              </article>
              <article className="step" data-step="2">
                <h3><span className="num">2</span>{STEPS[1].title}</h3>
                <p>{STEPS[1].line}</p>
                <div className="ui ui-chat">
                  <p className="bubble you">Nothing on a main road. And I&rsquo;d take a garden over a second bathroom.</p>
                  <p className="bubble sys">Done. Dropped 31 homes on A-roads and ranked gardens higher. <b>9 left.</b></p>
                </div>
              </article>
              <article className="step" data-step="3">
                <h3><span className="num">3</span>{STEPS[2].title}</h3>
                <p>{STEPS[2].line}</p>
                <div className="ui ui-sheet">
                  <div className="sheet-head"><b>Victorian terrace, Leyton E10</b><span>£625,000</span></div>
                  <p className="sheet-meta">3 bed · 1 bath · 14 m garden</p>
                  <ul>
                    <li><Known /> Garden <em>from the listing</em></li>
                    <li><Guessed /> 8 min walk to a primary <em>estimated</em></li>
                    <li><Guessed /> Quiet street <em>70% sure</em></li>
                  </ul>
                </div>
              </article>
              <article className="step" data-step="4">
                <h3><span className="num">4</span>{STEPS[3].title}</h3>
                <p>{STEPS[3].line}</p>
                <div className="ui ui-mail">
                  <p className="mail-head">To: Leyton branch · Viewing request, Ashby Road</p>
                  <p className="voice">Hi, we&rsquo;d love to view on Saturday morning. We&rsquo;re chain-free with a mortgage in principle, and the garden is exactly what we&rsquo;ve been looking for.</p>
                  <span className="sent">Sent <Arrow /></span>
                </div>
              </article>
            </div>
            <p className="footnote">Listings, prices and messages shown are illustrative.</p>
          </div>
        </section>

        <section id="commute" className="commute">
          <div className="sticky">
            <div className="commute-copy">
              <h2>Commute, <span className="voice">not a radius.</span></h2>
              <p>Portals draw a circle on a map. You live by a timetable. The scan measures how far you can get, door to door, by the routes you&rsquo;d actually take.</p>
              <ul className="legend">
                <li><svg className="tick" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="none" stroke="#f4f0e5" strokeWidth="1.4" strokeDasharray="2 1.6" /></svg><b>1-mile radius</b> the portal way</li>
                <li><svg className="tick" viewBox="0 0 12 12" aria-hidden="true"><rect x="1.5" y="1.5" width="9" height="9" rx="2" fill="currentColor" /></svg><b>25 minutes door to door</b> along roads and rail</li>
              </ul>
              <p className="footnote-inline">Illustrative reach, not a real journey planner result.</p>
            </div>
          </div>
        </section>

        <section id="schools" className="commute">
          <div className="sticky">
            <div className="commute-copy">
              <h2>Schools, <span className="voice">by the walk.</span></h2>
              <p>&ldquo;Near a good primary&rdquo; means a walk your kids can do, not a line on a catchment map. The scan measures the walk itself, and says which parts come from records and which are estimates.</p>
              <ul className="legend">
                <li><Known /><b>Inspection rating</b> from the official record</li>
                <li><Guessed /><b>Walking time</b> estimated along real pavements</li>
              </ul>
              <p className="footnote-inline">Illustrative. Schools and ratings shown are not real data.</p>
            </div>
          </div>
        </section>

        <section id="quiet" className="commute">
          <div className="sticky">
            <div className="commute-copy">
              <h2>Quiet, <span className="voice">but not dead.</span></h2>
              <p>Quiet means different things to different people. The scan reads the road you&rsquo;d live on and the ones around it, day and night, and tells you how sure it is.</p>
              <ul className="legend">
                <li><Known /><b>Road type</b> from map data</li>
                <li><Guessed /><b>Evening traffic</b> estimated, with a confidence score</li>
              </ul>
              <p className="footnote-inline">Illustrative. Not a real traffic reading.</p>
            </div>
          </div>
        </section>

        <section id="truth" className="truth">
          <div className="sticky">
            <div className="truth-copy">
              <h2>
                <span>Show what&rsquo;s known.</span>
                <span className="voice">Label what&rsquo;s guessed.</span>
              </h2>
              <p>
                Every fact carries its source. Anything we estimate says it&rsquo;s an estimate, with how sure we are. You never mistake a guess for a fact.
              </p>
              <ul className="legend">
                <li><Known /> <b>Solid</b> means it came from the listing or an official record.</li>
                <li><Guessed /> <b>Dashed</b> means we worked it out, and we show our confidence.</li>
              </ul>
            </div>
            <div className="tags" aria-hidden="true">
              <div className="tag3d known" data-anchor="-0.35,2.05,0"><Known /><span>3 bedrooms<em>from the listing</em></span></div>
              <div className="tag3d known" data-anchor="-0.35,0.55,1.25"><Known /><span>£625,000 asking<em>from the listing</em></span></div>
              <div className="tag3d guessed" data-anchor="0.5,1.4,0.2"><Guessed /><span>Quiet street<em>from traffic data · 70% sure</em></span></div>
              <div className="tag3d guessed" data-anchor="0.45,0.25,2.0"><Guessed /><span>8 min walk to a primary<em>estimated from map data</em></span></div>
            </div>
          </div>
        </section>

        <section id="streets" className="streets">
          <div className="sticky">
            <div className="streets-head">
              <h2>Read a street <span className="voice">before you visit.</span></h2>
              <p>Every street gets a reading. Facts are solid, guesses are dashed and come with a confidence score. These five streets are made up, to show the format.</p>
            </div>
            <div className="street-track">
              {STREETS.map((st, n) => (
                <article className="street-card" key={st.name} style={{ "--a": st.accent } as React.CSSProperties}>
                  <div className="street-art">
                    <StreetArt id={n} roof={st.roof} sky={st.sky} facades={st.facades} />
                    <span className="street-no">0{n + 1} / 0{STREETS.length}</span>
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

        <section id="around" className="how around">
          <div className="sticky">
            <h2 className="how-title">Search by what&rsquo;s near. <span className="voice">Not by postcode.</span></h2>
            <ol className="rail" aria-label="Places">
              {STOPS.map((s) => <li key={s.n} data-stop={s.n}><span>{s.n}</span>{s.place}</li>)}
            </ol>
            <div className="steps">
              {STOPS.map((s) => (
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

        <section id="people" className="people">
          <h2>Made for three kinds of London buyer.</h2>
          <ol className="persona-list">
            <li>
              <h3>The time-poor buyer</h3>
              <p className="said voice">&ldquo;Just find me three that are worth a Saturday.&rdquo;</p>
              <p>Describe it once on the bus. Get a shortlist, not a feed.</p>
            </li>
            <li>
              <h3>The careful first-time buyer</h3>
              <p className="said voice">&ldquo;Is the quiet street actually quiet, or did the agent just say so?&rdquo;</p>
              <p>Every fact shows its source. Every guess says it&rsquo;s a guess.</p>
            </li>
            <li>
              <h3>The relocating family</h3>
              <p className="said voice">&ldquo;We don&rsquo;t know London. We know we want a park and a good primary.&rdquo;</p>
              <p>Search by how a place feels, in a city you&rsquo;ve never lived in.</p>
            </li>
          </ol>
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

        <section id="demo" className="launch">
          <div className="launch-copy">
            <h2>Launching in<br />London first.</h2>
            <p>
              One city, done properly. Book a demo and we&rsquo;ll run a live scan for the home you&rsquo;re actually looking for.
            </p>
          </div>
          <DemoForm />
        </section>
      </main>

      <footer className="foot">
        <span className="brand"><Mark />Property Scanner</span>
        <p>Listings, prices and messages on this page are illustrative examples.</p>
        <p>© 2026 Property Scanner</p>
      </footer>
    </>
  );
}
