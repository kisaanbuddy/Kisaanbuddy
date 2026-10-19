import { NextResponse } from "next/server";
import { getEquipmentCatalog } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const supplier = searchParams.get("supplier") || undefined;
    const search = searchParams.get("search") || undefined;
    const min_hp_raw = searchParams.get("min_hp");
    const max_hp_raw = searchParams.get("max_hp");
    const page_raw = searchParams.get("page");
    const limit_raw = searchParams.get("limit");

    const result = getEquipmentCatalog({
      category,
      brand,
      supplier,
      search,
      min_hp: min_hp_raw ? parseFloat(min_hp_raw) : undefined,
      max_hp: max_hp_raw ? parseFloat(max_hp_raw) : undefined,
      page: page_raw ? parseInt(page_raw) : 1,
      limit: limit_raw ? parseInt(limit_raw) : 250,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch equipment catalog" }, { status: 500 });
  }
}
