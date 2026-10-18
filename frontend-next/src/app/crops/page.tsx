"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sprout,
  Plus,
  Layers,
  Calendar,
  Droplets,
  ArrowRight,
  Filter,
  Sparkles,
  RotateCw,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
} from "lucide-react";
import {
  fieldsApi,
  tasksApi,
  FarmerField,
  FarmTask,
} from "@/lib/farmer-api";

export default function CropsPage() {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FarmerField[]>([]);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [selectedCropFilter, setSelectedCropFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);

  // Form State
  const [fieldName, setFieldName] = useState("");
  const [acreage, setAcreage] = useState("2.5");
  const [cropName, setCropName] = useState("Wheat");
  const [variety, setVariety] = useState("");
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedHarvest, setExpectedHarvest] = useState("");
  const [soilType, setSoilType] = useState("Loamy");
  const [irrigationType, setIrrigationType] = useState("Tube well");
  const [season, setSeason] = useState("Rabi");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fData, tData] = await Promise.all([
        fieldsApi.list().catch(() => []),
        tasksApi.list().catch(() => []),
      ]);
      setFields(fData);
      setTasks(tData);
    } catch (err) {
      console.error("Crops page loading error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cropsList = Array.from(
    new Set(fields.map((f) => f.current_crop).filter(Boolean))
  ) as string[];

  const filteredFields = fields.filter((f) => {
    if (selectedCropFilter !== "all" && f.current_crop !== selectedCropFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.field_name?.toLowerCase().includes(q);
      const matchCrop = f.current_crop?.toLowerCase().includes(q);
      const matchVariety = f.crop_variety?.toLowerCase().includes(q);
      return matchName || matchCrop || matchVariety;
    }
    return true;
  });

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || !cropName.trim()) return;

    try {
      setSaving(true);
      if (editingFieldId) {
        await fieldsApi.update(editingFieldId, {
          field_name: fieldName.trim(),
          acreage: parseFloat(acreage) || undefined,
          current_crop: cropName.trim(),
          crop_variety: variety.trim() || undefined,
          sowing_date: sowingDate || undefined,
          expected_harvest: expectedHarvest || undefined,
          soil_type: soilType,
          irrigation_type: irrigationType,
          season: season,
        });
      } else {
        await fieldsApi.create({
          field_name: fieldName.trim(),
          acreage: parseFloat(acreage) || undefined,
          area_unit: "acre",
          current_crop: cropName.trim(),
          crop_variety: variety.trim() || undefined,
          sowing_date: sowingDate || undefined,
          expected_harvest: expectedHarvest || undefined,
          soil_type: soilType,
          irrigation_type: irrigationType,
          season: season,
        });
      }

      setShowModal(false);
      setEditingFieldId(null);
      setFieldName("");
      setVariety("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save plot.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (id: number) => {
    if (!confirm("Are you sure you want to remove this field plot?")) return;
    try {
      await fieldsApi.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete field.");
    }
  };

  const getGrowthProgress = (sowingDateStr?: string | null, harvestDateStr?: string | null) => {
    if (!sowingDateStr) return { stage: "Stage Not Tracked", percent: 0, daysPassed: 0 };
    const sowing = new Date(sowingDateStr).getTime();
    const now = Date.now();
    const harvest = harvestDateStr
      ? new Date(harvestDateStr).getTime()
      : sowing + 120 * 24 * 60 * 60 * 1000;

    const totalDuration = Math.max(harvest - sowing, 1);
    const elapsed = Math.max(now - sowing, 0);
    const percent = Math.min(Math.round((elapsed / totalDuration) * 100), 100);
    const daysPassed = Math.round(elapsed / (24 * 60 * 60 * 1000));

    let stage = "Early Vegetative";
    if (percent > 85) stage = "Maturity / Harvest";
    else if (percent > 65) stage = "Grain / Fruit Formation";
    else if (percent > 40) stage = "Flowering / Tillering";
    else if (percent > 20) stage = "Active Vegetative";

    return { stage, percent, daysPassed };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <Sprout className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Crops & Field Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track individual plots, vegetative growth stages, sowing calendars, and crop-specific tasks.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingFieldId(null);
            setFieldName("");
            setVariety("");
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plot / Crop</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCropFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCropFilter === "all"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Crops ({fields.length})
          </button>

          {cropsList.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCropFilter(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCropFilter === crop
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {crop}
            </button>
          ))}
        </div>

        <div className="relative sm:w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search plot or variety..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Fields & Crops Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RotateCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading crops and fields...</p>
        </div>
      ) : filteredFields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <Sprout className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Farm Plots Registered
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Register your first agricultural plot to track crop stages, calculate irrigation needs, and receive fertilizer alerts.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Your First Plot</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFields.map((field) => {
            const crop = field.current_crop || "Unspecified Crop";
            const { stage, percent, daysPassed } = getGrowthProgress(
              field.sowing_date,
              field.expected_harvest
            );
            const relatedTasks = tasks.filter((t) => t.field_id === field.id && t.status === "pending");

            return (
              <div
                key={field.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-500/50 transition duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{field.field_name || "Plot #" + field.id}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {field.acreage ? `${field.acreage} ${field.area_unit || "Acres"}` : "Size not set"}
                        {field.season ? ` • ${field.season}` : ""}
                      </p>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {crop}
                    </span>
                  </div>

                  {field.crop_variety && (
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Variety: <span className="text-emerald-700 dark:text-emerald-400">{field.crop_variety}</span>
                    </div>
                  )}

                  {/* Growth Stage Progress */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/60 space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{stage}</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-600">{percent}%</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{daysPassed > 0 ? `Day ${daysPassed} since sowing` : "Sowing not set"}</span>
                      {field.expected_harvest && <span>Harvest: {field.expected_harvest}</span>}
                    </div>
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 mb-3">
                    {field.soil_type && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        Soil: {field.soil_type}
                      </span>
                    )}
                    {field.irrigation_type && (
                      <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> {field.irrigation_type}
                      </span>
                    )}
                    {relatedTasks.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {relatedTasks.length} Pending Tasks
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <Link
                    href={`/chatbot?query=${encodeURIComponent(
                      `Give me a complete scientific management plan for my ${crop} (variety: ${field.crop_variety || "standard"}) in ${field.field_name || "plot"} at stage ${stage}`
                    )}`}
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Crop Advice</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingFieldId(field.id);
                        setFieldName(field.field_name || "");
                        setAcreage(String(field.acreage || ""));
                        setCropName(field.current_crop || "");
                        setVariety(field.crop_variety || "");
                        setSowingDate(field.sowing_date || "");
                        setExpectedHarvest(field.expected_harvest || "");
                        setSoilType(field.soil_type || "Loamy");
                        setIrrigationType(field.irrigation_type || "Tube well");
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Plot"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Plot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit Plot */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {editingFieldId ? "Edit Plot & Crop Details" : "Register New Plot & Crop"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Map field dimensions, seed variety, and sowing dates for accurate AI recommendations.
            </p>

            <form onSubmit={handleSaveField} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plot / Field Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. East Well Plot"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plot Acreage
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 2.5"
                    value={acreage}
                    onChange={(e) => setAcreage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Crop *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wheat, Mustard"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seed Variety (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HD-2967"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sowing Date
                  </label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    value={expectedHarvest}
                    onChange={(e) => setExpectedHarvest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Soil Type
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Black">Black Soil</option>
                    <option value="Alluvial">Alluvial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Irrigation Type
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Tube well">Tube well</option>
                    <option value="Canal">Canal</option>
                    <option value="Drip">Drip</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Rain-fed">Rain-fed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Rabi">Rabi</option>
                    <option value="Kharif">Kharif</option>
                    <option value="Zaid">Zaid</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{editingFieldId ? "Save Changes" : "Register Plot"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
