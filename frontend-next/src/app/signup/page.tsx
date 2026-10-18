"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sprout,
  ShieldCheck,
  Languages,
  TrendingUp,
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle2,
  RotateCw,
  RefreshCw,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  useAuth,
  sendOtp,
  verifyOtp,
  completeOtpRegistration,
  normalizeIndianPhone,
  isValidIndianPhone,
} from "@/lib/auth";
import { OtpInput } from "@/components/auth/OtpInput";

export default function SignupPage() {
  const { user, ready } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registrationToken, setRegistrationToken] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (ready && user) {
      window.location.replace("/dashboard");
    }
  }, [ready, user]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e && "preventDefault" in e) e.preventDefault();
    const cleanPhone = normalizeIndianPhone(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await sendOtp(cleanPhone);
    setLoading(false);

    if (res.ok) {
      setStep("otp");
      setResendCooldown(res.resendAfter || 30);
      setNotice("Enter the verification code sent to your phone.");
    } else {
      setError(res.error || "Failed to send verification code. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    const cleanPhone = normalizeIndianPhone(phone);
    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await sendOtp(cleanPhone);
    setLoading(false);

    if (res.ok) {
      setResendCooldown(res.resendAfter || 30);
      setNotice("A fresh 6-digit verification code has been sent to your phone.");
    } else {
      setError(res.error || "Failed to resend code. Please wait a few seconds and try again.");
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, otpOverride?: string) => {
    if (e && "preventDefault" in e) e.preventDefault();
    const targetOtp = otpOverride || otp;
    const cleanOtp = targetOtp.trim().replace(/[^0-9]/g, "");
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    const cleanPhone = normalizeIndianPhone(phone);
    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await verifyOtp(cleanPhone, cleanOtp);
    if (res.ok) {
      if (res.registered) {
        // User already exists, log them into dashboard with a full-page hop
        setNotice("Account verified! Redirecting to your dashboard...");
        window.location.href = "/dashboard";
      } else {
        setRegistrationToken(res.registrationToken);
        setLoading(false);
        setStep("register");
        setNotice("Mobile number verified! Enter your name to complete your profile.");
      }
    } else {
      setLoading(false);
      setError(res.error || "Invalid verification code. Please check and try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await completeOtpRegistration(registrationToken, cleanName);
    if (res.ok) {
      setNotice("Profile created! Launching your digital farm setup...");
      // Launch into 8-step farm onboarding with full-page navigation
      window.location.href = "/onboarding";
    } else {
      setLoading(false);
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  const cleanPhonePreview = normalizeIndianPhone(phone);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left column: Brand promise and farmer trust */}
        <div className="md:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Farm Intelligence for Every Kisan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Create Your Digital Farm Profile
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Join thousands of Indian farmers using KisaanBuddy to track field growth stages, diagnose leaf diseases, monitor mandi arrivals, and connect directly with verified harvest buyers.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tailored crop advice for wheat, paddy, cotton, soybean & vegetables</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Available in Hindi, English, and regional Indian languages</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct access to AGMARKNET mandi rates and wholesale FPO buyers</span>
            </div>
          </div>
        </div>

        {/* Right column: Signup Card */}
        <div className="md:col-span-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {step === "phone" && "Get Started with Mobile Number"}
                {step === "otp" && "Verify OTP Code"}
                {step === "register" && "What should we call you?"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {step === "phone" && "We will send a 6-digit SMS verification code to your phone."}
                {step === "otp" && `Code sent to +91 ${cleanPhonePreview || phone}`}
                {step === "register" && "Enter your name to complete your digital farm registration."}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Notice / Success Message */}
            {notice && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>{notice}</span>
              </div>
            )}

            {/* STEP 1: Phone */}
            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      maxLength={16}
                      value={phone}
                      onChange={(e) => {
                        setError(null);
                        setPhone(e.target.value);
                      }}
                      disabled={loading}
                      autoFocus
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter standard 10-digit mobile number (e.g. 9876543210).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || normalizeIndianPhone(phone).length < 10}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Enter 6-Digit Code
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      setError(null);
                    }}
                    onComplete={(code) => handleVerifyOtp(undefined, code)}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError(null);
                      setNotice(null);
                    }}
                    disabled={loading}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Change Number
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.replace(/[^0-9]/g, "").length !== 6}
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Resend OTP Bar */}
                <div className="pt-2 text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-xs text-slate-500 font-medium">
                      Didn&apos;t receive code? Resend available in{" "}
                      <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {resendCooldown}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Verification Code</span>
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* STEP 3: Register Name */}
            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Farmer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Patel"
                    value={name}
                    onChange={(e) => {
                      setError(null);
                      setName(e.target.value);
                    }}
                    disabled={loading}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Complete Setup & Start Farming</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              <span>Already have an account? </span>
              <Link
                href="/login"
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
