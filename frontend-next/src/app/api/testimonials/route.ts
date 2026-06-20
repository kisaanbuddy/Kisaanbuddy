import { NextResponse } from "next/server"
import { localTestimonialsCache } from "./store"

export async function GET(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get("status")
  const searchParam = searchParams.get("search")

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const authHeader = request.headers.get("Authorization")
  if (authHeader) {
    headers["Authorization"] = authHeader
  }

  try {
    const query = new URLSearchParams()
    if (statusParam) query.append("status", statusParam)
    if (searchParam) query.append("search", searchParam)

    const res = await fetch(`${backendUrl}/api/testimonials?${query}`, {
      method: "GET",
      headers,
      next: { revalidate: 0 }
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch (err) {
    console.error("Backend testimonials fetch failed, serving local fallback", err)
  }

  // Fallback filtering logic
  let filtered = [...localTestimonialsCache]
  
  // Enforce role-based access locally:
  // If no auth token is passed, we filter to approved only (public access)
  const isLocalStorageAdmin = authHeader?.startsWith("Bearer ")
  
  if (!isLocalStorageAdmin) {
    filtered = filtered.filter(item => item.status === "approved")
  } else if (statusParam) {
    filtered = filtered.filter(item => item.status === statusParam)
  }

  if (searchParam) {
    const q = searchParam.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.crop.toLowerCase().includes(q) ||
      item.text.toLowerCase().includes(q)
    )
  }

  filtered.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
  return NextResponse.json(filtered)
}

export async function POST(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  let body: any
  
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ detail: "Invalid JSON payload" }, { status: 400 })
  }

  if (!body.name?.trim() || !body.location?.trim() || !body.crop?.trim() || !body.text?.trim()) {
    return NextResponse.json({ detail: "All fields are required" }, { status: 400 })
  }

  try {
    const res = await fetch(`${backendUrl}/api/testimonials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data, { status: 201 })
    }
  } catch (err) {
    console.error("Backend testimonial submission failed, activating local session fallback", err)
  }

  // Fallback save locally
  const now = new Date().toISOString()
  const simulated = {
    id: `fallback-${Math.random().toString(36).substr(2, 9)}`,
    name: body.name.trim(),
    location: body.location.trim(),
    crop: body.crop.trim(),
    text: body.text.trim(),
    stars: Number(body.stars) || 5,
    status: "pending",
    created_at: now,
    updated_at: now
  }
  
  localTestimonialsCache.unshift(simulated)
  return NextResponse.json(simulated, { status: 201 })
}
