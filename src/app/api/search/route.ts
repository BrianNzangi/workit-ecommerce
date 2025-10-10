import { NextResponse } from "next/server";
import woo from "@/lib/woocommerce";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing search term" }, { status: 400 });
  }

  try {
    const response = await woo.get("/products", {
      params: { search: query, per_page: 20 },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Woo Search Error:", error.message);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
