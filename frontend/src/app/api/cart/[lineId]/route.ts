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

  const csrfHeader =
    request.headers.get("x-xsrf-token") ||
    request.headers.get("x-csrf-token") ||
    request.headers.get("csrf-token");
  if (csrfHeader) headers["x-xsrf-token"] = csrfHeader;

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lineId: string }> },
) {
  try {
    const { lineId } = await params;
    const body = await request.text();
    const response = await fetch(`${getBackendUrl()}/cart/${lineId}`, {
      method: "PUT",
      headers: getForwardHeaders(request, { includeJson: true }),
      body,
      cache: "no-store",
    });
    return toJsonResponse(response);
  } catch (error) {
    console.error("Cart PUT proxy failed:", error);
    return NextResponse.json({ message: "Failed to update cart item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lineId: string }> },
) {
  try {
    const { lineId } = await params;
    const response = await fetch(`${getBackendUrl()}/cart/${lineId}`, {
      method: "DELETE",
      headers: getForwardHeaders(request),
      cache: "no-store",
    });
    return toJsonResponse(response);
  } catch (error) {
    console.error("Cart DELETE line proxy failed:", error);
    return NextResponse.json({ message: "Failed to remove cart item" }, { status: 500 });
  }
}
