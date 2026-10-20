"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Shield, User, Phone, MapPin, Send, Loader2, Sparkles } from "lucide-react";

interface RequestExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName: string;
  variety?: string;
  state: string;
  district: string;
  predictedDisease?: string;
  confidence?: number;
  imageUrl?: string | null;
  onCaseCreated?: (caseId: string) => void;
  language?: string;
}

export function RequestExpertModal({
  isOpen,
  onClose,
  cropName,
  variety,
  state,
  district,
  predictedDisease,
  confidence,
  imageUrl,
  onCaseCreated,
  language = "en",
}: RequestExpertModalProps) {
  const isHi = language === "hi";
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<"phone" | "whatsapp" | "sms">("phone");
  const [village, setVillage] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [assignedExpertName, setAssignedExpertName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!farmerName.trim()) {
      setError(isHi ? "कृपया अपना नाम लिखें।" : "Please enter your full name.");
      return;
    }
    if (!farmerPhone.trim() || farmerPhone.replace(/\D/g, "").length < 10) {
      setError(isHi ? "कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!consent) {
      setError(isHi ? "कृषि विशेषज्ञों से संपर्क के लिए सहमति आवश्यक है।" : "Explicit consent is required to share diagnosis with experts.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/disease/advisory/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_name: farmerName.trim(),
          farmer_phone: farmerPhone.trim(),
          preferred_contact_method: contactMethod,
          consent_recorded: consent,
          crop_name: cropName || "Field Crop",
          crop_variety: variety || null,
          state: state || "Madhya Pradesh",
          district: district || "Sehore",
          village_or_tehsil: village.trim() || null,
          ai_predicted_disease: predictedDisease || null,
          ai_confidence: confidence || null,
          image_url: imageUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to submit advisory case.");
      }

      const data = await res.json();
      setCreatedCaseId(data.case_id);
      setAssignedExpertName(data.assigned_expert?.institution_name || "Nearest Krishi Vigyan Kendra");

      // Save to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("kisaanbuddy_recent_cases") || "[]");
        stored.unshift(data.case_id);
        localStorage.setItem("kisaanbuddy_recent_cases", JSON.stringify(stored.slice(0, 10)));
      } catch {}

      if (onCaseCreated) {
        onCaseCreated(data.case_id);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {createdCaseId ? (
          <div className="text-center py-6 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-foreground">
                {isHi ? "परामर्श केस सफलतापूर्वक दर्ज हुआ!" : "Advisory Case Created Successfully!"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {isHi
                  ? "आपका मामला निकटतम प्रमाणित कृषि विज्ञान केंद्र को भेज दिया गया है।"
                  : "Your diagnosis has been routed to the assigned regional agricultural support center."}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{isHi ? "केस आईडी: " : "Case ID: "}</span>
                <span className="font-mono font-bold text-foreground text-sm">{createdCaseId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{isHi ? "आवंटित केंद्र: " : "Assigned Centre: "}</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{assignedExpertName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{isHi ? "संपर्क माध्यम: " : "Contact Mode: "}</span>
                <span className="font-medium text-foreground uppercase">{contactMethod}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {isHi
                ? "वैज्ञानिक समीक्षा के बाद विशेषज्ञ आपको संपर्क करेंगे। आप 'Track Case' बटन से प्रगति देख सकते हैं।"
                : "The extension scientist will review your leaf image. You can track this case anytime using your Case ID."}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              {isHi ? "ठीक है" : "Done"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                {isHi ? "कृषि विशेषज्ञ समीक्षा" : "Human Expert Advisory Review"}
              </div>
              <h3 className="text-lg font-bold font-display text-foreground">
                {isHi ? "प्रमाणित विशेषज्ञ से सलाह लें" : "Request Agricultural Expert Review"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isHi
                  ? "यदि AI निदान अनिश्चित लगे तो निकटतम KVK वैज्ञानिक से वास्तविक परामर्श प्राप्त करें।"
                  : "Forward your leaf image & symptoms directly to verified agricultural scientists."}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  {isHi ? "किसान का पूरा नाम *" : "Farmer Name *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder={isHi ? "उदा. रामेश्वर पाटीदार" : "e.g. Rameshwar Patidar"}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  {isHi ? "मोबाइल नंबर *" : "Mobile Number *"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder={isHi ? "10 अंकों का फोन नंबर" : "10-digit mobile number"}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    {isHi ? "गांव / तहसील" : "Village / Tehsil"}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={isHi ? "गांव का नाम" : "Village name"}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    {isHi ? "संपर्क का पसंदीदा माध्यम" : "Preferred Contact"}
                  </label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="phone">📞 Phone Call</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="sms">✉️ SMS</option>
                  </select>
                </div>
              </div>

              {/* Crop Summary */}
              <div className="p-3 rounded-lg border border-border/50 bg-muted/30 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isHi ? "फसल व किस्म: " : "Crop & Variety: "}</span>
                  <span className="font-semibold text-foreground">{cropName} {variety ? `(${variety})` : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isHi ? "क्षेत्र / स्थान: " : "Location: "}</span>
                  <span className="font-semibold text-foreground">{district}, {state}</span>
                </div>
                {predictedDisease && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isHi ? "AI संभावित रोग: " : "AI Diagnosis: "}</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">{predictedDisease}</span>
                  </div>
                )}
              </div>

              {/* Explicit Consent Checkbox */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {isHi
                    ? "मैं अपनी पत्ती की फोटो और समस्या का विवरण KVK / ICAR प्रमाणित वैज्ञानिकों के साथ साझा करने की सहमति देता/देती हूँ।"
                    : "I give explicit consent for KisaanBuddy to share my crop diagnosis, symptoms, and leaf photo with verified agricultural extension scientists for advisory review."}
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-semibold transition-colors"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{isHi ? "दर्ज हो रहा है..." : "Submitting..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{isHi ? "केस दर्ज करें" : "Submit Advisory Request"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
