import { NextResponse } from "next/server";
import { getEquipmentCategories } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = getEquipmentCategories();
    return NextResponse.json(categories);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch categories" }, { status: 500 });
  }
}
