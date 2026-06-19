'use client';

import { useLanguage } from '@/lib/language';
import { Star, Quote, MessageSquare, Loader2, CheckCircle2, User, MapPin, Tag, AlertTriangle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

type Review = {
  id: string;
  name: string;
  location: string;
  crop: string;
  text: string;
  stars: number;
  created_at: string;
};

export function Testimonials() {
  const { t } = useLanguage();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !crop.trim() || !text.trim()) {
      const errVal = "Validation Error: All fields are required";
      setError(errVal);
      setToast({ message: errVal, type: "error" });
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim(),
          crop: crop.trim(),
          text: text.trim(),
          stars: stars
        })
      });

      if (res.ok) {
        const newReview = await res.json();
        // Dynamic instant update without page refresh
        setReviews((prev) => [newReview, ...prev]);
        setSuccess(true);
        // Clear form
        setName("");
        setLocation("");
        setCrop("");
        setText("");
        setStars(5);
        
        // Dynamic alert based on API/fallback response
        if (newReview.id?.startsWith("fallback-")) {
          setToast({ 
            message: "API Offline: Review saved locally in session cache.", 
            type: "warning" 
          });
        } else {
          setToast({ 
            message: t("testimonials.success_alert") || "Review published successfully!", 
            type: "success" 
          });
        }
        // Hide success alert after 5s
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const data = await res.json();
        const errMsg = data.detail || "Failed to submit review";
        setError(errMsg);
        setToast({ message: `Submission Error: ${errMsg}`, type: "error" });
      }
    } catch (err) {
      const netMsg = "Network error: Connection to API endpoint failed.";
      setError(netMsg);
      setToast({ message: netMsg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Fallback default testimonials in active language if fetch fails or returns empty
  const defaultTestimonials = [
    {
      id: "default-1",
      name: t("landing_testimonials.ramesh_patel"),
      location: t("landing_testimonials.rajkot_gujarat"),
      crop: t("landing_testimonials.cotton_farmer"),
      text: t("landing_testimonials.the_crop_predictor_identified"),
      stars: 5,
    },
    {
      id: "default-2",
      name: t("landing_testimonials.suresh_gowda"),
      location: t("landing_testimonials.kolar_karnataka"),
      crop: t("landing_testimonials.tomato_grower"),
      text: t("landing_testimonials.the_leaf_disease_detector"),
      stars: 5,
    },
    {
      id: "default-3",
      name: t("landing_testimonials.rajesh_kumar"),
      location: t("landing_testimonials.agra_uttar_pradesh"),
      crop: t("landing_testimonials.potato_cultivator"),
      text: t("landing_testimonials.mandi_price_target_notifications"),
      stars: 5,
    },
  ];

  const displayedReviews = reviews.length > 0 ? reviews : defaultTestimonials;

  return (
    <>
      <section className="py-24 bg-[#040814]/40 relative border-b border-border/10">
      
      {/* Background glow glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.015] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-400">
            {t("landing_testimonials.success_stories")}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white">
            {t("landing_testimonials.trusted_by")}{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              {t("landing_testimonials.indian_kisans")}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            {t("landing_testimonials.see_how_farmers_across")}
          </p>
        </div>

        {/* Dynamic Reviews Grid */}
        {loadingReviews ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <span className="text-xs text-muted-foreground font-semibold">Loading reviews...</span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            <AnimatePresence>
              {displayedReviews.map((rev, idx) => (
                <motion.div
                  key={rev.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-6 hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Rating stars */}
                    <div className="flex gap-1 select-none">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < rev.stars ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
                      ))}
                    </div>
                    
                    <Quote className="h-8 w-8 text-emerald-500/10 absolute top-6 right-6" />

                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed italic font-medium">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                  </div>

                  {/* Author Detail */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{rev.name}</span>
                      <span className="text-[10px] text-muted-foreground/80 font-semibold">{rev.location}</span>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase">
                      {rev.crop}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── SUBMISSION FORM SECTION ── */}
        <div className="max-w-xl mx-auto rounded-3xl border border-white/5 bg-white/[0.02] p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

          {/* Form Header */}
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{t("testimonials.write_review")}</h3>
            </div>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 leading-relaxed animate-fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
              <span className="font-semibold">{t("testimonials.success_alert")}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 font-semibold">
              {error}
            </div>
          )}

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  {t("testimonials.name_label")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("testimonials.name_placeholder")}
                    className="w-full h-10 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 text-xs text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  {t("testimonials.location_label")}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("testimonials.location_placeholder")}
                    className="w-full h-10 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 text-xs text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  {t("testimonials.crop_label")}
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    placeholder={t("testimonials.crop_placeholder")}
                    className="w-full h-10 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 text-xs text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Star Rating Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  Rating
                </label>
                <div className="flex items-center h-10 gap-1.5 pl-1 select-none">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = hoverStars !== null ? star <= hoverStars : star <= stars;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStars(star)}
                        onMouseEnter={() => setHoverStars(star)}
                        onMouseLeave={() => setHoverStars(null)}
                        className="hover:scale-110 active:scale-95 transition-all outline-none"
                      >
                        <Star className={`h-5.5 w-5.5 ${active ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                {t("testimonials.text_label")}
              </label>
              <textarea
                required
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("testimonials.text_placeholder")}
                className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl p-3 text-xs text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-glow-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("testimonials.submitting")}</span>
                </>
              ) : (
                <span>{t("testimonials.submit")}</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </section>
    
    {/* Floating Toast Notification Overlay */}
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, x: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 bg-[#0a1224]/95 select-none"
          style={{
            borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.3)" : toast.type === "warning" ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white">
              {toast.type === "success" ? "Success" : toast.type === "warning" ? "API Warning" : "Error"}
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed font-semibold">
              {toast.message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}
