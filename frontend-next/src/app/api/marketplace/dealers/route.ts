import { NextResponse } from "next/server";
import { getDealersDirectory } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;
    const category = searchParams.get("category") || undefined;

    const result = getDealersDirectory({
      state,
      district,
      category,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch dealers" }, { status: 500 });
  }
}
