"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Stage, type SceneState } from "@/lib/stage";
import { readWords } from "@/lib/read-words";

const QUERIES = [
  { text: "A quiet street, three beds, somewhere the kids can walk to a good primary. Under £650k.", chips: ["3 bed", "Low-traffic street", "Primary ≤ 10 min walk", "≤ £650k"] },
  { text: "A flat with morning light and a balcony. Thirty minutes door to door to Liverpool Street.", chips: ["1–2 bed flat", "East-facing", "Balcony", "≤ 30 min to Liverpool St"] },
  { text: "We're moving down from Manchester. Leafy, near a park, room for a home office.", chips: ["2–3 bed", "Park ≤ 5 min", "Study or box room", "Low density"] },
];

const BASE: SceneState = {
  cx: 22, cy: 12.5, cz: 29, tx: 3, ty: 2, tz: -5,
  orbit: 1, school: 0, commute: 0, scan: 1, dim: 0, cloud: 0, morph: 0, narrow: 0, focus: 0, arc: 0, wire: 0, pin: 0,
};

type Key = { id: string; at: number; s: SceneState };

function keyframes(P: { x: number; z: number }, narrow: boolean): Key[] {
  const hero = BASE;
  // On portrait screens the copy sits below, so the home is framed in the upper half.
  const k = narrow ? { tx: P.x + 0.9, ty: -2.2, tz: P.z - 0.9 } : { tx: P.x - 0.7, ty: 0.8, tz: P.z + 0.7 };
  const top: SceneState = { ...BASE, cx: 0.1, cy: 64, cz: 6, tx: 0, ty: 8, tz: 0, orbit: 0, scan: 0, dim: 0.85, cloud: 1 };
  const describe: SceneState = { ...BASE, cx: P.x + 18, cy: 15, cz: P.z + 24, tx: P.x - 2, ty: 0, tz: P.z - 3, orbit: 0.4 };
  const refine: SceneState = { ...describe, cx: P.x + 13, cy: 12, cz: P.z + 17, tx: P.x - 1.5, tz: P.z + 1.5, narrow: 1, orbit: 0.2 };
  const decide: SceneState = { ...refine, cx: P.x + 9, cy: 9, cz: P.z + 12, tx: P.x - 1.6, ty: 0.6, tz: P.z + 1.6, focus: 1, dim: 1, orbit: 0, scan: 0.4 };
  const send: SceneState = { ...decide, cx: P.x + 10, cy: 9, cz: P.z + 14, tx: P.x + 5, ty: 6, tz: P.z - 6, arc: 1 };
  const known: SceneState = { ...decide, cx: P.x + 3.6, cy: 3.6, cz: P.z + 4.6, ...k, arc: 0, scan: 0 };
  const examined: SceneState = { ...known, wire: 1 };
  const examinedEnd: SceneState = { ...examined, cx: P.x + 2.2, cy: 3.9, cz: P.z + 5.4 };
  const commuteA: SceneState = { ...BASE, cx: P.x + 3, cy: 40, cz: P.z + 26, tx: P.x + 9, ty: 0, tz: P.z - 1, orbit: 0, scan: 0, dim: 0.35 };
  const commuteB: SceneState = { ...commuteA, commute: 1 };
  // Schools: a low pass over the primary while its outline lights up.
  const schoolA: SceneState = { ...BASE, cx: 12, cy: 10, cz: 27, tx: -1, ty: 0.8, tz: 9.5, orbit: 0, scan: 0, school: 1 };
  const schoolB: SceneState = { ...schoolA, cx: 6, cy: 8, cz: 24 };
  // Quiet streets: down at kerb height on a side road, easing along it.
  const quietA: SceneState = { ...BASE, cx: -38, cy: 1.5, cz: 27.75, tx: -28, ty: 0.9, tz: 26.8, orbit: 0, scan: 0 };
  const quietB: SceneState = { ...quietA, cx: -31, tx: -21 };
  // Street level: the camera drives east along a residential road with the traffic.
  const driveA: SceneState = { ...BASE, cx: -46, cy: 2.6, cz: 17.2, tx: -36, ty: 1.4, tz: 17.6, orbit: 0, scan: 0 };
  const driveB: SceneState = { ...driveA, cx: 22, tx: 32 };
  // Around London: Westminster (Eye and Big Ben), St Paul's in the City, then Hyde Park.
  const westminster: SceneState = { ...BASE, cx: 3, cy: 8, cz: 11, tx: -13, ty: 3, tz: -5, orbit: 0, scan: 0 };
  const theCity: SceneState = { ...westminster, cx: -10, cy: 13, cz: -30, tx: 5.5, ty: 1.6, tz: -22.5 };
  const hydePark: SceneState = { ...westminster, cx: -11, cy: 12, cz: -3, tx: -24, ty: 0.5, tz: -16 };
  const tryIt: SceneState = { ...BASE, cx: -24, cy: 17, cz: 28, tx: 2, ty: 0, tz: -2, orbit: 0.5, school: 1, scan: 1 };
  const faq: SceneState = { ...BASE, cx: 0.1, cy: 70, cz: 52, tx: 0, ty: 0, tz: 0, orbit: 0.3, scan: 0.4, dim: 0.75 };
  const city: SceneState = { ...BASE, cx: 0.1, cy: 92, cz: 30, tx: 0, ty: 0, tz: 4, orbit: 0.3, scan: 0.6, pin: 1 };
  return [
    { id: "top", at: 0, s: hero },
    { id: "top", at: 0.35, s: hero },
    { id: "problem", at: 0, s: top },
    { id: "problem", at: 0.25, s: top },
    { id: "problem", at: 0.78, s: { ...top, morph: 1 } },
    { id: "problem", at: 1, s: { ...top, morph: 1, cloud: 0.3 } },
    { id: "compare", at: 0, s: { ...top, morph: 1, cloud: 0, dim: 0.95 } },
    { id: "compare", at: 1, s: { ...top, morph: 1, cloud: 0, dim: 0.95 } },
    { id: "how", at: 0.1, s: describe },
    { id: "how", at: 0.22, s: describe },
    { id: "how", at: 0.36, s: refine },
    { id: "how", at: 0.47, s: refine },
    { id: "how", at: 0.6, s: decide },
    { id: "how", at: 0.72, s: decide },
    { id: "how", at: 0.86, s: send },
    { id: "how", at: 1, s: send },
    { id: "commute", at: 0, s: commuteA },
    { id: "commute", at: 0.15, s: commuteA },
    { id: "commute", at: 0.6, s: commuteB },
    { id: "commute", at: 1, s: commuteB },
    { id: "schools", at: 0, s: schoolA },
    { id: "schools", at: 1, s: schoolB },
    { id: "quiet", at: 0, s: quietA },
    { id: "quiet", at: 1, s: quietB },
    { id: "truth", at: 0, s: known },
    { id: "truth", at: 0.3, s: examined },
    { id: "truth", at: 1, s: examinedEnd },
    { id: "streets", at: 0, s: driveA },
    { id: "streets", at: 1, s: driveB },
    { id: "around", at: 0, s: westminster },
    { id: "around", at: 0.26, s: westminster },
    { id: "around", at: 0.42, s: theCity },
    { id: "around", at: 0.6, s: theCity },
    { id: "around", at: 0.76, s: hydePark },
    { id: "around", at: 1, s: hydePark },
    { id: "try", at: 0, s: tryIt },
    { id: "try", at: 1, s: tryIt },
    { id: "faq", at: 0, s: faq },
    { id: "demo", at: 0, s: city },
  ];
}

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

const hash = (t: string) => [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function Experience() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lite = innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const canvas = document.getElementById("stage") as HTMLCanvasElement;
    gsap.registerPlugin(ScrollTrigger);

    let stage: Stage | null = null;
    try {
      stage = new Stage(canvas, { lite });
    } catch {
      document.documentElement.classList.add("no-webgl");
    }
    const root = document.documentElement;
    root.classList.add("js");
    if (reduced) root.classList.add("reduced");

    const lenis = reduced ? null : new Lenis({ anchors: true, lerp: 0.085 });
    const onLenisTick = (time: number) => lenis?.raf(time * 1000);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(onLenisTick);
      gsap.ticker.lagSmoothing(0);
    }

    // --- Scroll -> scene state
    const narrow = innerWidth < 900;
    const keys = stage ? keyframes(stage.focusPos, narrow) : [];
    let anchors: number[] = [];
    const measure = () => {
      const vh = innerHeight;
      anchors = keys.map((k) => {
        const el = document.getElementById(k.id)!;
        const top = el.getBoundingClientRect().top + scrollY;
        return top + k.at * Math.max(el.offsetHeight - vh, 0) - (k.id === "demo" ? vh * 0.6 : 0);
      });
    };
    const state = { ...BASE };
    const sample = (y: number) => {
      let i = 0;
      while (i < anchors.length - 1 && y > anchors[i + 1]) i++;
      const a = keys[i].s;
      const b = keys[Math.min(i + 1, keys.length - 1)].s;
      const span = anchors[i + 1] - anchors[i];
      const t = i >= anchors.length - 1 || span <= 0 ? (y > anchors[i] ? 1 : 0) : ease(Math.min(Math.max((y - anchors[i]) / span, 0), 1));
      (Object.keys(state) as (keyof SceneState)[]).forEach((k) => { state[k] = a[k] + (b[k] - a[k]) * t; });
      if (reduced) Object.assign(state, { cx: BASE.cx, cy: BASE.cy, cz: BASE.cz, tx: BASE.tx, ty: BASE.ty, tz: BASE.tz });
      // Opening swoop: the camera drops from survey height into the street view.
      state.cy += intro.v * 62;
      state.cx -= intro.v * 18;
      state.cz += intro.v * 6;
    };
    const intro = { v: reduced ? 0 : 1 };
    gsap.to(intro, { v: 0, duration: 3.4, ease: "power3.inOut", delay: 0.1 });

    // --- Drag to look around (mouse only; touch keeps native scrolling).
    const NO_DRAG = "a,button,input,textarea,select,label,summary,details,form,figure,h1,h2,h3,p,li,.ui,.dock,.feeling,.people,.faq,.foot";
    let yaw = 0, pitch = 0, vy = 0, vp = 0, dragging = false, lx = 0, ly = 0, mx = 0, my = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || (e.target as Element).closest(NO_DRAG)) return;
      dragging = true; lx = e.clientX; ly = e.clientY; vy = vp = 0;
      root.classList.add("dragging");
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5;
      if (!dragging) return;
      vy = -(e.clientX - lx) * 0.006; vp = (e.clientY - ly) * 0.004;
      lx = e.clientX; ly = e.clientY;
      yaw += vy; pitch = clamp(pitch + vp, -0.35, 0.5);
    };
    const onUp = () => { dragging = false; root.classList.remove("dragging"); };
    addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);

    // --- Price tags over the homes the hero scan matched.
    const spotEls = Array.from(document.querySelectorAll<HTMLElement>(".spot"));
    let spots: { x: number; y: number; z: number }[] = [];
    const setSpots = (qi: number) => {
      if (!stage) return;
      spots = stage.spots(qi, spotEls.length);
      spots.forEach((p, i) => {
        const h = Math.abs(Math.sin(p.x * 12.9 + p.z * 78.2) * 43758) % 1;
        const price = Math.round((qi === 1 ? 380 + h * 220 : 520 + h * 260) / 5) * 5;
        const beds = qi === 1 ? `${1 + Math.floor(h * 2)} bed flat` : `${2 + Math.floor(h * 2)} bed`;
        spotEls[i].querySelector(".spot-label")!.innerHTML = `<b>£${price}k</b><span>${beds} · ${88 + Math.floor(h * 11)}% fit</span>`;
      });
    };
    const avoid = Array.from(document.querySelectorAll<HTMLElement>(".hero-copy, .console, .hero-top"));

    // --- Dock: chapter progress
    const chapterLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".dock-track a"));
    let chapters: { a: HTMLAnchorElement; top: number; h: number }[] = [];
    const measureChapters = () => {
      chapters = chapterLinks.map((a) => {
        const el = document.getElementById(a.dataset.chapter!)!;
        return { a, top: el.getBoundingClientRect().top + scrollY, h: el.offsetHeight };
      });
    };

    // --- Labels pinned to the chosen home
    const tags = Array.from(document.querySelectorAll<HTMLElement>(".tag3d")).map((el) => {
      const [x, y, z] = el.dataset.anchor!.split(",").map(Number);
      return { el, p: { x, y, z } };
    });

    const tick = () => {
      if (!stage) return;
      sample(scrollY);
      if (!dragging) {
        yaw += vy; pitch += vp; vy *= 0.93; vp *= 0.85;
      }
      stage.look(yaw + (reduced ? 0 : mx * 0.07), clamp(pitch + (reduced ? 0 : my * 0.04), -0.4, 0.55));
      stage.render(state, reduced);

      const vh = innerHeight;
      const inHero = scrollY < vh * 0.6;
      const zones = inHero ? avoid.map((el) => el.getBoundingClientRect()) : [];
      spots.forEach((p, i) => {
        const s = stage!.projectWorld(p);
        const blocked = zones.some((r) => s.x > r.left - 90 && s.x < r.right + 90 && s.y > r.top - 70 && s.y < r.bottom + 30);
        const on = inHero && !s.behind && !blocked && s.x > 60 && s.x < innerWidth - 60 && s.y > 80 && stage!.scanX.value > p.x + 1;
        spotEls[i].style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
        spotEls[i].classList.toggle("on", on);
      });

      root.classList.toggle("dock-on", scrollY > vh * 0.55);
      chapters.forEach(({ a, top, h }) => {
        const p = clamp((scrollY + vh * 0.5 - top) / h, 0, 1);
        a.style.setProperty("--p", String(p));
        if (p > 0 && p < 1) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      const show = state.wire > 0.6 && !reduced;
      tags.forEach(({ el, p }) => {
        const s = stage!.project(p);
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
        el.classList.toggle("on", show && !s.behind);
      });
    };
    measure();
    measureChapters();
    gsap.ticker.add(tick);
    const onResize = () => { stage?.resize(); measure(); ScrollTrigger.refresh(); };
    addEventListener("resize", onResize);
    ScrollTrigger.addEventListener("refresh", measure);
    ScrollTrigger.addEventListener("refresh", measureChapters);

    const ctx = gsap.context(() => {
      // Hero entrance: lines rise out of their own baseline.
      if (!reduced) {
        gsap.from(".hero-title .line > span", { yPercent: 115, duration: 1.4, ease: "expo.out", stagger: 0.09, delay: 0.15 });
        gsap.from(".hero-sub, .hero-cta, .console", { autoAlpha: 0, y: 24, filter: "blur(8px)", duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.55 });
        gsap.from("#stage", { autoAlpha: 0, duration: 2, ease: "power2.out" });
        gsap.from(".hero-top", { autoAlpha: 0, y: -12, duration: 1.2, ease: "expo.out", delay: 1.2 });
        gsap.to(".hero-copy, .console, .hero-top", {
          yPercent: -18, autoAlpha: 0, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true },
        });
      }

      // Feelings drift in loose, then get forced into filter rows.
      const feelings = gsap.utils.toArray<HTMLElement>(".feeling");
      // Each loose quote gets its own row, shuffled, so none overlap before they snap into place.
      const rows = [2, 0, 4, 1, 5, 3];
      const xs = narrow ? [0, 0, 0, 0, 0, 0] : [-55, -10, -35, -60, -5, -30];
      const rot = [-6, 5, 4, -7, -3, 6];
      const tl = gsap.timeline({ scrollTrigger: { trigger: "#problem", start: "top top", end: "bottom bottom", scrub: reduced ? true : 0.6 } });
      feelings.forEach((el, i) => {
        tl.fromTo(el, { xPercent: xs[i], yPercent: (rows[i] - i) * 118, rotation: narrow ? rot[i] / 2 : rot[i], scale: 1.04 }, { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, ease: "power3.inOut", duration: 1 }, 0.25 + i * 0.04);
        tl.fromTo(el.querySelector(".feel"), { autoAlpha: 1, filter: "blur(0px)" }, { autoAlpha: 0, filter: "blur(6px)", duration: 0.35 }, 0.95 + i * 0.04);
        tl.fromTo(el.querySelector(".filt"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 1.05 + i * 0.04);
      });
      tl.fromTo(".problem-title .voice", { autoAlpha: 1 }, { autoAlpha: 0.28, duration: 0.6 }, 0.9);
      tl.fromTo(".problem-coda", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.55);
      tl.to({}, { duration: 0.3 });

      // Steps follow the camera through the four moves.
      const stepEls = document.querySelectorAll<HTMLElement>("#how .step, #how .rail li");
      // onRefresh too, so a reload that restores the scroll mid-section shows the right step.
      const setStep = (self: ScrollTrigger) => {
        const p = self.progress;
        const active = String(p < 0.3 ? 1 : p < 0.54 ? 2 : p < 0.79 ? 3 : 4);
        stepEls.forEach((el) => el.toggleAttribute("data-active", el.dataset.step === active));
      };
      ScrollTrigger.create({ trigger: "#how", start: "top top", end: "bottom bottom", onUpdate: setStep, onRefresh: setStep });
      const stopEls = document.querySelectorAll<HTMLElement>("#around [data-stop]");
      const setStop = (self: ScrollTrigger) => {
        const active = String(self.progress < 0.34 ? 1 : self.progress < 0.68 ? 2 : 3);
        stopEls.forEach((el) => el.toggleAttribute("data-active", el.dataset.stop === active));
      };
      ScrollTrigger.create({ trigger: "#around", start: "top top", end: "bottom bottom", onUpdate: setStop, onRefresh: setStop });

      const track = document.querySelector<HTMLElement>(".street-track");
      if (track) {
        gsap.to(track, {
          x: () => -(track.scrollWidth - innerWidth),
          ease: "none",
          scrollTrigger: { trigger: "#streets", start: "top top", end: "bottom bottom", scrub: reduced ? true : 0.5, invalidateOnRefresh: true },
        });
      }
      gsap.utils.toArray<HTMLElement>(".commute").forEach((sec) => {
        gsap.from(sec.querySelectorAll(".commute-copy > *"), {
          autoAlpha: 0, y: 30, stagger: 0.09, duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: sec, start: "top 40%" },
        });
      });
      gsap.from(".filter-wall li", {
        autoAlpha: 0, y: 14, stagger: 0.045, duration: 0.7, ease: "expo.out",
        scrollTrigger: { trigger: ".compare", start: "top 65%" },
      });
      gsap.from(".compare h2, .side.ours > *", {
        autoAlpha: 0, y: 30, stagger: 0.09, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: ".compare", start: "top 60%" },
      });
      gsap.from(".try-panel > *", {
        autoAlpha: 0, y: 30, stagger: 0.08, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: "#try", start: "top 60%" },
      });
      gsap.from(".faq h2, .faq details", {
        autoAlpha: 0, y: 24, stagger: 0.07, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: "#faq", start: "top 70%" },
      });
      gsap.from(".truth-copy > *", {
        autoAlpha: 0, y: 40, stagger: 0.1, ease: "expo.out", duration: 1.2,
        scrollTrigger: { trigger: "#truth", start: "top 40%" },
      });
      gsap.utils.toArray<HTMLElement>(".persona-list li").forEach((li) => {
        gsap.from(li, { clipPath: "inset(0 0 100% 0)", y: 30, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: li, start: "top 85%" } });
      });
      gsap.from(".launch-copy h2, .launch-copy p, .form", {
        autoAlpha: 0, y: 40, stagger: 0.1, duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: "#demo", start: "top 60%" },
      });
    });

    // --- The hero's live demo: type the words, translate them, sweep the city.
    const words = document.getElementById("q-text")!;
    const chips = document.getElementById("q-parse")!;
    const count = document.getElementById("q-count")!;
    const bar = document.getElementById("q-bar")!;
    const setCount = (scanned: number, matched: number) => {
      count.innerHTML = `<b>${scanned.toLocaleString("en-GB")}</b> homes scanned · <b class="y">${matched}</b> match`;
    };
    const setChips = (list: string[]) => {
      chips.innerHTML = list.map((c) => `<li>${c}</li>`).join("");
    };
    let loop: gsap.core.Timeline | null = null;
    const run = (qi: number) => {
      if (!stage) return;
      const q = QUERIES[qi];
      const total = stage.total;
      const m = stage.matches(qi);
      const typed = { n: 0 };
      const scan = { p: 0 };
      stage.setQuery(qi);
      setSpots(qi);
      loop = gsap.timeline({ onComplete: () => run((qi + 1) % QUERIES.length) });
      loop
        .call(() => { setChips([]); setCount(0, 0); words.classList.add("typing"); })
        .to(typed, { n: q.text.length, duration: q.text.length * 0.032, ease: "none", onUpdate: () => { words.textContent = q.text.slice(0, Math.round(typed.n)); } })
        .call(() => { words.classList.remove("typing"); setChips(q.chips); gsap.from("#q-parse li", { autoAlpha: 0, y: 8, stagger: 0.07, duration: 0.6, ease: "expo.out" }); })
        .fromTo(stage.scanX, { value: -56 }, { value: 58, duration: 3.2, ease: "power1.inOut" }, "+=0.35")
        .fromTo(scan, { p: 0 }, { p: 1, duration: 3.2, ease: "power1.inOut", onUpdate: () => {
          setCount(Math.round(total * scan.p), Math.round(m * scan.p));
          bar.style.transform = `scaleX(${scan.p})`;
        } }, "<")
        .to({}, { duration: 3.4 })
        .to(bar, { scaleX: 0, duration: 0.4, ease: "power2.in" });
    };
    const settle = () => {
      loop?.kill();
      loop = null;
      if (!stage) return;
      stage.setQuery(0);
      setSpots(0);
      gsap.to(stage.scanX, { value: 80, duration: 1.2, ease: "power2.out" });
      words.textContent = QUERIES[0].text;
      setChips(QUERIES[0].chips);
      setCount(stage.total, stage.matches(0));
      bar.style.transform = "scaleX(1)";
    };
    if (reduced) settle();
    else {
      run(0);
      ScrollTrigger.create({
        trigger: "#top", start: "top top", end: "bottom top",
        onLeave: settle,
        onEnterBack: () => { if (!loop) run(0); },
      });
    }

    // --- Try it: read the visitor's words, then sweep the city for them.
    const form = document.getElementById("try-form") as HTMLFormElement;
    const input = document.getElementById("try-input") as HTMLTextAreaElement;
    const tryChips = document.getElementById("try-chips")!;
    const tryCount = document.getElementById("try-count")!;
    const scanFor = (text: string) => {
      const chips = readWords(text);
      if (!chips.length) {
        tryChips.innerHTML = `<li class="ghost">Tell it a little more: rooms, budget, area or how it should feel.</li>`;
        tryCount.textContent = "\u00a0";
        return;
      }
      tryChips.innerHTML = chips.map((c) => `<li class="${c.guess ? "guess" : ""}">${c.label}</li>`).join("");
      if (!reduced) gsap.from("#try-chips li", { autoAlpha: 0, y: 10, stagger: 0.06, duration: 0.6, ease: "expo.out" });
      if (!stage) return;
      loop?.kill(); loop = null;
      const q = hash(text) % 3;
      const m = stage.matches(q);
      stage.setQuery(q);
      const shown = { p: 0 };
      gsap.timeline()
        .fromTo(stage.scanX, { value: -56 }, { value: 58, duration: reduced ? 0.01 : 2.8, ease: "power1.inOut" }, 0)
        .fromTo(shown, { p: 0 }, { p: 1, duration: reduced ? 0.01 : 2.8, ease: "power1.inOut", onUpdate: () => {
          tryCount.innerHTML = `<b>${Math.round(stage!.total * shown.p).toLocaleString("en-GB")}</b> homes scanned · <b class="y">${Math.round(m * shown.p)}</b> match`;
        } }, 0);
    };
    const onTry = (e: Event) => { e.preventDefault(); scanFor(input.value); };
    const onSuggest = (e: Event) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-suggest]");
      if (!t) return;
      input.value = t.dataset.suggest!;
      scanFor(input.value);
    };
    form.addEventListener("submit", onTry);
    const suggest = document.querySelector(".try-suggest")!;
    suggest.addEventListener("click", onSuggest);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

    return () => {
      form.removeEventListener("submit", onTry);
      suggest.removeEventListener("click", onSuggest);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      loop?.kill();
      ctx.revert();
      gsap.ticker.remove(tick);
      gsap.ticker.remove(onLenisTick);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.removeEventListener("refresh", measure);
      removeEventListener("resize", onResize);
      lenis?.destroy();
      stage?.dispose();
    };
  }, []);

  return null;
}
