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
  ExternalLink,
  Eye,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon
} from "lucide-react";
import { AdvisoryCase } from "@/lib/disease-advisory-store";

const REVIEW_OUTCOME_OPTIONS = [
  { value: "confirmed_correct", label: "✓ Confirmed Correct (AI diagnosis accurate)", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
  { value: "correct_crop_incorrect_disease", label: "⚡ Correct Crop, Incorrect Disease (Provide correction below)", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
  { value: "incorrect_crop", label: "❌ Incorrect Crop (Provide corrected crop below)", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" },
  { value: "uncertain_diagnosis", label: "❓ Uncertain / Ambiguous Symptoms (Complex foliar syndrome)", color: "text-purple-600 bg-purple-500/10 border-purple-500/30" },
  { value: "unable_to_assess_photograph", label: "⚠️ Unable to Assess Photograph (Blurry, poor lighting, or occluded)", color: "text-orange-600 bg-orange-500/10 border-orange-500/30" },
  { value: "additional_photograph_required", label: "📷 Additional Photograph Required (Needs reverse-leaf or stem angle)", color: "text-blue-600 bg-blue-500/10 border-blue-500/30" },
];

const COMMON_CROPS = [
  "Tomato", "Potato", "Corn (Maize)", "Bell Pepper", "Squash", "Rice", "Wheat", "Cotton", "Mustard", "Chilli", "Other"
];

export function ExpertDashboardClient() {
  const [cases, setCases] = useState<AdvisoryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<AdvisoryCase | null>(null);

  // Review Form State
  const [reviewOutcome, setReviewOutcome] = useState<string>("confirmed_correct");
  const [expertCrop, setExpertCrop] = useState<string>("");
  const [expertDisease, setExpertDisease] = useState<string>("");
  const [expertIsHealthy, setExpertIsHealthy] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, [statusFilter, cropFilter]);

  useEffect(() => {
    if (selectedCase) {
      setReviewOutcome(selectedCase.review_outcome || "confirmed_correct");
      setExpertCrop(selectedCase.expert_crop || selectedCase.crop_name || "");
      setExpertDisease(selectedCase.expert_disease || selectedCase.ai_predicted_disease || "");
      setExpertIsHealthy(Boolean(selectedCase.expert_is_healthy));
      setReviewNotes(selectedCase.expert_notes || "");
      setPrescription(selectedCase.expert_recommendation || "");
      setFollowUpDate(selectedCase.follow_up_date || "");
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [selectedCase]);

  async function fetchCases() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (cropFilter !== "all") params.append("crop", cropFilter);

      const url = `/api/disease/advisory/cases${params.toString() ? `?${params.toString()}` : ""}`;
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
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/disease/advisory/cases/${selectedCase.case_id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_outcome: reviewOutcome,
          expert_crop: expertCrop.trim() || selectedCase.crop_name,
          expert_disease: expertDisease.trim() || undefined,
          expert_is_healthy: expertIsHealthy,
          expert_notes: reviewNotes.trim() || undefined,
          expert_recommendation: prescription.trim() || undefined,
          follow_up_date: followUpDate || undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedCase(updated);
        setCases((prev) => prev.map((c) => (c.case_id === updated.case_id ? updated : c)));
        setSuccessMsg("✓ Expert clinical review recorded and verified.");
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        const err = await res.json().catch(() => ({ detail: "Submission failed" }));
        setErrorMsg(err.detail || "Failed to submit review.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  // Parse image quality metrics if present
  let imageQuality: any = null;
  if (selectedCase?.image_quality_json) {
    try {
      imageQuality = JSON.parse(selectedCase.image_quality_json);
    } catch {}
  }

  return (
    <div className="w-full py-8 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Agricultural Expert & KVK Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">
              Supervised Field Pilot: Expert Diagnostic Dashboard
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Examine genuine Indian farmer photographs, review calibrated AI screenings, confirm or correct pathological diagnoses, and compile verified ground truth for model retraining.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3.5 border border-border/50 shrink-0">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <div className="text-left text-xs">
              <p className="font-bold text-foreground">KVK & ICAR Supervised Network</p>
              <p className="text-[11px] text-muted-foreground">732 Agricultural Districts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Case Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Pilot Queue ({cases.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-border bg-card text-foreground text-xs font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="resolved">Resolved / Verified</option>
                <option value="additional_photo_needed">Needs Photo</option>
                <option value="unassessable">Unassessable</option>
              </select>

              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-border bg-card text-foreground text-xs font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Crops</option>
                {COMMON_CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
              Loading field pilot cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
              No advisory cases match the selected filters.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {cases.map((c) => {
                const isSelected = selectedCase?.case_id === c.case_id;
                const isResolved = c.status === "resolved";
                return (
                  <button
                    key={c.case_id}
                    onClick={() => setSelectedCase(c)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                        : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {c.case_id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isResolved
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : c.status === "pending"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {c.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="font-bold text-xs text-foreground truncate">
                      {c.crop_name} • {c.farmer_name}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.district}, {c.state}
                      </span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>

                    {c.ai_predicted_disease && (
                      <div className="mt-1.5 text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 truncate">
                        AI Screening: {c.ai_predicted_disease} {c.ai_confidence ? `(${(c.ai_confidence * 100).toFixed(0)}%)` : ""}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Inspection, Image Preview & Expert Review Form */}
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
                    {selectedCase.crop_name} {selectedCase.crop_variety ? `(${selectedCase.crop_variety})` : ""} Case
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
                  <span className="text-muted-foreground text-[10px] block">Research Consent</span>
                  <span className="text-emerald-600 font-bold">
                    {selectedCase.consent_for_research !== false ? "✓ Granted for ML Pilot" : "✗ Refused"}
                  </span>
                </div>
              </div>

              {/* Leaf Photograph Preview & Image Quality Guardrails */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-emerald-600" />
                    Field Leaf Photograph
                  </span>
                  {selectedCase.image_url && (
                    <a
                      href={selectedCase.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline inline-flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Full Resolution
                    </a>
                  )}
                </div>

                {selectedCase.image_url ? (
                  <div className="relative aspect-video max-h-56 rounded-lg overflow-hidden border border-border bg-black/10 flex items-center justify-center">
                    <img
                      src={selectedCase.image_url}
                      alt="Crop leaf observation"
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                    No photograph attached to this advisory case.
                  </div>
                )}

                {/* Image Quality Breakdown */}
                {imageQuality && (
                  <div className="grid grid-cols-4 gap-2 text-[10px] p-2.5 rounded-lg bg-background border border-border">
                    <div>
                      <span className="text-muted-foreground block">Focus / Blur:</span>
                      <span className="font-mono font-bold text-foreground">{imageQuality.blur_score?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Brightness:</span>
                      <span className="font-mono font-bold text-foreground">{imageQuality.brightness?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Contrast:</span>
                      <span className="font-mono font-bold text-foreground">{imageQuality.contrast?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Green Ratio:</span>
                      <span className="font-mono font-bold text-foreground">{imageQuality.green_ratio ? `${(imageQuality.green_ratio * 100).toFixed(0)}%` : "N/A"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preliminary AI Prediction Box */}
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  AI Model Screening (Preliminary • Unverified)
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {selectedCase.ai_predicted_disease || "General Foliar Symptom"}
                  </span>
                  {selectedCase.ai_confidence && (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {(selectedCase.ai_confidence * 100).toFixed(1)}% Calibrated Softmax
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Reported by farmer: {selectedCase.visible_symptoms || "Leaf spotting and wilting."}
                </p>
                {selectedCase.model_version && (
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Model: {selectedCase.model_version} • Artifact: {selectedCase.artifact_hash || "verified"}
                  </p>
                )}
              </div>

              {/* Review Audit Info if already reviewed */}
              {selectedCase.reviewer_name && (
                <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-blue-900 dark:text-blue-300 space-y-0.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                    Verified by: {selectedCase.reviewer_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Reviewed on: {selectedCase.reviewed_at ? new Date(selectedCase.reviewed_at).toLocaleString() : "Recently"} • Outcome: <strong>{selectedCase.review_outcome}</strong>
                  </p>
                </div>
              )}

              {/* Expert Review & Verification Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Official Agronomist / KVK Clinical Review
                </h4>

                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  {/* Standardized Review Outcome */}
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      1. Standardized Review Outcome *
                    </label>
                    <select
                      value={reviewOutcome}
                      onChange={(e) => setReviewOutcome(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    >
                      {REVIEW_OUTCOME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Crop & Disease Correction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-border/50 bg-muted/10">
                    <div>
                      <label className="font-semibold text-foreground block mb-1">
                        Confirmed Botanical Crop
                      </label>
                      <input
                        type="text"
                        value={expertCrop}
                        onChange={(e) => setExpertCrop(e.target.value)}
                        placeholder="e.g. Tomato, Potato, Corn"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-foreground block mb-1">
                        Confirmed Disease / Condition
                      </label>
                      <input
                        type="text"
                        value={expertDisease}
                        onChange={(e) => setExpertDisease(e.target.value)}
                        placeholder="e.g. Early Blight, Late Blight, Common Rust"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="healthyCheck"
                        checked={expertIsHealthy}
                        onChange={(e) => setExpertIsHealthy(e.target.checked)}
                        className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <label htmlFor="healthyCheck" className="text-xs text-foreground cursor-pointer">
                        Confirm plant is <strong>Healthy & Asymptomatic</strong> (no disease/pest infestation)
                      </label>
                    </div>
                  </div>

                  {/* Agronomist Notes */}
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      2. Clinical Diagnostic Observations & Internal Reasoning
                    </label>
                    <textarea
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="e.g. Target-board concentric rings confirm Alternaria solani. Secondary bacterial spot absent."
                      className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Treatment Prescription */}
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      3. Official Integrated Pest/Disease Management (IDM) Prescription for Farmer *
                    </label>
                    <textarea
                      rows={3}
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="e.g. 1. Cultural: Prune bottom leaves. 2. Biological: Spray Trichoderma harzianum @ 5g/L. 3. Chemical: Mancozeb 75% WP @ 2g/L (5-day PHI)."
                      required
                      className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Follow-Up Inspection Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Recording Review...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Verified Diagnosis</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
              Select an advisory case from the left queue to inspect leaf symptoms and record an official expert diagnosis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
