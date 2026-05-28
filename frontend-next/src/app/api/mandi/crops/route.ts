import { NextResponse } from "next/server"

const API_KEY = process.env.DATA_GOV_API_KEY || ""
const AGMARKNET_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

const CATEGORY_MAP: Record<string, string> = {
  wheat: "Cereal", rice: "Cereal", paddy: "Cereal", maize: "Cereal",
  jowar: "Cereal", bajra: "Cereal", barley: "Cereal",
  soyabean: "Oilseed", mustard: "Oilseed", groundnut: "Oilseed",
  sunflower: "Oilseed", sesame: "Oilseed",
  chana: "Pulse", gram: "Pulse", tur: "Pulse", arhar: "Pulse",
  urad: "Pulse", moong: "Pulse", masur: "Pulse",
  cotton: "Fiber", jute: "Fiber",
  onion: "Vegetable", potato: "Vegetable", tomato: "Vegetable",
  cabbage: "Vegetable", cauliflower: "Vegetable", brinjal: "Vegetable",
  sugarcane: "Cash Crop", tobacco: "Cash Crop", ginger: "Cash Crop",
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
  if (modal > mid * 1.02) return { trend: "up", change: +((modal - mid) / mid * 100).toFixed(1) }
  if (modal < mid * 0.98) return { trend: "down", change: +((modal - mid) / mid * 100).toFixed(1) }
  return { trend: "stable", change: 0 }
}

const MOCK_CROPS = [
  { id:1, name:"Wheat (गेहूं)", variety:"Sharbati", price:2275, unit:"per quintal", mandi:"Indore Mandi", state:"Madhya Pradesh", category:"Cereal", trend:"up", change_percent:2.3, min_price:2100, max_price:2400, modal_price:2275, arrival_tonnes:12500 },
  { id:2, name:"Rice (चावल)", variety:"Basmati 1121", price:3850, unit:"per quintal", mandi:"Karnal Mandi", state:"Haryana", category:"Cereal", trend:"up", change_percent:1.8, min_price:3600, max_price:4100, modal_price:3850, arrival_tonnes:8200 },
  { id:3, name:"Soybean (सोयाबीन)", variety:"Yellow", price:4600, unit:"per quintal", mandi:"Ujjain Mandi", state:"Madhya Pradesh", category:"Oilseed", trend:"down", change_percent:1.2, min_price:4400, max_price:4800, modal_price:4600, arrival_tonnes:5600 },
  { id:4, name:"Cotton (कपास)", variety:"Medium Staple", price:6800, unit:"per quintal", mandi:"Rajkot Mandi", state:"Gujarat", category:"Fiber", trend:"up", change_percent:3.1, min_price:6500, max_price:7200, modal_price:6800, arrival_tonnes:3200 },
  { id:5, name:"Mustard (सरसों)", variety:"Laha", price:5200, unit:"per quintal", mandi:"Alwar Mandi", state:"Rajasthan", category:"Oilseed", trend:"stable", change_percent:0.1, min_price:5000, max_price:5400, modal_price:5200, arrival_tonnes:4100 },
  { id:6, name:"Chana (चना)", variety:"Desi", price:5100, unit:"per quintal", mandi:"Latur Mandi", state:"Maharashtra", category:"Pulse", trend:"down", change_percent:0.8, min_price:4900, max_price:5300, modal_price:5100, arrival_tonnes:6800 },
  { id:7, name:"Tur/Arhar Dal (तूर दाल)", variety:"FAQ", price:7200, unit:"per quintal", mandi:"Gulbarga Mandi", state:"Karnataka", category:"Pulse", trend:"up", change_percent:4.5, min_price:6800, max_price:7600, modal_price:7200, arrival_tonnes:2800 },
  { id:8, name:"Onion (प्याज)", variety:"Nasik Red", price:1800, unit:"per quintal", mandi:"Nashik Mandi", state:"Maharashtra", category:"Vegetable", trend:"up", change_percent:8.2, min_price:1500, max_price:2200, modal_price:1800, arrival_tonnes:15000 },
  { id:9, name:"Potato (आलू)", variety:"Jyoti", price:1200, unit:"per quintal", mandi:"Agra Mandi", state:"Uttar Pradesh", category:"Vegetable", trend:"stable", change_percent:0.3, min_price:1000, max_price:1400, modal_price:1200, arrival_tonnes:18000 },
  { id:10, name:"Sugarcane (गन्ना)", variety:"Co-0238", price:350, unit:"per quintal", mandi:"Muzaffarnagar Mandi", state:"Uttar Pradesh", category:"Cash Crop", trend:"stable", change_percent:0.0, min_price:340, max_price:365, modal_price:350, arrival_tonnes:45000 },
  { id:11, name:"Maize (मक्का)", variety:"Yellow", price:2050, unit:"per quintal", mandi:"Davangere Mandi", state:"Karnataka", category:"Cereal", trend:"down", change_percent:1.5, min_price:1900, max_price:2200, modal_price:2050, arrival_tonnes:7200 },
  { id:12, name:"Groundnut (मूंगफली)", variety:"Bold", price:5800, unit:"per quintal", mandi:"Junagadh Mandi", state:"Gujarat", category:"Oilseed", trend:"up", change_percent:2.0, min_price:5500, max_price:6100, modal_price:5800, arrival_tonnes:3400 },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stateFilter = searchParams.get("state") || ""
  const commodityFilter = searchParams.get("commodity") || ""

  // Try live AGMARKNET data if API key is set
  if (API_KEY) {
    try {
      const params = new URLSearchParams({
        "api-key": API_KEY,
        format: "json",
        limit: "200",
        offset: "0",
      })
      const res = await fetch(`${AGMARKNET_URL}?${params}`, {
        next: { revalidate: 3600 }, // cache for 1 hour
      })

      if (res.ok) {
        const data = await res.json()
        const records: any[] = data.records || []

        if (records.length > 0) {
          const seen = new Set<string>()
          const crops: any[] = []
          let id = 1

          for (const r of records) {
            const commodity = (r.commodity || r.Commodity || "").trim()
            const variety   = (r.variety   || r.Variety   || "FAQ").trim()
            const mandi     = (r.market    || r.Market    || r.apmc || "").trim()
            const state     = (r.state     || r.State     || "").trim()
            const min       = parseFloat(r.min_price   || r.Min_Price   || 0)
            const max       = parseFloat(r.max_price   || r.Max_Price   || 0)
            const modal     = parseFloat(r.modal_price || r.Modal_Price || 0)
            const arrival   = parseFloat(r.arrivals_in_qtl || r.Arrivals_Qtl || 0)

            if (!modal || !mandi || !state || !commodity) continue
            const key = `${commodity}_${mandi}`
            if (seen.has(key)) continue
            seen.add(key)

            const { trend, change } = getTrend(modal, min || modal * 0.95, max || modal * 1.05)

            crops.push({
              id: id++,
              name: commodity,
              variety: variety || "FAQ",
              price: Math.round(modal),
              unit: "per quintal",
              mandi,
              state,
              category: getCategory(commodity),
              trend,
              change_percent: Math.abs(Number(change)),
              min_price: Math.round(min || modal * 0.95),
              max_price: Math.round(max || modal * 1.05),
              modal_price: Math.round(modal),
              arrival_tonnes: Math.round(arrival / 10),
            })

            if (id > 50) break
          }

          if (crops.length > 0) {
            let filtered = crops
            if (stateFilter) filtered = filtered.filter(c => c.state.toLowerCase().includes(stateFilter.toLowerCase()))
            if (commodityFilter) filtered = filtered.filter(c => c.name.toLowerCase().includes(commodityFilter.toLowerCase()))
            return NextResponse.json({ crops: filtered, total: filtered.length, source: "live", updated_at: new Date().toISOString() })
          }
        }
      }
    } catch (e) {
      console.error("[AGMARKNET] fetch error:", e)
    }
  }

  // Fallback to mock data
  let filtered = MOCK_CROPS
  if (stateFilter) filtered = filtered.filter(c => c.state.toLowerCase().includes(stateFilter.toLowerCase()))
  if (commodityFilter) filtered = filtered.filter(c => c.name.toLowerCase().includes(commodityFilter.toLowerCase()))

  return NextResponse.json({
    crops: filtered,
    total: filtered.length,
    source: "mock",
    updated_at: new Date().toISOString(),
    note: API_KEY ? "AGMARKNET fetch failed, using mock" : "Set DATA_GOV_API_KEY env var for live data",
  })
}
