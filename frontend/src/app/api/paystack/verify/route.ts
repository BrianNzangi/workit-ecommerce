import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta/meta-conversions";

const getBackendUrl = () => {
  const env = process.env as Record<string, string | undefined>;
  return (
    env.BACKEND_API_URL ||
    env.NEXT_PUBLIC_BACKEND_URL ||
    env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:3001"
  ).replace(/\/$/, "");
};

const toJsonResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return NextResponse.json({}, { status: response.status });
  }

  try {
    return NextResponse.json(JSON.parse(text), { status: response.status });
  } catch {
    return NextResponse.json({ message: text }, { status: response.status });
  }
};

const parseJsonSafely = (text: string) => {
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    const orderId = searchParams.get("orderId");

    if (!reference || !orderId) {
      return NextResponse.json({ error: "Missing reference or orderId" }, { status: 400 });
    }

    const response = await fetch(`${getBackendUrl()}/checkout/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("cookie")
          ? { cookie: req.headers.get("cookie") as string }
          : {}),
      },
      body: JSON.stringify({ orderId, paymentReference: reference }),
    });

    const text = await response.text();
    const data = parseJsonSafely(text);

    if (response.ok && data?.tracking) {
      const tracking = data.tracking;

      void sendMetaEvent({
        request: req,
        eventName: "Purchase",
        eventId: String(tracking.orderId || orderId),
        eventSourceUrl: req.headers.get("referer"),
        userData: {
          email: tracking.customer?.email || null,
          phone:
            tracking.shippingAddress?.phoneNumber ||
            tracking.billingAddress?.phoneNumber ||
            tracking.customer?.phoneNumber ||
            null,
          firstName:
            tracking.customer?.firstName ||
            tracking.shippingAddress?.fullName?.split(" ")[0] ||
            tracking.billingAddress?.fullName?.split(" ")[0] ||
            null,
          city:
            tracking.shippingAddress?.city ||
            tracking.billingAddress?.city ||
            null,
          region:
            tracking.shippingAddress?.province ||
            tracking.billingAddress?.province ||
            null,
          postcode:
            tracking.shippingAddress?.postalCode ||
            tracking.billingAddress?.postalCode ||
            null,
          country:
            tracking.shippingAddress?.country ||
            tracking.billingAddress?.country ||
            "KE",
          externalId: tracking.customer?.id || null,
        },
        customData: {
          currency: tracking.currencyCode || "KES",
          value: Number(tracking.total || 0),
          content_type: "product",
          content_ids: Array.isArray(tracking.items)
            ? tracking.items.map((item: any) => String(item.productId))
            : [],
          contents: Array.isArray(tracking.items)
            ? tracking.items.map((item: any) => ({
                id: String(item.productId),
                quantity: Number(item.quantity || 0),
                item_price: Number(item.linePrice || 0),
              }))
            : [],
          num_items: Array.isArray(tracking.items)
            ? tracking.items.reduce(
                (total: number, item: any) => total + Number(item.quantity || 0),
                0,
              )
            : 0,
        },
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Error verifying Paystack payment:", err.message);
    } else {
      console.error("❌ Error verifying Paystack payment:", err);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
        details: err instanceof Error ? err.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
