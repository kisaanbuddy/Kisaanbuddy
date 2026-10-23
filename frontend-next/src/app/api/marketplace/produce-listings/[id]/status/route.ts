import { NextResponse } from "next/server";
import { updateProduceListingStatus } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")
  );
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const { searchParams } = new URL(request.url);
  const status_value = searchParams.get("status_value");

  if (isNaN(id) || !status_value) {
    return NextResponse.json({ detail: "Invalid request parameters" }, { status: 400 });
  }

  // 1. Try remote FastAPI backend if available
  try {
    const backendUrl = getBackendUrl();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const auth = request.headers.get("authorization");
    if (auth) headers["Authorization"] = auth;
    const cookie = request.headers.get("cookie");
    if (cookie) headers["Cookie"] = cookie;

    const res = await fetch(
      `${backendUrl}/api/marketplace/produce-listings/${id}/status?status_value=${encodeURIComponent(status_value)}`,
      {
        method: "PATCH",
        headers,
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      updateProduceListingStatus(id, status_value);
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline, fallback to local store
  }

  // 2. Fallback to local store
  const updated = updateProduceListingStatus(id, status_value);
  if (!updated) {
    return NextResponse.json({ detail: "Produce listing not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
