"use client";

import { useLanguage } from "@/lib/language";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, logoutUser } from "@/lib/auth";
import {
  User, Mail, Shield, Calendar, Key, Phone, LogOut,
  ArrowLeft, CheckCircle2, Activity, Clock
} from "lucide-react";

const localTranslations = {
  en: {
    profileTitle: "My Profile",
    farmProfile: "Farm Profile & Intelligence Access",
    personalInfo: "Personal Information",
    role: "User Role",
    joinedDate: "Joined Date",
    provider: "Login Provider",
    phone: "Phone Number",
    logout: "Log Out",
    backToDashboard: "Back to Dashboard",
    providerEmail: "Email & Password",
    providerGoogle: "Google Account",
    notProvided: "Not provided",
    accountActive: "Account Active",
    lastLogin: "Last Login",
    lastSeen: "Last Seen",
  },
  hi: {
    profileTitle: "मेरी प्रोफाइल",
    farmProfile: "कृषि प्रोफाइल और इंटेलिजेंस एक्सेस",
    personalInfo: "व्यक्तिगत जानकारी",
    role: "उपयोगकर्ता की भूमिका",
    joinedDate: "शामिल होने की तिथि",
    provider: "लॉगिन प्रदाता",
    phone: "फ़ोन नंबर",
    logout: "लॉग आउट करें",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    providerEmail: "ईमेल और पासवर्ड",
    providerGoogle: "गूगल खाता",
    notProvided: "प्रदान नहीं किया गया",
    accountActive: "खाता सक्रिय",
    lastLogin: "पिछला लॉगिन",
    lastSeen: "अंतिम बार देखा गया",
  },
  kn: {
    profileTitle: "ನನ್ನ ಪ್ರೊಫೈಲ್",
    farmProfile: "ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಬುದ್ಧಿಮತ್ತೆ ಪ್ರವೇಶ",
    personalInfo: "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ",
    role: "ಬಳಕೆದಾರರ ಪಾತ್ರ",
    joinedDate: "ಸೇರಿದ ದಿನಾಂಕ",
    provider: "ಲಾಗಿನ್ ಒದಗಿಸುವವರು",
    phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
    logout: "ಲಾಗ್ ಔಟ್",
    backToDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    providerEmail: "ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್",
    providerGoogle: "ಗೂಗಲ್ ಖಾತೆ",
    notProvided: "ಒದಗಿಸಲಾಗಿಲ್ಲ",
    accountActive: "ಖಾತೆ ಸಕ್ರಿಯವಾಗಿದೆ",
    lastLogin: "ಕೊನೆಯ ಲಾಗಿನ್",
    lastSeen: "ಕೊನೆಯದಾಗಿ ನೋಡಿದ್ದು",
  }
};

export default function ProfilePage() {
  const { t, lang } = useLanguage();
  const lt = localTranslations[lang as "en" | "hi" | "kn"] || localTranslations.en;
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground font-semibold text-sm">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  // Format initials
  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Filter out the SQLite placeholder phone numbers (e.g. google_xxxx or email_xxxx)
  const isPlaceholderPhone = user.phone_number?.startsWith("google_") || user.phone_number?.startsWith("email_");
  const displayPhone = isPlaceholderPhone ? lt.notProvided : user.phone_number;

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : lt.notProvided;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{lt.backToDashboard}</span>
        </Link>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="w-full rounded-3xl p-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 shadow-2xl relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-[0.05] pointer-events-none" />

        <div className="relative rounded-[22px] bg-[#040814]/90 backdrop-blur-xl border border-white/5 p-6 md:p-10">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name || "Profile"}
                className="h-20 w-20 rounded-full border border-emerald-500/20 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl font-bold shadow-lg shadow-emerald-500/25">
                {initials}
              </div>
            )}

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                <h1 className="text-2xl font-bold font-display text-white truncate">
                  {user.name || user.email?.split("@")[0]}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 select-none">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {lt.accountActive}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/80 mt-1">{lt.farmProfile}</p>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 sm:mt-0 flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold text-red-400 border border-red-500/10 hover:bg-red-500/5 hover:border-red-500/20 transition-all select-none"
            >
              <LogOut className="h-4 w-4" />
              <span>{lt.logout}</span>
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2 pt-8">
            {/* Personal Info Box */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{lt.personalInfo}</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">{t("profile.email_address")}</span>
                  <span className="text-sm text-white font-medium flex items-center gap-2 mt-0.5 break-all">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
                    {user.email || lt.notProvided}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">{lt.phone}</span>
                  <span className="text-sm text-white font-medium flex items-center gap-2 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground/60" />
                    {displayPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Settings Box */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>{t("profile.platform_details")}</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">{lt.role}</span>
                  <span className="text-sm text-white font-medium flex items-center gap-2 mt-0.5">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground/60" />
                    {user.role}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">{lt.provider}</span>
                  <span className="text-sm text-white font-medium flex items-center gap-2 mt-0.5">
                    <Key className="h-3.5 w-3.5 text-muted-foreground/60" />
                    {user.provider === "google" ? lt.providerGoogle : lt.providerEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Joined Info & Metadata */}
            <div className="md:col-span-2 rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">{lt.joinedDate}</span>
                    <span className="text-sm text-white font-semibold">{joinedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-muted-foreground">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">{t("profile.last_seen")}</span>
                    <span className="text-sm text-white font-semibold">
                      {user.last_seen_at
                        ? new Date(user.last_seen_at).toLocaleTimeString(lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) + " " + new Date(user.last_seen_at).toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : lt.notProvided}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
