"use client";

import { useLanguage } from "@/lib/language";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Loader2, Sparkles, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth, verifyAndLogin, googleLogin } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1036498725890-example.apps.googleusercontent.com"; // Swappable client ID

const localTranslations = {
  en: {
    welcomeBack: "Welcome Back",
    signInToAccess: "Sign in to access your farm intelligence dashboard",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password?",
    signInBtn: "Sign In",
    signingIn: "Signing In...",
    noAccount: "Don't have an account?",
    signUpFree: "Sign up free",
    orContinueWith: "Or continue with",
    invalidCredentials: "Invalid email or password",
    requiredFields: "Please fill in all fields",
  },
  hi: {
    welcomeBack: "आपका स्वागत है",
    signInToAccess: "अपने फार्म इंटेलिजेंस डैशबोर्ड तक पहुंचने के लिए साइन इन करें",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    rememberMe: "मुझे याद रखें",
    forgotPassword: "पासवर्ड भूल गए?",
    signInBtn: "साइन इन करें",
    signingIn: "साइन इन हो रहा है...",
    noAccount: "खाता नहीं है?",
    signUpFree: "मुफ़्त पंजीकरण करें",
    orContinueWith: "या इसके साथ जारी रखें",
    invalidCredentials: "अमान्य ईमेल या पासवर्ड",
    requiredFields: "कृपया सभी फ़ील्ड भरें",
  },
  kn: {
    welcomeBack: "ಸ್ವಾಗತ",
    signInToAccess: "ನಿಮ್ಮ ಫಾರ್ಮ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ",
    emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
    passwordLabel: "ಪಾಸ್‌ವರ್ಡ್",
    rememberMe: "ನನ್ನನ್ನು ನೆನಪಿನಲ್ಲಿಡು",
    forgotPassword: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    signInBtn: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
    signingIn: "ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...",
    noAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
    signUpFree: "ಉಚಿತವಾಗಿ ನೋಂದಾಯಿಸಿ",
    orContinueWith: "ಅಥವಾ ಇದರೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ",
    invalidCredentials: "ಅಮಾನ್ಯ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್",
    requiredFields: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
  }
};

export default function LoginPage() {
  const { t } = useLanguage()
  const { lang } = useLanguage();
  const t = localTranslations[lang as "en" | "hi" | "kn"] || localTranslations.en;
  const router = useRouter();
  const { user, ready } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  // Handle Google Login Credential Response
  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await googleLogin(response.credential);
      if (res.ok) {
        router.replace("/dashboard");
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "Google Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Render Google Sign-in Button once loaded and ref is available
  useEffect(() => {
    if (googleLoaded && typeof window !== "undefined" && (window as any).google && googleBtnRef.current) {
      try {
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_blue",
          size: "large",
          width: "100%",
          shape: "rectangular",
          text: "signin_with",
        });
      } catch (err) {
        console.error("Failed to initialize Google Sign-in Button", err);
      }
    }
  }, [googleLoaded, googleBtnRef.current]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t.requiredFields);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyAndLogin(email, password);
      if (res.ok) {
        router.replace("/dashboard");
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setGoogleLoaded(true)}
        onError={() => console.error("Google OAuth SDK failed to load")}
      />
      <div className="flex min-h-[80vh] items-center justify-center px-4 -mt-4 py-8">
        <div className="w-full max-w-md rounded-3xl p-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 shadow-2xl relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-[0.08] pointer-events-none" />

          <div className="relative rounded-[22px] bg-[#040814]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold font-display text-white tracking-tight">
                {t.welcomeBack}
              </h1>
              <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-[280px]">
                {t.signInToAccess}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 animate-shake">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={loading}
                    className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 pl-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t.passwordLabel}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1 pb-2 pl-1 select-none">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 h-4 w-4 cursor-pointer focus:outline-none"
                />
                <label
                  htmlFor="remember-me"
                  className="text-xs text-muted-foreground/80 cursor-pointer font-medium hover:text-muted-foreground"
                >
                  {t.rememberMe}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-glow-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t.signingIn}</span>
                  </>
                ) : (
                  <>
                    <span>{t.signInBtn}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="relative my-6 select-none">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                <span className="bg-[#040814]/90 px-3">{t.orContinueWith}</span>
              </div>
            </div>

            {/* Google Login Button Container */}
            <div className="w-full flex justify-center mb-6 overflow-hidden rounded-xl">
              {googleLoaded ? (
                <div ref={googleBtnRef} className="w-full max-h-11 min-h-[40px] flex items-center justify-center" />
              ) : (
                <div className="w-full h-11 border border-white/10 rounded-xl bg-white/[0.01] flex items-center justify-center gap-2 text-xs text-muted-foreground select-none">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/60" />
                  <span>{t("login.loading_google_auth")}</span>
                </div>
              )}
            </div>

            {/* Signup Link */}
            <div className="text-center text-xs text-muted-foreground/85">
              <span>{t.noAccount} </span>
              <Link
                href="/signup"
                className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
              >
                {t.signUpFree}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
