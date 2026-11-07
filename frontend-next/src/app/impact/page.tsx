import type { Metadata } from "next"
import ImpactClient from "./ImpactClient"

export const metadata: Metadata = {
  title: "Impact & Investor Dashboard | KisaanBuddy",
  description: "Explore the growth metrics, agritech roadmap, and agricultural impact of KisaanBuddy V2, serving over 100,000+ farmers across India.",
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/impact',
  },
  openGraph: {
    title: "Impact & Investor Dashboard | KisaanBuddy",
    description: "Explore the growth metrics, agritech roadmap, and agricultural impact of KisaanBuddy V2, serving over 100,000+ farmers across India.",
    url: 'https://www.kisaanbuddy.com/impact',
    type: "website",
  },
}

export default function ImpactPage() {
  return <ImpactClient />
}
