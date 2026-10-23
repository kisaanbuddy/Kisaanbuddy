import { NextResponse } from "next/server";
import { getProduceListings, addProduceListing } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crop_name = searchParams.get("crop_name") || undefined;
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;
    const min_quantity_raw = searchParams.get("min_quantity");
    const status = searchParams.get("status") || undefined;
    const page_raw = searchParams.get("page");
    const limit_raw = searchParams.get("limit");

    const result = getProduceListings({
      crop_name,
      state,
      district,
      min_quantity: min_quantity_raw ? parseFloat(min_quantity_raw) : undefined,
      status,
      page: page_raw ? parseInt(page_raw) : 1,
      limit: limit_raw ? parseInt(limit_raw) : 50,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch produce listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addProduceListing(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create produce listing" }, { status: 400 });
  }
}
