import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")

  try {
    const cookies = req.headers.get("cookie") || ""
    const body = await req.json()
    const res = await fetch(`${backendUrl}/api/feedback/quick`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error("Quick feedback proxy error:", err)
    return NextResponse.json(
      { detail: "Quick review could not be recorded." },
      { status: 502 }
    )
  }
}
