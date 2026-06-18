"use client";

import { useLanguage } from "@/lib/language";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
        setError(data.detail || "Failed to reset password.");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl p-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 shadow-2xl relative animate-fade-in">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-[0.08] pointer-events-none" />

      <div className="relative rounded-[22px] bg-[#040814]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            {lt.resetPassword}
          </h1>
          <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-[320px]">
            {lt.enterNewPasswordText}
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 leading-relaxed">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5 animate-pulse-glow" />
              <div>
                <span className="font-bold block text-white mb-1 font-display">{t("reset_password.success")}</span>
                <span>{lt.successMsg}</span>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg flex items-center justify-center gap-2 hover:shadow-glow-primary active:scale-[0.98] transition-all"
            >
              <span>{lt.backToLogin}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">
                {lt.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading || !token}
                  className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">
                {lt.confirmPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading || !token}
                  className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-glow-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
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
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 -mt-4 py-8">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-xs text-muted-foreground">{t("reset_password.initializing_reset_page")}</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
