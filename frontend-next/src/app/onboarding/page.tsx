"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sprout,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Layers,
  FlaskConical,
  Languages,
  User,
  ShieldCheck,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage, SELECTABLE_LANGS, LANG_NAMES, LANG_DETAILS, Lang } from "@/lib/language";
import {
  farmerProfileApi,
  fieldsApi,
  soilTestsApi,
} from "@/lib/farmer-api";

const STEPS = [
  { id: 1, title: "Personal Info", desc: "Your identity & contact" },
  { id: 2, title: "Language", desc: "Preferred regional tongue" },
  { id: 3, title: "Farm Location", desc: "Village, district & state" },
  { id: 4, title: "Land Holding", desc: "Acreage & irrigation" },
  { id: 5, title: "Primary Crops", desc: "Current seasonal crops" },
  { id: 6, title: "Initial Plot", desc: "First mapped field" },
  { id: 7, title: "Soil Health", desc: "Soil type & fertility (Optional)" },
  { id: 8, title: "Review & Launch", desc: "Confirm & start dashboard" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const isKn = lang === "kn";
  const isHi = lang === "hi";

  const steps = [
    { id: 1, title: isKn ? "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ" : isHi ? "व्यक्तिगत जानकारी" : "Personal Info", desc: isKn ? "ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಸಂಪರ್ಕ ವಿವರ" : isHi ? "आपकी पहचान और संपर्क" : "Your identity & contact" },
    { id: 2, title: isKn ? "ಭಾಷೆ" : isHi ? "भाषा" : "Language", desc: isKn ? "ಆದ್ಯತೆಯ ಪ್ರಾದೇಶಿಕ ಭಾಷೆ" : isHi ? "पसंदीदा क्षेत्रीय भाषा" : "Preferred regional tongue" },
    { id: 3, title: isKn ? "ಜಮೀನಿನ ಸ್ಥಳ" : isHi ? "खेत का स्थान" : "Farm Location", desc: isKn ? "ಗ್ರಾಮ, ಜಿಲ್ಲೆ ಮತ್ತು ರಾಜ್ಯ" : isHi ? "गाँव, जिला और राज्य" : "Village, district & state" },
    { id: 4, title: isKn ? "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ" : isHi ? "भूमि जोत" : "Land Holding", desc: isKn ? "ವಿಸ್ತೀರ್ಣ ಮತ್ತು ನೀರಾವರಿ" : isHi ? "रकबा और सिंचाई" : "Acreage & irrigation" },
    { id: 5, title: isKn ? "ಮುಖ್ಯ ಬೆಳೆಗಳು" : isHi ? "मुख्य फसलें" : "Primary Crops", desc: isKn ? "ಪ್ರಸ್ತುತ ಹಂಗಾಮಿನ ಬೆಳೆಗಳು" : isHi ? "वर्तमान मौसमी फसलें" : "Current seasonal crops" },
    { id: 6, title: isKn ? "ಆರಂಭಿಕ ಜಮೀನು" : isHi ? "प्रारंभिक प्लॉट" : "Initial Plot", desc: isKn ? "ಮೊದಲು ನಕ್ಷೆ ಮಾಡಿದ ಪ್ಲಾಟ್" : isHi ? "पहला मैप किया गया खेत" : "First mapped field" },
    { id: 7, title: isKn ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ" : isHi ? "मृदा स्वास्थ्य" : "Soil Health", desc: isKn ? "ಮಣ್ಣಿನ ಪ್ರಕಾರ ಮತ್ತು ಫಲವತ್ತತೆ (ಐಚ್ಛಿಕ)" : isHi ? "मिट्टी का प्रकार और उर्वरता (वैकल्पिक)" : "Soil type & fertility (Optional)" },
    { id: 8, title: isKn ? "ಪರಿಶೀಲಿಸಿ & ಪ್ರಾರಂಭಿಸಿ" : isHi ? "समीक्षा और शुरुआत" : "Review & Launch", desc: isKn ? "ದೃಢೀಕರಿಸಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ" : isHi ? "पुष्टि करें और डैशबोर्ड शुरू करें" : "Confirm & start dashboard" },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(user?.name || "");
  const [selectedLang, setSelectedLang] = useState<Lang>((lang as Lang) || "hi");

  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLon, setGpsLon] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [landHolding, setLandHolding] = useState<string>("5.0");
  const [landOwnership, setLandOwnership] = useState<string>("owned");
  const [hasIrrigation, setHasIrrigation] = useState<boolean>(true);
  const [hasTractor, setHasTractor] = useState<boolean>(false);
  const [equipment, setEquipment] = useState<string>("");

  const [primaryCrop, setPrimaryCrop] = useState<string>("Wheat");
  const [cropVariety, setCropVariety] = useState<string>("");

  const [plotName, setPlotName] = useState<string>("Main Field");
  const [plotAcreage, setPlotAcreage] = useState<string>("2.5");
  const [plotIrrigation, setPlotIrrigation] = useState<string>("Tube Well Drip");

  const [soilType, setSoilType] = useState<string>("Alluvial / Loamy");
  const [soilPh, setSoilPh] = useState<string>("6.8");
  const [hasSoilCard, setHasSoilCard] = useState<boolean>(false);

  // GPS autofill with permission
  const handleGetGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
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
        console.warn("GPS Permission denied or unavailable:", err);
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleNext = () => {
    setError(null);
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // 1. Update Profile
      await farmerProfileApi.update({
        village_name: village.trim() || undefined,
        district_name: district.trim() || undefined,
        state_name: stateName.trim() || undefined,
        pin_code: pinCode.trim() || undefined,
        gps_lat: gpsLat || undefined,
        gps_lon: gpsLon || undefined,
        land_holding_acres: parseFloat(landHolding) || 0,
        land_ownership: landOwnership,
        has_irrigation: hasIrrigation,
        has_tractor: hasTractor,
        equipment_list: equipment.trim() || undefined,
        primary_crop: primaryCrop.trim() || undefined,
        preferred_language: selectedLang,
      });

      // 2. Create Initial Field if named
      if (plotName.trim()) {
        try {
          await fieldsApi.create({
            field_name: plotName.trim(),
            acreage: parseFloat(plotAcreage) || undefined,
            area_unit: "acre",
            current_crop: primaryCrop.trim() || undefined,
            crop_variety: cropVariety.trim() || undefined,
            soil_type: soilType,
            irrigation_type: plotIrrigation,
          });
        } catch (fieldErr) {
          console.warn("Field creation deferred:", fieldErr);
        }
      }

      // 3. Create baseline soil test if values entered
      if (soilPh) {
        try {
          await soilTestsApi.create({
            test_date: new Date().toISOString().split("T")[0],
            soil_type: soilType,
            soil_ph: parseFloat(soilPh) || 6.8,
            is_verified: hasSoilCard,
            notes: hasSoilCard ? "Soil Health Card test record" : "Farmer estimated baseline",
          });
        } catch (soilErr) {
          console.warn("Soil test creation deferred:", soilErr);
        }
      }

      // Update global language
      setLang(selectedLang);

      // Route to new enterprise dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding submission error:", err);
      setError(err.message || "Failed to save profile. You can continue and finish later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            {isKn
              ? `ಹಂತ ${currentStep}/8: ${steps[currentStep - 1].title}`
              : isHi
              ? `चरण ${currentStep}/8: ${steps[currentStep - 1].title}`
              : `Step ${currentStep} of 8: ${steps[currentStep - 1].title}`}
          </span>
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
          >
            {isKn ? "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ತೆರಳಿ" : isHi ? "डैशबोर्ड पर जाएं" : "Skip to Dashboard"}
          </Link>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isKn ? "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ" : isHi ? "व्यक्तिगत जानकारी" : "Personal Information"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ, ಇದರಿಂದ ಕಿಸಾನ್‌ಬಡ್ಡಿ ನಿಮ್ಮ ಕೃಷಿ ಶಿಫಾರಸುಗಳನ್ನು ವೈಯಕ್ತೀಕರಿಸಬಹುದು."
                  : isHi
                  ? "अपना नाम दर्ज करें ताकि किसानबड्डी आपकी कृषि सिफारिशों को वैयक्तिकृत कर सके।"
                  : "Tell us your name so KisaanBuddy can personalize your farming recommendations."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isKn ? "ಪೂರ್ಣ ಹೆಸರು *" : isHi ? "पूरा नाम *" : "Full Name *"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isKn ? "ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್" : isHi ? "उदा. रमेश कुमार पटेल" : "e.g. Ramesh Kumar Patel"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Preferred Language */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isKn ? "ಆದ್ಯತೆಯ ಭಾಷೆ / Language" : isHi ? "पसंदीदा भाषा / Preferred Language" : "Preferred Language / ಭಾಷೆ / भाषा"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? "ನೀವು ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಓದಲು ಮತ್ತು ಕೇಳಲು ಬಯಸುವ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ."
                  : isHi
                  ? "वह भाषा चुनें जिसमें आप कृषि सलाह पढ़ना और सुनना चाहते हैं।"
                  : "Choose the language you want to read and listen to farming advisories in."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SELECTABLE_LANGS.map((code) => {
                const isSelected = selectedLang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedLang(code as Lang)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">
                        {LANG_DETAILS[code as Lang]?.native || LANG_NAMES[code as Lang]}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {LANG_DETAILS[code as Lang]?.en || code}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Farm Location */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isKn ? "ಜಮೀನಿನ ಸ್ಥಳ" : isHi ? "खेत का स्थान" : "Farm Location"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? "ಸ್ಥಳೀಯ ಹವಾಮಾನ, ಎಪಿಎಂಸಿ ಮಂಡಿ ದರಗಳು ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಕೀಟ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಲು ಬಳಸಲಾಗುತ್ತದೆ."
                  : isHi
                  ? "हाइपरलोकल मौसम, एपीएमसी मंडी भाव और क्षेत्रीय कीट अलर्ट प्राप्त करने के लिए उपयोग किया जाता है।"
                  : "Used to retrieve hyperlocal weather, APMC mandi arrivals, and regional pest alerts."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಗ್ರಾಮ / ಪಟ್ಟಣ" : isHi ? "गाँव / शहर" : "Village / Town"}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={isKn ? "ಉದಾ: ಧಾರವಾಡ" : isHi ? "उदा. सीहोर" : "e.g. Ashta"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಜಿಲ್ಲೆ" : isHi ? "जिला" : "District"}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={isKn ? "ಉದಾ: ಧಾರವಾಡ" : isHi ? "उदा. सीहोर" : "e.g. Sehore"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ರಾಜ್ಯ" : isHi ? "राज्य" : "State"}
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder={isKn ? "ಉದಾ: ಕರ್ನಾಟಕ" : isHi ? "उदा. मध्य प्रदेश" : "e.g. Madhya Pradesh"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಪಿನ್ ಕೋಡ್" : isHi ? "पिन कोड" : "PIN Code"}
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 580001"
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* GPS optional button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGetGps}
                disabled={gpsLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {gpsLat
                    ? (isKn ? `ಜಿಪಿಎಸ್ ದಾಖಲಾಗಿದೆ (${gpsLat}, ${gpsLon})` : isHi ? `जीपीएस प्राप्त (${gpsLat}, ${gpsLon})` : `GPS Captured (${gpsLat}, ${gpsLon})`)
                    : (isKn ? "ಸ್ವಯಂ ಜಿಪಿಎಸ್ ಗುರುತಿಸುವಿಕೆ (ಐಚ್ಛಿಕ)" : isHi ? "ऑटो-डिटेक्ट जीपीएस (वैकल्पिक)" : "Auto-detect GPS (Optional)")}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Land Holding */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isKn ? "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಸೌಲಭ್ಯಗಳು" : isHi ? "खेत का आकार और सुविधाएं" : "Farm Size & Facilities"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? "ನಿಮ್ಮ ಒಟ್ಟು ಕೃಷಿ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಲಭ್ಯವಿರುವ ಉಪಕರಣಗಳನ್ನು ನಮೂದಿಸಿ."
                  : isHi
                  ? "अपनी कुल कृषि भूमि जोत और उपलब्ध उपकरण दर्ज करें।"
                  : "Enter your total agricultural land holding and available equipment."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಒಟ್ಟು ಕೃಷಿ ಜಮೀನು (ಎಕರೆಗಳಲ್ಲಿ) *" : isHi ? "कुल कृषि भूमि (एकड़ में) *" : "Total Land Holding (in Acres) *"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={landHolding}
                  onChange={(e) => setLandHolding(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಭೂಮಿ ಮಾಲೀಕತ್ವದ ಸ್ಥಿತಿ" : isHi ? "भूमि स्वामित्व की स्थिति" : "Land Ownership Status"}
                </label>
                <select
                  value={landOwnership}
                  onChange={(e) => setLandOwnership(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="owned">{isKn ? "ಸ್ವಂತ ಜಮೀನು" : isHi ? "अपनी भूमि" : "Owned Land"}</option>
                  <option value="leased">{isKn ? "ಗೇಣಿ / ಕೌಲು" : isHi ? "पट्टे पर / किरायेदार" : "Leased / Tenant"}</option>
                  <option value="both">{isKn ? "ಸ್ವಂತ ಮತ್ತು ಗೇಣಿ" : isHi ? "दोनों (स्वामित्व और पट्टा)" : "Both Owned & Leased"}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={hasIrrigation}
                  onChange={(e) => setHasIrrigation(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {isKn
                    ? "ಜಮೀನಿನಲ್ಲಿ ನೀರಾವರಿ ಸೌಲಭ್ಯವಿದೆ (ಕೊಳವೆಬಾವಿ, ಕಾಲುವೆ ಅಥವಾ ಹನಿ ನೀರಾವರಿ)"
                    : isHi
                    ? "खेत में सिंचाई की सुविधा है (नलकूप, नहर या ड्रिप)"
                    : "Farm has irrigation facility (Tube well, canal, or drip)"}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={hasTractor}
                  onChange={(e) => setHasTractor(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {isKn
                    ? "ಟ್ರಾಕ್ಟರ್ / ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳನ್ನು ಹೊಂದಿದೆ"
                    : isHi
                    ? "ट्रैक्टर / भारी कृषि मशीनरी उपलब्ध है"
                    : "Owns tractor / heavy machinery"}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Primary Crops */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isKn ? "ನೀವು ಬೆಳೆಯುವ ಬೆಳೆಗಳು" : isHi ? "आप कौन सी फसलें उगाते हैं" : "Crops You Cultivate"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? "ಸೂಕ್ತವಾದ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ ಮತ್ತು ಕೀಟ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಮುಖ್ಯ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ."
                  : isHi
                  ? "सटीक उर्वरक मात्रा और कीट सलाह प्राप्त करने के लिए अपनी प्राथमिक फसल चुनें।"
                  : "Select your primary crop to receive tailored fertilizer doses and pest advisories."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { en: "Wheat", hi: "गेहूं", kn: "ಗೋಧಿ" },
                { en: "Paddy (Rice)", hi: "धान (चावल)", kn: "ಭತ್ತ (ಅಕ್ಕಿ)" },
                { en: "Cotton", hi: "कपास", kn: "ಹತ್ತಿ" },
                { en: "Soybean", hi: "सोयाबीन", kn: "ಸೋಯಾಬೀನ್" },
                { en: "Mustard", hi: "सरसों", kn: "ಸಾಸಿವೆ" },
                { en: "Maize", hi: "मक्का", kn: "ಮೆಕ್ಕೆಜೋಳ" },
                { en: "Potato", hi: "आलू", kn: "ಆಲೂಗಡ್ಡೆ" },
                { en: "Tomato", hi: "टमाटर", kn: "ಟೊಮೆಟೊ" },
              ].map((cropObj) => {
                const isSelected = primaryCrop === cropObj.en;
                const cropLabel = isKn ? cropObj.kn : isHi ? cropObj.hi : cropObj.en;
                return (
                  <button
                    key={cropObj.en}
                    type="button"
                    onClick={() => setPrimaryCrop(cropObj.en)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {cropLabel}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isKn ? "ಬೀಜದ ತಳಿ (ಐಚ್ಛಿಕ)" : isHi ? "बीज किस्म (वैकल्पिक)" : "Seed Variety (Optional)"}
              </label>
              <input
                type="text"
                value={cropVariety}
                onChange={(e) => setCropVariety(e.target.value)}
                placeholder="e.g. HD-2967, Shriram Super 303, PBW 550"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* STEP 6: Initial Plot Information */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isKn ? "ನಿಮ್ಮ ಮೊದಲ ಜಮೀನಿನ ಪ್ಲಾಟ್ ನೋಂದಾಯಿಸಿ" : isHi ? "अपना पहला खेत प्लॉट पंजीकृत करें" : "Register Your First Field Plot"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? "ಪ್ಲಾಟ್‌ಗಳನ್ನು ನಕ್ಷೆ ಮಾಡುವುದರಿಂದ ಪ್ರತ್ಯೇಕ ಬೆಳೆ ಪರಿವರ್ತನೆ ಮತ್ತು ನೀರಾವರಿ ದಾಖಲೆಗಳನ್ನು ಇಡಲು ಸಹಾಯವಾಗುತ್ತದೆ."
                  : isHi
                  ? "प्लॉट मैप करने से फसल चक्र और सिंचाई लॉग अलग-अलग बनाए रखने में मदद मिलती है।"
                  : "Mapping plots enables separate crop rotations and irrigation logs."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಪ್ಲಾಟ್ ಹೆಸರು" : isHi ? "प्लॉट का नाम" : "Plot Name"}
                </label>
                <input
                  type="text"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  placeholder={isKn ? "ಉದಾ: ಪೂರ್ವ ಬಾವಿ ಜಮೀನು" : isHi ? "उदा. पूर्वी कुआं प्लॉट" : "e.g. East Well Plot"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಪ್ಲಾಟ್ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)" : isHi ? "प्लॉट रकबा (एकड़)" : "Plot Acreage"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={plotAcreage}
                  onChange={(e) => setPlotAcreage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ನೀರಾವರಿ ವ್ಯವಸ್ಥೆ" : isHi ? "सिंचाई प्रणाली" : "Irrigation System"}
                </label>
                <select
                  value={plotIrrigation}
                  onChange={(e) => setPlotIrrigation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="Tube Well Drip">{isKn ? "ಕೊಳವೆಬಾವಿ ಹನಿ ನೀರಾವರಿ" : isHi ? "नलकूप ड्रिप" : "Tube Well Drip"}</option>
                  <option value="Flood Irrigation">{isKn ? "ಹರಿ ನೀರಾವರಿ" : isHi ? "बाढ़ सिंचाई" : "Flood Irrigation"}</option>
                  <option value="Sprinkler">{isKn ? "ತುಂತುರು ನೀರಾವರಿ" : isHi ? "स्प्रिंकलर" : "Sprinkler"}</option>
                  <option value="Canal">{isKn ? "ಕಾಲುವೆ" : isHi ? "नहर" : "Canal"}</option>
                  <option value="Rainfed">{isKn ? "ಮಳೆ ಆಧಾರಿತ ಮಾತ್ರ" : isHi ? "केवल वर्षा आधारित" : "Rainfed Only"}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Optional Soil Information */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isKn ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು ವಿಧ (ಐಚ್ಛಿಕ)" : isHi ? "मृदा स्वास्थ्य और प्रकार (वैकल्पिक)" : "Soil Health & Type (Optional)"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? "ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ಮೌಲ್ಯಗಳು ತಿಳಿದಿಲ್ಲದಿದ್ದರೆ ಬಿಟ್ಟುಬಿಡಿ. ನೀವು ಇದನ್ನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನವೀಕರಿಸಬಹುದು."
                  : isHi
                  ? "यदि आपको अभी मिट्टी परीक्षण का डेटा नहीं पता है तो छोड़ सकते हैं। इसे कभी भी अपडेट किया जा सकता है।"
                  : "Skip if you don't know your soil test metrics yet. You can update this anytime."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಮಣ್ಣಿನ ವಿನ್ಯಾಸ / ವಿಧ" : isHi ? "मिट्टी का प्रकार" : "Soil Texture / Type"}
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="Alluvial / Loamy">{isKn ? "ಮೆಕ್ಕಲು / ಗೋಡು ಮಣ್ಣು" : isHi ? "दोमट मिट्टी" : "Alluvial / Loamy (Dumat)"}</option>
                  <option value="Black Cotton (Clay)">{isKn ? "ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು" : isHi ? "काली कपास मिट्टी" : "Black Cotton Soil (Kali Mitti)"}</option>
                  <option value="Sandy Loam">{isKn ? "ಮರಳು ಗೋಡು ಮಣ್ಣು" : isHi ? "बलुई दोमट" : "Sandy Loam (Retili Dumat)"}</option>
                  <option value="Red Laterite">{isKn ? "ಕೆಂಪು ಮಣ್ಣು" : isHi ? "लाल मिट्टी" : "Red Soil (Lal Mitti)"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isKn ? "ಮಣ್ಣಿನ pH (6.0 - 7.5 ಉತ್ತಮ)" : isHi ? "मृदा pH (6.0 - 7.5 सर्वोत्तम)" : "Soil pH (Est. 6.0 – 7.5 is optimal)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={soilPh}
                  onChange={(e) => setSoilPh(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 pt-2">
              <input
                type="checkbox"
                checked={hasSoilCard}
                onChange={(e) => setHasSoilCard(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                {isKn
                  ? "ನನ್ನ ಬಳಿ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ (Soil Health Card) ವರದಿ ಇದೆ"
                  : isHi
                  ? "मेरे पास आधिकारिक सरकारी मृदा स्वास्थ्य कार्ड रिपोर्ट है"
                  : "I have an official government Soil Health Card report"}
              </span>
            </label>
          </div>
        )}

        {/* STEP 8: Review & Launch */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isKn ? "ಪರಿಶೀಲಿಸಿ & ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ಪ್ರಾರಂಭಿಸಿ" : isHi ? "समीक्षा करें और फार्म प्रोफ़ाइल शुरू करें" : "Review & Launch Farm Profile"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKn
                  ? "ಎಲ್ಲವೂ ಸಿದ್ಧವಾಗಿದೆ. ನಿಮ್ಮ ಸಮಗ್ರ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲು ಕೆಳಗೆ ಕ್ಲಿಕ್ ಮಾಡಿ."
                  : isHi
                  ? "सब कुछ तैयार है। अपना एकीकृत कृषि डैशबोर्ड शुरू करने के लिए नीचे क्लिक करें।"
                  : "Everything is set. Click below to launch your unified agricultural dashboard."}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">{isKn ? "ರೈತರು:" : isHi ? "किसान:" : "Farmer:"}</span>
                <span className="font-bold text-slate-900 dark:text-white">{name || (isKn ? "ಕಿಸಾನ್ ಸಾಥಿ" : isHi ? "किसान साथी" : "Kisaan Saathi")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">{isKn ? "ಸ್ಥಳ:" : isHi ? "स्थान:" : "Location:"}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {[village, district, stateName].filter(Boolean).join(", ") || (isKn ? "ಸ್ಥಳ ನಿಗದಿಯಾಗಿಲ್ಲ" : isHi ? "स्थान निर्धारित नहीं" : "Location not set")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">{isKn ? "ಒಟ್ಟು ಕೃಷಿ ವಿಸ್ತೀರ್ಣ:" : isHi ? "कुल खेत आकार:" : "Total Farm Size:"}</span>
                <span className="font-bold text-slate-900 dark:text-white">{landHolding} {isKn ? "ಎಕರೆ" : isHi ? "एकड़" : "Acres"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">{isKn ? "ಸಕ್ರಿಯ ಬೆಳೆ:" : isHi ? "सक्रिय फसल:" : "Active Crop:"}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {primaryCrop} {cropVariety ? `(${cropVariety})` : ""}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{isKn ? "ಆರಂಭಿಕ ಪ್ಲಾಟ್:" : isHi ? "प्रारंभिक प्लॉट:" : "Initial Plot:"}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {plotName} ({plotAcreage} {isKn ? "ಎಕರೆ" : isHi ? "एकड़" : "Acres"})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer Controls */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isKn ? "ಹಿಂದೆ" : isHi ? "पीछे" : "Back"}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              <span>{isKn ? "ಮುಂದುವರಿಯಿರಿ" : isHi ? "आगे बढ़ें" : "Continue"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isKn ? "ಪೂರ್ಣಗೊಳಿಸಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ" : isHi ? "पूरा करें और डैशबोर्ड खोलें" : "Complete & Open Dashboard"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
