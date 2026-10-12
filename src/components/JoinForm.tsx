"use client";

import { useRef, useState } from "react";

type Status = { kind: "idle" | "sending" | "done" | "error"; msg?: string };

export default function JoinForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const tilt = useRef<HTMLDivElement>(null);
  const done = status.kind === "done";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/join", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setStatus({ kind: "done" });
      // Experience.tsx listens: golden house rises over London while the card flips.
      window.dispatchEvent(new Event("founding:claimed"));
    } catch (err) {
      setStatus({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  // The card follows the pointer in 3D, and a sheen slides across it.
  function aim(e: React.PointerEvent<HTMLDivElement>) {
    const el = tilt.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 14}deg`);
    el.style.setProperty("--rx", `${-y * 10}deg`);
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
  }
  function rest() {
    tilt.current?.style.removeProperty("--ry");
    tilt.current?.style.removeProperty("--rx");
  }

  return (
    <div className="flip" data-done={done || undefined} onPointerMove={aim} onPointerLeave={rest}>
      <div className="tilt" ref={tilt}>
        <div className="flip-inner">
          <form className="form face front" onSubmit={submit} inert={done}>
            <label>
              <span>Email address</span>
              <input name="email" type="email" required autoComplete="email" maxLength={200} />
            </label>
            <label>
              <span>What are you looking for? <em>Optional</em></span>
              <textarea name="wish" rows={3} maxLength={1000} placeholder="Say it the way you'd tell a friend." />
            </label>
            <fieldset className="roles">
              <legend>I&rsquo;m</legend>
              <label><input type="radio" name="role" value="buyer" defaultChecked /><span>Looking for a home</span></label>
              <label><input type="radio" name="role" value="agent" /><span>An agent or agency</span></label>
            </fieldset>
            <button className="btn btn-block" disabled={status.kind === "sending"}>
              {status.kind === "sending" ? "Claiming…" : "Claim my founding place"}
            </button>
            <p className="form-note">We&rsquo;ll only email you when something genuinely matches. No agent spam, leave any time.</p>
            {status.kind === "error" && <p className="form-error" role="alert">{status.msg} Please try again.</p>}
          </form>

          <div className="ticket face back" role="status" aria-hidden={!done}>
            <svg className="ticket-mark" viewBox="0 0 28 28" aria-hidden="true">
              <path d="M4 12 14 4l10 8v12H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M1 16h26" stroke="currentColor" strokeWidth="2.5" />
            </svg>
            <p className="ticket-kicker">Founding member</p>
            <p className="ticket-title">You&rsquo;re in.</p>
            <p className="ticket-line">Your place in London is reserved. Watch it land on the map.</p>
            <div className="ticket-tear" aria-hidden="true" />
            <p className="ticket-fine">We&rsquo;ll only email you when something genuinely matches.</p>
            <span className="sheen" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
