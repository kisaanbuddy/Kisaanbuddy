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
import { useLanguage, SELECTABLE_LANGS, LANG_NAMES, Lang } from "@/lib/language";
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
            Step {currentStep} of 8: {STEPS[currentStep - 1].title}
          </span>
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
          >
            Skip to Dashboard
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
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tell us your name so KisaanBuddy can personalize your farming recommendations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar Patel"
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
                Preferred Language / भाषा चुनें
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose the language you want to read and listen to farming advisories in.
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
                      <div className="text-sm font-bold">{LANG_NAMES[code as Lang]?.native}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {LANG_NAMES[code as Lang]?.en}
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
                Farm Location
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Used to retrieve hyperlocal weather, APMC mandi arrivals, and regional pest alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Village / Town
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Ashta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Sehore"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Madhya Pradesh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 466116"
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
                  {gpsLat ? `GPS Captured (${gpsLat}, ${gpsLon})` : "Auto-detect GPS (Optional)"}
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
                Farm Size & Facilities
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your total agricultural land holding and available equipment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Total Land Holding (in Acres) *
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
                  Land Ownership Status
                </label>
                <select
                  value={landOwnership}
                  onChange={(e) => setLandOwnership(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="owned">Owned Land</option>
                  <option value="leased">Leased / Tenant</option>
                  <option value="both">Both Owned & Leased</option>
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
                <span>Farm has irrigation facility (Tube well, canal, or drip)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={hasTractor}
                  onChange={(e) => setHasTractor(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Owns tractor / heavy machinery</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Primary Crops */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Crops You Cultivate
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select your primary crop to receive tailored fertilizer doses and pest advisories.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Wheat", "Paddy (Rice)", "Cotton", "Soybean", "Mustard", "Maize", "Potato", "Tomato"].map(
                (crop) => {
                  const isSelected = primaryCrop === crop;
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => setPrimaryCrop(crop)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {crop}
                    </button>
                  );
                }
              )}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Seed Variety (Optional)
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
                Register Your First Field Plot
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mapping plots enables separate crop rotations and irrigation logs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Plot Name
                </label>
                <input
                  type="text"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  placeholder="e.g. East Well Plot"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Plot Acreage
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
                  Irrigation System
                </label>
                <select
                  value={plotIrrigation}
                  onChange={(e) => setPlotIrrigation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="Tube Well Drip">Tube Well Drip</option>
                  <option value="Flood Irrigation">Flood Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Canal">Canal</option>
                  <option value="Rainfed">Rainfed Only</option>
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
                Soil Health & Type (Optional)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Skip if you don't know your soil test metrics yet. You can update this anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Soil Texture / Type
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="Alluvial / Loamy">Alluvial / Loamy (Dumat)</option>
                  <option value="Black Cotton (Clay)">Black Cotton Soil (Kali Mitti)</option>
                  <option value="Sandy Loam">Sandy Loam (Retili Dumat)</option>
                  <option value="Red Laterite">Red Soil (Lal Mitti)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Soil pH (Est. 6.0 – 7.5 is optimal)
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
              <span>I have an official government Soil Health Card report</span>
            </label>
          </div>
        )}

        {/* STEP 8: Review & Launch */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Review & Launch Farm Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Everything is set. Click below to launch your unified agricultural dashboard.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Farmer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{name || "Kisaan Saathi"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {[village, district, stateName].filter(Boolean).join(", ") || "Location not set"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Total Farm Size:</span>
                <span className="font-bold text-slate-900 dark:text-white">{landHolding} Acres</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Active Crop:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {primaryCrop} {cropVariety ? `(${cropVariety})` : ""}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Initial Plot:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {plotName} ({plotAcreage} Acres)
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
              <span>Back</span>
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
              <span>Continue</span>
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
              <span>Complete & Open Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
