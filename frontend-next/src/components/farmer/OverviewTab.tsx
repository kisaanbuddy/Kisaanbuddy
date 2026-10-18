/**
 * Overview Tab — shows farmer's farm summary, soil health gauge,
 * active crops count, and recent activity timeline.
 */
"use client";

import { useMemo } from "react";
import {
  Sprout, Droplets, MapPin, Layers, TrendingUp,
  FlaskConical, Calendar, ChevronRight, BadgeCheck, Clock
} from "lucide-react";
import Link from "next/link";
import type { FarmerProfile, Farm, FarmerField, SoilTest, Recommendation, FarmActivity } from "@/lib/farmer-api";
import { getSoilHealthScore, acresToHectares } from "@/lib/farmer-api";

interface Props {
  profile: FarmerProfile | null;
  farms: Farm[];
  fields: FarmerField[];
  soilTests: SoilTest[];
  recommendations: Recommendation[];
  activities: FarmActivity[];
  lang: string;
}

const CROP_STAGE_COLORS: Record<string, string> = {
  "sowing": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  "germination": "bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-500/20",
  "vegetative": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  "flowering": "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  "harvest": "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
};

function SoilHealthBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-500" :
    score >= 40 ? "bg-amber-500" :
    "bg-red-500";
  const label =
    score >= 70 ? "Good" :
    score >= 40 ? "Fair" :
    "Low";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-medium">
        <span className="text-muted-foreground">Soil Health</span>
        <span className="font-bold text-foreground">{label} ({score}%)</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-black text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function OverviewTab({ profile, farms, fields, soilTests, recommendations, activities, lang }: Props) {
  const hi = lang === "hi";

  const totalAreaAcres = useMemo(() =>
    fields.reduce((sum, f) => {
      if (!f.acreage) return sum;
      if (f.area_unit === "hectare") return sum + f.acreage * 2.47105;
      return sum + f.acreage;
    }, 0),
    [fields]
  );

  const activeCrops = fields.filter(f => f.current_crop).length;
  const latestSoilTest = soilTests[0] ?? null;
  const soilScore = latestSoilTest ? getSoilHealthScore(latestSoilTest) : 0;
  const pendingRecs = recommendations.filter(r => r.status === "pending").length;

  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          label={hi ? "कुल खेत" : "Total Farms"}
          value={farms.length}
          color="text-primary bg-primary/10 border-primary/20"
        />
        <StatCard
          icon={MapPin}
          label={hi ? "कुल भूखंड" : "Total Plots"}
          value={fields.length}
          color="text-indigo-600 bg-indigo-500/10 border-indigo-500/20"
        />
        <StatCard
          icon={Sprout}
          label={hi ? "सक्रिय फसलें" : "Active Crops"}
          value={activeCrops}
          color="text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label={hi ? "कुल क्षेत्र (एकड़)" : "Total Area (acres)"}
          value={totalAreaAcres > 0 ? totalAreaAcres.toFixed(1) : "—"}
          color="text-amber-600 bg-amber-500/10 border-amber-500/20"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Location & profile summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Farmer info card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {hi ? "किसान जानकारी" : "Farmer Information"}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {[
                { label: hi ? "गाँव" : "Village", value: profile?.village_name },
                { label: hi ? "जिला" : "District", value: profile?.district_name },
                { label: hi ? "राज्य" : "State", value: profile?.state_name },
                { label: hi ? "पिन कोड" : "PIN Code", value: profile?.pin_code },
                { label: hi ? "अनुभव" : "Experience", value: profile?.experience_years ? `${profile.experience_years} ${hi ? "वर्ष" : "years"}` : null },
                { label: hi ? "भूमि स्वामित्व" : "Land Ownership", value: profile?.land_ownership },
                { label: hi ? "सिंचाई" : "Irrigation", value: profile?.has_irrigation ? (hi ? "उपलब्ध" : "Available") : (hi ? "नहीं" : "None") },
                { label: hi ? "ट्रैक्टर" : "Tractor", value: profile?.has_tractor ? (hi ? "उपलब्ध" : "Available") : (hi ? "नहीं" : "None") },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">{label}</span>
                  <span className="font-medium text-foreground mt-0.5 block">{value || <span className="text-muted-foreground/60">—</span>}</span>
                </div>
              ))}
            </div>
            {profile?.equipment_list && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  {hi ? "उपकरण" : "Equipment"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.equipment_list.split(",").map(eq => (
                    <span key={eq} className="text-[10px] font-medium bg-muted/60 border border-border rounded-full px-2.5 py-0.5 text-foreground">
                      {eq.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active fields */}
          {fields.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-primary" />
                  {hi ? "सक्रिय फसलें" : "Active Crops"}
                </h3>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {fields.filter(f => f.current_crop).slice(0, 4).map(field => (
                  <div key={field.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate">{field.field_name || "Field"}</span>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
                        {field.acreage ? `${field.acreage} ${field.area_unit || "ac"}` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Sprout className="h-3 w-3 text-emerald-500" />
                      <span className="font-semibold text-foreground">{field.current_crop}</span>
                      {field.crop_variety && <span className="text-muted-foreground">({field.crop_variety})</span>}
                    </div>
                    <div className="flex gap-2">
                      {field.sowing_date && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-2.5 w-2.5" />
                          {hi ? "बुआई:" : "Sown:"} {new Date(field.sowing_date).toLocaleDateString()}
                        </span>
                      )}
                      {field.irrigation_type && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Droplets className="h-2.5 w-2.5 text-sky-500" />
                          {field.irrigation_type}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — soil + recommendations */}
        <div className="space-y-4">
          {/* Soil health */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-teal-600" />
              {hi ? "मिट्टी स्वास्थ्य" : "Soil Health"}
            </h3>
            {latestSoilTest ? (
              <div className="space-y-3">
                <SoilHealthBar score={soilScore} />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "pH", value: latestSoilTest.soil_ph?.toFixed(1), ideal: "6.0–7.5" },
                    { label: hi ? "नाइट्रोजन" : "Nitrogen (N)", value: latestSoilTest.nitrogen_kg_ha ? `${latestSoilTest.nitrogen_kg_ha} kg/ha` : null },
                    { label: hi ? "फास्फोरस" : "Phosphorus (P)", value: latestSoilTest.phosphorus_kg_ha ? `${latestSoilTest.phosphorus_kg_ha} kg/ha` : null },
                    { label: hi ? "पोटाश" : "Potassium (K)", value: latestSoilTest.potassium_kg_ha ? `${latestSoilTest.potassium_kg_ha} kg/ha` : null },
                    { label: hi ? "कार्बनिक" : "Org. Carbon", value: latestSoilTest.organic_carbon_pct ? `${latestSoilTest.organic_carbon_pct}%` : null },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="rounded-lg bg-muted/40 p-2.5">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">{label}</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{value}</p>
                    </div>
                  ) : null)}
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {hi ? "परीक्षण:" : "Tested:"} {new Date(latestSoilTest.test_date).toLocaleDateString()}
                  {latestSoilTest.is_verified && <BadgeCheck className="h-3 w-3 text-emerald-500 ml-1" />}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <FlaskConical className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  {hi ? "कोई मिट्टी परीक्षण नहीं है।" : "No soil test recorded yet."}
                </p>
              </div>
            )}
          </div>

          {/* Pending recommendations */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                {hi ? "सिफारिशें" : "Recommendations"}
              </span>
              {pendingRecs > 0 && (
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">
                  {pendingRecs} {hi ? "बाकी" : "pending"}
                </span>
              )}
            </h3>
            {recommendations.filter(r => r.status === "pending").slice(0, 3).length > 0 ? (
              <div className="space-y-2">
                {recommendations.filter(r => r.status === "pending").slice(0, 3).map(rec => (
                  <div key={rec.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                    <p className="text-xs font-bold text-foreground">{rec.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{rec.recommended_action}</p>
                    {rec.date_window && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{rec.date_window}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                {hi ? "कोई सक्रिय सिफारिश नहीं है।" : "No active recommendations."}
              </p>
            )}
          </div>

          {/* Recent activities */}
          {recentActivities.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                {hi ? "हाल की गतिविधियाँ" : "Recent Activities"}
              </h3>
              <div className="space-y-2">
                {recentActivities.map(act => (
                  <div key={act.id} className="flex items-center gap-2.5 py-1.5 border-b border-border/40 last:border-0">
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                      act.category === "income" ? "bg-emerald-500" :
                      act.category === "expense" ? "bg-red-500" : "bg-indigo-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{act.title}</p>
                      <p className="text-[10px] text-muted-foreground">{act.activity_date}</p>
                    </div>
                    {act.amount ? (
                      <span className={`ml-auto text-[11px] font-bold flex-shrink-0 ${
                        act.category === "income" ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {act.category === "income" ? "+" : "−"}₹{act.amount}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
