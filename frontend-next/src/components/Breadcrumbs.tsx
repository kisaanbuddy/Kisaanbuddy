"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language";

const labels: Record<string, string> = {
  dashboard: "dashboard", weather: "weather", "crop-predictor": "aiPredictor",
  disease: "diseaseDetect", "soil-health": "soilHealth", schemes: "schemes",
  mandi: "mandi", "worker-connect": "agrilabour", chatbot: "aiChatbot",
  "khet-diary": "khetDiary", about: "aboutUs", founders: "founders",
  contact: "contactUs", privacy: "privacyPolicy", terms: "termsConditions",
  disclaimer: "disclaimerLabel", "cookie-policy": "cookiePolicy", impact: "impact",
};

const hiddenRoutes = new Set(["/", "/login", "/signup", "/forgot-password", "/reset-password", "/marketplace"]);

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useLanguage();
  if (hiddenRoutes.has(pathname) || pathname?.startsWith("/marketplace")) return null;

  const segments = pathname.split("/").filter(Boolean);
  const format = (segment: string) => {
    const translated = labels[segment] ? t(labels[segment]) : "";
    return translated && translated !== labels[segment]
      ? translated
      : segment.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <Link href="/" className="inline-flex items-center gap-1 font-medium hover:text-primary">
        <Home className="h-3.5 w-3.5" /><span className="hidden sm:inline">Home</span>
      </Link>
      {segments.map((segment, index) => {
        const last = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        return <React.Fragment key={href}>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {last ? <span aria-current="page" className="max-w-[13rem] truncate font-medium text-foreground">{format(segment)}</span> : <Link href={href} className="font-medium hover:text-primary">{format(segment)}</Link>}
        </React.Fragment>;
      })}
    </nav>
  );
}
