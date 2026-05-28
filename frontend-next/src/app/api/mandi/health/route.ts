import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.DATA_GOV_API_KEY || ""
  return NextResponse.json({
    status: "ok",
    api_key_configured: !!apiKey,
    data_source: apiKey ? "AGMARKNET (live)" : "Mock data (set DATA_GOV_API_KEY for live)",
  })
}
