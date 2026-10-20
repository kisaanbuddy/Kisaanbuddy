"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Phone, Mail, Globe, MapPin, Building2, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";
import { AUTHENTIC_EXPERTS, AgriculturalExpert } from "@/lib/disease-advisory-store";

interface KVKDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultState?: string;
  language?: string;
}

const INDIAN_STATES = [
  "All",
  "Haryana",
  "Punjab",
  "Madhya Pradesh",
  "Maharashtra",
  "Karnataka",
  "Uttar Pradesh",
  "Tamil Nadu",
  "Rajasthan",
  "Gujarat",
  "Andhra Pradesh",
  "Bihar",
  "West Bengal",
];

export function KVKDirectoryModal({
  isOpen,
  onClose,
  defaultState,
  language = "en",
}: KVKDirectoryModalProps) {
  const isHi = language === "hi";
  const [selectedState, setSelectedState] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [experts, setExperts] = useState<AgriculturalExpert[]>(AUTHENTIC_EXPERTS);

  useEffect(() => {
    if (defaultState && defaultState !== "All") {
      const match = INDIAN_STATES.find((s) => s.toLowerCase() === defaultState.toLowerCase());
      if (match) setSelectedState(match);
    }
  }, [defaultState]);

  if (!isOpen) return null;

  const filtered = experts.filter((e) => {
    const matchState = selectedState === "All" || e.state.toLowerCase() === selectedState.toLowerCase() || e.id === 8;
    const matchSearch =
      searchQuery === "" ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.institution_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchState && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Building2 className="h-3 w-3" />
              {isHi ? "प्रमाणित सरकारी नेटवर्क" : "Official ICAR / SAU Network"}
            </div>
            <h3 className="text-lg font-bold font-display text-foreground">
              {isHi ? "निकटतम कृषि विज्ञान केंद्र (KVK) व विशेषज्ञ निर्देशिका" : "Nearby Krishi Vigyan Kendras (KVK) Directory"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* National Kisan Call Centre Banner */}
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              {isHi ? "राष्ट्रीय टोल-फ्री किसान हेल्पलाइन" : "National Toll-Free Farmer Helpdesk"}
            </span>
            <h4 className="text-sm font-bold text-foreground">
              {isHi ? "किसान कॉल सेंटर (Kisan Call Centre)" : "Kisan Call Centre (24x7 / All Indian Languages)"}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isHi ? "कृषि मंत्रालय द्वारा संचालित - सुबह 6 से रात 10 बजे तक" : "Ministry of Agriculture & Farmers Welfare, Govt of India"}
            </p>
          </div>
          <a
            href="tel:18001801551"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>1800-180-1551</span>
          </a>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? "जिला, फसल या वैज्ञानिक खोजें..." : "Search district, crop, or scientist..."}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st === "All" ? (isHi ? "सभी राज्य (All States)" : "All States") : st}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              {isHi ? "कोई केंद्र नहीं मिला। कृपया दूसरा राज्य चुनें।" : "No KVK center found matching this query."}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:border-emerald-500/40 transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-foreground">{item.name}</h4>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.institution_type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.designation} · {item.institution_name}</p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    <span className="font-semibold text-foreground">{item.district}, {item.state}</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  <p><strong>{isHi ? "विशेषज्ञता: " : "Specialization: "}</strong>{item.specialization}</p>
                  {item.crops_supported && (
                    <p><strong>{isHi ? "फसलें: " : "Crops: "}</strong>{item.crops_supported}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/30 text-[11px]">
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${item.official_phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{item.official_phone}</span>
                    </a>
                    {item.official_email && (
                      <a
                        href={`mailto:${item.official_email}`}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <Mail className="h-3 w-3" />
                        <span>{item.official_email}</span>
                      </a>
                    )}
                  </div>

                  {item.official_website && (
                    <a
                      href={item.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      <Globe className="h-2.5 w-2.5" />
                      <span>{isHi ? "वेबसाइट" : "Official Website"}</span>
                      <ExternalLink className="h-2 w-2" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
