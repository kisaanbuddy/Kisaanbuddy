import { NextRequest, NextResponse } from "next/server"

function getCandidateBackendUrls(): string[] {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (envUrl) {
    return [envUrl.replace(/\/+$/, "")]
  }

  if (process.env.NODE_ENV === "production") {
    return ["https://krishiai-api.onrender.com"]
  }

  return ["http://127.0.0.1:8000", "http://localhost:8000"]
}

export async function POST(req: NextRequest) {
  const candidateUrls = getCandidateBackendUrls()
  const cookies = req.headers.get("cookie") || ""

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ detail: "Invalid JSON payload." }, { status: 400 })
  }

  let lastError: any = null

  for (const backendUrl of candidateUrls) {
    try {
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
      lastError = err
    }
  }

  console.error("Quick feedback proxy error:", lastError)
  return NextResponse.json(
    { detail: "Quick review could not be recorded. Please try again later." },
    { status: 502 }
  )
}
