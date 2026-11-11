"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Navigation,
  Globe,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CloudSun,
  CheckCircle,
  ExternalLink,
  LocateFixed,
  Loader2,
  X,
} from "lucide-react";
import {
  AgriContact,
  ALL_INDIAN_STATES,
  searchAgriDirectory,
  NATIONAL_HELPLINES,
} from "@/lib/agri-directory-store";
import { FarmerProfileData } from "@/lib/farm-profile-store";
import { getCurrentByCity } from "@/lib/weather-api";

interface AgriIntelligenceSidebarProps {
  farmerProfile: FarmerProfileData;
  onUpdateLocation: (state: string, district: string, block?: string) => void;
  onSelectQuery?: (q: string) => void;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

export function AgriIntelligenceSidebar({
  farmerProfile,
  onUpdateLocation,
  onSelectQuery,
  onClose,
  onCloseMobile,
}: AgriIntelligenceSidebarProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "weather" | "schemes">("directory");
  const [selectedState, setSelectedState] = useState(farmerProfile.state || "Haryana");
  const [selectedDistrict, setSelectedDistrict] = useState(farmerProfile.district || "Karnal");
  const [selectedBlock, setSelectedBlock] = useState(farmerProfile.block || "");
  const [isLocating, setIsLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Reality-first weather state (no fabricated defaults)
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    provider: string;
    spraySafe: boolean;
    advisory: string;
  } | null>(null);

  useEffect(() => {
    if (farmerProfile.state) setSelectedState(farmerProfile.state);
    if (farmerProfile.district) setSelectedDistrict(farmerProfile.district);
    if (farmerProfile.block) setSelectedBlock(farmerProfile.block);
  }, [farmerProfile.state, farmerProfile.district, farmerProfile.block]);

  // Fetch genuine live weather when Weather tab is active
  useEffect(() => {
    if (activeTab !== "weather") return;
    let cancelled = false;
    const ctl = new AbortController();

    async function fetchWeather() {
      const target = selectedDistrict || selectedState;
      if (!target) return;
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const res = await getCurrentByCity(target, ctl.signal);
        if (cancelled) return;
        const wind = res.current.wind_kph ?? 0;
        const hum = res.current.humidity ?? 0;
        const isSafe = wind < 12 && hum < 85;
        setWeatherData({
          temp: Math.round(res.current.temp_c),
          humidity: Math.round(hum),
          condition: res.current.condition || "Clear",
          windSpeed: Math.round(wind * 10) / 10,
          provider: res.provider,
          spraySafe: isSafe,
          advisory: isSafe
            ? "Safe spraying window: Wind speed is under 12 km/h and humidity is below 85%."
            : "Avoid pesticide spraying now: High wind speed or high humidity increases drift and wash-off risk.",
        });
      } catch {
        if (!cancelled) {
          setWeatherData(null);
          setWeatherError(`Live weather for ${target} is currently unavailable.`);
        }
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }

    void fetchWeather();
    return () => {
      cancelled = true;
      ctl.abort();
    };
  }, [activeTab, selectedDistrict, selectedState]);

  const directoryResult = searchAgriDirectory({
    state: selectedState,
    district: selectedDistrict,
    block: selectedBlock,
  });

  const availableDistricts =
    ALL_INDIAN_STATES.find((s) => s.name.toLowerCase() === selectedState.toLowerCase())?.districts || [
      selectedDistrict,
    ];

  const handleClose = onClose || onCloseMobile;

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      setGeoNotice("Geolocation is not supported by your browser. Please select your district manually.");
      return;
    }
    setIsLocating(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const state = address.state || selectedState || "Haryana";
            const district = address.state_district || address.county || address.city || selectedDistrict || "Karnal";
            const block = address.suburb || address.village || "";

            setSelectedState(state);
            setSelectedDistrict(district);
            setSelectedBlock(block);
            onUpdateLocation(state, district, block);
            setGeoNotice(`Location detected: ${district}, ${state}`);
          } else {
            setGeoNotice("Coordinates received. Please select your specific agricultural district.");
          }
        } catch {
          setGeoNotice("Could not resolve address. Please choose your district from the dropdown.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setGeoNotice("Location permission denied. Please select your State & District manually below.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <aside className="w-full h-full flex flex-col bg-white dark:bg-stone-900 border-l border-emerald-900/10 dark:border-stone-800 select-none overflow-hidden">
      {/* Top Header & Location Bar */}
      <div className="p-4 border-b border-emerald-900/10 dark:border-stone-800 space-y-3 bg-[#F8FBF8] dark:bg-stone-950/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[#143325] dark:text-stone-100 truncate">
                Agriculture Dept &amp; Helplines
              </h3>
              <p className="text-[11px] text-[#4B5D50] dark:text-stone-400 truncate">
                Verified KVKs, Officers &amp; Toll-Free Support
              </p>
            </div>
          </div>

          {handleClose && (
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-stone-500 hover:text-foreground hover:bg-emerald-950/5 dark:hover:bg-stone-800 transition-colors shrink-0"
              aria-label="Close Agriculture Department panel"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Selector */}
        <div className="p-2.5 rounded-2xl border border-emerald-900/10 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5D50] dark:text-stone-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              Farmer District
            </span>
            <button
              type="button"
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline disabled:opacity-50"
            >
              <LocateFixed className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
              {isLocating ? "Detecting..." : "Auto Detect"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <select
              aria-label="Select State"
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                const matching = ALL_INDIAN_STATES.find((s) => s.name === newState);
                const newDist = matching ? matching.districts[0] : "";
                setSelectedDistrict(newDist);
                onUpdateLocation(newState, newDist, selectedBlock);
              }}
              className="text-xs py-1.5 px-2 rounded-xl border border-emerald-900/15 dark:border-stone-700 bg-[#F8FBF8] dark:bg-stone-800 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {ALL_INDIAN_STATES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Select District"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                onUpdateLocation(selectedState, e.target.value, selectedBlock);
              }}
              className="text-xs py-1.5 px-2 rounded-xl border border-emerald-900/15 dark:border-stone-700 bg-[#F8FBF8] dark:bg-stone-800 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {geoNotice && (
            <p className="text-[11px] text-[#4B5D50] dark:text-stone-400 bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50">
              {geoNotice}
            </p>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-emerald-950/5 dark:bg-stone-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === "directory"
                ? "bg-white dark:bg-stone-900 text-[#143325] dark:text-emerald-300 shadow-2xs font-bold"
                : "text-[#4B5D50] dark:text-stone-400 hover:text-foreground"
            }`}
          >
            Centres
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weather")}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === "weather"
                ? "bg-white dark:bg-stone-900 text-[#143325] dark:text-emerald-300 shadow-2xs font-bold"
                : "text-[#4B5D50] dark:text-stone-400 hover:text-foreground"
            }`}
          >
            Weather
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schemes")}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === "schemes"
                ? "bg-white dark:bg-stone-900 text-[#143325] dark:text-emerald-300 shadow-2xs font-bold"
                : "text-[#4B5D50] dark:text-stone-400 hover:text-foreground"
            }`}
          >
            Schemes
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 custom-scrollbar">
        {activeTab === "directory" && (
          <div className="space-y-3">
            {!directoryResult.hasDirectDistrictContact && (
              <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/25 space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      Direct District Contact Pending Verification
                    </h4>
                    <p className="text-[11px] text-amber-900/90 dark:text-amber-300/80 leading-relaxed mt-0.5">
                      Verified direct officer number for {selectedDistrict} is not yet listed. Connect directly with the official National Kisan Call Centre:
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-[#4B5D50] dark:text-stone-400 uppercase">
                      Kisan Call Centre (Toll-Free)
                    </p>
                    <a
                      href="tel:18001801551"
                      className="text-sm font-black text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      1800-180-1551
                    </a>
                    <p className="text-[10px] text-[#4B5D50] dark:text-stone-400">
                      6:00 AM – 10:00 PM • 22 Languages
                    </p>
                  </div>
                  <a
                    href="tel:18001801551"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs shrink-0"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            )}

            {directoryResult.exactMatches.map((contact) => (
              <InstitutionCard key={contact.id} contact={contact} isExact={true} />
            ))}

            {directoryResult.stateMatches.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#4B5D50] dark:text-stone-400">
                  State Agricultural Centres ({selectedState})
                </p>
                {directoryResult.stateMatches.map((contact) => (
                  <InstitutionCard key={contact.id} contact={contact} isExact={false} />
                ))}
              </div>
            )}

            {/* Official National Helplines */}
            <div className="pt-3 border-t border-emerald-900/10 dark:border-stone-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5D50] dark:text-stone-400">
                Official National Helplines
              </span>
              <div className="space-y-2">
                {NATIONAL_HELPLINES.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl border border-emerald-900/10 dark:border-stone-800 bg-[#F8FBF8] dark:bg-stone-900/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground leading-snug">{h.name}</p>
                        <p className="text-[11px] text-[#4B5D50] dark:text-stone-400">
                          {h.designation}
                        </p>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          {h.workingHours}
                        </span>
                      </div>
                      <a
                        href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{h.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "weather" && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-emerald-900/10 dark:border-stone-800 bg-[#F8FBF8] dark:bg-stone-900/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Live District Weather
                  </span>
                  <h4 className="text-base font-bold text-[#143325] dark:text-stone-100">
                    {selectedDistrict}, {selectedState}
                  </h4>
                </div>
                <CloudSun className="w-7 h-7 text-amber-500" />
              </div>

              {weatherLoading ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#4B5D50] dark:text-stone-400">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Fetching live weather...</span>
                </div>
              ) : weatherData ? (
                <>
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-emerald-900/10 dark:border-stone-800 text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-emerald-900/5">
                      <span className="text-[10px] text-[#4B5D50] dark:text-stone-400 block">
                        Temp
                      </span>
                      <span className="text-sm font-black text-foreground">
                        {weatherData.temp}°C
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-emerald-900/5">
                      <span className="text-[10px] text-[#4B5D50] dark:text-stone-400 block">
                        Humidity
                      </span>
                      <span className="text-sm font-black text-foreground">
                        {weatherData.humidity}%
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-emerald-900/5">
                      <span className="text-[10px] text-[#4B5D50] dark:text-stone-400 block">
                        Wind
                      </span>
                      <span className="text-sm font-black text-foreground">
                        {weatherData.windSpeed} km/h
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2 ${
                      weatherData.spraySafe
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200"
                        : "border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200"
                    }`}
                  >
                    {weatherData.spraySafe ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs leading-relaxed">
                      <span className="font-bold block">
                        {weatherData.spraySafe ? "Suitable for Spraying" : "Caution for Spraying"}
                      </span>
                      {weatherData.advisory}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#4B5D50] dark:text-stone-400 text-center">
                    Provider: {weatherData.provider} • Condition: {weatherData.condition}
                  </p>
                </>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  {weatherError || "Live weather data is currently unavailable."}
                </div>
              )}

              {onSelectQuery && (
                <button
                  type="button"
                  onClick={() =>
                    onSelectQuery(
                      `Give me a 5-day farm weather and spraying advisory for ${selectedDistrict}, ${selectedState}.`
                    )
                  }
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                >
                  Ask AI for 5-Day Farm Weather Plan
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "schemes" && (
          <div className="space-y-3">
            {[
              {
                id: "pm-kisan",
                name: "PM-KISAN Samman Nidhi",
                amount: "₹6,000 / year",
                eligibility: "Landholding farmer families with valid land record (RoR) & Aadhaar eKYC",
                docs: "Aadhaar, Land Khasra/Khatauni, Bank Passbook (NPCI mapped)",
                link: "https://pmkisan.gov.in",
              },
              {
                id: "pmfby",
                name: "Pradhan Mantri Fasal Bima Yojana",
                amount: "Notified crop loss insurance cover",
                eligibility: "Farmers growing notified crops in notified areas (Kharif & Rabi seasons)",
                docs: "Sowing Certificate / Patwari Girdawari, Land Deed, Aadhaar, Bank Details",
                link: "https://pmfby.gov.in",
              },
              {
                id: "kcc",
                name: "Kisan Credit Card (KCC)",
                amount: "4% effective interest on timely repayment",
                eligibility: "Farmers, sharecroppers, tenant farmers, animal husbandry & fisheries",
                docs: "Land Records, Identity Proof, Residence Proof",
                link: "https://www.myscheme.gov.in/schemes/kcc",
              },
              {
                id: "soil-health",
                name: "Soil Health Card Scheme",
                amount: "Free Soil Nutrient Analysis every 2 years",
                eligibility: "All agricultural land owners & operational cultivators",
                docs: "Aadhaar Card, Farm Survey / Khasra Number",
                link: "https://soilhealth.dac.gov.in",
              },
            ].map((scheme) => (
              <div
                key={scheme.id}
                className="p-3.5 rounded-2xl border border-emerald-900/10 dark:border-stone-800 bg-[#F8FBF8] dark:bg-stone-900/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-[#143325] dark:text-stone-100">
                      {scheme.name}
                    </h5>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {scheme.amount}
                    </span>
                  </div>
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-white dark:hover:bg-stone-800"
                    title="Open official portal"
                    aria-label={`Open ${scheme.name} portal`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-[11px] text-[#4B5D50] dark:text-stone-400 space-y-1">
                  <p>
                    <strong className="text-foreground">Eligibility:</strong> {scheme.eligibility}
                  </p>
                  <p>
                    <strong className="text-foreground">Documents:</strong> {scheme.docs}
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  {onSelectQuery ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectQuery(
                          `Explain eligibility and step-by-step application for ${scheme.name} in ${selectedState}.`
                        )
                      }
                      className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Ask AI Details
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Official Portal</span>
                  )}
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Official Portal →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-emerald-900/10 dark:border-stone-800 bg-[#F8FBF8] dark:bg-stone-950 text-[11px] text-[#4B5D50] dark:text-stone-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Govt &amp; ICAR Contacts
        </span>
        <a
          href="https://icar.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline flex items-center gap-1"
        >
          ICAR <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
}

function InstitutionCard({ contact, isExact }: { contact: AgriContact; isExact: boolean }) {
  const cleanPhone = contact.phone.replace(/[^0-9+]/g, "");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    contact.address + " " + contact.name
  )}`;

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all text-left space-y-2.5 ${
        isExact
          ? "border-emerald-500/35 bg-emerald-50/50 dark:bg-emerald-950/20"
          : "border-emerald-900/10 dark:border-stone-800 bg-[#F8FBF8] dark:bg-stone-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20 uppercase">
              {contact.type.toUpperCase()}
            </span>
            {isExact && (
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                Nearest District Centre
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-[#143325] dark:text-stone-100 mt-1.5 leading-snug">
            {contact.name}
          </h4>
          <p className="text-[11px] text-[#4B5D50] dark:text-stone-400 font-medium">
            {contact.contactPerson ? `${contact.contactPerson} • ` : ""}
            {contact.designation}
          </p>
        </div>
      </div>

      {/* Address & Hours */}
      <div className="text-[11px] text-[#4B5D50] dark:text-stone-400 space-y-1">
        <p className="line-clamp-2 leading-relaxed">{contact.address}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] pt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {contact.workingHours}
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            Verified: {contact.verifiedDate}
          </span>
        </div>
      </div>

      {contact.servicesOffered && contact.servicesOffered.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {contact.servicesOffered.slice(0, 3).map((srv, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 text-[#4B5D50] dark:text-stone-300 border border-emerald-900/10 dark:border-stone-700"
            >
              {srv}
            </span>
          ))}
        </div>
      )}

      {/* Functional Action Buttons: Call Now, Directions, Email, Website */}
      <div className="pt-2 border-t border-emerald-900/10 dark:border-stone-800 grid grid-cols-2 gap-1.5">
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Now</span>
        </a>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-emerald-900/15 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-stone-800 text-foreground font-semibold text-xs transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          <span>Directions</span>
        </a>

        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-emerald-900/15 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-stone-800 text-foreground font-semibold text-xs transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>Email</span>
          </a>
        )}

        {contact.sourceUrl && (
          <a
            href={contact.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-emerald-900/15 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-stone-800 text-foreground font-semibold text-xs transition-colors ${
              !contact.email ? "col-span-2" : ""
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Website</span>
          </a>
        )}
      </div>
    </div>
  );
}
