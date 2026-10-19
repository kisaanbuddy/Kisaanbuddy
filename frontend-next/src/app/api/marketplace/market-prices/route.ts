import { NextResponse } from "next/server";
import { getMarketPrices } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get("commodity") || undefined;
    const state = searchParams.get("state") || undefined;
    const limit_raw = searchParams.get("limit");

    const result = getMarketPrices({
      commodity,
      state,
      limit: limit_raw ? parseInt(limit_raw) : 20,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch market prices" }, { status: 500 });
  }
}
