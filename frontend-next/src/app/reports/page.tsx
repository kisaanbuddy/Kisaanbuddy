"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  FlaskConical,
  Calendar,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  RotateCw,
  Info,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import {
  fieldsApi,
  activitiesApi,
  soilTestsApi,
  tasksApi,
  FarmerField,
  FarmActivity,
  SoilTest,
  FarmTaskSummary,
} from "@/lib/farmer-api";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FarmerField[]>([]);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [soilTests, setSoilTests] = useState<SoilTest[]>([]);
  const [taskSummary, setTaskSummary] = useState<FarmTaskSummary | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [fRes, aRes, sRes, tRes] = await Promise.allSettled([
          fieldsApi.list(),
          activitiesApi.list(),
          soilTestsApi.list(),
          tasksApi.summary(),
        ]);
        if (fRes.status === "fulfilled") setFields(fRes.value);
        if (aRes.status === "fulfilled") setActivities(aRes.value);
        if (sRes.status === "fulfilled") setSoilTests(sRes.value);
        if (tRes.status === "fulfilled") setTaskSummary(tRes.value);
      } catch (err) {
        console.error("Reports data loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Financial calculations
  const totalExpense = activities
    .filter((a) => a.category === "expense" && a.amount)
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const totalIncome = activities
    .filter((a) => a.category === "income" && a.amount)
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const netMargin = totalIncome - totalExpense;

  // Acreage calculations
  const totalAcreage = fields.reduce((sum, f) => sum + (f.acreage || 0), 0);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Farm Performance Reports & Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-proven analytics derived from your actual field logs, soil tests, and seasonal crop inputs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RotateCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Compiling farm analytics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recorded Expenses
                </span>
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{totalExpense.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Fertilizers, seeds, labour & machinery
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recorded Harvest Sales
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                ₹{totalIncome.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Mandi sales & direct wholesale transactions
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Net Seasonal Margin
                </span>
                <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  netMargin >= 0
                    ? "text-slate-900 dark:text-white"
                    : "text-rose-600"
                }`}
              >
                {netMargin >= 0 ? `+₹${netMargin.toLocaleString()}` : `-₹${Math.abs(netMargin).toLocaleString()}`}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {activities.length === 0
                  ? "Log entries in Khet Diary to compute margins"
                  : `Calculated from ${activities.length} ledger entries`}
              </p>
            </div>
          </div>

          {/* Plot Land Distribution Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Plot Land Distribution & Crop Schedule
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total Farm Acreage: {totalAcreage.toFixed(1)} Acres across {fields.length} plots
                </p>
              </div>

              <Link
                href="/profile?tab=fields"
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Edit Fields</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {fields.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No plots registered yet. Register your fields to see acreage distribution.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-4 rounded-l-lg">Plot Name</th>
                      <th className="py-2.5 px-4">Size (Acres)</th>
                      <th className="py-2.5 px-4">Current Crop</th>
                      <th className="py-2.5 px-4">Variety</th>
                      <th className="py-2.5 px-4">Sowing Date</th>
                      <th className="py-2.5 px-4">Irrigation</th>
                      <th className="py-2.5 px-4 rounded-r-lg">Soil Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fields.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {f.field_name || "Plot #" + f.id}
                        </td>
                        <td className="py-3 px-4">{f.acreage || "—"}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                          {f.current_crop || "Not Assigned"}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{f.crop_variety || "—"}</td>
                        <td className="py-3 px-4 text-slate-500">{f.sowing_date || "—"}</td>
                        <td className="py-3 px-4 text-slate-500">{f.irrigation_type || "—"}</td>
                        <td className="py-3 px-4 text-slate-500">{f.soil_type || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Soil Fertility Provincial History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Soil Fertility Records & Provenance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Macronutrient history across laboratory reports and field estimates
                </p>
              </div>

              <Link
                href="/profile?tab=soil"
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Add Soil Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {soilTests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No soil tests recorded. Record a soil test or baseline estimate to track fertility trends.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-4 rounded-l-lg">Test Date</th>
                      <th className="py-2.5 px-4">Verification</th>
                      <th className="py-2.5 px-4">pH</th>
                      <th className="py-2.5 px-4">Nitrogen (N)</th>
                      <th className="py-2.5 px-4">Phosphorus (P)</th>
                      <th className="py-2.5 px-4">Potassium (K)</th>
                      <th className="py-2.5 px-4">Organic Carbon</th>
                      <th className="py-2.5 px-4 rounded-r-lg">Lab Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {soilTests.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {st.test_date}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.is_verified
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {st.is_verified ? "Lab Verified" : "Farmer Estimate"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{st.soil_ph ?? "—"}</td>
                        <td className="py-3 px-4">{st.nitrogen_kg_ha ? `${st.nitrogen_kg_ha} kg/ha` : "—"}</td>
                        <td className="py-3 px-4">{st.phosphorus_kg_ha ? `${st.phosphorus_kg_ha} kg/ha` : "—"}</td>
                        <td className="py-3 px-4">{st.potassium_kg_ha ? `${st.potassium_kg_ha} kg/ha` : "—"}</td>
                        <td className="py-3 px-4">{st.organic_carbon_pct ? `${st.organic_carbon_pct}%` : "—"}</td>
                        <td className="py-3 px-4 text-slate-500">{st.lab_name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
