import { NextResponse } from "next/server";
import { getEquipmentBrands } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = getEquipmentBrands();
    return NextResponse.json(brands);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch brands" }, { status: 500 });
  }
}
