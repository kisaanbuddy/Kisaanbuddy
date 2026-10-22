"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalBackdropVariants, modalDialogVariants } from "@/lib/motion";
import { X, Search, CheckCircle2, Clock, AlertTriangle, Shield, Building2, Calendar, FileText, Loader2 } from "lucide-react";
import { AdvisoryCase } from "@/lib/disease-advisory-store";

interface TrackCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCaseId?: string | null;
  language?: string;
}

export function TrackCaseModal({
  isOpen,
  onClose,
  initialCaseId,
  language = "en",
}: TrackCaseModalProps) {
  const isHi = language === "hi";
  const [caseIdInput, setCaseIdInput] = useState(initialCaseId || "");
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<AdvisoryCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentCases, setRecentCases] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("kisaanbuddy_recent_cases") || "[]");
      setRecentCases(stored);
      if (initialCaseId) {
        setCaseIdInput(initialCaseId);
        fetchCase(initialCaseId);
      } else if (stored.length > 0 && !caseData) {
        setCaseIdInput(stored[0]);
        fetchCase(stored[0]);
      }
    } catch {}
  }, [initialCaseId]);

  async function fetchCase(idToSearch: string) {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/disease/advisory/cases/${encodeURIComponent(idToSearch.trim())}`);
      if (!res.ok) {
        throw new Error(isHi ? "केस नहीं मिला। कृपया Case ID की जांच करें।" : "Case ID not found. Please verify the ID.");
      }
      const data = await res.json();
      setCaseData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load case status");
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCase(caseIdInput);
  }

  const steps = [
    { key: "sent", labelHi: "केस दर्ज", labelEn: "Submitted" },
    { key: "acknowledged", labelHi: "KVK को प्रेषित", labelEn: "Routed to KVK" },
    { key: "accepted", labelHi: "वैज्ञानिक समीक्षा", labelEn: "Under Review" },
    { key: "farmer_contacted", labelHi: "किसान से संपर्क", labelEn: "Contacted" },
    { key: "resolved", labelHi: "समाधान पूर्ण", labelEn: "Resolved" },
  ];

  function getStepIndex(status: string): number {
    switch (status) {
      case "pending":
      case "queued":
      case "sent":
        return 0;
      case "acknowledged":
        return 1;
      case "accepted":
        return 2;
      case "farmer_contacted":
        return 3;
      case "resolved":
        return 4;
      default:
        return 1;
    }
  }

  const currentStep = caseData ? getStepIndex(caseData.status) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <motion.div
            variants={modalDialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-lg font-bold font-display text-foreground">
            {isHi ? "कृषि परामर्श केस ट्रैक करें" : "Track Advisory Case Status"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isHi
              ? "अपनी केस आईडी दर्ज कर KVK वैज्ञानिक समीक्षा की ताज़ा स्थिति देखें।"
              : "Enter your Advisory Case ID to check review progress by assigned scientists."}
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex gap-2 text-xs">
          <input
            type="text"
            value={caseIdInput}
            onChange={(e) => setCaseIdInput(e.target.value)}
            placeholder="e.g. ADV-20261020-4102"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono uppercase focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            <span>{isHi ? "खोजें" : "Track"}</span>
          </button>
        </form>

        {/* Recent Cases Quick Pills */}
        {recentCases.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-muted-foreground">{isHi ? "हाल के केस: " : "Recent Cases: "}</span>
            {recentCases.slice(0, 3).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setCaseIdInput(id);
                  fetchCase(id);
                }}
                className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground font-mono text-[10px] border border-border/40 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        {caseData && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {caseData.case_id}
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  {caseData.crop_name} {caseData.crop_variety ? `(${caseData.crop_variety})` : ""}
                </h4>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                {caseData.status.replace("_", " ")}
              </span>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-1 py-1">
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground pb-1">
                {steps.map((st, i) => (
                  <span
                    key={st.key}
                    className={i <= currentStep ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}
                  >
                    {isHi ? st.labelHi : st.labelEn}
                  </span>
                ))}
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Details Box */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isHi ? "स्थान: " : "Location: "}</span>
                <span className="font-semibold text-foreground">
                  {caseData.village_or_tehsil ? `${caseData.village_or_tehsil}, ` : ""}{caseData.district}, {caseData.state}
                </span>
              </div>

              {caseData.assigned_expert && (
                <div className="flex justify-between border-t border-border/30 pt-1.5">
                  <span className="text-muted-foreground">{isHi ? "आवंटित वैज्ञानिक/KVK: " : "Assigned Centre: "}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 text-right">
                    {caseData.assigned_expert.name}<br />
                    <span className="text-[10px] text-muted-foreground">{caseData.assigned_expert.institution_name}</span>
                  </span>
                </div>
              )}

              {caseData.farmer_phone_masked && (
                <div className="flex justify-between border-t border-border/30 pt-1.5">
                  <span className="text-muted-foreground">{isHi ? "सुरक्षित संपर्क नंबर: " : "Masked Contact: "}</span>
                  <span className="font-mono text-muted-foreground">{caseData.farmer_phone_masked}</span>
                </div>
              )}

              {caseData.ai_predicted_disease && (
                <div className="flex justify-between border-t border-border/30 pt-1.5">
                  <span className="text-muted-foreground">{isHi ? "AI रोग पहचान: " : "AI Diagnosis: "}</span>
                  <span className="font-semibold text-foreground">{caseData.ai_predicted_disease}</span>
                </div>
              )}

              {caseData.expert_recommendation && (
                <div className="mt-2 pt-2 border-t border-border/40 space-y-1 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                    {isHi ? "विशेषज्ञ की प्रमाणित सलाह:" : "Official Expert Recommendation:"}
                  </span>
                  <p className="text-[11px] text-foreground leading-relaxed">
                    {caseData.expert_recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
