import { NextResponse } from "next/server";
import { getGovernmentProcurement } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crop_name = searchParams.get("crop_name") || undefined;
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;
    const search = searchParams.get("search") || undefined;
    const page_raw = searchParams.get("page");
    const limit_raw = searchParams.get("limit");

    const result = getGovernmentProcurement({
      crop_name,
      state,
      district,
      search,
      page: page_raw ? parseInt(page_raw) : 1,
      limit: limit_raw ? parseInt(limit_raw) : 50,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch government procurement" }, { status: 500 });
  }
}
