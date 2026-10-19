import { NextResponse } from "next/server";
import { getEquipmentCatalogItem } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ detail: "Invalid ID" }, { status: 400 });
    }
    const item = getEquipmentCatalogItem(id);
    if (!item) {
      return NextResponse.json({ detail: "Equipment catalogue item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch item" }, { status: 500 });
  }
}
