import { NextResponse } from "next/server";
import { getLegacyListings, addLegacyListing } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listing_type = searchParams.get("listing_type") || undefined;
    const category = searchParams.get("category") || undefined;
    const crop = searchParams.get("crop") || undefined;
    const district = searchParams.get("district") || undefined;

    const result = getLegacyListings({
      listing_type,
      category,
      crop,
      district,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addLegacyListing(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create listing" }, { status: 400 });
  }
}
