import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta-conversions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.eventName) {
      return NextResponse.json(
        { ok: false, message: "eventName is required" },
        { status: 400 },
      );
    }

    const result = await sendMetaEvent({
      request,
      eventName: body.eventName,
      eventId: body.eventId,
      eventSourceUrl: body.eventSourceUrl,
      userData: body.userData,
      customData: body.customData,
      optOut: body.optOut,
    });

    return NextResponse.json(result, {
      status: result.ok || result.skipped ? 200 : 202,
    });
  } catch (error) {
    console.error("[Meta CAPI] Event relay failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to relay Meta event",
      },
      { status: 500 },
    );
  }
}
