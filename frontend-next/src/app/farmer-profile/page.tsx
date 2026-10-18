import type { Metadata } from "next";
import { Suspense } from "react";
import { FarmerProfileClient } from "./FarmerProfileClient";

export const metadata: Metadata = {
  title: "Farmer Profile & Agricultural History | KisaanBuddy",
  description:
    "Permanent digital farmer profile with land holdings, crop varieties, soil health test records, and context-aware AI recommendations.",
};

export default function FarmerProfilePage() {
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
