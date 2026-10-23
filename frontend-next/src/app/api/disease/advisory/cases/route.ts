import { NextResponse } from "next/server";
import { createAdvisoryCase, listAdvisoryCases } from "@/lib/disease-advisory-store";

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
    const status = searchParams.get("status") || undefined;
    const crop = searchParams.get("crop") || undefined;
    const state = searchParams.get("state") || undefined;

    try {
      const backendUrl = getBackendUrl();
      const qs = searchParams.toString();
      const res = await fetch(`${backendUrl}/api/disease/advisory/cases${qs ? `?${qs}` : ""}`, {
        method: "GET",
        cache: "no-store",
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {
      // Backend offline
    }

    const cases = listAdvisoryCases({ status, crop, state });
    return NextResponse.json(cases);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to list advisory cases." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.consent_recorded) {
      return NextResponse.json(
        { detail: "Farmer explicit consent is required to share diagnosis data with agricultural experts." },
        { status: 400 }
      );
    }

    // Try remote FastAPI backend first
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/disease/advisory/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        createAdvisoryCase(body);
        return NextResponse.json(data, { status: 201 });
      }
    } catch {
      // Backend offline
    }

    const created = createAdvisoryCase(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create advisory case." }, { status: 400 });
  }
}
