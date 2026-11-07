import type { Metadata } from "next";
import { FeaturesClient } from "./FeaturesClient";

export const metadata: Metadata = {
  title: "Features — KisaanBuddy Agricultural Intelligence Platform",
  description:
    "Explore KisaanBuddy's full suite of agricultural tools: AI Farm Advisor, Crop Doctor, Mandi Prices, Weather Advisory, Soil Health, and Direct Marketplace.",
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/features',
  },
  openGraph: {
    title: "Features — KisaanBuddy Agricultural Intelligence Platform",
    description:
      "Explore KisaanBuddy's full suite of agricultural tools: AI Farm Advisor, Crop Doctor, Mandi Prices, Weather Advisory, Soil Health, and Direct Marketplace.",
    url: 'https://www.kisaanbuddy.com/features',
    type: 'website',
  },
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}

