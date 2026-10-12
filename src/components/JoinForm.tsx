"use client";

import { useState } from "react";

type Status = { kind: "idle" | "sending" | "done" | "error"; msg?: string };

export default function JoinForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/join", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setStatus({ kind: "done" });
    } catch (err) {
      setStatus({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="form done" role="status">
        <p className="done-title">You&rsquo;re on the list.</p>
        <p>We&rsquo;ll only email you when something genuinely matches.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
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
  );
}
