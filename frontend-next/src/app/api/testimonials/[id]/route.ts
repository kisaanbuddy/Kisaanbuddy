import { NextResponse } from "next/server"
import { localTestimonialsCache } from "../store"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  const { id } = params
  
  let body: any
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ detail: "Invalid JSON payload" }, { status: 400 })
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const authHeader = request.headers.get("Authorization")
  if (authHeader) {
    headers["Authorization"] = authHeader
  }

  try {
    const res = await fetch(`${backendUrl}/api/testimonials/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body)
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch (err) {
    console.error("Backend PUT testimonial failed, running local fallback", err)
  }

  // Local fallback updates
  const index = localTestimonialsCache.findIndex(item => item.id === id)
  if (index !== -1) {
    const existing = localTestimonialsCache[index]
    const updated = {
      ...existing,
      ...body,
      updated_at: new Date().toISOString()
    }
    localTestimonialsCache[index] = updated
    return NextResponse.json(updated)
  }

  return NextResponse.json({ detail: "Testimonial not found in local cache" }, { status: 404 })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  const { id } = params

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const authHeader = request.headers.get("Authorization")
  if (authHeader) {
    headers["Authorization"] = authHeader
  }

  try {
    const res = await fetch(`${backendUrl}/api/testimonials/${id}`, {
      method: "DELETE",
      headers
    })

    if (res.status === 204 || res.ok) {
      return new Response(null, { status: 204 })
    }
  } catch (err) {
    console.error("Backend DELETE testimonial failed, running local fallback", err)
  }

  // Local fallback deletion
  const index = localTestimonialsCache.findIndex(item => item.id === id)
  if (index !== -1) {
    localTestimonialsCache.splice(index, 1)
    return new Response(null, { status: 204 })
  }

  return NextResponse.json({ detail: "Testimonial not found in local cache" }, { status: 404 })
}
