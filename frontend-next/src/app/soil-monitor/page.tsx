import type { Metadata } from "next"
import SoilMonitorClient from "./SoilMonitorClient"

export const metadata: Metadata = {
  title: "Smart Soil Monitor | KisaanBuddy",
  description: "Live, verified readings from your connected KisaanBuddy soil sensor.",
}

export default function SoilMonitorPage() {
  return <SoilMonitorClient />
}
