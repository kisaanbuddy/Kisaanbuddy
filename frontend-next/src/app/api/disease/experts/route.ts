import { NextResponse } from "next/server";
import { getExperts } from "@/lib/disease-advisory-store";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")
  );
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;
    const crop = searchParams.get("crop") || undefined;
    const specialization = searchParams.get("specialization") || undefined;

    // Try remote FastAPI backend first
    try {
      const backendUrl = getBackendUrl();
      const qs = searchParams.toString();
      const res = await fetch(`${backendUrl}/api/disease/experts${qs ? `?${qs}` : ""}`, {
        method: "GET",
        cache: "no-store",
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {
      // Backend offline, fallback to authentic store
    }

    const items = getExperts({ state, district, crop, specialization });
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to load experts" }, { status: 500 });
  }
}
