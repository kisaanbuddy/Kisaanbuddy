import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")

  try {
    const contentType = req.headers.get("content-type") || ""
    const cookies = req.headers.get("cookie") || ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const res = await fetch(`${backendUrl}/api/feedback`, {
        method: "POST",
        headers: {
          Cookie: cookies,
        },
        body: formData,
      })

      const data = await res.json().catch(() => ({}))
      return NextResponse.json(data, { status: res.status })
    } else {
      const body = await req.json()
      const res = await fetch(`${backendUrl}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json().catch(() => ({}))
      return NextResponse.json(data, { status: res.status })
    }
  } catch (err: any) {
    console.error("Feedback proxy error:", err)
    return NextResponse.json(
      { detail: "Could not connect to feedback service. Please try again later." },
      { status: 502 }
    )
  }
}
