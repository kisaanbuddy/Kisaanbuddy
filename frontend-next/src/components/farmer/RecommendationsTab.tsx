/**
 * Recommendations Tab — shows AI recommendations with status management.
 */
"use client";

import { useState } from "react";
import {
  Sparkles, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
  Droplets, FlaskConical, Bug, Leaf, Warehouse, Sprout, Star, Loader2
} from "lucide-react";
import type { Recommendation, RecommendationStatus, RecommendationCategory } from "@/lib/farmer-api";
import { recommendationsApi } from "@/lib/farmer-api";

interface Props {
  recommendations: Recommendation[];
  onRefresh: () => Promise<void>;
  lang: string;
}

const CATEGORY_CONFIG: Record<RecommendationCategory, { icon: React.ElementType; color: string; label: string; hiLabel: string }> = {
  irrigation:  { icon: Droplets,   color: "text-sky-600 bg-sky-500/10 border-sky-500/20",      label: "Irrigation",     hiLabel: "सिंचाई" },
  fertilizer:  { icon: FlaskConical, color: "text-teal-600 bg-teal-500/10 border-teal-500/20", label: "Fertilizer",     hiLabel: "उर्वरक" },
  pest:        { icon: Bug,         color: "text-red-600 bg-red-500/10 border-red-500/20",      label: "Pest Control",   hiLabel: "कीट नियंत्रण" },
  disease:     { icon: Bug,         color: "text-orange-600 bg-orange-500/10 border-orange-500/20", label: "Disease",   hiLabel: "रोग प्रबंधन" },
  harvest:     { icon: Warehouse,   color: "text-amber-600 bg-amber-500/10 border-amber-500/20", label: "Harvest",     hiLabel: "कटाई" },
  next_season: { icon: Sprout,      color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20", label: "Next Season", hiLabel: "अगली फसल" },
  general:     { icon: Sparkles,    color: "text-purple-600 bg-purple-500/10 border-purple-500/20", label: "General",  hiLabel: "सामान्य" },
};

const STATUS_CONFIG: Record<RecommendationStatus, { label: string; hiLabel: string; color: string; icon: React.ElementType }> = {
  pending:         { label: "Pending",         hiLabel: "बाकी",        color: "text-amber-600 bg-amber-500/10 border-amber-500/20",    icon: Clock },
  completed:       { label: "Completed",       hiLabel: "पूर्ण",       color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  not_applicable:  { label: "Not Applicable",  hiLabel: "लागू नहीं",   color: "text-muted-foreground bg-muted/30 border-border",       icon: XCircle },
  postponed:       { label: "Postponed",       hiLabel: "स्थगित",      color: "text-blue-600 bg-blue-500/10 border-blue-500/20",       icon: Clock },
};

const CONFIDENCE_COLOR: Record<string, string> = {
  "High": "text-emerald-600",
  "Moderate": "text-amber-600",
  "Low": "text-red-600",
};

function RecommendationCard({ rec, onStatusChange, lang }: {
  rec: Recommendation;
  onStatusChange: (id: number, status: RecommendationStatus) => Promise<void>;
  lang: string;
}) {
  const hi = lang === "hi";
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const catConfig = CATEGORY_CONFIG[rec.category] ?? CATEGORY_CONFIG.general;
  const statusConfig = STATUS_CONFIG[rec.status] ?? STATUS_CONFIG.pending;
  const CatIcon = catConfig.icon;
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async (newStatus: RecommendationStatus) => {
    setUpdating(true);
    setShowStatusMenu(false);
    try {
      await onStatusChange(rec.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`rounded-xl border bg-card overflow-hidden transition-all ${rec.status !== "pending" ? "opacity-70" : "border-border"}`}>
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${catConfig.color}`}>
              <CatIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">{rec.title}</p>
              {rec.crop_name && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 mt-1 inline-block">
                  {rec.crop_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(s => !s)}
                disabled={updating}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${statusConfig.color}`}
              >
                {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <StatusIcon className="h-3 w-3" />}
                {hi ? statusConfig.hiLabel : statusConfig.label}
              </button>
              {showStatusMenu && (
                <>
                  <button className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                  <div className="absolute right-0 top-8 z-50 rounded-xl border border-border bg-popover shadow-lg p-1 w-44 space-y-0.5">
                    {(Object.entries(STATUS_CONFIG) as [RecommendationStatus, typeof STATUS_CONFIG.pending][]).map(([s, cfg]) => {
                      const SI = cfg.icon;
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors ${rec.status === s ? "bg-muted font-bold" : "hover:bg-muted/60"} ${cfg.color}`}
                        >
                          <SI className="h-3.5 w-3.5" />
                          {hi ? cfg.hiLabel : cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setExpanded(s => !s)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Action and date */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{hi ? "सुझाई गई कार्रवाई" : "Recommended Action"}</p>
          <p className="text-xs font-medium text-foreground">{rec.recommended_action}</p>
        </div>

        {rec.date_window && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            {hi ? "समय-सीमा:" : "Time Window:"} {rec.date_window}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/50 p-4 space-y-3 bg-muted/10">
          {rec.explanation && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{hi ? "विवरण" : "Explanation"}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.explanation}</p>
            </div>
          )}
          {rec.reason && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{hi ? "कारण" : "Why This Recommendation"}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            {rec.confidence && (
              <span className={`font-semibold ${CONFIDENCE_COLOR[rec.confidence] ?? ""}`}>
                {hi ? "विश्वास:" : "Confidence:"} {rec.confidence}
              </span>
            )}
            {rec.source && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" />
                {hi ? "स्रोत:" : "Source:"} {rec.source}
              </span>
            )}
            {rec.created_at && (
              <span>{hi ? "बनाया:" : "Created:"} {new Date(rec.created_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function RecommendationsTab({ recommendations, onRefresh, lang }: Props) {
  const hi = lang === "hi";
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<RecommendationCategory | "all">("all");
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (id: number, status: RecommendationStatus) => {
    setError(null);
    try {
      await recommendationsApi.updateStatus(id, status);
      await onRefresh();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const filtered = recommendations.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    return true;
  });

  const pendingCount = recommendations.filter(r => r.status === "pending").length;
  const completedCount = recommendations.filter(r => r.status === "completed").length;

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-black text-foreground">{recommendations.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{hi ? "कुल" : "Total"}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 mt-1">{hi ? "बाकी" : "Pending"}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <p className="text-2xl font-black text-emerald-600">{completedCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 mt-1">{hi ? "पूर्ण" : "Completed"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-black text-foreground">{recommendations.filter(r => r.status === "postponed").length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{hi ? "स्थगित" : "Postponed"}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {(["all", "pending", "completed", "not_applicable", "postponed"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
            >
              {s === "all" ? (hi ? "सभी" : "All") : hi ? STATUS_CONFIG[s]?.hiLabel : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI context notice */}
      {pendingCount === 0 && recommendations.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3">
          <Sparkles className="h-10 w-10 text-muted-foreground/25 mx-auto" />
          <div>
            <p className="text-sm font-bold text-foreground">{hi ? "अभी कोई सिफारिश नहीं है।" : "No recommendations yet."}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              {hi
                ? "अपनी फसल, मिट्टी और खेत की जानकारी जोड़ें, फिर AI चैटबॉट से सलाह लें। AI द्वारा दी गई सिफारिशें यहाँ दिखाई देंगी।"
                : "Add your crop, soil, and field information, then ask the AI chatbot for advice. Recommendations generated by the AI will appear here."}
            </p>
          </div>
        </div>
      )}

      {/* Recommendation cards */}
      <div className="space-y-3">
        {filtered.map(rec => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            onStatusChange={handleStatusChange}
            lang={lang}
          />
        ))}
        {filtered.length === 0 && recommendations.length > 0 && (
          <p className="text-sm text-center text-muted-foreground py-8">
            {hi ? "इस फ़िल्टर के लिए कोई सिफारिश नहीं है।" : "No recommendations match this filter."}
          </p>
        )}
      </div>
    </div>
  );
}
