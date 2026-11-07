import { NextResponse } from "next/server";
import { compareMarketplacePrices } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    if (!category) {
      return NextResponse.json({ detail: "category parameter is required" }, { status: 400 });
    }

    const deal_type = searchParams.get("deal_type") || undefined;
    const price_unit = searchParams.get("price_unit") || undefined;
    const hp_rating_raw = searchParams.get("hp_rating");
    const brand = searchParams.get("brand") || undefined;
    const model_name = searchParams.get("model_name") || undefined;
    const target_id = searchParams.get("target_id") || undefined;

    const result = compareMarketplacePrices({
      category,
      deal_type,
      price_unit,
      hp_rating: hp_rating_raw ? parseFloat(hp_rating_raw) : undefined,
      brand,
      model_name,
      target_id,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to compare prices" }, { status: 500 });
  }
}
