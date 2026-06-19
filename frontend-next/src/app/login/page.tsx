"use client";

import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Phone, ShieldCheck, AlertCircle, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { t } = useLanguage();
  const lt = {
    welcomeBack: t("login.welcomeBack"),
    signInToAccess: t("login.signInToAccess"),
    phoneLabel: t("login.phoneLabel"),
    phonePlaceholder: t("login.phonePlaceholder"),
    sendOtp: t("login.sendOtp"),
    sendingOtp: t("login.sendingOtp"),
    otpLabel: t("login.otpLabel"),
    otpPlaceholder: t("login.otpPlaceholder"),
    verifyOtp: t("login.verifyOtp"),
    verifyingOtp: t("login.verifyingOtp"),
    nameLabel: t("login.nameLabel"),
    namePlaceholder: t("login.namePlaceholder"),
    completeRegistration: t("login.completeRegistration"),
    devModeNotice: t("login.devModeNotice"),
    phoneError: t("login.phoneError"),
    otpError: t("login.otpError"),
    nameError: t("login.nameError"),
    incorrectOtp: t("login.incorrectOtp"),
  };
  const router = useRouter();
  const { user, ready } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
    if (cleanPhone.length !== 10) {
      setError(lt.phoneError);
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate OTP generation (standard Firebase verification trigger simulation)
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/[^0-9]/g, "");
    if (cleanOtp.length !== 6) {
      setError(lt.otpError);
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      if (cleanOtp === "123456") {
        // Check if user already exists in storage or default list
        const existingUserRaw = window.localStorage.getItem(`user_${phone}`);
        if (existingUserRaw) {
          const sessionUser = JSON.parse(existingUserRaw);
          window.localStorage.setItem("kisaanbuddy_user", JSON.stringify(sessionUser));
          window.localStorage.setItem("kisaanbuddy_token", "otp_token_" + Date.now());
          window.dispatchEvent(new Event("kisaanbuddy-auth-change"));
          router.replace("/dashboard");
        } else {
          setStep("register");
        }
      } else {
        setError(lt.incorrectOtp);
      }
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError(lt.nameError);
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@KisaanBuddy.com`,
        name: cleanName,
        phone_number: phone,
        role: "Farmer",
        provider: "phone_otp",
        created_at: new Date().toISOString()
      };

      // Save user to system registry and set active session
      window.localStorage.setItem(`user_${phone}`, JSON.stringify(newUser));
      window.localStorage.setItem("kisaanbuddy_user", JSON.stringify(newUser));
      window.localStorage.setItem("kisaanbuddy_token", "otp_token_" + Date.now());
      window.dispatchEvent(new Event("kisaanbuddy-auth-change"));
      setLoading(false);
      router.replace("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 -mt-4 py-8">
      <div className="w-full max-w-md rounded-3xl p-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 shadow-2xl relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-[0.08] pointer-events-none" />

        <div className="relative rounded-[22px] bg-[#040814]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              {lt.welcomeBack}
            </h1>
            <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-[280px]">
              {step === "phone" && lt.signInToAccess}
              {step === "otp" && `${lt.otpLabel} (Sent to +91 ${phone.substring(0,2)}******${phone.substring(8,10)})`}
              {step === "register" && lt.namePlaceholder}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Dev Mode Notice */}
          {step === "otp" && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-bold justify-center">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{lt.devModeNotice}</span>
            </div>
          )}

          {/* Phone Form */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  {lt.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-foreground/80 font-bold border-r border-white/10 pr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder={lt.phonePlaceholder}
                    disabled={loading}
                    className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-[4.5rem] pr-4 text-sm text-white placeholder-muted-foreground/45 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20 font-bold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-glow-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{lt.sendingOtp}</span>
                  </>
                ) : (
                  <>
                    <span>{lt.sendOtp}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Form */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  {lt.otpPlaceholder}
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="------"
                  disabled={loading}
                  className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 text-center text-lg text-white placeholder-muted-foreground/30 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20 font-black tracking-[0.7em] font-mono"
                />
              </div>

              <div className="flex justify-between items-center px-1">
                <button
                  type="button"
                  onClick={() => { setStep("phone"); setError(null); }}
                  className="text-xs text-muted-foreground hover:text-white transition-colors"
                >
                  ← Change Number
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-glow-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{lt.verifyingOtp}</span>
                  </>
                ) : (
                  <>
                    <span>{lt.verifyOtp}</span>
                    <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Registration Form */}
          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  {lt.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lt.namePlaceholder}
                  disabled={loading}
                  className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 text-sm text-white placeholder-muted-foreground/45 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-glow-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{lt.verifyingOtp}</span>
                  </>
                ) : (
                  <>
                    <span>{lt.completeRegistration}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
