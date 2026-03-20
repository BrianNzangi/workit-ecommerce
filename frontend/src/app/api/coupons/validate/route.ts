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

const getForwardHeaders = (request: NextRequest) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const response = await fetch(`${getBackendUrl()}/store/coupons/validate`, {
      method: "POST",
      headers: getForwardHeaders(request),
      body,
      cache: "no-store",
    });
    return toJsonResponse(response);
  } catch (error) {
    console.error("Coupon API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
