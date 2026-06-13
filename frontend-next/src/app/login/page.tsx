"use client";

import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, User, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";

const localTranslations = {
  en: {
    welcomeBack: "Welcome to KrishiAI",
    signInToAccess: "Enter your name to access your farming dashboard",
    nameLabel: "Your Name",
    signInBtn: "Enter Dashboard",
    signingIn: "Entering...",
  },
  hi: {
    welcomeBack: "KrishiAI में आपका स्वागत है",
    signInToAccess: "अपने कृषि डैशबोर्ड तक पहुँचने के लिए अपना नाम दर्ज करें",
    nameLabel: "आपका नाम",
    signInBtn: "डैशबोर्ड में प्रवेश करें",
    signingIn: "प्रवेश कर रहे हैं...",
  },
  kn: {
    welcomeBack: "KrishiAI ಗೆ ಸ್ವಾಗತ",
    signInToAccess: "ನಿಮ್ಮ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಲು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    nameLabel: "ನಿಮ್ಮ ಹೆಸರು",
    signInBtn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಿ",
    signingIn: "ಪ್ರವೇಶಿಸಲಾಗುತ್ತಿದೆ...",
  }
};

export default function LoginPage() {
  const { t, lang } = useLanguage();
  const lt = localTranslations[lang as "en" | "hi" | "kn"] || localTranslations.en;
  const router = useRouter();
  const { user, ready } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError(
        lang === "hi"
          ? "कृपया अपना नाम दर्ज करें"
          : lang === "kn"
          ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ"
          : "Please enter your name"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a local session with the entered name
      const sessionUser = {
        id: Date.now(),
        email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@krishiai.com`,
        name: cleanName,
        phone_number: "not_provided",
        role: "Farmer",
        provider: "email",
        created_at: new Date().toISOString()
      };
      
      // Save session locally
      if (typeof window !== "undefined") {
        window.localStorage.setItem("krishi_user", JSON.stringify(sessionUser));
        window.localStorage.setItem("krishi_token", "mock_token_" + Date.now());
        window.dispatchEvent(new Event("krishi-auth-change"));
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 -mt-4 py-8">
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
              {lt.welcomeBack}
            </h1>
            <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-[280px]">
              {lt.signInToAccess}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">
                {lt.nameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    lang === "hi"
                      ? "अपना नाम यहाँ लिखें"
                      : lang === "kn"
                      ? "ನಿಮ್ಮ ಹೆಸರನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ"
                      : "Enter your name here"
                  }
                  disabled={loading}
                  className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
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
                  <span>{lt.signingIn}</span>
                </>
              ) : (
                <>
                  <span>{lt.signInBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
