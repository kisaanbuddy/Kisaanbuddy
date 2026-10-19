/**
 * Overview Tab — shows farmer's farm summary, soil health gauge,
 * active crops count, and recent activity timeline.
 */
"use client";

import { useMemo } from "react";
import {
  Sprout, Droplets, MapPin, Layers, TrendingUp,
  FlaskConical, Calendar, Clock, BadgeCheck
} from "lucide-react";
import type { FarmerProfile, Farm, FarmerField, SoilTest, Recommendation, FarmActivity } from "@/lib/farmer-api";
import { getSoilHealthScore } from "@/lib/farmer-api";
import { FARMER_I18N } from "@/lib/farmer-i18n";

interface Props {
  profile: FarmerProfile | null;
  farms: Farm[];
  fields: FarmerField[];
  soilTests: SoilTest[];
  recommendations: Recommendation[];
  activities: FarmActivity[];
  lang: string;
}

function SoilHealthBar({ score, t }: { score: number; t: typeof FARMER_I18N['en'] }) {
  const color =
    score >= 70 ? "bg-emerald-500" :
    score >= 40 ? "bg-amber-500" :
    "bg-red-500";
  const label =
    score >= 70 ? t.soilGood :
    score >= 40 ? t.soilFair :
    t.soilLow;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-medium">
        <span className="text-muted-foreground">{t.soilHealth}</span>
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
  const t = FARMER_I18N[lang] || FARMER_I18N.en;

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
          label={t.totalFarms}
          value={farms.length}
          color="text-primary bg-primary/10 border-primary/20"
        />
        <StatCard
          icon={MapPin}
          label={t.totalPlots}
          value={fields.length}
          color="text-indigo-600 bg-indigo-500/10 border-indigo-500/20"
        />
        <StatCard
          icon={Sprout}
          label={t.activeCrops}
          value={activeCrops}
          color="text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label={t.areaAcreage}
          value={totalAreaAcres > 0 ? `${totalAreaAcres.toFixed(1)} ac` : "—"}
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
              {t.locationVillage}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {[
                { label: t.locationVillage, value: profile?.village_name },
                { label: t.district, value: profile?.district_name },
                { label: t.state, value: profile?.state_name },
                { label: "PIN", value: profile?.pin_code },
                { label: "Experience", value: profile?.experience_years ? `${profile.experience_years} yrs` : null },
                { label: "Ownership", value: profile?.land_ownership },
                { label: t.irrigationType, value: profile?.has_irrigation ? "✓" : "—" },
                { label: "Tractor", value: profile?.has_tractor ? "✓" : "—" },
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
                  Equipment
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
                  {t.activeCrops}
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
                          {t.sowing}: {new Date(field.sowing_date).toLocaleDateString()}
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
              {t.soilHealth}
            </h3>
            {latestSoilTest ? (
              <div className="space-y-3">
                <SoilHealthBar score={soilScore} t={t} />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "pH", value: latestSoilTest.soil_ph?.toFixed(1) },
                    { label: t.nitrogen, value: latestSoilTest.nitrogen_kg_ha ? `${latestSoilTest.nitrogen_kg_ha} kg/ha` : null },
                    { label: t.phosphorus, value: latestSoilTest.phosphorus_kg_ha ? `${latestSoilTest.phosphorus_kg_ha} kg/ha` : null },
                    { label: t.potassium, value: latestSoilTest.potassium_kg_ha ? `${latestSoilTest.potassium_kg_ha} kg/ha` : null },
                    { label: t.organicCarbon, value: latestSoilTest.organic_carbon_pct ? `${latestSoilTest.organic_carbon_pct}%` : null },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="rounded-lg bg-muted/40 p-2.5">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground truncate">{label}</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{value}</p>
                    </div>
                  ) : null)}
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t.date}: {new Date(latestSoilTest.test_date).toLocaleDateString()}
                  {latestSoilTest.is_verified && <BadgeCheck className="h-3 w-3 text-emerald-500 ml-1" />}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <FlaskConical className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  {t.noSoilTests}
                </p>
              </div>
            )}
          </div>

          {/* Pending recommendations */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                {t.recsTitle}
              </span>
              {pendingRecs > 0 && (
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">
                  {pendingRecs} {t.pendingRecs}
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
                {t.noRecs}
              </p>
            )}
          </div>

          {/* Recent activities */}
          {recentActivities.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                {t.recentActivity}
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
