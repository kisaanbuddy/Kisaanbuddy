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
import { useLanguage } from "@/lib/language";

export default function SignupPage() {
  const { user, ready } = useAuth();
  const { t, lang } = useLanguage();
  const isHi = lang === "hi";
  const isKn = lang === "kn";

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
      setError(
        isKn
          ? "ದಯವಿಟ್ಟು 6, 7, 8, ಅಥವಾ 9 ರಿಂದ ಪ್ರಾರಂಭವಾಗುವ ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ."
          : isHi
          ? "कृपया 6, 7, 8, या 9 से शुरू होने वाला 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
      );
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
      setNotice(
        isKn
          ? "ನಿಮ್ಮ ಫೋನ್‌ಗೆ ಕಳುಹಿಸಲಾದ 6-ಅಂಕಿಯ ದೃಢೀಕರಣ ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ."
          : isHi
          ? "आपके फोन पर भेजा गया सत्यापन कोड दर्ज करें।"
          : "Enter the verification code sent to your phone."
      );
    } else {
      setError(
        res.error ||
          (isKn
            ? "ದೃಢೀಕರಣ ಕೋಡ್ ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            : isHi
            ? "सत्यापन कोड भेजने में विफल। कृपया पुन: प्रयास करें।"
            : "Failed to send verification code. Please try again.")
      );
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
      setNotice(
        isKn
          ? "ಹೊಸ 6-ಅಂಕಿಯ ದೃಢೀಕರಣ ಕೋಡ್ ಅನ್ನು ನಿಮ್ಮ ಫೋನ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ."
          : isHi
          ? "आपके फोन पर एक नया 6-अंकीय सत्यापन कोड भेजा गया है।"
          : "A fresh 6-digit verification code has been sent to your phone."
      );
    } else {
      setError(
        res.error ||
          (isKn
            ? "ಕೋಡ್ ಮರುಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಲವು ಸೆಕೆಂಡುಗಳ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            : isHi
            ? "कोड पुनः भेजने में विफल। कृपया कुछ सेकंड प्रतीक्षा करें।"
            : "Failed to resend code. Please wait a few seconds and try again.")
      );
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, otpOverride?: string) => {
    if (e && "preventDefault" in e) e.preventDefault();
    const targetOtp = otpOverride || otp;
    const cleanOtp = targetOtp.trim().replace(/[^0-9]/g, "");
    if (cleanOtp.length !== 6) {
      setError(
        isKn
          ? "ದಯವಿಟ್ಟು ಸಂಪೂರ್ಣ 6-ಅಂಕಿಯ ದೃಢೀಕರಣ ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ."
          : isHi
          ? "कृपया 6 अंकों का पूरा सत्यापन कोड दर्ज करें।"
          : "Please enter the complete 6-digit verification code."
      );
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
        setNotice(
          isKn
            ? "ಖಾತೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ..."
            : isHi
            ? "खाता सत्यापित! आपके डैशबोर्ड पर पुनर्निर्देशित किया जा रहा है..."
            : "Account verified! Redirecting to your dashboard..."
        );
        window.location.href = "/dashboard";
      } else {
        setRegistrationToken(res.registrationToken);
        setLoading(false);
        setStep("register");
        setNotice(
          isKn
            ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಲು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ."
            : isHi
            ? "मोबाइल नंबर सत्यापित! अपनी प्रोफ़ाइल पूरी करने के लिए अपना नाम दर्ज करें।"
            : "Mobile number verified! Enter your name to complete your profile."
        );
      }
    } else {
      setLoading(false);
      setError(
        res.error ||
          (isKn
            ? "ಅಮಾನ್ಯ ದೃಢೀಕರಣ ಕೋಡ್. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            : isHi
            ? "अमान्य सत्यापन कोड। कृपया जांचें और पुनः प्रयास करें।"
            : "Invalid verification code. Please check and try again.")
      );
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError(
        isKn
          ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ."
          : isHi
          ? "कृपया अपना पूरा नाम दर्ज करें।"
          : "Please enter your full name."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await completeOtpRegistration(registrationToken, cleanName);
    if (res.ok) {
      setNotice(
        isKn
          ? "ಪ್ರೊಫೈಲ್ ರಚಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಕೃಷಿ ಸೆಟಪ್ ಅನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ..."
          : isHi
          ? "प्रोफ़ाइल बनाई गई! आपका डिजिटल फार्म सेटअप शुरू किया जा रहा है..."
          : "Profile created! Launching your digital farm setup..."
      );
      // Launch into 8-step farm onboarding with full-page navigation
      window.location.href = "/onboarding";
    } else {
      setLoading(false);
      setError(
        res.error ||
          (isKn
            ? "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            : isHi
            ? "पंजीकरण विफल। कृपया पुनः प्रयास करें।"
            : "Registration failed. Please try again.")
      );
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
            <span>
              {isKn ? "ಪ್ರತಿ ರೈತರಿಗಾಗಿ ಉಚಿತ ಕೃಷಿ ಇಂಟೆಲಿಜೆನ್ಸ್" : isHi ? "हर किसान के लिए निःशुल्क फार्म इंटेलिजेंस" : "Free Farm Intelligence for Every Kisan"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {isKn ? "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ" : isHi ? "अपना डिजिटल फार्म प्रोफाइल बनाएं" : "Create Your Digital Farm Profile"}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isKn
              ? "ಬೆಳೆ ಬೆಳವಣಿಗೆಯ ಹಂತಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ಎಲೆ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು, ಮಂಡಿ ಆಗಮನಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಲು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಬೆಳೆ ಖರೀದಿದಾರರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಲು KisaanBuddy ಬಳಸುವ ಸಾವಿರಾರು ಭಾರತೀಯ ರೈತರೊಂದಿಗೆ ಸೇರಿ."
              : isHi
              ? "हजारों भारतीय किसानों से जुड़ें जो फसल वृद्धि, पत्ती रोगों के निदान, मंडी आवक की निगरानी और सत्यापित खरीदारों से जुड़ने के लिए KisaanBuddy का उपयोग करते हैं।"
              : "Join thousands of Indian farmers using KisaanBuddy to track field growth stages, diagnose leaf diseases, monitor mandi arrivals, and connect directly with verified harvest buyers."}
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isKn
                  ? "ಗೋಧಿ, ಭತ್ತ, ಹತ್ತಿ, ಸೋಯಾಬೀನ್ ಮತ್ತು ತರಕಾರಿಗಳಿಗೆ ಸೂಕ್ತವಾದ ಬೆಳೆ ಸಲಹೆ"
                  : isHi
                  ? "गेहूं, धान, कपास, सोयाबीन और सब्जियों के लिए अनुकूलित फसल सलाह"
                  : "Tailored crop advice for wheat, paddy, cotton, soybean & vegetables"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isKn
                  ? "ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯವಿದೆ"
                  : isHi
                  ? "हिंदी, अंग्रेजी और क्षेत्रीय भारतीय भाषाओं में उपलब्ध"
                  : "Available in Hindi, English, and regional Indian languages"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isKn
                  ? "AGMARKNET ಮಂಡಿ ದರಗಳು ಮತ್ತು ಸಗಟು FPO ಖರೀದಿದಾರರಿಗೆ ನೇರ ಪ್ರವೇಶ"
                  : isHi
                  ? "AGMARKNET मंडी दरों और थोक FPO खरीदारों तक सीधी पहुंच"
                  : "Direct access to AGMARKNET mandi rates and wholesale FPO buyers"}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Signup Card */}
        <div className="md:col-span-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {step === "phone" && (isKn ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ" : isHi ? "मोबाइल नंबर से शुरू करें" : "Get Started with Mobile Number")}
                {step === "otp" && (isKn ? "OTP ಕೋಡ್ ಪರಿಶೀಲಿಸಿ" : isHi ? "OTP कोड सत्यापित करें" : "Verify OTP Code")}
                {step === "register" && (isKn ? "ನಿಮ್ಮ ಹೆಸರೇನು?" : isHi ? "हम आपको क्या कहें?" : "What should we call you?")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {step === "phone" && (isKn ? "ನಿಮ್ಮ ಫೋನ್‌ಗೆ ನಾವು 6-ಅಂಕಿಯ SMS ದೃಢೀಕರಣ ಕೋಡ್ ಕಳುಹಿಸುತ್ತೇವೆ." : isHi ? "हम आपके फोन पर 6 अंकों का SMS सत्यापन कोड भेजेंगे।" : "We will send a 6-digit SMS verification code to your phone.")}
                {step === "otp" && (isKn ? `+91 ${cleanPhonePreview || phone} ಗೆ ಕೋಡ್ ಕಳುಹಿಸಲಾಗಿದೆ` : isHi ? `+91 ${cleanPhonePreview || phone} पर कोड भेजा गया` : `Code sent to +91 ${cleanPhonePreview || phone}`)}
                {step === "register" && (isKn ? "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಕೃಷಿ ನೋಂದಣಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ." : isHi ? "अपना डिजिटल फार्म पंजीकरण पूरा करने के लिए अपना नाम दर्ज करें।" : "Enter your name to complete your digital farm registration.")}
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
                    {isKn ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *" : isHi ? "मोबाइल नंबर *" : "Mobile Number *"}
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
                    {isKn
                      ? "10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (ಉದಾ. 9876543210)."
                      : isHi
                      ? "10 अंकों का मोबाइल नंबर दर्ज करें (उदा. 9876543210)।"
                      : "Enter standard 10-digit mobile number (e.g. 9876543210)."}
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
                      <span>{isKn ? "ಕೋಡ್ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ..." : isHi ? "कोड भेजा जा रहा है..." : "Sending Code..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isKn ? "ದೃಢೀಕರಣ ಕೋಡ್ ಕಳುಹಿಸಿ" : isHi ? "सत्यापन कोड भेजें" : "Send Verification Code"}</span>
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
                    {isKn ? "6-ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ" : isHi ? "6 अंकों का कोड दर्ज करें" : "Enter 6-Digit Code"}
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
                    {isKn ? "ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ" : isHi ? "नंबर बदलें" : "Change Number"}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.replace(/[^0-9]/g, "").length !== 6}
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>{isKn ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : isHi ? "सत्यापित किया जा रहा है..." : "Verifying..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isKn ? "ಕೋಡ್ ಪರಿಶೀಲಿಸಿ" : isHi ? "कोड सत्यापित करें" : "Verify Code"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Resend OTP Bar */}
                <div className="pt-2 text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-xs text-slate-500 font-medium">
                      {isKn ? "ಕೋಡ್ ಬಂದಿಲ್ಲವೇ? ಇಷ್ಟು ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಮರುಕಳುಹಿಸಿ " : isHi ? "कोड नहीं मिला? फिर से भेजें " : "Didn't receive code? Resend available in "}
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
                      <span>{isKn ? "ದೃಢೀಕರಣ ಕೋಡ್ ಮರುಕಳುಹಿಸಿ" : isHi ? "सत्यापन कोड फिर भेजें" : "Resend Verification Code"}</span>
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
                    {isKn ? "ರೈತರ ಪೂರ್ಣ ಹೆಸರು *" : isHi ? "किसान का पूरा नाम *" : "Farmer Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isKn ? "ಉದಾ. ರಮೇಶ್ ಕುಮಾರ್ ಪಾಟೀಲ್" : isHi ? "उदा. रमेश कुमार पटेल" : "e.g. Ramesh Kumar Patel"}
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
                      <span>{isKn ? "ಪ್ರೊಫೈಲ್ ರಚಿಸಲಾಗುತ್ತಿದೆ..." : isHi ? "प्रोफ़ाइल बनाई जा रही है..." : "Creating Profile..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isKn ? "ಸೆಟಪ್ ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ಕೃಷಿ ಪ್ರಾರಂಭಿಸಿ" : isHi ? "सेटअप पूरा करें और खेती शुरू करें" : "Complete Setup & Start Farming"}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              <span>{isKn ? "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ? " : isHi ? "क्या आपके पास पहले से खाता है? " : "Already have an account? "}</span>
              <Link
                href="/login"
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {isKn ? "ಸೈನ್ ಇನ್ ಮಾಡಿ" : isHi ? "साइन इन करें" : "Sign In"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
