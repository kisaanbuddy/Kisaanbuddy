"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileAppHeader } from "@/components/mobile/MobileAppHeader";
import { CompactInternalHeader } from "./CompactInternalHeader";
import { isHomeRoute, isMarketplaceRoute } from "./route-utils";

/**
 * Route-aware global navigation coordinator for KisaanBuddy.
 *
 * Rules:
 * 1. Home route ('/') → Full Global Navbar (Desktop: <Header />, Mobile: <MobileAppHeader />).
 * 2. Machinery Marketplace ('/marketplace/*') → Suppressed here (Marketplace renders its
 *    own specialized equipment search & category navigation).
 * 3. All other internal routes → Compact contextual header system following the
 *    visual reference of the Marketplace header.
 */
export function AppNavigationShell() {
  const pathname = usePathname();

  const isHome = isHomeRoute(pathname);
  const isMarketplace = isMarketplaceRoute(pathname);

  // 1. Home Route: Display full primary navigation
  if (isHome) {
    return (
      <>
        <div className="global-header-desktop hidden md:block">
          <Header />
        </div>
        <div className="global-header-mobile block md:hidden">
          <MobileAppHeader />
        </div>
      </>
    );
  }

  // 2. Marketplace: Dedicated equipment search & actions rendered by page
  if (isMarketplace) {
    return null;
  }

  // 3. All other internal pages: Clean, compact, module-specific contextual header
  return <CompactInternalHeader />;
}
