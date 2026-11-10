"use client";

import React, { useState } from "react";
import {
  X,
  Stethoscope,
  Upload,
  Camera,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Phone
} from "lucide-react";
import { CropDiagnosisRecord } from "@/lib/conversation-store";

interface CropDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosisHistory: CropDiagnosisRecord[];
  onStartNewDiagnosis: (cropHint: string, symptoms: string, imageFile?: File) => void;
}

export function CropDiagnosisModal({
  isOpen,
  onClose,
  diagnosisHistory,
  onStartNewDiagnosis
}: CropDiagnosisModalProps) {
  const [activeView, setActiveView] = useState<"history" | "new">("history");
  const [cropType, setCropType] = useState("Wheat");
  const [symptoms, setSymptoms] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartNewDiagnosis(cropType, symptoms, selectedFile || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Crop Disease Diagnosis & Health Clinic</h3>
              <p className="text-xs text-muted-foreground">
                Authentic visual inspection backed by ICAR & CIBRC treatment recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex border-b border-border/60 bg-muted/10 text-xs font-semibold px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveView("history")}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeView === "history"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Diagnosis History ({diagnosisHistory.length})
          </button>
          <button
            onClick={() => setActiveView("new")}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeView === "new"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            + New Crop Diagnosis
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1 text-xs">
          {activeView === "history" ? (
            diagnosisHistory.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-3">
                <Stethoscope className="w-8 h-8 mx-auto text-muted-foreground/30" />
                <p className="font-semibold text-foreground">No Crop Diagnosis Records Yet</p>
                <p className="text-[11px] max-w-sm mx-auto leading-relaxed">
                  Upload a photo of an affected leaf or describe symptoms in the chat. Each verified
                  diagnosis, calibrated confidence, and chemical dosage will be saved here for your records.
                </p>
                <button
                  onClick={() => setActiveView("new")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Start First Diagnosis
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnosisHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-2xl border border-border/60 bg-background/80 hover:border-emerald-500/40 transition-all flex items-start gap-3"
                  >
                    {rec.imageUrl ? (
                      <img
                        src={rec.imageUrl}
                        alt="Crop leaf"
                        className="w-16 h-16 rounded-xl object-cover border border-border/60 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
                        🌿
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">{rec.cropName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(rec.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {rec.diseaseName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        <strong>Remedy:</strong> {rec.keyRemedy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* New Diagnosis Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Select Crop
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Rice">Rice / Paddy (धान)</option>
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Cotton">Cotton (कपास)</option>
                    <option value="Maize">Corn / Maize (मक्का)</option>
                    <option value="Chilli">Chilli / Pepper (मिर्च)</option>
                    <option value="Sugarcane">Sugarcane (गन्ना)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Mustard">Mustard (सरसों)</option>
                    <option value="Gram">Gram / Chickpea (चना)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Upload or Capture Crop Leaf Photo
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-border/70 hover:border-emerald-500/50 rounded-2xl p-4 text-center cursor-pointer bg-muted/10 transition-colors">
                      <Upload className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                      <span className="text-xs font-semibold text-foreground block">
                        {selectedFile ? selectedFile.name : "Tap to upload leaf photo"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">JPEG, PNG or WebP (Max 15MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {previewUrl && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-emerald-500/50 shrink-0">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Describe Visible Symptoms (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Yellow linear powder stripes on wheat flag leaf, leaves curling upwards with small black specks..."
                    className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed">
                  <strong>Scientific Reality Notice:</strong> The diagnosis will be calibrated against
                  authentic ICAR pathogen profiles. If the image is blurry or symptoms do not match with
                  high certainty, the AI will honestly state uncertainty and refer you to your nearest KVK officer.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setActiveView("history")}
                  className="px-4 py-2 rounded-xl border border-border/60 hover:bg-muted font-semibold text-foreground"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                >
                  Analyze Plant Health
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
