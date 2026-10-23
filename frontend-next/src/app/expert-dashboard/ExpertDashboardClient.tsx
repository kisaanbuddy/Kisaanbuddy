"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Leaf,
  Send,
  Loader2,
  Search,
  Filter,
  Check,
  MessageSquare,
  Calendar,
  ExternalLink
} from "lucide-react";
import { AdvisoryCase, AUTHENTIC_EXPERTS } from "@/lib/disease-advisory-store";

export function ExpertDashboardClient() {
  const [cases, setCases] = useState<AdvisoryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<AdvisoryCase | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [reviewStatus, setReviewStatus] = useState<string>("accepted");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  async function fetchCases() {
    setLoading(true);
    try {
      const url = statusFilter === "all" ? "/api/disease/advisory/cases" : `/api/disease/advisory/cases?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCases(data);
        if (data.length > 0 && !selectedCase) {
          setSelectedCase(data[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to load cases:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCase) return;

    setSubmittingReview(true);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/disease/advisory/cases/${selectedCase.case_id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          expert_notes: reviewNotes.trim() || undefined,
          expert_recommendation: prescription.trim() || undefined,
          follow_up_date: followUpDate || undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedCase(updated);
        setCases((prev) => prev.map((c) => (c.case_id === updated.case_id ? updated : c)));
        setSuccessMsg("Case advisory submitted successfully.");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.warn("Review submission error:", err);
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Agricultural Expert & KVK Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">
              Expert Diagnostic Advisory Dashboard
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Review assigned farmer disease cases, examine high-resolution leaf photographs, review calibrated AI predictions, and issue official ICAR-compliant management prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3.5 border border-border/50 shrink-0">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <div className="text-left text-xs">
              <p className="font-bold text-foreground">KVK & ICAR Network</p>
              <p className="text-[11px] text-muted-foreground">732 Agricultural Districts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cases List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["all", "sent", "accepted", "farmer_contacted", "resolved"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground text-xs gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span>Loading assigned advisory cases...</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
              No advisory cases found in this filter category.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {cases.map((c) => {
                const isSelected = selectedCase?.case_id === c.case_id;
                return (
                  <div
                    key={c.case_id}
                    onClick={() => {
                      setSelectedCase(c);
                      setReviewNotes(c.expert_notes || "");
                      setPrescription(c.expert_recommendation || "");
                      setReviewStatus(c.status);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/5 shadow-xs"
                        : "border-border/60 bg-card hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {c.case_id}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted/60 text-muted-foreground">
                        {c.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground">
                        {c.crop_name} {c.crop_variety ? `(${c.crop_variety})` : ""}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        {c.district}, {c.state}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {c.visible_symptoms || "Farmer requested diagnostic verification of leaf spots."}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] text-muted-foreground">
                      <span>Farmer: {c.farmer_name}</span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Inspection & Prescriptions */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedCase.case_id}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                      {selectedCase.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-0.5">
                    {selectedCase.crop_name} {selectedCase.crop_variety ? `(${selectedCase.crop_variety})` : ""} Diagnosis Case
                  </h3>
                </div>

                <div className="text-left sm:text-right text-xs text-muted-foreground">
                  <p><strong>Created:</strong> {new Date(selectedCase.created_at).toLocaleString()}</p>
                  <p><strong>Contact via:</strong> {selectedCase.preferred_contact_method.toUpperCase()}</p>
                </div>
              </div>

              {/* Farmer & Farm Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Farmer Name</span>
                  <span className="font-bold text-foreground">{selectedCase.farmer_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Contact Phone</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedCase.farmer_phone_masked || selectedCase.farmer_phone}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Location</span>
                  <span className="font-semibold text-foreground">
                    {selectedCase.village_or_tehsil ? `${selectedCase.village_or_tehsil}, ` : ""}{selectedCase.district}, {selectedCase.state}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Growth Stage</span>
                  <span className="font-semibold text-foreground">{selectedCase.growth_stage || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Assigned KVK</span>
                  <span className="font-semibold text-foreground">{selectedCase.assigned_expert?.institution_name || "Regional KVK"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Consent Status</span>
                  <span className="text-emerald-600 font-bold">✓ Explicit Consent</span>
                </div>
              </div>

              {/* AI Prediction Overview */}
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  AI Model Preliminary Assessment
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {selectedCase.ai_predicted_disease || "General Foliar Spot"}
                  </span>
                  {selectedCase.ai_confidence && (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {(selectedCase.ai_confidence * 100).toFixed(1)}% Calibrated Confidence
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Symptoms reported by farmer: {selectedCase.visible_symptoms || "Leaf lesions and discoloration."}
                </p>
              </div>

              {/* Expert Review & Prescription Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Official Agronomist / KVK Recommendation
                </h4>

                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                    {successMsg}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Case Status Update
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="accepted">Accepted (Reviewing Sample)</option>
                      <option value="farmer_contacted">Farmer Contacted via Phone / WhatsApp</option>
                      <option value="resolved">Resolved with Verified Prescription</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Diagnostic Observations & Internal Notes
                    </label>
                    <textarea
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="e.g. Symptoms indicate early stage rust rather than fungal blast. Verified under district weather bulletin."
                      className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Verified Integrated Treatment Prescription for Farmer *
                    </label>
                    <textarea
                      rows={3}
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="e.g. 1. Cultural: Drain stagnant water. 2. Biological: Spray Trichoderma harzianum @ 5g/L. 3. Chemical: If spreading continues, apply Propiconazole 25% EC @ 1 ml/L (200 ml/acre) with 30-day PHI."
                      required
                      className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-foreground block mb-1">
                        Follow-Up Inspection Date
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Updating Case...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Save & Notify Farmer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
              Select an advisory case from the left to inspect symptoms and formulate expert recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
