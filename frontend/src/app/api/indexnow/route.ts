import { NextRequest, NextResponse } from "next/server";
import {
  INDEXNOW_KEY,
  getCanonicalSiteUrl,
  getIndexNowKeyLocation,
  getUrlsForScopes,
  normalizeIndexNowUrls,
  toAbsoluteSiteUrl,
  type IndexingScope,
} from "@/lib/seo/site-indexing";

interface IndexNowRequestBody {
  paths?: string[];
  urls?: string[];
  scope?: IndexingScope;
  scopes?: IndexingScope[];
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as IndexNowRequestBody;
    const scopes = Array.from(
      new Set([...(body.scopes || []), ...(body.scope ? [body.scope] : [])]),
    );

    const scopedUrls = scopes.length > 0 ? await getUrlsForScopes(scopes) : [];
    const directUrls = normalizeIndexNowUrls([
      ...(body.urls || []),
      ...(body.paths || []).map((path) => toAbsoluteSiteUrl(path)),
    ]);

    const urlList = normalizeIndexNowUrls([...scopedUrls, ...directUrls]);

    if (urlList.length === 0) {
      return NextResponse.json(
        { error: "No valid URLs were provided for IndexNow submission." },
        { status: 400 },
      );
    }

    const host = new URL(getCanonicalSiteUrl()).host;
    const response = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: getIndexNowKeyLocation(),
        urlList,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "IndexNow submission failed.",
          status: response.status,
          details: responseText || null,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      submitted: urlList.length,
      host,
      keyLocation: getIndexNowKeyLocation(),
      urls: urlList,
      response: responseText || "OK",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unexpected IndexNow error." },
      { status: 500 },
    );
  }
}
