"use client";

import React, { useState } from "react";
import { ShieldCheck, Leaf, Sprout, AlertCircle, ExternalLink, Calendar, Building2 } from "lucide-react";

interface IDMTreatmentTabsProps {
  cultural?: string;
  biological?: string;
  chemical?: string;
  dosage?: string;
  phiDays?: number;
  safety?: string;
  sourceInstitution?: string;
  sourceUrl?: string;
  lastVerifiedDate?: string;
  language?: string;
}

export function IDMTreatmentTabs({
  cultural,
  biological,
  chemical,
  dosage,
  phiDays,
  safety,
  sourceInstitution,
  sourceUrl,
  lastVerifiedDate,
  language = "en",
}: IDMTreatmentTabsProps) {
  const [activeTab, setActiveTab] = useState<"cultural" | "biological" | "chemical">("cultural");
  const isHi = language === "hi";

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3.5">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isHi ? "प्रमाणित एकीकृत रोग प्रबंधन (IDM)" : "Verified Integrated Disease Management (IDM)"}</span>
        </div>
        {lastVerifiedDate && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Calendar className="h-3 w-3" />
            <span>Verified: {lastVerifiedDate}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-lg text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("cultural")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all ${
            activeTab === "cultural"
              ? "bg-card text-foreground shadow-xs font-bold border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sprout className="h-3.5 w-3.5 text-emerald-600" />
          <span>{isHi ? "कृषि व रोकथाम" : "1. Cultural"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("biological")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all ${
            activeTab === "biological"
              ? "bg-card text-foreground shadow-xs font-bold border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Leaf className="h-3.5 w-3.5 text-teal-600" />
          <span>{isHi ? "जैविक उपचार" : "2. Bio / Organic"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chemical")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all ${
            activeTab === "chemical"
              ? "bg-card text-foreground shadow-xs font-bold border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
          <span>{isHi ? "रासायनिक (CIBRC)" : "3. Chemical (CIBRC)"}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="text-xs leading-relaxed text-foreground">
        {activeTab === "cultural" && (
          <div className="space-y-2 p-1">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              {isHi ? "फसल स्वच्छता और सांस्कृतिक प्रबंधन" : "Sanitation, Spacing & Cultural Prevention"}
            </p>
            <p className="text-muted-foreground">
              {cultural || (isHi ? "खेत में उचित जल निकासी बनाए रखें और संक्रमित पौधों के अवशेष तुरंत हटाएं।" : "Ensure proper drainage, crop rotation, and remove infected plant debris.")}
            </p>
          </div>
        )}

        {activeTab === "biological" && (
          <div className="space-y-2 p-1">
            <p className="font-semibold text-teal-800 dark:text-teal-300">
              {isHi ? "जैविक नियंत्रण और मित्र जीवाणु" : "Biological Control & Bio-Fungicides"}
            </p>
            <p className="text-muted-foreground">
              {biological || (isHi ? "ट्राइकोडर्मा विरिडी या नीम तेल 10,000 ppm (2-3 ml/लीटर) का छिड़काव करें।" : "Spray Trichoderma harzianum @ 5g/L or 5% Neem Seed Kernel Extract (NSKE).")}
            </p>
          </div>
        )}

        {activeTab === "chemical" && (
          <div className="space-y-2.5 p-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                {isHi ? "केंद्रीय कीटनाशी बोर्ड (CIBRC) पंजीकृत रसायन" : "Approved Formulations & Safe Dosages"}
              </p>
              {phiDays && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  PHI: {phiDays} Days Waiting Period
                </span>
              )}
            </div>

            <p className="text-muted-foreground">
              {chemical || (isHi ? "अनुशंसित कवकनाशी का सही मात्रा में उपयोग करें।" : "Apply registered fungicide according to label recommendations.")}
            </p>

            {dosage && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>{isHi ? "सटीक मात्रा (Dosage): " : "Exact Dosage: "}</strong>
                {dosage}
              </div>
            )}

            {safety && (
              <div className="flex gap-2 text-[10px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/40">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span><strong>{isHi ? "सुरक्षा निर्देश: " : "Safety Rules: "}</strong>{safety}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Source Citation */}
      {sourceInstitution && (
        <div className="pt-2 border-t border-border/30 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground/80">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-emerald-600" />
            <span>{isHi ? "स्रोत संस्थान: " : "Source Authority: "}<strong>{sourceInstitution}</strong></span>
          </div>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>{isHi ? "आधिकारिक पोर्टल" : "Official Reference"}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
