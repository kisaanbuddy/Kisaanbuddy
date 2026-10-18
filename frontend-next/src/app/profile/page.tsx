import type { Metadata } from "next";
import { Suspense } from "react";
import { FarmerProfileClient } from "@/app/farmer-profile/FarmerProfileClient";

export const metadata: Metadata = {
  title: "My Farm & Farmer Profile | KisaanBuddy",
  description:
    "Manage your farm acreage, crop varieties, plots, soil health test cards, and context-aware AI recommendations.",
};

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <FarmerProfileClient />
    </Suspense>
  );
}
