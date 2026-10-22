"use client";

import { useLanguage } from "@/lib/language";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { fadeDown, MOTION_DURATIONS, MOTION_EASINGS } from "@/lib/motion";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const lt = {
    forgotPassword: t("forgot_password.forgotPassword"),
    enterEmailText: t("ui.auth.email_instructions"),
    emailLabel: t("forgot_password.emailLabel"),
    sendLinkBtn: t("forgot_password.sendLinkBtn"),
    sending: t("forgot_password.sending"),
    backToLogin: t("forgot_password.backToLogin"),
    successMsg: t("forgot_password.successMsg"),
    requiredFields: t("forgot_password.requiredFields"),
    invalidEmail: t("forgot_password.invalidEmail"),
  };

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError(lt.requiredFields);
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError(lt.invalidEmail);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || t("ui.auth.reset_request_failed"));
      } else if (data.delivery_available === false) {
        setError(t("ui.auth.reset_delivery_unavailable"));
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(t("ui.auth.network_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: MOTION_DURATIONS.modal, ease: MOTION_EASINGS.gentle }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            {lt.forgotPassword}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
            {lt.enterEmailText}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs text-primary leading-relaxed">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <span className="font-semibold block text-foreground mb-0.5">{t("forgot_password.link_sent_successfully")}</span>
                <span>{lt.successMsg}</span>
              </div>
            </div>

            <Link
              href="/login"
              className="btn-secondary w-full h-11 gap-2 text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{lt.backToLogin}</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {lt.emailLabel}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  className="w-full h-11 rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  autoFocus
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 gap-2 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{lt.sending}</span>
                </>
              ) : (
                <span>{lt.sendLinkBtn}</span>
              )}
            </button>

            {/* Back to Login Link */}
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{lt.backToLogin}</span>
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
