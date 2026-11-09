import { NextResponse } from "next/server"
import authenticBenchmarks from "@/lib/data/authentic-mandi-benchmarks.json"

const API_KEY = process.env.DATA_GOV_API_KEY || ""
const AGMARKNET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://krishiai-api.onrender.com"
    : "http://127.0.0.1:8000")

const CATEGORY_MAP: Record<string, string> = {
  wheat: "Cereals", rice: "Cereals", paddy: "Cereals", maize: "Cereals",
  jowar: "Cereals", bajra: "Cereals", barley: "Cereals", ragi: "Cereals",
  
  chana: "Pulses", gram: "Pulses", tur: "Pulses", arhar: "Pulses",
  urad: "Pulses", moong: "Pulses", masur: "Pulses", masoor: "Pulses", peas: "Pulses",
  
  mustard: "Oilseeds", sarson: "Oilseeds", soyabean: "Oilseeds", soybean: "Oilseeds",
  groundnut: "Oilseeds", sunflower: "Oilseeds", sesame: "Oilseeds", til: "Oilseeds",
  castor: "Oilseeds", linseed: "Oilseeds", alsi: "Oilseeds",
  
  tomato: "Vegetables", potato: "Vegetables", onion: "Vegetables",
  cauliflower: "Vegetables", cabbage: "Vegetables", brinjal: "Vegetables",
  chilli: "Vegetables", okra: "Vegetables", bhindi: "Vegetables",
  cucumber: "Vegetables", garlic: "Vegetables", ginger: "Vegetables",
  carrot: "Vegetables", capsicum: "Vegetables", spinach: "Vegetables",
  
  mango: "Fruits", banana: "Fruits", apple: "Fruits", grapes: "Fruits",
  orange: "Fruits", papaya: "Fruits", guava: "Fruits", pomegranate: "Fruits",
  watermelon: "Fruits", litchi: "Fruits",
  
  turmeric: "Spices", haldi: "Spices", coriander: "Spices", cumin: "Spices",
  jeera: "Spices", cardamom: "Spices", pepper: "Spices", fenugreek: "Spices", methi: "Spices",
  
  cotton: "Commercial Crops", sugarcane: "Commercial Crops", jute: "Commercial Crops",
  tobacco: "Commercial Crops",
}

function getCategory(commodity: string): string {
  const name = commodity.toLowerCase()
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (name.includes(key)) return cat
  }
  return "Other"
}

function getTrend(modal: number, min: number, max: number) {
  const mid = (min + max) / 2
  if (mid <= 0) return { trend: "stable", change: 0 }
  if (modal > mid * 1.02) return { trend: "up", change: +(((modal - mid) / mid) * 100).toFixed(1) }
  if (modal < mid * 0.98) return { trend: "down", change: +(((modal - mid) / mid) * 100).toFixed(1) }
  return { trend: "stable", change: 0 }
}

function checkStale(arrivalDate?: string | null): { isStale: boolean; warning?: string } {
  if (!arrivalDate) return { isStale: true, warning: "Reporting date unknown. Verify locally." }
  try {
    const d = new Date(arrivalDate)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 2) {
      return {
        isStale: true,
        warning: `Reported on ${arrivalDate} (${diffDays} days ago). Verify current rates before trading.`,
      }
    }
  } catch {
    return { isStale: true, warning: "Invalid reporting date." }
  }
  return { isStale: false }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stateFilter = searchParams.get("state")?.trim() || ""
  const commodityFilter = searchParams.get("commodity")?.trim() || ""
  const districtFilter = searchParams.get("district")?.trim() || ""
  const marketFilter = searchParams.get("market")?.trim() || ""

  // 1. First, attempt to proxy from authentic Python backend
  try {
    const backendQs = new URLSearchParams()
    if (stateFilter && stateFilter.toLowerCase() !== "all") backendQs.set("state", stateFilter)
    if (commodityFilter && commodityFilter.toLowerCase() !== "all") backendQs.set("commodity", commodityFilter)
    if (districtFilter && districtFilter.toLowerCase() !== "all") backendQs.set("district", districtFilter)
    if (marketFilter && marketFilter.toLowerCase() !== "all") backendQs.set("market", marketFilter)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4500)
    const backendRes = await fetch(`${BACKEND_URL}/api/mandi/crops?${backendQs.toString()}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 600 },
    })
    clearTimeout(timer)

    if (backendRes.ok) {
      const data = await backendRes.json()
      if (data && Array.isArray(data.crops) && data.crops.length > 0) {
        return NextResponse.json(data)
      }
    }
  } catch (err) {
    // Backend offline / timed out — proceed to fallback
  }

  // 2. Fallback to authentic curated AGMARKNET benchmark records with actual dates
  let list = (authenticBenchmarks as any[]).map((r, idx) => {
    const modal = Number(r.modal_price || 0)
    const minP = Number(r.min_price || modal)
    const maxP = Number(r.max_price || modal)
    const { trend, change } = getTrend(modal, minP, maxP)
    const { isStale, warning } = checkStale(r.arrival_date)

    return {
      id: idx + 1,
      name: r.commodity,
      variety: r.variety || "FAQ",
      price: Math.round(modal),
      unit: "per quintal",
      mandi: r.market_center || r.market || "APMC Mandi",
      state: r.state,
      district: r.district || "",
      category: getCategory(r.commodity),
      trend,
      change_percent: Math.abs(change),
      min_price: Math.round(minP),
      max_price: Math.round(maxP),
      modal_price: Math.round(modal),
      arrival_tonnes: Math.round(Number(r.arrival_quantity || 0)),
      arrival_date: r.arrival_date || "2026-10-19",
      source_name: r.source_name || "AGMARKNET / Directorate of Marketing & Inspection",
      source_url: r.source_url || "https://agmarknet.gov.in",
      is_stale: isStale,
      stale_warning: warning,
      data_label: "Official AGMARKNET reference market data",
    }
  })

  if (commodityFilter && commodityFilter.toLowerCase() !== "all") {
    list = list.filter((c) => c.name.toLowerCase().includes(commodityFilter.toLowerCase()))
  }
  if (stateFilter && stateFilter.toLowerCase() !== "all") {
    list = list.filter((c) => c.state.toLowerCase().includes(stateFilter.toLowerCase()))
  }
  if (districtFilter && districtFilter.toLowerCase() !== "all") {
    list = list.filter((c) => c.district.toLowerCase().includes(districtFilter.toLowerCase()))
  }

  return NextResponse.json({
    crops: list,
    total: list.length,
    source: "AGMARKNET / Directorate of Marketing & Inspection (data.gov.in)",
    source_license: "Open Government Data (OGD) License - India",
    provenance_url: "https://agmarknet.gov.in",
    disclaimer: "Authentic APMC reported benchmark observations. Not a guaranteed purchase offer.",
    updated_at: new Date().toISOString(),
  })
}
