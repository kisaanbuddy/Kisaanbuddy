import type { Metadata } from "next"
import { Suspense } from "react"
import SatelliteClient from "./SatelliteClient"

export const metadata: Metadata = {
  title: "Satellite Farm Intelligence | KisaanBuddy",
  description: "Live Copernicus Sentinel-2 multispectral NDVI and Sentinel-1 SAR radar monitoring for your farmland.",
  alternates: {
    canonical: "/satellite",
  },
}

export default function SatellitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SatelliteClient />
    </Suspense>
  )
}
