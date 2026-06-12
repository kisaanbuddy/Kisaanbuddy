"use client";

import { useLanguage } from "@/lib/language";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

const localTranslations = {
  en: {
    forgotPassword: "Forgot Password",
    enterEmailText: "Enter your email address to receive a secure password reset link in the console logs.",
    emailLabel: "Email Address",
    sendLinkBtn: "Send Reset Link",
    sending: "Sending...",
    backToLogin: "Back to Sign In",
    successMsg: "Reset link has been generated! Check the FastAPI terminal/console output to retrieve your secure reset link.",
    requiredFields: "Please enter your email address",
    invalidEmail: "Please enter a valid email address",
  },
  hi: {
    forgotPassword: "पासवर्ड भूल गए",
    enterEmailText: "कंसोल लॉग में एक सुरक्षित पासवर्ड रीसेट लिंक प्राप्त करने के लिए अपना ईमेल पता दर्ज करें।",
    emailLabel: "ईमेल पता",
    sendLinkBtn: "रीसेट लिंक भेजें",
    sending: "भेजा जा रहा है...",
    backToLogin: "साइन इन पर वापस जाएं",
    successMsg: "रीसेट लिंक जनरेट हो गया है! अपना सुरक्षित रीसेट लिंक प्राप्त करने के लिए FastAPI टर्मिनल/कंसोल आउटपुट की जाँच करें।",
    requiredFields: "कृपया अपना ईमेल दर्ज करें",
    invalidEmail: "कृपया एक मान्य ईमेल दर्ज करें",
  },
  kn: {
    forgotPassword: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ",
    enterEmailText: "ಕನ್ಸೋಲ್ ಲಾಗ್‌ಗಳಲ್ಲಿ ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಪಡೆಯಲು ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.",
    emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
    sendLinkBtn: "ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಿ",
    sending: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    backToLogin: "ಸೈನ್ ಇನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    successMsg: "ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ರಚಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಸುರಕ್ಷಿತ ಲಿಂಕ್ ಪಡೆಯಲು FastAPI ಟರ್ಮಿನಲ್/ಕನ್ಸೋಲ್ ಪರಿಶೀಲಿಸಿ.",
    requiredFields: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    invalidEmail: "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಇಮೇಲ್ ನಮೂದಿಸಿ",
  }
};

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const { lang } = useLanguage();
  const t = localTranslations[lang as "en" | "hi" | "kn"] || localTranslations.en;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError(t.requiredFields);
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || "Failed to request reset link.");
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
    <div className="flex min-h-[80vh] items-center justify-center px-4 -mt-4 py-8">
      <div className="w-full max-w-md rounded-3xl p-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 shadow-2xl relative animate-fade-in">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-[0.08] pointer-events-none" />

        <div className="relative rounded-[22px] bg-[#040814]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              {t.forgotPassword}
            </h1>
            <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-[320px] leading-relaxed">
              {t.enterEmailText}
            </p>
          </div>

          {/* Messages */}
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
                  <span className="font-bold block text-white mb-1">{t("forgot_password.link_sent_successfully")}</span>
                  <span>{t.successMsg}</span>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full h-11 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t.backToLogin}</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-glow-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t.sending}</span>
                  </>
                ) : (
                  <span>{t.sendLinkBtn}</span>
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{t.backToLogin}</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
