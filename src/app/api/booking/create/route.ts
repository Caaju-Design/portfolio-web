import { NextResponse, type NextRequest } from "next/server";

import { createBooking, getAvailableSlots } from "@/lib/booking";
import { logAccess, upsertLead } from "@/lib/audit";
import { checkRateLimit, classifyEmail } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  let body: {
    start?: string; name?: string; email?: string;
    company?: string; notes?: string; timeZone?: string; website?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ ok: true }); // honeypot

  const email = body.email?.trim().toLowerCase() ?? "";
  const name = body.name?.trim() ?? "";
  const start = body.start ?? "";

  if (!email || !name || !start) {
    return NextResponse.json({ ok: false, message: "Missing fields." }, { status: 400 });
  }

  const verdict = classifyEmail(email);
  if (verdict === "invalid" || verdict === "disposable") {
    return NextResponse.json({ ok: false, message: "Please use a valid work email." }, { status: 400 });
  }

  const byIp = await checkRateLimit(`book:ip:${ip}`, 5, 3600_000);
  const byEmail = await checkRateLimit(`book:email:${email}`, 2, 86_400_000);
  if (!byIp.allowed || !byEmail.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  // Revalida no servidor: o horário precisa estar realmente livre AGORA.
  // Sem isto, duas pessoas na mesma tela reservam o mesmo slot.
  const available = await getAvailableSlots();
  if (!available.some((s) => s.start === start)) {
    return NextResponse.json(
      { ok: false, message: "That slot was just taken. Pick another one." },
      { status: 409 },
    );
  }

  try {
    const result = await createBooking({
      startIso: start,
      name,
      email,
      company: body.company,
      notes: body.notes,
      visitorTimeZone: body.timeZone,
    });

    await upsertLead({
      email, company: body.company, caseSlug: "booking", ip, userAgent,
    });
    await logAccess({
      action: "granted", email, caseSlug: "booking", ip, userAgent, reason: "call-booked",
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[booking/create]", error);
    return NextResponse.json(
      { ok: false, message: "Couldn't complete the booking. Please email me instead." },
      { status: 500 },
    );
  }
}
