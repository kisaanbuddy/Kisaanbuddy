import { NextResponse } from "next/server";
import { getBuyerRequirements, addBuyerRequirement } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get("commodity") || undefined;
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const page_raw = searchParams.get("page");
    const limit_raw = searchParams.get("limit");

    const result = getBuyerRequirements({
      commodity,
      state,
      district,
      search,
      status,
      page: page_raw ? parseInt(page_raw) : 1,
      limit: limit_raw ? parseInt(limit_raw) : 50,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch buyer requirements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addBuyerRequirement(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create buyer requirement" }, { status: 400 });
  }
}
