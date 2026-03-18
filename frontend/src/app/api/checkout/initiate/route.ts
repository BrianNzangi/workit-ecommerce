import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta-conversions";

const getBackendUrl = () => {
  const env = process.env as Record<string, string | undefined>;
  return (
    env.BACKEND_API_URL ||
    env.NEXT_PUBLIC_BACKEND_URL ||
    env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
};

const getForwardHeaders = (request: NextRequest) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const guestId = request.headers.get("x-guest-id");
  if (guestId) headers["x-guest-id"] = guestId;

  const cookie = request.headers.get("cookie");
  if (cookie) headers["cookie"] = cookie;

  return headers;
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

const parseJsonBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getCartSnapshot = async (request: NextRequest) => {
  try {
    const response = await fetch(`${getBackendUrl()}/cart`, {
      method: "GET",
      headers: getForwardHeaders(request),
      cache: "no-store",
    });

    if (!response.ok) return null;
    return await parseJsonBody(response);
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const cartSnapshot = await getCartSnapshot(request);
    const response = await fetch(`${getBackendUrl()}/checkout/initiate`, {
      method: "POST",
      headers: getForwardHeaders(request),
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const responseBody = await parseJsonBody(response);

    if (response.ok) {
      const lines = Array.isArray(cartSnapshot?.lines) ? cartSnapshot.lines : [];

      void sendMetaEvent({
        request,
        eventName: "InitiateCheckout",
        eventId: `checkout:${responseBody.orderId || Date.now()}`,
        eventSourceUrl: request.headers.get("referer"),
        userData: {
          email: payload.billingAddress?.email || null,
          phone:
            payload.billingAddress?.phoneNumber ||
            payload.shippingAddress?.phoneNumber ||
            null,
          firstName:
            payload.billingAddress?.fullName?.split(" ")[0] ||
            payload.shippingAddress?.fullName?.split(" ")[0] ||
            null,
          city: payload.shippingAddress?.city || payload.billingAddress?.city || null,
          region:
            payload.shippingAddress?.province ||
            payload.billingAddress?.province ||
            null,
          postcode:
            payload.shippingAddress?.postalCode ||
            payload.billingAddress?.postalCode ||
            null,
          country:
            payload.shippingAddress?.country ||
            payload.billingAddress?.country ||
            "KE",
        },
        customData: {
          currency: "KES",
          value: Number(responseBody.total || 0),
          content_type: "product",
          content_ids: lines.map((line: any) => String(line.productId)),
          contents: lines.map((line: any) => ({
            id: String(line.productId),
            quantity: Number(line.quantity || 0),
            item_price: Number(
              line.product?.salePrice ?? line.product?.originalPrice ?? 0,
            ),
          })),
          num_items: lines.reduce(
            (total: number, line: any) => total + Number(line.quantity || 0),
            0,
          ),
        },
      });
    }

    return NextResponse.json(responseBody, { status: response.status });
  } catch (error) {
    console.error("Checkout initiate proxy failed:", error);
    return NextResponse.json(
      { message: "Failed to initiate checkout" },
      { status: 500 }
    );
  }
}
