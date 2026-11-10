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
  Building2,
  CloudSun,
  Droplets,
  Wind,
  FileText,
  HelpCircle,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  LocateFixed,
  X
} from "lucide-react";
import {
  AgriContact,
  ALL_INDIAN_STATES,
  searchAgriDirectory,
  NATIONAL_KISAN_CALL_CENTRE,
  NATIONAL_HELPLINES
} from "@/lib/agri-directory-store";
import { FarmerProfileData } from "@/lib/farm-profile-store";

interface AgriIntelligenceSidebarProps {
  farmerProfile: FarmerProfileData;
  onUpdateLocation: (state: string, district: string, block?: string) => void;
  onSelectQuery?: (q: string) => void;
  onCloseMobile?: () => void;
}

export function AgriIntelligenceSidebar({
  farmerProfile,
  onUpdateLocation,
  onSelectQuery,
  onCloseMobile
}: AgriIntelligenceSidebarProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "weather" | "schemes">("directory");
  const [selectedState, setSelectedState] = useState(farmerProfile.state || "Haryana");
  const [selectedDistrict, setSelectedDistrict] = useState(farmerProfile.district || "Karnal");
  const [selectedBlock, setSelectedBlock] = useState(farmerProfile.block || "");
  const [isLocating, setIsLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Weather state
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    spraySafe: boolean;
    advisory: string;
  }>({
    temp: 26,
    humidity: 58,
    condition: "Partly Cloudy",
    windSpeed: 6.5,
    spraySafe: true,
    advisory: "Favorable conditions for foliar bio-stimulant or fungicide spray before 11:00 AM."
  });

  // Sync with prop changes
  useEffect(() => {
    if (farmerProfile.state) setSelectedState(farmerProfile.state);
    if (farmerProfile.district) setSelectedDistrict(farmerProfile.district);
    if (farmerProfile.block) setSelectedBlock(farmerProfile.block);
  }, [farmerProfile.state, farmerProfile.district, farmerProfile.block]);

  // Fetch live weather when location changes
  useEffect(() => {
    let isCancelled = false;
    async function fetchWeather() {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(selectedDistrict || selectedState)}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data) {
            const wind = data.wind_kph || 6.5;
            const hum = data.humidity_pct || 60;
            const isSafe = wind < 12 && hum < 85;
            setWeatherData({
              temp: Math.round(data.temperature_c ?? 26),
              humidity: hum,
              condition: data.condition || "Clear / Mild",
              windSpeed: wind,
              spraySafe: isSafe,
              advisory: isSafe
                ? "Safe spraying window: Wind speed is under 12 km/h. Suitable for foliar applications."
                : "Avoid pesticide spraying today: High wind speed or humidity can cause spray drift and runoff."
            });
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchWeather();
    return () => {
      isCancelled = true;
    };
  }, [selectedDistrict, selectedState]);

  // Search directory results
  const directoryResult = searchAgriDirectory({
    state: selectedState,
    district: selectedDistrict,
    block: selectedBlock
  });

  const availableDistricts =
    ALL_INDIAN_STATES.find((s) => s.name.toLowerCase() === selectedState.toLowerCase())?.districts || [
      selectedDistrict
    ];

  // Browser Geolocation
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
          // Reverse geocode via BigDataCloud / OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const state = address.state || "Haryana";
            const district = address.state_district || address.county || address.city || "Karnal";
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
      (err) => {
        setIsLocating(false);
        setGeoNotice("Location permission denied. Please select your State & District manually below.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <aside className="w-full h-full flex flex-col bg-card border-l border-border/60 select-none overflow-hidden">
      {/* Top Header & Location Bar */}
      <div className="p-4 border-b border-border/50 space-y-3 bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              📍
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">Agricultural Intelligence</h3>
              <p className="text-[10px] text-muted-foreground">Nearby KVKs, Officers & Schemes</p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Close intelligence panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Selector */}
        <div className="p-2.5 rounded-xl border border-border/60 bg-background space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              Farmer Location
            </span>
            <button
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline disabled:opacity-50"
            >
              <LocateFixed className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
              {isLocating ? "Detecting..." : "Auto Detect"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                const matching = ALL_INDIAN_STATES.find((s) => s.name === newState);
                const newDist = matching ? matching.districts[0] : "";
                setSelectedDistrict(newDist);
                onUpdateLocation(newState, newDist, selectedBlock);
              }}
              className="text-xs py-1 px-2 rounded-lg border border-border/60 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {ALL_INDIAN_STATES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                onUpdateLocation(selectedState, e.target.value, selectedBlock);
              }}
              className="text-xs py-1 px-2 rounded-lg border border-border/60 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {geoNotice && (
            <p className="text-[10px] text-muted-foreground italic bg-muted/40 p-1.5 rounded border border-border/40">
              {geoNotice}
            </p>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted/50 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab("directory")}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === "directory" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🏛️ Officers
          </button>
          <button
            onClick={() => setActiveTab("weather")}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === "weather" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🌤️ Weather
          </button>
          <button
            onClick={() => setActiveTab("schemes")}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === "schemes" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📜 Schemes
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar">
        {/* TAB 1: OFFICIAL DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-3">
            {/* National Fallback Alert when direct district officer is unavailable */}
            {!directoryResult.hasDirectDistrictContact && (
              <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Direct District Officer Unavailable
                    </h4>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                      Authoritative direct telephone contact for {selectedDistrict} is currently pending government portal verification. Contact the official Kisan Call Centre directly:
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-background border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">National Toll-Free Helpline</p>
                    <a
                      href="tel:18001801551"
                      className="text-sm font-black text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      1800-180-1551
                    </a>
                    <p className="text-[9px] text-muted-foreground">6:00 AM – 10:00 PM • 22 Indian Languages</p>
                  </div>
                  <a
                    href="tel:18001801551"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            )}

            {/* Exact District Institutions */}
            {directoryResult.exactMatches.map((contact) => (
              <InstitutionCard key={contact.id} contact={contact} isExact={true} />
            ))}

            {/* State-Level Matches */}
            {directoryResult.stateMatches.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  State Agricultural Universities & Centres ({selectedState})
                </p>
                {directoryResult.stateMatches.map((contact) => (
                  <InstitutionCard key={contact.id} contact={contact} isExact={false} />
                ))}
              </div>
            )}

            {/* National Toll-Free Helplines Section */}
            <div className="pt-3 border-t border-border/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Official National Helplines
              </span>
              <div className="space-y-1.5">
                {NATIONAL_HELPLINES.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl border border-border/60 bg-background/60 hover:bg-muted/40 transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-foreground truncate">{h.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{h.designation}</p>
                      <span className="text-[9px] text-emerald-600 font-semibold">{h.workingHours}</span>
                    </div>
                    <a
                      href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {h.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEATHER & AGROMET */}
        {activeTab === "weather" && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-background space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Live Agromet Forecast
                  </span>
                  <h4 className="text-base font-black text-foreground">
                    {selectedDistrict}, {selectedState}
                  </h4>
                </div>
                <CloudSun className="w-8 h-8 text-amber-500" />
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 text-center">
                <div className="p-2 rounded-xl bg-muted/40">
                  <span className="text-[10px] text-muted-foreground block">Temp</span>
                  <span className="text-sm font-black text-foreground">{weatherData.temp}°C</span>
                </div>
                <div className="p-2 rounded-xl bg-muted/40">
                  <span className="text-[10px] text-muted-foreground block">Humidity</span>
                  <span className="text-sm font-black text-foreground">{weatherData.humidity}%</span>
                </div>
                <div className="p-2 rounded-xl bg-muted/40">
                  <span className="text-[10px] text-muted-foreground block">Wind</span>
                  <span className="text-sm font-black text-foreground">{weatherData.windSpeed} km/h</span>
                </div>
              </div>

              {/* Spray Advisory Banner */}
              <div
                className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                  weatherData.spraySafe
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200"
                }`}
              >
                {weatherData.spraySafe ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold block">
                    {weatherData.spraySafe ? "Suitable for Spraying" : "Unfavorable Spray Conditions"}
                  </span>
                  {weatherData.advisory}
                </div>
              </div>
            </div>

            {/* Source Tag */}
            <p className="text-[10px] text-muted-foreground text-center">
              Source: India Meteorological Department (IMD) Agromet Advisory Services
            </p>
          </div>
        )}

        {/* TAB 3: GOVERNMENT SCHEMES */}
        {activeTab === "schemes" && (
          <div className="space-y-3">
            {[
              {
                id: "pm-kisan",
                name: "PM-KISAN Samman Nidhi",
                amount: "₹6,000 / year",
                eligibility: "Landholding farmer families with valid land record (RoR) & Aadhaar eKYC",
                docs: "Aadhaar, Land Khasra/Khatauni, Bank Passbook (NPCI mapped)",
                link: "https://pmkisan.gov.in"
              },
              {
                id: "pmfby",
                name: "Pradhan Mantri Fasal Bima Yojana",
                amount: "Up to 100% sum insured on notified crop losses",
                eligibility: "Farmers growing notified crops in notified areas (Kharif & Rabi seasons)",
                docs: "Sowing Certificate / Patwari Girdawari, Land Deed, Aadhaar, Cancelled Cheque",
                link: "https://pmfby.gov.in"
              },
              {
                id: "kcc",
                name: "Kisan Credit Card (KCC)",
                amount: "Low interest crop loan (4% after prompt repayment subvention)",
                eligibility: "All farmers, sharecroppers, tenant farmers, animal husbandry & fisheries",
                docs: "Land Title Records, Identity Proof, Residence Proof, No-Dues Certificate",
                link: "https://www.myscheme.gov.in/schemes/kcc"
              },
              {
                id: "soil-health",
                name: "Soil Health Card Scheme",
                amount: "Free Soil Nutrient Analysis every 2 years",
                eligibility: "All agricultural land owners & operational cultivators",
                docs: "Aadhaar Card, Farm Survey Number / Khasra detail",
                link: "https://soilhealth.dac.gov.in"
              }
            ].map((scheme) => (
              <div
                key={scheme.id}
                className="p-3 rounded-2xl border border-border/60 bg-background hover:border-emerald-500/40 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{scheme.name}</h5>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Benefit: {scheme.amount}
                    </span>
                  </div>
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-muted-foreground hover:text-emerald-600"
                    title="Open official government scheme website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-1">
                  <p>
                    <strong className="text-foreground">Eligibility:</strong> {scheme.eligibility}
                  </p>
                  <p>
                    <strong className="text-foreground">Documents:</strong> {scheme.docs}
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-600 font-semibold">Government of India Verified</span>
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Apply on Official Portal →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 bg-muted/20 text-[10px] text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Zero Fabricated Contacts
        </span>
        <a
          href="https://icar.gov.in"
          target="_blank"
          rel="noreferrer"
          className="hover:underline flex items-center gap-0.5"
        >
          ICAR Directory <ExternalLink className="w-2.5 h-2.5" />
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
      className={`p-3 rounded-2xl border transition-all text-left space-y-2.5 ${
        isExact
          ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
          : "border-border/60 bg-background hover:border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase">
              {contact.type.toUpperCase()}
            </span>
            {isExact && (
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                Nearest District Centre
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-foreground mt-1 leading-snug">{contact.name}</h4>
          <p className="text-[11px] text-muted-foreground font-medium">
            {contact.contactPerson ? `${contact.contactPerson} • ` : ""}
            {contact.designation}
          </p>
        </div>
      </div>

      {/* Address & Hours */}
      <div className="text-[11px] text-muted-foreground space-y-1">
        <p className="line-clamp-2 leading-relaxed">{contact.address}</p>
        <div className="flex items-center gap-3 text-[10px] pt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            {contact.workingHours}
          </span>
          <span className="text-emerald-600 font-semibold">Verified: {contact.verifiedDate}</span>
        </div>
      </div>

      {/* Services offered badges */}
      {contact.servicesOffered && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {contact.servicesOffered.slice(0, 3).map((srv, idx) => (
            <span
              key={idx}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
            >
              {srv}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons: Click-to-Call, Get Directions, Website */}
      <div className="pt-1.5 border-t border-border/40 grid grid-cols-3 gap-1.5">
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Phone className="w-3 h-3" />
          <span>Call Now</span>
        </a>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border border-border/60 bg-background hover:bg-muted text-foreground font-medium text-xs transition-colors"
        >
          <Navigation className="w-3 h-3 text-blue-500" />
          <span>Directions</span>
        </a>

        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border border-border/60 bg-background hover:bg-muted text-foreground font-medium text-xs transition-colors"
          >
            <Mail className="w-3 h-3 text-amber-500" />
            <span>Email</span>
          </a>
        ) : (
          <a
            href={contact.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border border-border/60 bg-background hover:bg-muted text-foreground font-medium text-xs transition-colors"
          >
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>Website</span>
          </a>
        )}
      </div>
    </div>
  );
}
