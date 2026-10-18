"use client";

import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth, useAuth, logoutUser } from "@/lib/auth";
import {
  User, Mail, Shield, Calendar, Key, Phone, LogOut,
  ArrowLeft, Activity, MapPin, Sprout, Droplets, Plus, ChevronRight, Loader2
} from "lucide-react";

type Farm = { id: number; name: string; location_text?: string | null; village_name?: string | null; district_name?: string | null; state_name?: string | null };
type Field = { id: number; field_name?: string | null; acreage?: number | null; area_unit?: string | null; soil_type?: string | null; current_crop?: string | null; crop_variety?: string | null; irrigation_type?: string | null; season?: string | null; location_text?: string | null; expected_harvest?: string | null };
type FarmContext = { farms: Farm[]; fields: Field[]; has_farm_context: boolean };

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
  const [farmContext, setFarmContext] = useState<FarmContext | null>(null);
  const [farmLoading, setFarmLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchWithAuth("/api/farmer/context")
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setFarmContext(data); })
      .catch(() => { if (active) setFarmContext(null); })
      .finally(() => { if (active) setFarmLoading(false); });
    return () => { active = false; };
  }, [user]);

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

      {/* Farm profile: pulls the existing authenticated farm context API. */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border bg-[#f4f8f0] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:bg-primary/5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow text-[10px]">{lang === 'hi' ? 'आपके खेत की डिजिटल मेमोरी' : 'Your farm’s digital memory'}</p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-xl">{lang === 'hi' ? 'मेरा फार्म प्रोफाइल' : 'My farm profile'}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lang === 'hi' ? 'खेत, फसल और सिंचाई की जानकारी—ताकि हर सलाह आपके संदर्भ में हो।' : 'Your fields, crops and irrigation context—so every recommendation can be more relevant.'}</p>
            </div>
          </div>
          <Link href="/farmer-profile" className="btn-primary h-10 shrink-0 text-xs shadow-sm">
            {lang === 'hi' ? 'डिजिटल किसान प्रोफाइल खोलें' : 'Open Digital Farmer Profile'} <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="p-5 sm:p-6">
          {farmLoading ? (
            <div className="flex min-h-32 items-center justify-center gap-2 text-xs font-semibold text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" />{lang === 'hi' ? 'फार्म प्रोफाइल लोड हो रही है…' : 'Loading your farm profile…'}</div>
          ) : farmContext?.has_farm_context ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-muted/30 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{lang === 'hi' ? 'फार्म' : 'Farms'}</p><p className="mt-1 text-xl font-bold text-foreground">{farmContext.farms.length}</p></div>
                <div className="rounded-xl border border-border bg-muted/30 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{lang === 'hi' ? 'खेत' : 'Fields'}</p><p className="mt-1 text-xl font-bold text-foreground">{farmContext.fields.length}</p></div>
                <div className="rounded-xl border border-border bg-muted/30 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{lang === 'hi' ? 'वर्तमान फसल' : 'Current crops'}</p><p className="mt-1 text-xl font-bold text-foreground">{farmContext.fields.filter((field) => field.current_crop).length}</p></div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {farmContext.fields.slice(0, 4).map((field) => (
                  <div key={field.id} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-foreground">{field.field_name || (lang === 'hi' ? 'मेरा खेत' : 'My field')}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3 text-primary" />{field.location_text || farmContext.farms[0]?.location_text || (lang === 'hi' ? 'स्थान जोड़ें' : 'Add location')}</p></div><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{field.acreage ? `${field.acreage} ${field.area_unit || 'acre'}` : (lang === 'hi' ? 'आकार जोड़ें' : 'Add area')}</span></div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]"><span className="rounded-lg bg-muted/50 px-2.5 py-2 text-muted-foreground"><Sprout className="mr-1 inline h-3 w-3 text-primary" />{field.current_crop || (lang === 'hi' ? 'फसल जोड़ें' : 'Add crop')}</span><span className="rounded-lg bg-muted/50 px-2.5 py-2 text-muted-foreground"><Droplets className="mr-1 inline h-3 w-3 text-sky-600" />{field.irrigation_type || (lang === 'hi' ? 'सिंचाई जोड़ें' : 'Add irrigation')}</span></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-bold text-foreground">{lang === 'hi' ? 'अपने फार्म से शुरुआत करें' : 'Start with your farm context'}</p><p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">{lang === 'hi' ? 'फसल, जगह और खेत की जानकारी जोड़ें। इससे AI सलाह और भी उपयोगी होगी।' : 'Add your crop, location and field details. It helps the AI give advice that fits your situation.'}</p></div>
              <Link href="/farmer-profile" className="btn-primary h-10 shrink-0 text-xs"><Plus className="h-3.5 w-3.5" />{lang === 'hi' ? 'किसान प्रोफाइल बनाएं' : 'Set Up Farmer Profile'}</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
