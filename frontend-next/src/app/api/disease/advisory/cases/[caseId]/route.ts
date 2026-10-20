import { NextResponse } from "next/server";
import { getAdvisoryCaseById } from "@/lib/disease-advisory-store";

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
  { params }: { params: { caseId: string } }
) {
  const caseId = params.caseId;
  if (!caseId) {
    return NextResponse.json({ detail: "Missing case ID" }, { status: 400 });
  }

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/disease/advisory/cases/${encodeURIComponent(caseId)}`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    // Backend offline
  }

  const caseItem = getAdvisoryCaseById(caseId);
  if (!caseItem) {
    return NextResponse.json({ detail: "Advisory case not found" }, { status: 404 });
  }

  return NextResponse.json(caseItem);
}
