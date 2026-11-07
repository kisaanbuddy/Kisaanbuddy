import { NextResponse } from "next/server";
import { addTradeInquiry, getTradeInquiries } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listing_type = searchParams.get("listing_type") || undefined;
    const listing_id_raw = searchParams.get("listing_id");
    const sender_phone = searchParams.get("sender_phone") || undefined;

    const items = getTradeInquiries({
      listing_type,
      listing_id: listing_id_raw ? parseInt(listing_id_raw) : undefined,
      sender_phone,
    });
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addTradeInquiry(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    const status = err.status || (err.message && err.message.includes("already registered") ? 409 : 400);
    return NextResponse.json({ detail: err.message || "Failed to submit inquiry" }, { status });
  }
}
