"use client";

import { useState } from "react";

type Status = { kind: "idle" | "sending" | "done" | "error"; msg?: string };

export default function DemoForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setStatus({ kind: "done", msg: String(data.name).split(" ")[0] });
    } catch (err) {
      setStatus({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="form done" role="status">
        <p className="done-title">Thanks, {status.msg}.</p>
        <p>We&rsquo;ll email you to pick a time for your demo.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate={false}>
      <label>
        <span>Your name</span>
        <input name="name" required autoComplete="name" maxLength={120} />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" maxLength={200} />
      </label>
      <label>
        <span>I&rsquo;m a</span>
        <select name="role" defaultValue="buyer">
          <option value="buyer">Buyer in London</option>
          <option value="agent">Estate agent</option>
          <option value="partner">Investor or partner</option>
        </select>
      </label>
      <label>
        <span>What are you looking for? <em>Optional</em></span>
        <textarea name="wish" rows={3} maxLength={1000} placeholder="Say it the way you'd tell a friend." />
      </label>
      <button className="btn btn-block" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Booking…" : "Book a demo"}
      </button>
      {status.kind === "error" && <p className="form-error" role="alert">{status.msg} Please try again.</p>}
    </form>
  );
}
