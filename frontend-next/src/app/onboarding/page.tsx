"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Sparkles,
  RotateCw,
  Globe,
  Wheat,
  Home,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  useLanguage,
  SELECTABLE_LANGS,
  LANG_NAMES,
  LANG_DETAILS,
  Lang,
} from "@/lib/language";
import { farmerProfileApi } from "@/lib/farmer-api";

const COMMON_CROPS = [
  { id: "Wheat", hi: "गेहूं", kn: "ಗೋಧಿ", icon: "🌾" },
  { id: "Rice", hi: "धान (चावल)", kn: "ಭತ್ತ (ಅಕ್ಕಿ)", icon: "🌾" },
  { id: "Cotton", hi: "कपास", kn: "ಹತ್ತಿ", icon: "🌱" },
  { id: "Soybean", hi: "सोयाबीन", kn: "ಸೋಯಾಬೀನ್", icon: "🌿" },
  { id: "Mustard", hi: "सरसों", kn: "ಸಾಸಿವೆ", icon: "🌼" },
  { id: "Maize", hi: "मक्का", kn: "ಮೆಕ್ಕೆಜೋಳ", icon: "🌽" },
  { id: "Potato", hi: "आलू", kn: "ಆಲೂಗಡ್ಡೆ", icon: "🥔" },
  { id: "Tomato", hi: "टमाटर", kn: "ಟೊಮೆಟೊ", icon: "🍅" },
  { id: "Sugarcane", hi: "गन्ना", kn: "ಕಬ್ಬು", icon: "🎋" },
  { id: "Onion", hi: "प्याज", kn: "ಈರುಳ್ಳಿ", icon: "🧅" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();

  // 4 guided steps
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedLang, setSelectedLang] = useState<Lang>(
    (lang as Lang) || "hi"
  );
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLon, setGpsLon] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [primaryCrop, setPrimaryCrop] = useState<string>("Wheat");
  const [customCrop, setCustomCrop] = useState<string>("");

  // Load existing profile if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kisaanbuddy_farmer_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.village) setVillage(parsed.village);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.state) setStateName(parsed.state);
        if (parsed.primaryCrop) setPrimaryCrop(parsed.primaryCrop);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLanguageSelect = (code: Lang) => {
    setSelectedLang(code);
    setLang(code);
  };

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      alert("GPS is not supported on this device.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLat(Number(pos.coords.latitude.toFixed(5)));
        setGpsLon(Number(pos.coords.longitude.toFixed(5)));
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS permission not granted:", err);
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setError(null);

    const activeCrop = customCrop.trim() || primaryCrop;
    const profilePayload = {
      village_name: village.trim() || undefined,
      district_name: district.trim() || undefined,
      state_name: stateName.trim() || undefined,
      pin_code: pinCode.trim() || undefined,
      gps_lat: gpsLat || undefined,
      gps_lon: gpsLon || undefined,
      primary_crop: activeCrop || undefined,
      preferred_language: selectedLang,
    };

    // Store in localStorage for guest farmers
    try {
      localStorage.setItem(
        "kisaanbuddy_farmer_profile",
        JSON.stringify({
          village: village.trim(),
          district: district.trim(),
          state: stateName.trim(),
          primaryCrop: activeCrop,
          lang: selectedLang,
          lat: gpsLat,
          lon: gpsLon,
        })
      );
    } catch {
      // ignore
    }

    // If authenticated, persist to backend profile
    if (user) {
      try {
        await farmerProfileApi.update(profilePayload);
      } catch (err: any) {
        console.warn("Backend profile save deferred:", err);
      }
    }

    setSubmitting(false);
    router.push("/");
  };

  const isHindi = selectedLang === "hi" || selectedLang === "hi_en";
  const isKannada = selectedLang === "kn";

  return (
    <div className="mx-auto max-w-2xl py-4 sm:py-8 px-3 sm:px-4">
      {/* Top Stepper & Skip link */}
      <div className="mb-6 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900/90 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
              {step}
            </span>
            <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {step === 1 &&
                (isHindi
                  ? "कदम 1: अपनी भाषा चुनें"
                  : isKannada
                  ? "ಹಂತ 1: ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"
                  : "Step 1: Choose your language")}
              {step === 2 &&
                (isHindi
                  ? "कदम 2: अपना गांव और जिला"
                  : isKannada
                  ? "ಹಂತ 2: ನಿಮ್ಮ ಊರು ಮತ್ತು ಜಿಲ್ಲೆ"
                  : "Step 2: Farm Location")}
              {step === 3 &&
                (isHindi
                  ? "कदम 3: आपकी मुख्य फसल"
                  : isKannada
                  ? "ಹಂತ 3: ನಿಮ್ಮ ಮುಖ್ಯ ಬೆಳೆ"
                  : "Step 3: Main Crop")}
              {step === 4 &&
                (isHindi
                  ? "कदम 4: तैयार है!"
                  : isKannada
                  ? "ಹಂತ 4: ಸಿದ್ಧವಾಗಿದೆ!"
                  : "Step 4: All Set!")}
            </span>
          </div>

          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-primary underline px-2 py-1 rounded-lg"
          >
            {isHindi
              ? "बाद में भरें (Skip)"
              : isKannada
              ? "ನಂತರ ಭರ್ತಿ ಮಾಡಿ"
              : "Skip for now"}
          </Link>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-7 shadow-xs">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: LANGUAGE SELECTION                               */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Globe className="h-4 w-4" />
                <span>Language / भाषा / ಭಾಷೆ</span>
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50">
                अपनी पसंदीदा भाषा चुनें
              </h2>
              <p className="text-base text-stone-600 dark:text-stone-300 mt-1">
                Select the language you are most comfortable speaking and
                reading.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SELECTABLE_LANGS.map((code) => {
                const isSelected = selectedLang === code;
                const details = LANG_DETAILS[code as Lang];
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleLanguageSelect(code as Lang)}
                    className={`min-h-[64px] p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex items-center justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 dark:bg-emerald-950/50 text-primary dark:text-emerald-300 font-bold ring-2 ring-primary/20 shadow-xs"
                        : "border-stone-200 dark:border-stone-800 bg-[#FAF8F5]/80 dark:bg-stone-800/50 hover:border-stone-300 text-stone-800 dark:text-stone-200 font-medium"
                    }`}
                  >
                    <div>
                      <div className="text-base font-bold">
                        {details?.native || LANG_NAMES[code as Lang]}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">
                        {details?.en || code}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: LOCATION                                         */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {isHindi
                    ? "स्थान (वैकल्पिक)"
                    : isKannada
                    ? "ಸ್ಥಳ (ಐಚ್ಛಿಕ)"
                    : "Location (Optional)"}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50">
                {isHindi
                  ? "आपका खेत किस गांव या जिले में है?"
                  : isKannada
                  ? "ನಿಮ್ಮ ಜಮೀನು ಯಾವ ಊರು ಅಥವಾ ಜಿಲ್ಲೆಯಲ್ಲಿದೆ?"
                  : "Where is your farm located?"}
              </h2>
              <p className="text-base text-stone-600 dark:text-stone-300 mt-1">
                {isHindi
                  ? "इससे आपको अपने सबसे नजदीकी मंडी भाव और सही मौसम की जानकारी मिलेगी।"
                  : isKannada
                  ? "ಇದು ನಿಮ್ಮ ಹತ್ತಿರದ ಮಂಡಿ ದರ ಮತ್ತು ನಿಖರ ಹವಾಮಾನ ನೀಡಲು ನೆರವಾಗುತ್ತದೆ."
                  : "Helps show nearby mandi rates and local weather forecast."}
              </p>
            </div>

            {/* 1-tap GPS option */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                  {gpsLat && gpsLon
                    ? isHindi
                      ? `GPS लोकेशन मिल गई (${gpsLat}, ${gpsLon})`
                      : `GPS detected (${gpsLat}, ${gpsLon})`
                    : isHindi
                    ? "फोन की GPS लोकेशन से खुद भरें"
                    : "Auto-detect with phone GPS"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleGetGps}
                disabled={gpsLoading}
                className="shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {gpsLoading ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  (isHindi ? "लोकेशन लें" : "Use GPS")
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  {isHindi ? "गांव का नाम (Village)" : "Village Name"}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={isHindi ? "उदा. रामपुर" : "e.g. Rampur"}
                  className="w-full min-h-[48px] px-3.5 text-base rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  {isHindi ? "जिला (District)" : "District"}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={isHindi ? "उदा. सीहोर / धार" : "e.g. Sehore"}
                  className="w-full min-h-[48px] px-3.5 text-base rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  {isHindi ? "राज्य (State)" : "State"}
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder={
                    isHindi ? "उदा. मध्य प्रदेश, उत्तर प्रदेश" : "e.g. Madhya Pradesh"
                  }
                  className="w-full min-h-[48px] px-3.5 text-base rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  {isHindi ? "पिन कोड (Pin Code)" : "Pin Code (Optional)"}
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  maxLength={6}
                  placeholder="e.g. 466001"
                  className="w-full min-h-[48px] px-3.5 text-base rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: MAIN CROP                                        */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Wheat className="h-4 w-4" />
                <span>
                  {isHindi
                    ? "फसल (वैकल्पिक)"
                    : isKannada
                    ? "ಬೆಳೆ (ಐಚ್ಛಿಕ)"
                    : "Main Crop (Optional)"}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50">
                {isHindi
                  ? "आप मुख्यतः कौन सी फसल उगाते हैं?"
                  : isKannada
                  ? "ನೀವು ಮುಖ್ಯವಾಗಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯುತ್ತೀರಿ?"
                  : "Which crop do you primarily grow?"}
              </h2>
              <p className="text-base text-stone-600 dark:text-stone-300 mt-1">
                {isHindi
                  ? "अपनी मुख्य फसल चुनें ताकि हम उस फसल के भाव और बीमारी की सलाह तुरंत दे सकें।"
                  : isKannada
                  ? "ನಿಮ್ಮ ಮುಖ್ಯ ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ, ತಕ್ಷಣದ ಬೆಲೆ ಮತ್ತು ಸಲಹೆ ಪಡೆಯಿರಿ."
                  : "Select your main crop for tailored price alerts and health advice."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {COMMON_CROPS.map((crop) => {
                const isSelected = primaryCrop === crop.id;
                const label = isHindi
                  ? crop.hi
                  : isKannada
                  ? crop.kn
                  : crop.id;

                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => {
                      setPrimaryCrop(crop.id);
                      setCustomCrop("");
                    }}
                    className={`min-h-[58px] p-3 rounded-2xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary dark:text-emerald-300 font-bold ring-2 ring-primary/20"
                        : "border-stone-200 dark:border-stone-800 bg-[#FAF8F5]/80 dark:bg-stone-800/50 hover:border-stone-300 text-stone-800 dark:text-stone-200"
                    }`}
                  >
                    <span className="text-xl">{crop.icon}</span>
                    <span className="text-xs sm:text-sm font-bold leading-tight">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                {isHindi ? "या अन्य फसल लिखें" : "Or type other crop"}
              </label>
              <input
                type="text"
                value={customCrop}
                onChange={(e) => {
                  setCustomCrop(e.target.value);
                  setPrimaryCrop("");
                }}
                placeholder={
                  isHindi ? "उदा. चना, मूंगफली, अरहर" : "e.g. Gram, Groundnut"
                }
                className="w-full min-h-[48px] px-3.5 text-base rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: CONFIRM & ENTER                                  */}
        {/* ======================================================== */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <Sparkles className="h-6 w-6 stroke-[2.2]" />
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50">
                {isHindi
                  ? "सब कुछ तैयार है!"
                  : isKannada
                  ? "ಎಲ್ಲವೂ ಸಿದ್ಧವಾಗಿದೆ!"
                  : "All Set!"}
              </h2>
              <p className="text-base text-stone-600 dark:text-stone-300 mt-1">
                {isHindi
                  ? "किसानबडी अब आपकी भाषा और क्षेत्र के अनुसार तैयार है।"
                  : isKannada
                  ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ನಿಮ್ಮ ಭಾಷೆ ಮತ್ತು ಪ್ರದೇಶಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ."
                  : "KisaanBuddy is now tailored to your language and region."}
              </p>
            </div>

            {/* Summary card */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-800/60 p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-stone-200/80 dark:border-stone-700/80 text-sm">
                <span className="text-stone-500 dark:text-stone-400">
                  {isHindi ? "भाषा (Language)" : "Language"}
                </span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {LANG_DETAILS[selectedLang]?.native || LANG_NAMES[selectedLang]}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-stone-200/80 dark:border-stone-700/80 text-sm">
                <span className="text-stone-500 dark:text-stone-400">
                  {isHindi ? "स्थान (Location)" : "Location"}
                </span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {[village, district, stateName].filter(Boolean).join(", ") ||
                    (isHindi ? "सेट नहीं किया" : "Not set")}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 text-sm">
                <span className="text-stone-500 dark:text-stone-400">
                  {isHindi ? "मुख्य फसल (Main Crop)" : "Main Crop"}
                </span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {customCrop || primaryCrop || (isHindi ? "सेट नहीं किया" : "Not set")}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
              {isHindi
                ? "आप जब चाहें अपनी प्रोफाइल या सेटिंग्स में जाकर इसे बदल सकते हैं।"
                : "You can update these details anytime from Profile or Settings."}
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* NAVIGATION CONTROLS                                      */}
        {/* ======================================================== */}
        <div className="mt-8 pt-5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="min-h-[48px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isHindi ? "पीछे" : isKannada ? "ಹಿಂದೆ" : "Back"}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>{isHindi ? "आगे बढ़ें" : isKannada ? "ಮುಂದೆ" : "Continue"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={submitting}
              className="min-h-[48px] px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <RotateCw className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>
                {isHindi
                  ? "किसानबडी शुरू करें"
                  : isKannada
                  ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಪ್ರಾರಂಭಿಸಿ"
                  : "Enter KisaanBuddy"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
