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
    providerOtp: "Mobile OTP Verification",
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
    providerOtp: "मोबाइल OTP सत्यापन",
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
    providerOtp: "ಮೊಬೈಲ್ OTP ಪರಿಶೀಲನೆ",
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

  // Auth guard is handled by AuthGate in Providers.tsx — no redirect needed here.

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground font-semibold text-sm">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  // Format initials
  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Filter out placeholder phone numbers
  const isPlaceholderPhone = user.phone_number?.startsWith("google_") || user.phone_number?.startsWith("email_");
  const displayPhone = isPlaceholderPhone ? lt.notProvided : (user.phone_number || lt.notProvided);

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : lt.notProvided;

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      {/* Back button */}
      <div className="mb-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{lt.backToDashboard}</span>
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name || "Profile"}
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-bold font-display text-foreground">
                  {user.name || user.email?.split("@")[0]}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {lt.accountActive}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{lt.farmProfile}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>{lt.logout}</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{lt.personalInfo}</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  {t("profile.email_address")}
                </span>
                <span className="text-foreground font-medium flex items-center gap-2 mt-1 break-all">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.email || lt.notProvided}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  {lt.phone}
                </span>
                <span className="text-foreground font-medium flex items-center gap-2 mt-1">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {displayPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>{t("profile.platform_details")}</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  {lt.role}
                </span>
                <span className="text-foreground font-medium flex items-center gap-2 mt-1 capitalize">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.role || "Farmer / Cultivator"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  {lt.provider}
                </span>
                <span className="text-foreground font-medium flex items-center gap-2 mt-1">
                  <Key className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.provider === "google" ? lt.providerGoogle : user.provider === "phone_otp" ? lt.providerOtp : lt.providerEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Account Timeline */}
          <div className="md:col-span-2 rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  {lt.joinedDate}
                </span>
                <span className="text-xs text-foreground font-medium mt-0.5 block">{joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
