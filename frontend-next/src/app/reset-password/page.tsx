"use client";

import { useLanguage } from "@/lib/language";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fadeDown, MOTION_DURATIONS, MOTION_EASINGS } from "@/lib/motion";
import { Loader2, Sparkles, Lock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const { t } = useLanguage();
  const lt = {
    resetPassword: t("reset_password.resetPassword"),
    enterNewPasswordText: t("reset_password.enterNewPasswordText"),
    passwordLabel: t("reset_password.passwordLabel"),
    confirmPasswordLabel: t("reset_password.confirmPasswordLabel"),
    resetBtn: t("reset_password.resetBtn"),
    reseting: t("reset_password.reseting"),
    backToLogin: t("reset_password.backToLogin") || t("forgot_password.backToLogin") || "Back to Sign In",
    successMsg: t("reset_password.successMsg"),
    requiredFields: t("reset_password.requiredFields"),
    passwordsDoNotMatch: t("reset_password.passwordsDoNotMatch"),
    invalidToken: t("reset_password.invalidToken"),
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : lt.invalidToken);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(lt.invalidToken);
      return;
    }
    if (!password || !confirmPassword) {
      setError(lt.requiredFields);
      return;
    }
    if (password !== confirmPassword) {
      setError(lt.passwordsDoNotMatch);
      return;
    }
    if (password.length < 8) {
      setError(t("ui.auth.password_length"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || t("ui.auth.reset_failed"));
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
          {lt.resetPassword}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
          {lt.enterNewPasswordText}
        </p>
      </div>

      {/* Status Messages */}
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
              <span className="font-bold block text-foreground mb-0.5 font-display">{t("reset_password.success")}</span>
              <span>{lt.successMsg}</span>
            </div>
          </div>

          <Link
            href="/login"
            className="btn-primary w-full h-11 gap-2 text-xs font-semibold"
          >
            <span>{lt.backToLogin}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lt.passwordLabel}
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-muted-foreground/60" />
              <input
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || !token}
                className="w-full h-11 rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lt.confirmPasswordLabel}
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-muted-foreground/60" />
              <input
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || !token}
                className="w-full h-11 rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !token}
            className="btn-primary w-full h-11 gap-2 text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{lt.reseting}</span>
              </>
            ) : (
              <span>{lt.resetBtn}</span>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-8">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">{t("reset_password.initializing_reset_page")}</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
