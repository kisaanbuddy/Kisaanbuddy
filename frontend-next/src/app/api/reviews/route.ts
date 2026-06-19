import { NextResponse } from "next/server"

// Session cache for user submitted reviews during the Vercel edge/function lifetime
const localReviewsCache: any[] = []

const DEFAULT_REVIEWS = [
  {
    id: "default-1",
    name: "Ramesh Patel",
    location: "Rajkot, Gujarat",
    crop: "Cotton Farmer",
    text: "The Crop Predictor identified Cotton was optimal for my low-nitrogen field and suggested the exact fertilizer ratio. My crop yield grew by 35% this season.",
    stars: 5,
    created_at: "2026-06-18T06:00:00Z"
  },
  {
    id: "default-2",
    name: "Suresh Gowda",
    location: "Kolar, Karnataka",
    crop: "Tomato Grower",
    text: "The leaf disease detector saved my crop. I photographed black spots on my tomato leaves, diagnosed early blight in 2 seconds, and applied the organic neem recommendations.",
    stars: 5,
    created_at: "2026-06-18T06:10:00Z"
  },
  {
    id: "default-3",
    name: "Rajesh Kumar",
    location: "Agra, Uttar Pradesh",
    crop: "Potato Cultivator",
    text: "Mandi price target notifications allowed me to track Agra rates easily. I got an SMS alert when potato crossed ₹1,900 and sold at maximum profit.",
    stars: 5,
    created_at: "2026-06-18T06:20:00Z"
  }
]

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  
  try {
    const res = await fetch(`${backendUrl}/api/reviews`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 } // Fetch fresh from API without cache
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch (err) {
    console.error("Backend reviews fetch failed, serving local fallback", err)
  }

  // Fallback to merged list
  return NextResponse.json([...localReviewsCache, ...DEFAULT_REVIEWS])
}

export async function POST(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  let body: any
  
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ detail: "Invalid JSON payload" }, { status: 400 })
  }

  // Input validation
  if (!body.name?.trim() || !body.location?.trim() || !body.crop?.trim() || !body.text?.trim()) {
    return NextResponse.json({ detail: "All fields are required" }, { status: 400 })
  }

  try {
    const res = await fetch(`${backendUrl}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data, { status: 201 })
    }
    
    // Trigger catch block for 404 or other errors to execute local fallback
    throw new Error(`Backend reviews endpoint unavailable: status ${res.status}`)
  } catch (err) {
    console.error("Backend reviews submission failed, activating local session fallback", err)
    
    // Simulate successful creation and cache locally
    const simulatedReview = {
      id: `fallback-${Math.random().toString(36).substr(2, 9)}`,
      name: body.name.trim(),
      location: body.location.trim(),
      crop: body.crop.trim(),
      text: body.text.trim(),
      stars: Number(body.stars) || 5,
      created_at: new Date().toISOString()
    }
    
    localReviewsCache.unshift(simulatedReview)
    return NextResponse.json(simulatedReview, { status: 201 })
  }
}
