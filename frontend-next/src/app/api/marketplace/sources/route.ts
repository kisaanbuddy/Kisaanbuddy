import { NextResponse } from "next/server";
import { getImportSources } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sources = getImportSources();
    return NextResponse.json(sources);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to fetch sources" }, { status: 500 });
  }
}
