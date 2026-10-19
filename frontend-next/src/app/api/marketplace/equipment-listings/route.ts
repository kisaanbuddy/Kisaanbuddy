import { NextResponse } from "next/server";
import { getEquipmentListings, addEquipmentListing } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listing_type = searchParams.get("listing_type") || undefined;
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page_raw = searchParams.get("page");
    const limit_raw = searchParams.get("limit");

    const result = getEquipmentListings({
      listing_type,
      category,
      brand,
      state,
      district,
      status,
      search,
      page: page_raw ? parseInt(page_raw) : 1,
      limit: limit_raw ? parseInt(limit_raw) : 50,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch equipment listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addEquipmentListing(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create equipment listing" }, { status: 400 });
  }
}
