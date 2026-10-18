"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  User, Layers, FlaskConical, BookOpen, TrendingUp, Sparkles,
  MapPin, Phone, Mail, Shield, Calendar, Edit3, Save, X, Plus,
  ChevronRight, ArrowLeft, Loader2, RefreshCw, CheckCircle2,
  AlertCircle, Droplets, Sprout, Tractor, Globe, Navigation
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import {
  farmerProfileApi,
  farmsApi,
  fieldsApi,
  soilTestsApi,
  recommendationsApi,
  activitiesApi,
  type FarmerProfile,
  type Farm,
  type FarmerField,
  type SoilTest,
  type Recommendation,
  type FarmActivity,
} from "@/lib/farmer-api";

import { OverviewTab } from "@/components/farmer/OverviewTab";
import { FarmFieldsTab } from "@/components/farmer/FarmFieldsTab";
import { SoilTestsTab } from "@/components/farmer/SoilTestsTab";
import { RecommendationsTab } from "@/components/farmer/RecommendationsTab";
import { ActivitiesTab } from "@/components/farmer/ActivitiesTab";

type TabId = "overview" | "farms" | "soil" | "activities" | "recommendations";

const TABS: { id: TabId; label: string; hiLabel: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", hiLabel: "अवलोकन", icon: User },
  { id: "farms", label: "Farms & Plots", hiLabel: "खेत व भूखंड", icon: Layers },
  { id: "soil", label: "Soil Health", hiLabel: "मिट्टी स्वास्थ्य", icon: FlaskConical },
  { id: "activities", label: "Farm Diary", hiLabel: "खेत डायरी", icon: BookOpen },
  { id: "recommendations", label: "AI Advisory", hiLabel: "AI सिफारिशें", icon: Sparkles },
];

const LANGUAGES = [
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "en", name: "English" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
];

const OWNERSHIP_OPTIONS = [
  { value: "owned", label: "Self Owned (खुद की जमीन)" },
  { value: "leased", label: "Leased / Rented (पट्टे पर)" },
  { value: "shared", label: "Shared / Both (साझा / दोनों)" },
];

export function FarmerProfileClient() {
  const { user, ready } = useAuth();
  const { lang } = useLanguage();
  const hi = lang === "hi";

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core data states
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<FarmerField[]>([]);
  const [soilTests, setSoilTests] = useState<SoilTest[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activities, setActivities] = useState<FarmActivity[]>([]);

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    village_name: "",
    block_name: "",
    district_name: "",
    state_name: "",
    pin_code: "",
    gps_lat: null as number | null,
    gps_lon: null as number | null,
    experience_years: 0,
    primary_crop: "",
    land_holding_acres: 0,
    land_ownership: "owned",
    has_irrigation: false,
    has_tractor: false,
    equipment_list: "",
    preferred_language: "hi",
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setError(null);
      const [profData, farmsData, fieldsData, soilData, recsData, actsData] = await Promise.all([
        farmerProfileApi.get().catch(() => null),
        farmsApi.list().catch(() => []),
        fieldsApi.list().catch(() => []),
        soilTestsApi.list().catch(() => []),
        recommendationsApi.list().catch(() => []),
        activitiesApi.list().catch(() => []),
      ]);

      if (profData) {
        setProfile(profData);
        setProfileForm({
          village_name: profData.village_name || "",
          block_name: profData.block_name || "",
          district_name: profData.district_name || "",
          state_name: profData.state_name || "",
          pin_code: profData.pin_code || "",
          gps_lat: profData.gps_lat || null,
          gps_lon: profData.gps_lon || null,
          experience_years: profData.experience_years || 0,
          primary_crop: profData.primary_crop || "",
          land_holding_acres: profData.land_holding_acres || 0,
          land_ownership: profData.land_ownership || "owned",
          has_irrigation: profData.has_irrigation || false,
          has_tractor: profData.has_tractor || false,
          equipment_list: profData.equipment_list || "",
          preferred_language: profData.preferred_language || lang || "hi",
        });
      }
      setFarms(farmsData);
      setFields(fieldsData);
      setSoilTests(soilData);
      setRecommendations(recsData);
      setActivities(actsData);
    } catch (e: any) {
      setError(e.message || "Failed to load farmer profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lang]);

  useEffect(() => {
    if (user) {
      loadAllData();
    } else if (ready) {
      setLoading(false);
    }
  }, [user, ready, loadAllData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const updated = await farmerProfileApi.update(profileForm);
      setProfile(updated);
      setIsEditingProfile(false);
    } catch (err: any) {
      setError(err.message || "Could not save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleFetchGps = () => {
    if (!navigator.geolocation) {
      setGpsError(hi ? "ब्राउज़र जीपीएस का समर्थन नहीं करता।" : "Browser does not support GPS.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfileForm((prev) => ({
          ...prev,
          gps_lat: Math.round(pos.coords.latitude * 1000000) / 1000000,
          gps_lon: Math.round(pos.coords.longitude * 1000000) / 1000000,
        }));
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? (hi ? "स्थान अनुमति अस्वीकार कर दी गई।" : "Location permission denied.")
            : (hi ? "स्थान प्राप्त करने में विफल।" : "Failed to retrieve location.")
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!ready || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground font-semibold text-sm">
          <Loader2 className="h-5 w-5 rounded-full animate-spin text-primary" />
          <span>{hi ? "किसान प्रोफाइल लोड हो रही है..." : "Loading Farmer Profile..."}</span>
        </div>
      </div>
    );
  }

  // Generate unique Farmer ID display
  const farmerDisplayId = `KB-FARMER-${String(profile?.id || user?.id || 1001).padStart(5, "0")}`;

  return (
    <div className="max-w-6xl mx-auto py-6 px-3 sm:px-6 space-y-6">
      {/* Back and Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{hi ? "प्रोफाइल पेज पर वापस जाएं" : "Back to User Account"}</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-display">
              {hi ? "किसान डिजिटल प्रोफाइल" : "Farmer Digital Profile"}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-bold text-primary font-mono">
              {farmerDisplayId}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {hi
              ? "आपका स्थायी डिजिटल कृषि रिकॉर्ड। AI सहायक इसी प्रोफ़ाइल का उपयोग करके आपकी ज़मीन, मिट्टी और फसल के अनुसार सटीक सलाह देता है।"
              : "Your permanent agricultural record. The AI assistant uses this profile to provide tailored, context-aware farming recommendations."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary h-9 text-xs flex items-center gap-1.5"
            title="Refresh records"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>{hi ? "रिफ्रेश" : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="btn-primary h-9 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{hi ? "प्रोफाइल संपादित करें" : "Edit Profile"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Farmer Summary Banner Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-sm">
              {user?.name?.[0]?.toUpperCase() || "K"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{user?.name || "Farmer"}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  {hi ? "सक्रिय किसान" : "Verified Farmer"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {[profile?.village_name, profile?.district_name, profile?.state_name, profile?.pin_code]
                  .filter(Boolean)
                  .join(", ") || (hi ? "स्थान दर्ज नहीं किया गया" : "Location not set")}
              </p>
              {profile?.gps_lat && profile?.gps_lon && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  GPS: {profile.gps_lat}, {profile.gps_lon}
                </p>
              )}
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-xl border border-border bg-muted/40 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {hi ? "कुल भूमि" : "Land Size"}
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {profile?.land_holding_acres ? `${profile.land_holding_acres} ac` : "—"}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {hi ? "मुख्य फसल" : "Primary Crop"}
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">
                {profile?.primary_crop || "—"}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {hi ? "सिंचाई सुविधा" : "Irrigation"}
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {profile?.has_irrigation ? (hi ? "उपलब्ध ✅" : "Yes ✅") : (hi ? "नहीं ❌" : "Rainfed ❌")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex border-b border-border space-x-1 sm:space-x-2 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{hi ? tab.hiLabel : tab.label}</span>
              {tab.id === "recommendations" && recommendations.filter((r) => r.status === "pending").length > 0 && (
                <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-1.5 py-0.2">
                  {recommendations.filter((r) => r.status === "pending").length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="mt-4">
        {activeTab === "overview" && (
          <OverviewTab
            profile={profile}
            farms={farms}
            fields={fields}
            soilTests={soilTests}
            recommendations={recommendations}
            activities={activities}
            lang={lang}
          />
        )}

        {activeTab === "farms" && (
          <FarmFieldsTab
            farms={farms}
            fields={fields}
            onRefresh={handleRefresh}
            lang={lang}
          />
        )}

        {activeTab === "soil" && (
          <SoilTestsTab
            soilTests={soilTests}
            fields={fields}
            onRefresh={handleRefresh}
            lang={lang}
          />
        )}

        {activeTab === "activities" && (
          <ActivitiesTab
            activities={activities}
            fields={fields}
            onRefresh={handleRefresh}
            lang={lang}
          />
        )}

        {activeTab === "recommendations" && (
          <RecommendationsTab
            recommendations={recommendations}
            onRefresh={handleRefresh}
            lang={lang}
          />
        )}
      </div>

      {/* Profile Edit Drawer / Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {hi ? "किसान प्रोफ़ाइल संपादित करें" : "Edit Farmer Profile"}
                  </h3>
                  <p className="text-xs text-muted-foreground">{farmerDisplayId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label-field">{hi ? "गाँव का नाम" : "Village"}</label>
                  <input
                    value={profileForm.village_name}
                    onChange={(e) => setProfileForm({ ...profileForm, village_name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Sehore"
                  />
                </div>

                <div>
                  <label className="label-field">{hi ? "ब्लॉक / तहसील" : "Block / Tehsil"}</label>
                  <input
                    value={profileForm.block_name}
                    onChange={(e) => setProfileForm({ ...profileForm, block_name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Ashta"
                  />
                </div>

                <div>
                  <label className="label-field">{hi ? "जिला" : "District"}</label>
                  <input
                    value={profileForm.district_name}
                    onChange={(e) => setProfileForm({ ...profileForm, district_name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Sehore"
                  />
                </div>

                <div>
                  <label className="label-field">{hi ? "राज्य" : "State"}</label>
                  <input
                    value={profileForm.state_name}
                    onChange={(e) => setProfileForm({ ...profileForm, state_name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Madhya Pradesh"
                  />
                </div>

                <div>
                  <label className="label-field">{hi ? "पिन कोड" : "PIN Code"}</label>
                  <input
                    value={profileForm.pin_code}
                    onChange={(e) => setProfileForm({ ...profileForm, pin_code: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 466001"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="label-field">{hi ? "पसंदीदा भाषा" : "Preferred Language"}</label>
                  <select
                    value={profileForm.preferred_language}
                    onChange={(e) => setProfileForm({ ...profileForm, preferred_language: e.target.value })}
                    className="input-field"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">{hi ? "कुल भूमि (एकड़)" : "Total Land Area (Acres)"}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={profileForm.land_holding_acres || ""}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, land_holding_acres: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="label-field">{hi ? "भूमि स्वामित्व स्थिति" : "Land Ownership"}</label>
                  <select
                    value={profileForm.land_ownership}
                    onChange={(e) => setProfileForm({ ...profileForm, land_ownership: e.target.value })}
                    className="input-field"
                  >
                    {OWNERSHIP_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">{hi ? "मुख्य फसल" : "Primary Crop"}</label>
                  <input
                    value={profileForm.primary_crop}
                    onChange={(e) => setProfileForm({ ...profileForm, primary_crop: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Wheat, Soybean"
                  />
                </div>

                <div>
                  <label className="label-field">{hi ? "खेती का अनुभव (वर्ष)" : "Farming Experience (Years)"}</label>
                  <input
                    type="number"
                    min="0"
                    value={profileForm.experience_years || ""}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, experience_years: parseInt(e.target.value) || 0 })
                    }
                    className="input-field"
                    placeholder="e.g. 15"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label-field">{hi ? "उपलब्ध कृषि उपकरण" : "Available Equipment"}</label>
                  <input
                    value={profileForm.equipment_list}
                    onChange={(e) => setProfileForm({ ...profileForm, equipment_list: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Tractor, Rotavator, Drip Kit, Seed Drill"
                  />
                </div>

                {/* GPS location section */}
                <div className="sm:col-span-2 rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-primary" />
                        {hi ? "खेत GPS निर्देशांक (वैकल्पिक)" : "Farm GPS Location (Optional)"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {hi
                          ? "सटीक मौसम पूर्वानुमान और उपग्रह फसल निगरानी के लिए उपयोग किया जाता है।"
                          : "Used for hyper-local weather alerts and satellite crop monitoring."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFetchGps}
                      disabled={gpsLoading}
                      className="btn-secondary h-8 text-xs flex items-center gap-1 shrink-0"
                    >
                      {gpsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
                      <span>{hi ? "वर्तमान GPS लें" : "Get GPS"}</span>
                    </button>
                  </div>
                  {gpsError && <p className="text-[11px] text-destructive font-medium">{gpsError}</p>}
                  {profileForm.gps_lat && profileForm.gps_lon && (
                    <p className="text-[11px] font-mono font-semibold text-primary">
                      Latitude: {profileForm.gps_lat}, Longitude: {profileForm.gps_lon}
                    </p>
                  )}
                </div>

                {/* Checkbox options */}
                <div className="flex items-center gap-6 sm:col-span-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={profileForm.has_irrigation}
                      onChange={(e) => setProfileForm({ ...profileForm, has_irrigation: e.target.checked })}
                      className="h-4 w-4 rounded border-border text-primary accent-primary"
                    />
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Droplets className="h-3.5 w-3.5 text-sky-500" />
                      {hi ? "सिंचाई सुविधा उपलब्ध है" : "Has Irrigation Facility"}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={profileForm.has_tractor}
                      onChange={(e) => setProfileForm({ ...profileForm, has_tractor: e.target.checked })}
                      className="h-4 w-4 rounded border-border text-primary accent-primary"
                    />
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Tractor className="h-3.5 w-3.5 text-amber-500" />
                      {hi ? "ट्रैक्टर उपलब्ध है" : "Has Tractor"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="btn-secondary h-9 text-xs"
                >
                  {hi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="btn-primary h-9 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  {profileSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{hi ? "सहेजें" : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
