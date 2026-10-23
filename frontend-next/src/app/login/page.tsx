"use client";

import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Sparkles,
  Phone,
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  AlertTriangle,
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  KeyRound,
  User as UserIcon,
  UserPlus,
  LogIn,
} from "lucide-react";
import {
  useAuth,
  sendOtp,
  verifyOtp,
  completeOtpRegistration,
  verifyAndLogin,
  registerUser,
} from "@/lib/auth";
import { OtpInput } from "@/components/auth/OtpInput";
import { fadeDown } from "@/lib/motion";

function postLoginPath(role?: string) {
  if (role === "Admin") return "/admin";
  if (typeof window === "undefined") return "/dashboard";
  const next = new URLSearchParams(window.location.search).get("next");
  // Only permit an in-app relative path; never make login an open redirect.
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default function LoginPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
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
  
  // Auth Modes: OTP vs Email
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
  
  // Email Submode: Login vs Register
  const [emailSubMode, setEmailSubMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Translations
  const isHi = lang === "hi";
  const isKn = lang === "kn";

  const labels = {
    title: isHi ? "किसान लॉगिन व खाता" : isKn ? "ರೈತರ ಲಾಗಿನ್ & ಖಾತೆ" : "Farmer Login & Account",
    subtitle: isHi
      ? "मोबाइल OTP या ईमेल पासवर्ड से आसानी से लॉगिन या नया खाता बनाएं"
      : isKn
      ? "ಮೊಬೈಲ್ OTP ಅಥವಾ ಇಮೇಲ್ ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ"
      : "Sign in with mobile OTP or email, or create a new account in seconds.",
    phoneTab: isHi ? "मोबाइल OTP" : isKn ? "ಮೊಬೈಲ್ OTP" : "Mobile OTP",
    passwordTab: isHi ? "ईमेल से एक्सेस" : isKn ? "ಇಮೇಲ್ ಪ್ರವೇಶ" : "Email Access",
    phonePlaceholder: isHi ? "10 अंकों का मोबाइल नंबर" : isKn ? "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : "Enter 10-digit mobile number",
    sendOtpBtn: isHi ? "OTP भेजें" : isKn ? "OTP ಕಳುಹಿಸಿ" : "Send Login OTP",
    sending: isHi ? "OTP भेजा जा रहा है..." : isKn ? "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ..." : "Sending OTP...",
    verifyBtn: isHi ? "सत्यापित करें और आगे बढ़ें" : isKn ? "ದೃಢೀಕರಿಸಿ ಮುಂದುವರಿಯಿರಿ" : "Verify & Open Farm",
    verifying: isHi ? "सत्यापित हो रहा है..." : isKn ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Verifying code...",
    otpSentTo: isHi ? "OTP इस नंबर पर भेजा गया:" : isKn ? "OTP ಕಳುಹಿಸಲಾದ ಸಂಖ್ಯೆ:" : "6-digit OTP sent to",
    changeNumber: isHi ? "नंबर बदलें" : isKn ? "ಸಂಖ್ಯೆ ಬದಲಿಸಿ" : "Change number",
    resend: isHi ? "OTP पुनः भेजें" : isKn ? "ಮತ್ತೆ ಕಳುಹಿಸಿ" : "Resend OTP",
    resendIn: isHi ? "सेकंड बाद पुनः भेजें" : isKn ? "ಸೆಕೆಂಡುಗಳ ನಂತರ" : "Resend in",
    namePrompt: isHi ? "आपका शुभ नाम" : isKn ? "ನಿಮ್ಮ ಹೆಸರು" : "Your Full Name",
    namePlaceholder: isHi ? "उदा. रमेश कुमार" : isKn ? "ಉದಾ. ರಮೇಶ್ ಕುಮಾರ್" : "e.g. Ramesh Kumar",
    completeReg: isHi ? "प्रोफाइल बनाएं व शुरू करें" : isKn ? "ಖಾತೆ ತೆರೆಯಿರಿ" : "Complete & Enter Dashboard",
    trustSecure: isHi ? "100% सुरक्षित और निःशुल्क" : isKn ? "100% ಸುರಕ್ಷಿತ & ಉಚಿತ" : "100% Secure & Free for Farmers",
    trustEnam: isHi ? "अधिकृत e-NAM व कृषि गेटवे" : isKn ? "ಅಧಿಕೃತ e-NAM ಕೃಷಿ ವೇದಿಕೆ" : "Official e-NAM & APMC Connected",
  };

  // Only redirect if the session was already valid BEFORE the user reached this page
  useEffect(() => {
    if (ready && user) {
      window.location.replace(postLoginPath(user.role));
    }
  }, [ready, user]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    const fakeNumbers = [
      "0000000000",
      "1111111111",
      "2222222222",
      "3333333333",
      "4444444444",
      "5555555555",
      "1234567890",
    ];
    if (!indianPhoneRegex.test(cleanPhone) || fakeNumbers.includes(cleanPhone)) {
      setError(
        isHi
          ? "कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)।"
          : "Please enter a valid 10-digit Indian mobile number starting with 6-9."
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
      setResendCooldown(30);
      setNotice(
        isHi
          ? `+91 ${cleanPhone} पर 6-अंकों का OTP भेजा गया है।`
          : `6-digit OTP sent to +91 ${cleanPhone}.`
      );
    } else {
      setError(res.error || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalOtp = codeToVerify || otp;
    if (!finalOtp || finalOtp.length !== 6) {
      setError(isHi ? "कृपया 6 अंकों का OTP दर्ज करें।" : "Please enter the full 6-digit OTP code.");
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await verifyOtp(cleanPhone, finalOtp);

    if (res.ok) {
      if (!res.registered) {
        setRegistrationToken(res.registrationToken);
        setStep("register");
        setLoading(false);
      } else {
        // Full page reload committed to browser cookie jar
        window.location.href = postLoginPath(res.user?.role);
      }
    } else {
      setLoading(false);
      setError(
        res.error || (isHi ? "गलत OTP कोड। कृपया पुनः प्रयास करें।" : "Incorrect OTP code. Please check and try again.")
      );
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isHi ? "कृपया अपना नाम दर्ज करें।" : "Please enter your full name.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await completeOtpRegistration(registrationToken, name.trim());
    if (res.ok) {
      window.location.href = postLoginPath(res.user?.role);
    } else {
      setLoading(false);
      setError(res.error || "Failed to complete registration.");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isHi ? "कृपया ईमेल और पासवर्ड दोनों दर्ज करें।" : "Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    const res = await verifyAndLogin(email, password);
    if (res.ok) {
      window.location.href = postLoginPath(res.user.role);
    } else {
      setLoading(false);
      setError(res.error || (isHi ? "अमान्य ईमेल या पासवर्ड। यदि नया खाता बनाना है तो नीचे 'रजिस्टर करें' चुनें।" : "Invalid email or password. If you are new, click 'Register with Email' below."));
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError(isHi ? "कृपया एक वैध ईमेल पता दर्ज करें।" : "Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 8) {
      setError(
        isHi
          ? "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।"
          : "Password must be at least 8 characters long."
      );
      return;
    }
    if (password !== regConfirmPassword) {
      setError(isHi ? "दोनों पासवर्ड मेल नहीं खाते हैं।" : "Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await registerUser(
      cleanEmail,
      password,
      regName.trim() || undefined,
      regPhone.trim() || undefined
    );

    if (res.ok) {
      window.location.href = postLoginPath((res as any).user?.role);
    } else {
      setLoading(false);
      setError(
        res.error || (isHi ? "रजिस्ट्रेशन असफल रहा। कृपया पुनः प्रयास करें।" : "Registration failed. Please try again.")
      );
    }
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const isLocked =
    error?.toLowerCase().includes("lock") || error?.toLowerCase().includes("too many");

  // Loading session check
  if (!ready || user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F7F9F4]/90 dark:bg-stone-950/90 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
          <Loader2 className="h-6 w-6 animate-spin text-[#27834A]" />
          <span className="text-xs font-bold text-[#174B35] dark:text-stone-200">
            {user ? "Opening your farm dashboard…" : "Verifying secure session…"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-stone-950/60 backdrop-blur-md">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#27834A]/25 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#F2B84B]/20 blur-[100px] pointer-events-none" />

      {/* Floating Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="relative w-full max-w-md sm:max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_24px_70px_rgba(23,75,53,0.18)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.7)] overflow-hidden my-auto"
      >
        {/* Top Decorative Agrarian Header Bar */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-[#174B35] to-[#27834A] text-white">
          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold text-emerald-100 mb-2.5 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#78B957] animate-pulse" />
            <span>KisaanBuddy Secure Portal</span>
          </div>

          <h2 className="text-2xl sm:text-[26px] font-black text-white tracking-tight leading-tight">
            {labels.title}
          </h2>

          <p className="text-xs sm:text-[13px] text-emerald-50/85 mt-1 leading-relaxed">
            {labels.subtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Advanced Tab Switcher (Mobile OTP vs Email) */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60 text-xs font-bold relative">
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setError(null);
                setNotice(null);
              }}
              className={`relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors ${
                authMode === "otp"
                  ? "text-[#174B35] dark:text-white"
                  : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{labels.phoneTab}</span>
              {authMode === "otp" && (
                <motion.div
                  layoutId="activeLoginTab"
                  className="absolute inset-0 bg-white dark:bg-stone-700 rounded-xl shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setError(null);
                setNotice(null);
              }}
              className={`relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors ${
                authMode === "password"
                  ? "text-[#174B35] dark:text-white"
                  : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{labels.passwordTab}</span>
              {authMode === "password" && (
                <motion.div
                  layoutId="activeLoginTab"
                  className="absolute inset-0 bg-white dark:bg-stone-700 rounded-xl shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          </div>

          {/* Status Feedback Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="err"
                variants={fadeDown}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                  isLocked
                    ? "border border-red-300 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    : "border border-red-200 bg-red-50/90 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                }`}
                role="alert"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span className="leading-snug">{error}</span>
              </motion.div>
            )}

            {notice && (
              <motion.div
                key="note"
                variants={fadeDown}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-3 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2"
                role="status"
              >
                <CheckCircle2 className="h-4 w-4 text-[#27834A] shrink-0" />
                <span>{notice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================================================== */}
          {/* FLOW A: MOBILE PHONE + OTP                              */}
          {/* ======================================================== */}
          {authMode === "otp" && (
            <div className="space-y-4">
              {/* STEP 1: Phone Entry */}
              {step === "phone" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300 flex items-center justify-between">
                      <span>{isHi ? "मोबाइल नंबर" : "Mobile Phone Number"}</span>
                      <span className="text-[11px] text-stone-500 font-normal">
                        {phone.replace(/\D/g, "").length}/10 {isHi ? "अंक" : "digits"}
                      </span>
                    </label>

                    {/* Styled Phone Input with Indian Flag Badge */}
                    <div className="relative flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus-within:border-[#27834A] focus-within:ring-2 focus-within:ring-[#27834A]/20 transition-all overflow-hidden shadow-2xs">
                      <div className="flex items-center gap-1.5 px-3.5 py-3 bg-stone-100/90 dark:bg-stone-700/80 border-r border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 select-none">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                          setPhone(val);
                          if (error) setError(null);
                        }}
                        placeholder={labels.phonePlaceholder}
                        disabled={loading}
                        className="w-full px-3.5 py-3 text-sm font-semibold tracking-wider text-stone-900 dark:text-white placeholder-stone-400 bg-transparent outline-none"
                        autoFocus
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.replace(/\D/g, "").length !== 10}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#174B35] hover:bg-[#27834A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-[#174B35]/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{labels.sending}</span>
                      </>
                    ) : (
                      <>
                        <span>{labels.sendOtpBtn}</span>
                        <ArrowRight className="w-4 h-4 text-[#78B957]" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: 6-Digit OTP Verification */}
              {step === "otp" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 block text-[11px] font-medium">
                        {labels.otpSentTo}
                      </span>
                      <span className="font-bold text-[#174B35] dark:text-white text-sm tracking-wide">
                        +91 {phone}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#27834A] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                    >
                      {labels.changeNumber}
                    </button>
                  </div>

                  {/* 6 Individual OTP Boxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300 block text-center">
                      {isHi ? "6 अंकों का OTP दर्ज करें" : "Enter 6-digit OTP code"}
                    </label>
                    <OtpInput
                      value={otp}
                      onChange={(val) => {
                        setOtp(val);
                        if (error) setError(null);
                      }}
                      onComplete={(val) => handleVerifyOtp(val)}
                      disabled={loading}
                    />
                  </div>

                  {/* Verify Action Button */}
                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otp.length !== 6}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#174B35] hover:bg-[#27834A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-[#174B35]/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{labels.verifying}</span>
                      </>
                    ) : (
                      <>
                        <span>{labels.verifyBtn}</span>
                        <Check className="w-4 h-4 text-[#78B957]" />
                      </>
                    )}
                  </button>

                  {/* Resend Cooldown Counter */}
                  <div className="text-center pt-1 text-xs">
                    {resendCooldown > 0 ? (
                      <span className="text-stone-500 font-medium">
                        {labels.resendIn}{" "}
                        <span className="font-mono font-bold text-[#174B35] dark:text-emerald-400">
                          {resendCooldown}s
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 font-bold text-[#27834A] hover:underline"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{labels.resend}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Complete Name Registration (First-time phone number) */}
              {step === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-[#174B35] dark:text-emerald-200">
                    <p className="font-bold">
                      {isHi ? "स्वागत है! आपकी प्रोफाइल पूरी करें" : "Welcome! Please enter your name to finish setup"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300">
                      {labels.namePrompt}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={labels.namePlaceholder}
                      disabled={loading}
                      className="w-full px-3.5 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-semibold text-stone-900 dark:text-white placeholder-stone-400 focus:border-[#27834A] focus:ring-2 focus:ring-[#27834A]/20 outline-none"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#174B35] hover:bg-[#27834A] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{labels.verifying}</span>
                      </>
                    ) : (
                      <>
                        <span>{labels.completeReg}</span>
                        <ArrowRight className="w-4 h-4 text-[#78B957]" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* FLOW B: EMAIL ACCESS (Login OR Register with Email)     */}
          {/* ======================================================== */}
          {authMode === "password" && (
            <div className="space-y-4">
              {/* Sub-mode switcher (Sign In vs Register with Email) */}
              <div className="flex items-center justify-between p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setEmailSubMode("login");
                    setError(null);
                    setNotice(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                    emailSubMode === "login"
                      ? "bg-white dark:bg-stone-700 text-[#174B35] dark:text-white shadow-xs font-bold"
                      : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  {isHi ? "लॉगिन करें" : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailSubMode("register");
                    setError(null);
                    setNotice(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                    emailSubMode === "register"
                      ? "bg-white dark:bg-stone-700 text-[#174B35] dark:text-white shadow-xs font-bold"
                      : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  {isHi ? "ईमेल से रजिस्टर करें" : "Register with Email"}
                </button>
              </div>

              {/* Sub-mode 1: Sign In with Email & Password */}
              {emailSubMode === "login" && (
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300">
                      {isHi ? "ईमेल पता" : "Email Address"}
                    </label>
                    <div className="relative flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus-within:border-[#27834A] focus-within:ring-2 focus-within:ring-[#27834A]/20 transition-all overflow-hidden">
                      <div className="pl-3.5 pr-2 text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        disabled={loading}
                        className="w-full pr-3.5 py-3 text-sm font-semibold text-stone-900 dark:text-white placeholder-stone-400 bg-transparent outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300">
                        {isHi ? "पासवर्ड" : "Password"}
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-[11px] font-bold text-[#27834A] hover:underline"
                      >
                        {isHi ? "पासवर्ड भूल गए?" : "Forgot password?"}
                      </Link>
                    </div>

                    <div className="relative flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus-within:border-[#27834A] focus-within:ring-2 focus-within:ring-[#27834A]/20 transition-all overflow-hidden">
                      <div className="pl-3.5 pr-2 text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className="w-full pr-10 py-3 text-sm font-semibold text-stone-900 dark:text-white placeholder-stone-400 bg-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#174B35] hover:bg-[#27834A] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#174B35]/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{isHi ? "साइन इन हो रहा है..." : "Signing in..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isHi ? "पासवर्ड से साइन इन करें" : "Sign In with Password"}</span>
                        <ArrowRight className="w-4 h-4 text-[#78B957]" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-stone-500">
                      {isHi ? "नया खाता बनाना है?" : "Don't have an account yet?"}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setEmailSubMode("register");
                          setError(null);
                        }}
                        className="font-bold text-[#27834A] hover:underline cursor-pointer"
                      >
                        {isHi ? "ईमेल से रजिस्टर करें" : "Register with Email"}
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* Sub-mode 2: Create Account / Register with Email */}
              {emailSubMode === "register" && (
                <form onSubmit={handleEmailRegister} className="space-y-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-[#174B35] dark:text-emerald-200 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 shrink-0 text-[#27834A]" />
                    <span className="font-semibold">
                      {isHi ? "ईमेल से नया खाता बनाएं — सभी किसानों के लिए निःशुल्क" : "Create your free KisaanBuddy account with email"}
                    </span>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300">
                      {isHi ? "पूरा नाम" : "Full Name"}
                    </label>
                    <div className="relative flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus-within:border-[#27834A] focus-within:ring-2 focus-within:ring-[#27834A]/20 transition-all overflow-hidden">
                      <div className="pl-3.5 pr-2 text-stone-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={isHi ? "उदा. रमेश कुमार" : "e.g. Ramesh Kumar"}
                        disabled={loading}
                        className="w-full pr-3.5 py-2.5 text-sm font-semibold text-stone-900 dark:text-white placeholder-stone-400 bg-transparent outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300">
                      {isHi ? "ईमेल पता" : "Email Address"}
                    </label>
                    <div className="relative flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus-within:border-[#27834A] focus-within:ring-2 focus-within:ring-[#27834A]/20 transition-all overflow-hidden">
                      <div className="pl-3.5 pr-2 text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        disabled={loading}
                        className="w-full pr-3.5 py-2.5 text-sm font-semibold text-stone-900 dark:text-white placeholder-stone-400 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300">
                        {isHi ? "पासवर्ड (कम से कम 8 अक्षर)" : "Password (min 8 chars)"}
                      </label>
                      <div className="relative flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus-within:border-[#27834A] focus-within:ring-2 focus-within:ring-[#27834A]/20 transition-all overflow-hidden">
                        <div className="pl-3 pr-1 text-stone-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={loading}
                          className="w-full pr-8 py-2.5 text-sm font-semibold text-stone-900 dark:text-white placeholder-stone-400 bg-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300">
                        {isHi ? "पासवर्ड दोबारा लिखें" : "Confirm Password"}
                      </label>
                      <div className="relative flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus-within:border-[#27834A] focus-within:ring-2 focus-within:ring-[#27834A]/20 transition-all overflow-hidden">
                        <div className="pl-3 pr-1 text-stone-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={loading}
                          className="w-full pr-3 py-2.5 text-sm font-semibold text-stone-900 dark:text-white placeholder-stone-400 bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1D2B22] dark:text-stone-300 flex items-center justify-between">
                      <span>{isHi ? "मोबाइल नंबर (वैकल्पिक)" : "Phone Number (Optional)"}</span>
                      <span className="text-[10px] text-stone-500 font-normal">For SMS mandi alerts</span>
                    </label>
                    <div className="relative flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus-within:border-[#27834A] focus-within:ring-2 focus-within:ring-[#27834A]/20 transition-all overflow-hidden">
                      <div className="flex items-center gap-1 px-3 py-2.5 bg-stone-100/90 dark:bg-stone-700/80 border-r border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 select-none">
                        <span>🇮🇳 +91</span>
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        disabled={loading}
                        className="w-full px-3 py-2.5 text-sm font-semibold text-stone-900 dark:text-white placeholder-stone-400 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Register Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !email || password.length < 8 || password !== regConfirmPassword || !regName.trim()}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#174B35] hover:bg-[#27834A] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#174B35]/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{isHi ? "खाता बन रहा है..." : "Creating Account..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isHi ? "खाता बनाएं और प्रवेश करें" : "Create Account & Enter Farm"}</span>
                        <ArrowRight className="w-4 h-4 text-[#78B957]" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-stone-500">
                      {isHi ? "पहले से खाता है?" : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setEmailSubMode("login");
                          setError(null);
                        }}
                        className="font-bold text-[#27834A] hover:underline cursor-pointer"
                      >
                        {isHi ? "लॉगिन करें" : "Sign In"}
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bottom Trust & Security Pill Strip */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#27834A]" />
              <span>{labels.trustSecure}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#27834A]" />
              <span>{labels.trustEnam}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
