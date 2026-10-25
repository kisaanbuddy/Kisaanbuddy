import { NextResponse } from "next/server"

export async function GET() {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")

  try {
    const res = await fetch(`${backendUrl}/api/feedback/public-improvements`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
    return NextResponse.json([])
  } catch (err) {
    console.error("Failed to fetch public improvements:", err)
    return NextResponse.json([])
  }
}
