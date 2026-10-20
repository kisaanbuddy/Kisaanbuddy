import { NextResponse } from "next/server";
import { getProduceListingById } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")
  );
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ detail: "Invalid ID" }, { status: 400 });
  }

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/marketplace/produce-listings/${id}`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    // Backend offline
  }

  const item = getProduceListingById(id);
  if (!item) {
    return NextResponse.json({ detail: "Produce listing not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}
