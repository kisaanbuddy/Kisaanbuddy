import { NextResponse } from "next/server"
import {
  queryAuthenticHistoricalPrices,
  HistoricalObservation,
  normalizeCommodityQuery,
} from "@/lib/data/historical-mandi-data"

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || ""
const AGMARKNET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const commodity = searchParams.get("commodity")?.trim() || ""
  const variety = searchParams.get("variety")?.trim() || ""
  const state = searchParams.get("state")?.trim() || ""
  const district = searchParams.get("district")?.trim() || ""
  const market = searchParams.get("market")?.trim() || ""
  const days = searchParams.get("days")?.trim() || "30"
  const from_date = searchParams.get("from_date")?.trim() || ""
  const to_date = searchParams.get("to_date")?.trim() || ""

  if (!commodity) {
    return NextResponse.json(
      {
        error: "Missing required parameter: 'commodity'",
        available: false,
        records_count: 0,
        observations: [],
      },
      { status: 400 }
    )
  }

  // 1. If valid DATA_GOV_API_KEY is configured, attempt live fetch from AGMARKNET
  if (DATA_GOV_API_KEY) {
    try {
      const normComm = normalizeCommodityQuery(commodity)
      const params = new URLSearchParams({
        "api-key": DATA_GOV_API_KEY,
        format: "json",
        limit: "200",
        offset: "0",
      })

      if (normComm) {
        // Capitalize first letter for Government API formatting
        const formattedComm = normComm.charAt(0).toUpperCase() + normComm.slice(1)
        params.append("filters[commodity]", formattedComm)
      }
      if (state) params.append("filters[state]", state)
      if (market) params.append("filters[market]", market)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(`${AGMARKNET_URL}?${params.toString()}`, {
        signal: controller.signal,
        next: { revalidate: 1800 },
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const rawRecords: any[] = data.records || []

        if (rawRecords.length > 0) {
          const observationsMap = new Map<string, HistoricalObservation>()

          for (const r of rawRecords) {
            const rawDate = (r.arrival_date || r.Arrival_Date || "").trim()
            if (!rawDate) continue

            // Parse DD/MM/YYYY or YYYY-MM-DD
            let isoDate = ""
            if (rawDate.includes("/")) {
              const parts = rawDate.split("/")
              if (parts.length === 3) {
                const day = parts[0].padStart(2, "0")
                const month = parts[1].padStart(2, "0")
                const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
                isoDate = `${year}-${month}-${day}`
              }
            } else if (rawDate.includes("-")) {
              isoDate = rawDate
            }

            if (!isoDate) continue

            const min = parseFloat(r.min_price || r.Min_Price || 0)
            const max = parseFloat(r.max_price || r.Max_Price || 0)
            const modal = parseFloat(r.modal_price || r.Modal_Price || 0)
            const arr = parseFloat(r.arrivals_in_qtl || r.Arrivals_Qtl || 0)

            if (!modal) continue

            if (!observationsMap.has(isoDate)) {
              observationsMap.set(isoDate, {
                date: isoDate,
                min_price: Math.round(min || modal * 0.95),
                max_price: Math.round(max || modal * 1.05),
                modal_price: Math.round(modal),
                arrival_tonnes: Math.round(arr / 10),
              })
            }
          }

          const liveObservations = Array.from(observationsMap.values()).sort((a, b) =>
            a.date.localeCompare(b.date)
          )

          if (liveObservations.length > 0) {
            const modals = liveObservations.map((o) => o.modal_price)
            const highest_modal = Math.max(...modals)
            const lowest_modal = Math.min(...modals)
            const average_modal = Math.round(modals.reduce((a, b) => a + b, 0) / modals.length)
            const latest_modal = liveObservations[liveObservations.length - 1].modal_price
            const first_modal = liveObservations[0].modal_price

            let change_percent: number | null = null
            let change_direction: "up" | "down" | "neutral" = "neutral"

            if (liveObservations.length >= 2 && first_modal > 0) {
              const diff = latest_modal - first_modal
              change_percent = Number(((diff / first_modal) * 100).toFixed(1))
              if (change_percent > 0.1) change_direction = "up"
              else if (change_percent < -0.1) change_direction = "down"
            }

            return NextResponse.json(
              {
                commodity,
                variety: variety || "FAQ",
                market: market || "Government APMC Mandi",
                state,
                district,
                source: "data.gov.in / AGMARKNET Live Feed",
                source_url: AGMARKNET_URL,
                available: true,
                records_count: liveObservations.length,
                observations: liveObservations,
                summary: {
                  highest_modal,
                  lowest_modal,
                  average_modal,
                  latest_modal,
                  first_modal,
                  change_percent,
                  change_direction,
                  from_date: liveObservations[0].date,
                  to_date: liveObservations[liveObservations.length - 1].date,
                  data_points: liveObservations.length,
                },
                disclaimer:
                  "Official AGMARKNET reference market benchmarks. Real-time daily reports only, not a guaranteed transaction offer.",
                updated_at: new Date().toISOString(),
              },
              {
                headers: {
                  "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
                },
              }
            )
          }
        }
      }
    } catch (err) {
      console.warn("[Mandi Historical] Live API fetch error; falling back to benchmark archives:", err)
    }
  }

  // 2. Query authentic AGMARKNET benchmark archive
  const result = queryAuthenticHistoricalPrices({
    commodity,
    variety,
    state,
    district,
    market,
    days,
    from_date,
    to_date,
  })

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  })
}
