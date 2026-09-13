"use client";

import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, Phone, AlertCircle, AlertTriangle, ArrowRight, Check, RefreshCw } from "lucide-react";
import { useAuth, sendOtp, verifyOtp, completeOtpRegistration, verifyAndLogin } from "@/lib/auth";
import { OtpInput } from "@/components/auth/OtpInput";

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
  const [notice, setNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registrationToken, setRegistrationToken] = useState("");
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    const fakeNumbers = [
      "0000000000",
      "1111111111",
      "2222222222",
      "3333333333",
      "4444444444",
      "5555555555",
      "1234567890"
    ];
    if (!indianPhoneRegex.test(cleanPhone) || fakeNumbers.includes(cleanPhone)) {
      setError(t("ui.auth.invalid_phone"));
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
      setNotice(t("ui.auth.otp_sent"));
    } else {
      setError(res.error || t("ui.auth.otp_send_failed"));
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    const res = await sendOtp(phone);
    setLoading(false);
    if (res.ok) {
      setResendCooldown(res.resendAfter || 30);
      setNotice(t("ui.auth.otp_resent"));
    } else {
      setError(res.error || t("ui.auth.otp_resend_failed"));
    }
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
    setNotice(null);

    const res = await verifyOtp(phone, cleanOtp);
    if (res.ok) {
      // Keep loading=true during navigation — prevents the form from briefly
      // re-enabling and allows another submit before the new page lands.
      if (res.registered) {
        window.location.href = res.user.role === "Admin" ? "/admin" : "/dashboard";
      } else {
        setRegistrationToken(res.registrationToken);
        setLoading(false);
        setStep("register");
      }
    } else {
      setLoading(false);
      setError(res.error || t("ui.auth.otp_incorrect"));
    }
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
    setNotice(null);

    const res = await completeOtpRegistration(registrationToken, cleanName);
    if (res.ok) {
      window.location.href = res.user?.role === "Admin" ? "/admin" : "/dashboard";
    } else {
      setLoading(false);
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    const res = await verifyAndLogin(email, password);
    if (res.ok) {
      const isFounder = ["aditya@kisaanbuddy.com", "utkarsh@kisaanbuddy.com", "yash@kisaanbuddy.com", "admin@kisaanbuddy.com"].includes(email.trim().toLowerCase());
      window.location.href = (res.user?.role === "Admin" || isFounder) ? "/admin" : "/dashboard";
    } else {
      setLoading(false);
      setError(res.error || "Invalid email or password.");
    }
  };

  const isLocked = error?.toLowerCase().includes("lock") || error?.toLowerCase().includes("too many");

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            {lt.welcomeBack}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
            {authMode === "password"
              ? "Sign in with your Email & Password (Founders / Admin / Users)"
              : step === "phone"
              ? lt.signInToAccess
              : step === "otp"
              ? `${lt.otpLabel} sent to +91 ${phone.substring(0, 2)}******${phone.substring(8, 10)}`
              : lt.namePlaceholder}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted/60 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              authMode === "otp"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📱 Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              authMode === "password"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔑 Email & Password
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div
            className={`mb-5 flex items-start gap-2.5 rounded-xl p-3 text-xs ${
              isLocked
                ? "border border-destructive/30 bg-destructive/10 text-destructive"
                : "border border-destructive/20 bg-destructive/5 text-destructive"
            }`}
            role="alert"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            className="mb-5 rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-center text-xs font-medium text-primary"
            role="status"
          >
            {notice}
          </div>
        )}

        {/* Option A: Email & Password Login */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aditya@kisaanbuddy.com"
                disabled={loading}
                className="input-base h-11"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="input-base h-11"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 gap-2 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin / User</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Option B: Mobile OTP Form */}
        {authMode === "otp" && step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {lt.phoneLabel}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground/70" />
                  <span className="text-xs font-semibold text-foreground border-r border-border pr-2">
                    +91
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder={lt.phonePlaceholder}
                  disabled={loading}
                  className="w-full h-11 rounded-lg border border-border bg-background pl-[78px] pr-4 text-sm font-medium font-mono text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 gap-2 text-sm font-semibold"
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

        {/* Step 2: OTP Verification Form */}
        {authMode === "otp" && step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {lt.otpPlaceholder}
              </label>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => { setStep("phone"); setError(null); }}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 font-medium"
              >
                ← {t("ui.auth.change_phone")}
              </button>

              {resendCooldown > 0 ? (
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                  {t("ui.auth.resend_in").replace("{seconds}", String(resendCooldown))}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-primary hover:underline font-semibold transition-colors disabled:opacity-50"
                >
                  {t("ui.auth.resend_otp")}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 gap-2 text-sm font-semibold"
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

        {/* Step 3: Registration Form (For first-time phone numbers) */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {lt.nameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lt.namePlaceholder}
                disabled={loading}
                className="input-base h-11"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 gap-2 text-sm font-semibold"
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
  );
}
