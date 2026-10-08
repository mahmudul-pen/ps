// ponytail: logs only, no storage. Swap the console.log for an email/CRM call when bookings matter.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please add your name and a valid email." }, { status: 400 });
  }
  const role = ["buyer", "agent", "partner"].includes(body.role) ? body.role : "buyer";
  const wish = typeof body.wish === "string" ? body.wish.slice(0, 1000) : "";
  console.log("[demo-request]", JSON.stringify({ name, email, role, wish, at: new Date().toISOString() }));
  return Response.json({ ok: true });
}
