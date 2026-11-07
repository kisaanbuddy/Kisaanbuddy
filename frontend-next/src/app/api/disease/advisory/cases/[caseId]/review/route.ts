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

    // Pass incoming authentication headers to FastAPI backend
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) headers["Cookie"] = cookieHeader;

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/disease/advisory/cases/${encodeURIComponent(caseId)}/review`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        reviewAdvisoryCase(caseId, body);
        return NextResponse.json(data);
      }

      // Propagate authorization errors and validation failures
      if (res.status === 401 || res.status === 403 || res.status === 400 || res.status === 404) {
        const errData = await res.json().catch(() => ({ detail: "Request failed" }));
        return NextResponse.json(errData, { status: res.status });
      }
    } catch {
      // Backend offline network failure: fall back to local store
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
