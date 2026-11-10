"use client";

import React, { useState } from "react";
import {
  X,
  User,
  MapPin,
  Sprout,
  Droplets,
  Layers,
  Save,
  Trash2,
  Download,
  ShieldCheck,
  Check
} from "lucide-react";
import {
  FarmerProfileData,
  saveFarmerProfile,
  clearFarmerProfile,
  SoilType,
  IrrigationType,
  LandOwnership
} from "@/lib/farm-profile-store";
import { ALL_INDIAN_STATES } from "@/lib/agri-directory-store";

interface FarmProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FarmerProfileData;
  onProfileUpdated: (updated: FarmerProfileData) => void;
}

export function FarmProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated
}: FarmProfileModalProps) {
  const [formData, setFormData] = useState<FarmerProfileData>(profile);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleStateChange = (state: string) => {
    const matching = ALL_INDIAN_STATES.find((s) => s.name === state);
    const firstDistrict = matching ? matching.districts[0] : "";
    setFormData((prev) => ({
      ...prev,
      state,
      district: firstDistrict
    }));
  };

  const handleSave = () => {
    const updated = saveFarmerProfile(formData);
    onProfileUpdated(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your saved farm profile?")) {
      clearFarmerProfile();
      onProfileUpdated({
        ...formData,
        farmerName: "",
        farmSizeAcres: 0,
        mainCrops: [],
        consentGiven: false
      });
      onClose();
    }
  };

  const availableDistricts =
    ALL_INDIAN_STATES.find((s) => s.name === formData.state)?.districts || [formData.district];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">My Farm Profile & Land Context</h3>
              <p className="text-xs text-muted-foreground">
                Grounds KisaanBuddy AI advice in your exact soil type, crops, and regional weather
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

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          {/* Section 1: Farmer & Location */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Farmer & Location Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Farmer / Farm Name</label>
                <input
                  type="text"
                  value={formData.farmerName}
                  onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  {ALL_INDIAN_STATES.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">District</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Village / Gram Panchayat</label>
                <input
                  type="text"
                  value={formData.village || ""}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="e.g. Nilokheri / Rampur"
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Land & Soil */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Land Holding & Soil Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Farm Size (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.farmSizeAcres}
                  onChange={(e) =>
                    setFormData({ ...formData, farmSizeAcres: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Land Ownership</label>
                <select
                  value={formData.landOwnership}
                  onChange={(e) =>
                    setFormData({ ...formData, landOwnership: e.target.value as LandOwnership })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="owned">Self Owned (खुद की जमीन)</option>
                  <option value="leased">Leased / Pattedar (पट्टे पर)</option>
                  <option value="sharecropper">Sharecropper (बटाईदार)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Soil Type</label>
                <select
                  value={formData.soilType}
                  onChange={(e) =>
                    setFormData({ ...formData, soilType: e.target.value as SoilType })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="alluvial">Alluvial Soil (जलोढ़ मिट्टी)</option>
                  <option value="black">Black Cotton Soil (काली मिट्टी)</option>
                  <option value="red">Red Soil (लाल मिट्टी)</option>
                  <option value="sandy_loam">Sandy Loam (बलुई दोमट)</option>
                  <option value="clayey">Clayey Soil (चिकनी मिट्टी)</option>
                  <option value="laterite">Laterite Soil (लेटराइट)</option>
                  <option value="saline">Saline / Alkaline (खारी मिट्टी)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Crops & Management */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5" />
              Crops & Agronomic Practice
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">
                  Main Crops (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.mainCrops.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mainCrops: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder="e.g. Wheat, Basmati Rice, Mustard"
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">
                  Crop Varieties
                </label>
                <input
                  type="text"
                  value={formData.cropVarieties}
                  onChange={(e) => setFormData({ ...formData, cropVarieties: e.target.value })}
                  placeholder="e.g. HD-3226, Pusa 1509, Girnar-4"
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Irrigation Method</label>
                <select
                  value={formData.irrigationMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, irrigationMethod: e.target.value as IrrigationType })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="drip">Drip Irrigation (टपक सिंचाई)</option>
                  <option value="sprinkler">Sprinkler (फव्वारा सिंचाई)</option>
                  <option value="canal">Canal Irrigation (नहरी सिंचाई)</option>
                  <option value="borewell_flood">Borewell Flood (ट्यूबवेल क्यारी)</option>
                  <option value="rainfed">Rainfed / Barani (वर्षा आधारित)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">
                  Typical Fertilizer Usage
                </label>
                <input
                  type="text"
                  value={formData.fertilizerUsage}
                  onChange={(e) => setFormData({ ...formData, fertilizerUsage: e.target.value })}
                  placeholder="e.g. 2 bags Urea, 1 bag DAP, Zinc Sulphate"
                  className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-semibold">
                Historical Pest or Crop Disease Problems
              </label>
              <textarea
                rows={2}
                value={formData.previousCropProblems}
                onChange={(e) => setFormData({ ...formData, previousCropProblems: e.target.value })}
                placeholder="e.g. Yellow rust every winter, stem borer in paddy during monsoon, whitefly in cotton"
                className="w-full px-3 py-2 rounded-xl border border-border/70 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Privacy & Consent */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consentGiven}
                onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-foreground leading-relaxed">
                <strong>Explicit Privacy Consent:</strong> I agree to save this farm profile locally on
                my browser to personalize AI agronomist responses. I understand that I can update, export,
                or delete this data at any time.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-500/10 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Profile
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border/60 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? "Saved!" : "Save Farm Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
