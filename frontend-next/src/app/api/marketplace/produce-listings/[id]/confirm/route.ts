import { NextResponse } from "next/server";
import { confirmProduceListingStock } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")
  );
};

async function handleConfirm(request: Request, idParam: string) {
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ detail: "Invalid listing ID" }, { status: 400 });
  }

  // 1. Try remote FastAPI backend if available
  try {
    const backendUrl = getBackendUrl();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const auth = request.headers.get("authorization");
    if (auth) headers["Authorization"] = auth;
    const cookie = request.headers.get("cookie");
    if (cookie) headers["Cookie"] = cookie;

    const res = await fetch(`${backendUrl}/api/marketplace/produce-listings/${id}/confirm`, {
      method: "PATCH",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      confirmProduceListingStock(id);
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline, fallback to in-memory store
  }

  // 2. Fallback to local store
  const updated = confirmProduceListingStock(id);
  if (!updated) {
    return NextResponse.json({ detail: "Produce listing not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  return handleConfirm(request, params.id);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return handleConfirm(request, params.id);
}
