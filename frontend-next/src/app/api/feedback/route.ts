import { NextRequest, NextResponse } from "next/server"

function getCandidateBackendUrls(): string[] {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (envUrl) {
    return [envUrl.replace(/\/+$/, "")]
  }

  if (process.env.NODE_ENV === "production") {
    return ["https://krishiai-api.onrender.com"]
  }

  // In local development, check both 127.0.0.1:8000 and localhost:8000
  // to avoid IPv4 / IPv6 connection mismatch between Node.js undici and Python uvicorn
  return ["http://127.0.0.1:8000", "http://localhost:8000"]
}

export async function POST(req: NextRequest) {
  const candidateUrls = getCandidateBackendUrls()
  const contentType = req.headers.get("content-type") || ""
  const cookies = req.headers.get("cookie") || ""

  let formData: FormData | null = null
  let jsonBody: any = null

  try {
    if (contentType.includes("multipart/form-data")) {
      formData = await req.formData()
    } else {
      jsonBody = await req.json().catch(() => ({}))
    }
  } catch (err: any) {
    console.error("Failed to parse incoming feedback request payload:", err)
    return NextResponse.json(
      { detail: "Invalid request payload format." },
      { status: 400 }
    )
  }

  let lastError: any = null

  for (const backendUrl of candidateUrls) {
    try {
      let res: Response
      if (formData) {
        res = await fetch(`${backendUrl}/api/feedback`, {
          method: "POST",
          headers: {
            Cookie: cookies,
          },
          body: formData,
        })
      } else {
        res = await fetch(`${backendUrl}/api/feedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookies,
          },
          body: JSON.stringify(jsonBody),
        })
      }

      const data = await res.json().catch(() => ({}))
      return NextResponse.json(data, { status: res.status })
    } catch (err: any) {
      lastError = err
    }
  }

  console.error("Feedback proxy connection error:", lastError)
  return NextResponse.json(
    { detail: "Could not connect to feedback service. Please try again later." },
    { status: 502 }
  )
}
