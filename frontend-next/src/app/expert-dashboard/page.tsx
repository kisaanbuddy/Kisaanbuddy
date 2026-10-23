import { Metadata } from "next";
import { ExpertDashboardClient } from "./ExpertDashboardClient";

export const metadata: Metadata = {
  title: "Agricultural Expert & KVK Advisory Portal | KisaanBuddy",
  description: "Secure human expert diagnostic review portal for participating agronomists, plant pathologists, and Krishi Vigyan Kendra scientists across India.",
};

export default function ExpertDashboardPage() {
  return <ExpertDashboardClient />;
}
