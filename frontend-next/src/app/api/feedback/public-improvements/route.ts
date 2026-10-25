import { NextResponse } from "next/server"

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

export async function GET() {
  const candidateUrls = getCandidateBackendUrls()

  for (const backendUrl of candidateUrls) {
    try {
      const res = await fetch(`${backendUrl}/api/feedback/public-improvements`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch (err) {
      // try next candidate
    }
  }

  // Graceful fallback to empty showcase if backend is unreachable
  return NextResponse.json([])
}
