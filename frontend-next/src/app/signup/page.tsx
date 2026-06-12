"use client";

import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth, registerUser } from "@/lib/auth";

const localTranslations = {
  en: {
    createAccount: "Create Account",
    joinKrishiAI: "Join KrishiAI to unlock premium farming insights",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    signUpBtn: "Create Account",
    signingUp: "Creating Account...",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
    passwordsDoNotMatch: "Passwords do not match",
    requiredFields: "Please fill in all fields",
    invalidEmail: "Please enter a valid email address",
    passwordTooShort: "Password must be at least 4 characters",
    strengthWeak: "Weak password",
    strengthFair: "Fair password",
    strengthGood: "Good password",
    strengthStrong: "Strong password",
  },
  hi: {
    createAccount: "खाता बनाएं",
    joinKrishiAI: "प्रीमियम कृषि जानकारी अनलॉक करने के लिए KrishiAI से जुड़ें",
    nameLabel: "पूरा नाम",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    signUpBtn: "खाता बनाएं",
    signingUp: "खाता बनाया जा रहा है...",
    alreadyHaveAccount: "पहले से ही एक खाता है?",
    signIn: "साइन इन करें",
    passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते",
    requiredFields: "कृपया सभी फ़ील्ड भरें",
    invalidEmail: "कृपया एक मान्य ईमेल पता दर्ज करें",
    passwordTooShort: "पासवर्ड कम से कम 4 अक्षरों का होना चाहिए",
    strengthWeak: "कमजोर पासवर्ड",
    strengthFair: "सामान्य पासवर्ड",
    strengthGood: "अच्छा पासवर्ड",
    strengthStrong: "मजबूत पासवर्ड",
  },
  kn: {
    createAccount: "ಖಾತೆ ತೆರೆಯಿರಿ",
    joinKrishiAI: "ಪ್ರೀಮಿಯಂ ಕೃಷಿ ಒಳನೋಟಗಳನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಲು KrishiAI ಸೇರಿ",
    nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
    emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
    passwordLabel: "ಪಾಸ್‌ವರ್ಡ್",
    confirmPasswordLabel: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    signUpBtn: "ಖಾತೆ ರಚಿಸಿ",
    signingUp: "ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    alreadyHaveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?",
    signIn: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
    passwordsDoNotMatch: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
    requiredFields: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
    invalidEmail: "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ",
    passwordTooShort: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳಿರಬೇಕು",
    strengthWeak: "ದುರ್ಬಲ ಪಾಸ್‌ವರ್ಡ್",
    strengthFair: "ಸಾಧಾರಣ ಪಾಸ್‌ವರ್ಡ್",
    strengthGood: "ಉತ್ತಮ ಪಾಸ್‌ವರ್ಡ್",
    strengthStrong: "ಬಲಿಷ್ಠ ಪಾಸ್‌ವರ್ಡ್",
  }
};

export default function SignupPage() {
  const { t } = useLanguage()
  const { lang } = useLanguage();
  const t = localTranslations[lang as "en" | "hi" | "kn"] || localTranslations.en;
  const router = useRouter();
  const { user, ready } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Strength State
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("");
  const [strengthColor, setStrengthColor] = useState("bg-red-500");

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  // Track Password Strength
  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthLabel("");
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(score);

    if (score <= 1) {
      setStrengthLabel(t.strengthWeak);
      setStrengthColor("bg-red-500 w-1/4");
    } else if (score === 2) {
      setStrengthLabel(t.strengthFair);
      setStrengthColor("bg-amber-500 w-2/4");
    } else if (score === 3) {
      setStrengthLabel(t.strengthGood);
      setStrengthColor("bg-emerald-400 w-3/4");
    } else {
      setStrengthLabel(t.strengthStrong);
      setStrengthColor("bg-emerald-500 w-full");
    }
  }, [password, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError(t.requiredFields);
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError(t.invalidEmail);
      return;
    }
    if (password.length < 4) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await registerUser(email, password, name);
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
    <div className="flex min-h-[85vh] items-center justify-center px-4 -mt-4 py-8">
      <div className="w-full max-w-md rounded-3xl p-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 shadow-2xl relative animate-fade-in">
        {/* Subtle Ambient Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-[0.08] pointer-events-none" />

        <div className="relative rounded-[22px] bg-[#040814]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              {t.createAccount}
            </h1>
            <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-[280px]">
              {t.joinKrishiAI}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">
                {t.nameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("signup.rahul_kumar")}
                  disabled={loading}
                  className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

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
                  placeholder="rahul@example.com"
                  disabled={loading}
                  className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">
                {t.passwordLabel}
              </label>
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2.5 px-1 animate-fade-in">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                    <span>{t("signup.password_strength")}</span>
                    <span className="text-emerald-400">{strengthLabel}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strengthColor}`} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">
                {t.confirmPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-glow-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none pt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.signingUp}</span>
                </>
              ) : (
                <>
                  <span>{t.signUpBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-white/5" />

          {/* Signin Link */}
          <div className="text-center text-xs text-muted-foreground/85">
            <span>{t.alreadyHaveAccount} </span>
            <Link
              href="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
            >
              {t.signIn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
