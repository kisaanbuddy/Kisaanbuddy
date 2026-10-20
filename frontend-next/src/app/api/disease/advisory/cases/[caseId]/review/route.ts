import { NextResponse } from "next/server";
import { reviewAdvisoryCase } from "@/lib/disease-advisory-store";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")
  );
};

export async function POST(
  request: Request,
  { params }: { params: { caseId: string } }
) {
  const caseId = params.caseId;
  if (!caseId) {
    return NextResponse.json({ detail: "Missing case ID" }, { status: 400 });
  }

  try {
    const body = await request.json();

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/disease/advisory/cases/${encodeURIComponent(caseId)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        reviewAdvisoryCase(caseId, body);
        return NextResponse.json(data);
      }
    } catch {
      // Backend offline
    }

    const updated = reviewAdvisoryCase(caseId, body);
    if (!updated) {
      return NextResponse.json({ detail: "Advisory case not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update advisory review" }, { status: 500 });
  }
}
