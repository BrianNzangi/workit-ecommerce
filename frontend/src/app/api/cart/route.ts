import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = () => {
  const env = process.env as Record<string, string | undefined>;
  return (
    env.BACKEND_API_URL ||
    env.NEXT_PUBLIC_BACKEND_URL ||
    env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
};

const getForwardHeaders = (
  request: NextRequest,
  options: { includeJson?: boolean } = {},
) => {
  const headers: Record<string, string> = {};
  if (options.includeJson) {
    headers["Content-Type"] = "application/json";
  }

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

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${getBackendUrl()}/cart`, {
      method: "GET",
      headers: getForwardHeaders(request),
      cache: "no-store",
    });
    return toJsonResponse(response);
  } catch (error) {
    console.error("Cart GET proxy failed:", error);
    return NextResponse.json({ message: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const response = await fetch(`${getBackendUrl()}/cart`, {
      method: "POST",
      headers: getForwardHeaders(request, { includeJson: true }),
      body,
      cache: "no-store",
    });
    return toJsonResponse(response);
  } catch (error) {
    console.error("Cart POST proxy failed:", error);
    return NextResponse.json({ message: "Failed to add cart item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = await fetch(`${getBackendUrl()}/cart`, {
      method: "DELETE",
      headers: getForwardHeaders(request),
      cache: "no-store",
    });
    return toJsonResponse(response);
  } catch (error) {
    console.error("Cart DELETE proxy failed:", error);
    return NextResponse.json({ message: "Failed to clear cart" }, { status: 500 });
  }
}
