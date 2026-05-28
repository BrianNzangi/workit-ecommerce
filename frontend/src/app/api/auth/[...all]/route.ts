import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBackendUrl() {
  const env = process.env as Record<string, string | undefined>;
  return (
    env.BACKEND_API_URL ||
    env.BACKEND_URL ||
    env.NEXT_PUBLIC_BACKEND_URL ||
    env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

async function handler(request: NextRequest) {
  const backendUrl = getBackendUrl();
  const path = request.nextUrl.pathname.replace("/api/auth", "/auth");
  const url = `${backendUrl}${path}${request.nextUrl.search}`;

  try {
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");

    const body =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.arrayBuffer()
        : undefined;

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.arrayBuffer();
    const responseHeaders = new Headers();
    const headerList = response.headers as unknown as { getSetCookie?: () => string[] };
    const setCookies =
      typeof headerList.getSetCookie === "function"
        ? headerList.getSetCookie()
        : response.headers.get("set-cookie")
          ? [response.headers.get("set-cookie") as string]
          : [];

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") return;
      if (key.toLowerCase() !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });

    setCookies.forEach((cookie) => {
      responseHeaders.append("set-cookie", cookie);
    });

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Storefront Auth Proxy Error]:", error);
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
