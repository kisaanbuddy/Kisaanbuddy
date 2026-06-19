import type { Metadata } from "next"
import ImpactClient from "./ImpactClient"

export const metadata: Metadata = {
  title: "Impact & Investor Dashboard | KisaanBuddy",
  description: "Explore the growth metrics, agritech roadmap, and agricultural impact of KisaanBuddy V2, serving over 100,000+ farmers across India.",
  alternates: {
    canonical: "/impact",
  },
  openGraph: {
    title: "Impact & Investor Dashboard | KisaanBuddy",
    description: "Explore the growth metrics, agritech roadmap, and agricultural impact of KisaanBuddy V2, serving over 100,000+ farmers across India.",
    url: "/impact",
    type: "website",
  },
}

export default function ImpactPage() {
  return <ImpactClient />
}
