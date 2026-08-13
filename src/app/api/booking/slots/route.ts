import { NextResponse, type NextRequest } from "next/server";
import { bookingConfig, getAvailableSlots, type SlotDebug } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const wantsDebug =
    process.env.NODE_ENV !== "production" &&
    request.nextUrl.searchParams.get("debug") === "1";

  try {
    const box = { out: undefined as unknown as SlotDebug };
    const slots = await getAvailableSlots(wantsDebug ? box : undefined);

    return NextResponse.json(
      {
        slots,
        durationMinutes: bookingConfig.durationMinutes,
        ...(wantsDebug ? { debug: box.out, config: bookingConfig } : {}),
      },
      { headers: { "Cache-Control": "private, max-age=60" } },
    );
  } catch (error) {
    console.error("[booking/slots]", error);
    return NextResponse.json(
      {
        slots: [],
        error: "unavailable",
        ...(wantsDebug ? { detail: String((error as Error)?.message ?? error) } : {}),
      },
      { status: 503 },
    );
  }
}
