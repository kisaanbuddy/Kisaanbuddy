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
import { useLanguage } from "@/lib/language";

export default function ReportsPage() {
  const { lang } = useLanguage();
  const isKn = lang === "kn";
  const isHi = lang === "hi";

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
              {isKn ? "ಕೃಷಿ ಕಾರ್ಯಕ್ಷಮತೆ ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ" : isHi ? "फार्म प्रदर्शन रिपोर्ट और विश्लेषण" : "Farm Performance Reports & Analytics"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isKn ? "ನಿಮ್ಮ ವಾಸ್ತವಿಕ ಜಮೀನು ದಾಖಲೆಗಳು, ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಬೆಳೆ ಇನ್‌ಪುಟ್‌ಗಳಿಂದ ಪಡೆದ ಡೇಟಾ ಆಧಾರಿತ ವಿಶ್ಲೇಷಣೆ." : isHi ? "आपके वास्तविक खेत लॉग, मिट्टी परीक्षण और मौसमी फसल आदानों से प्राप्त डेटा-आधारित विश्लेषण।" : "Data-proven analytics derived from your actual field logs, soil tests, and seasonal crop inputs."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{isKn ? "ವರದಿ ಮುದ್ರಿಸಿ" : isHi ? "रिपोर्ट प्रिंट करें" : "Print Report"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RotateCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">{isKn ? "ಕೃಷಿ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ..." : isHi ? "फार्म विश्लेषण तैयार हो रहा है..." : "Compiling farm analytics..."}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isKn ? "ದಾಖಲಾದ ವೆಚ್ಚಗಳು" : isHi ? "दर्ज किए गए खर्च" : "Recorded Expenses"}
                </span>
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{totalExpense.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isKn ? "ರಸಗೊಬ್ಬರಗಳು, ಬೀಜಗಳು, ಕೂಲಿ ಮತ್ತು ಯಂತ್ರೋಪಕರಣಗಳು" : isHi ? "उर्वरक, बीज, श्रम और मशीनरी" : "Fertilizers, seeds, labour & machinery"}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isKn ? "ದಾಖಲಾದ ಬೆಳೆ ಮಾರಾಟ" : isHi ? "दर्ज की गई फसल बिक्री" : "Recorded Harvest Sales"}
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                ₹{totalIncome.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isKn ? "ಮಂಡಿ ಮಾರಾಟ ಮತ್ತು ಸಗಟು ವಹಿವಾಟುಗಳು" : isHi ? "मंडी बिक्री और प्रत्यक्ष थोक लेनदेन" : "Mandi sales & direct wholesale transactions"}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isKn ? "ನಿವ್ವಳ ಹಂಗಾಮಿನ ಲಾಭಾಂಶ" : isHi ? "शुद्ध मौसमी मार्जिन" : "Net Seasonal Margin"}
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
                  ? (isKn ? "ಲಾಭಾಂಶ ಲೆಕ್ಕಹಾಕಲು ಖೇತ್ ಡೈರಿಯಲ್ಲಿ ನಮೂದುಗಳನ್ನು ಸೇರಿಸಿ" : isHi ? "मार्जिन की गणना के लिए खेत डायरी में प्रविष्टियां दर्ज करें" : "Log entries in Khet Diary to compute margins")
                  : (isKn ? `${activities.length} ಲೆಕ್ಕಪತ್ರ ನಮೂದುಗಳಿಂದ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ` : isHi ? `${activities.length} बहीखाता प्रविष्टियों से गणना की गई` : `Calculated from ${activities.length} ledger entries`)}
              </p>
            </div>
          </div>

          {/* Plot Land Distribution Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isKn ? "ಜಮೀನು ಹಂಚಿಕೆ ಮತ್ತು ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ" : isHi ? "प्लॉट भूमि वितरण और फसल अनुसूची" : "Plot Land Distribution & Crop Schedule"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isKn 
                    ? `ಒಟ್ಟು ಕೃಷಿ ವಿಸ್ತೀರ್ಣ: ${fields.length} ಪ್ಲಾಟ್‌ಗಳಲ್ಲಿ ${totalAcreage.toFixed(1)} ಎಕರೆ` 
                    : isHi 
                    ? `कुल कृषि रकबा: ${fields.length} प्लॉटों में ${totalAcreage.toFixed(1)} एकड़` 
                    : `Total Farm Acreage: ${totalAcreage.toFixed(1)} Acres across ${fields.length} plots`}
                </p>
              </div>

              <Link
                href="/profile?tab=fields"
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{isKn ? "ಜಮೀನು ತಿದ್ದುಪಡಿ" : isHi ? "खेत संपादित करें" : "Edit Fields"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {fields.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {isKn ? "ಇನ್ನೂ ಯಾವುದೇ ಪ್ಲಾಟ್‌ಗಳನ್ನು ನೋಂದಾಯಿಸಿಲ್ಲ. ವಿಸ್ತೀರ್ಣ ಹಂಚಿಕೆಯನ್ನು ನೋಡಲು ನಿಮ್ಮ ಜಮೀನುಗಳನ್ನು ನೋಂದಾಯಿಸಿ." : isHi ? "अभी तक कोई प्लॉट पंजीकृत नहीं है। रकबा वितरण देखने के लिए अपने खेत पंजीकृत करें।" : "No plots registered yet. Register your fields to see acreage distribution."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-4 rounded-l-lg">{isKn ? "ಪ್ಲಾಟ್ ಹೆಸರು" : isHi ? "प्लॉट का नाम" : "Plot Name"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)" : isHi ? "रकबा (एकड़)" : "Size (Acres)"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ಪ್ರಸ್ತುತ ಬೆಳೆ" : isHi ? "वर्तमान फसल" : "Current Crop"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ತಳಿ" : isHi ? "किस्म" : "Variety"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ಬಿತ್ತನೆ ದಿನಾಂಕ" : isHi ? "बुवाई की तारीख" : "Sowing Date"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ನೀರಾವರಿ" : isHi ? "सिंचाई" : "Irrigation"}</th>
                      <th className="py-2.5 px-4 rounded-r-lg">{isKn ? "ಮಣ್ಣಿನ ವಿಧ" : isHi ? "मिट्टी का प्रकार" : "Soil Type"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fields.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {f.field_name || (isKn ? `ಜಮೀನು #${f.id}` : isHi ? `प्लॉट #${f.id}` : `Plot #${f.id}`)}
                        </td>
                        <td className="py-3 px-4">{f.acreage || "—"}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                          {f.current_crop || (isKn ? "ನಿಗದಿಯಾಗಿಲ್ಲ" : isHi ? "असाइन नहीं" : "Not Assigned")}
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
                  {isKn ? "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ದಾಖಲೆಗಳು ಮತ್ತು ವಿವರ" : isHi ? "मृदा उर्वरता रिकॉर्ड और विवरण" : "Soil Fertility Records & Provenance"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isKn ? "ಪ್ರಯೋಗಾಲಯ ವರದಿಗಳು ಮತ್ತು ಜಮೀನು ಅಂದಾಜುಗಳಿಂದ ಪೋಷಕಾಂಶಗಳ ಇತಿಹಾಸ" : isHi ? "प्रयोगशाला रिपोर्ट और खेत के अनुमानों से पोषक तत्वों का इतिहास" : "Macronutrient history across laboratory reports and field estimates"}
                </p>
              </div>

              <Link
                href="/profile?tab=soil"
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{isKn ? "ಮಣ್ಣಿನ ವರದಿ ಸೇರಿಸಿ" : isHi ? "मृदा रिपोर्ट जोड़ें" : "Add Soil Report"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {soilTests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {isKn ? "ಯಾವುದೇ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ದಾಖಲಾಗಿಲ್ಲ. ಫಲವತ್ತತೆಯ ಪ್ರವೃತ್ತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯನ್ನು ದಾಖಲಿಸಿ." : isHi ? "कोई मिट्टी परीक्षण दर्ज नहीं है। उर्वरता रुझानों को ट्रैक करने के लिए मिट्टी परीक्षण दर्ज करें।" : "No soil tests recorded. Record a soil test or baseline estimate to track fertility trends."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-4 rounded-l-lg">{isKn ? "ಪರೀಕ್ಷಾ ದಿನಾಂಕ" : isHi ? "परीक्षण तिथि" : "Test Date"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ಪರಿಶೀಲನೆ" : isHi ? "सत्यापन" : "Verification"}</th>
                      <th className="py-2.5 px-4">pH</th>
                      <th className="py-2.5 px-4">{isKn ? "ಸಾರಜನಕ (N)" : isHi ? "नाइट्रोजन (N)" : "Nitrogen (N)"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ರಂಜಕ (P)" : isHi ? "फास्फोरस (P)" : "Phosphorus (P)"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ಪೊಟ್ಯಾಶ್ (K)" : isHi ? "पोटेशियम (K)" : "Potassium (K)"}</th>
                      <th className="py-2.5 px-4">{isKn ? "ಸಾವಯವ ಇಂಗಾಲ" : isHi ? "जैविक कार्बन" : "Organic Carbon"}</th>
                      <th className="py-2.5 px-4 rounded-r-lg">{isKn ? "ಲ್ಯಾಬ್ ಹೆಸರು" : isHi ? "प्रयोगशाला नाम" : "Lab Name"}</th>
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
                            {st.is_verified ? (isKn ? "ಲ್ಯಾಬ್ ಪರಿಶೀಲಿತ" : isHi ? "लैब सत्यापित" : "Lab Verified") : (isKn ? "ರೈತರ ಅಂದಾಜು" : isHi ? "किसान का अनुमान" : "Farmer Estimate")}
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
