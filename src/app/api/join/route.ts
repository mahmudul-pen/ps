// ponytail: logs only, no storage. Swap the console.log for an email/CRM call when sign-ups matter.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please add a valid email." }, { status: 400 });
  }
  const role = ["buyer", "agent"].includes(body.role) ? body.role : "buyer";
  const wish = typeof body.wish === "string" ? body.wish.slice(0, 1000) : "";
  console.log("[founding-signup]", JSON.stringify({ email, role, wish, at: new Date().toISOString() }));
  return Response.json({ ok: true });
}
