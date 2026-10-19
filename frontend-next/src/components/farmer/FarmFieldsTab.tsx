/**
 * Farm & Fields Tab — CRUD for farms and plots.
 */
"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Layers, MapPin, Sprout, Droplets, Save, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { Farm, FarmerField } from "@/lib/farmer-api";
import { farmsApi, fieldsApi, acresToHectares, hectaresToAcres } from "@/lib/farmer-api";

interface Props {
  farms: Farm[];
  fields: FarmerField[];
  onRefresh: () => Promise<void>;
  lang: string;
}

const SOIL_TYPES = ["Loamy", "Sandy", "Clay", "Sandy Loam", "Clay Loam", "Silt Loam", "Black (Vertisol)", "Red (Laterite)", "Alluvial"];
const IRRIGATION_TYPES = ["Tube well", "Canal", "Drip", "Sprinkler", "Rain-fed", "Tank / Pond", "River / Stream", "Bore well"];
const SEASONS = ["Kharif (खरीफ)", "Rabi (रबी)", "Zaid (जायद)", "Year-round"];
const AREA_UNITS = ["acre", "hectare", "bigha"] as const;

function FarmForm({ farm, onSave, onCancel, lang }: {
  farm?: Farm;
  onSave: (data: Partial<Farm>) => Promise<void>;
  onCancel: () => void;
  lang: string;
}) {
  const isKn = lang === "kn";
  const hi = lang === "hi";
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: farm?.name ?? "",
    location_text: farm?.location_text ?? "",
    village_name: farm?.village_name ?? "",
    district_name: farm?.district_name ?? "",
    state_name: farm?.state_name ?? "",
    notes: farm?.notes ?? "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border border-primary/20 bg-primary/5">
      <h4 className="text-sm font-bold text-foreground">
        {farm
          ? isKn ? "ಜಮೀನು ಸಂಪಾದಿಸಿ" : hi ? "खेत संपादित करें" : "Edit Farm"
          : isKn ? "ಹೊಸ ಜಮೀನು ಸೇರಿಸಿ" : hi ? "नया खेत जोड़ें" : "Add New Farm"}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-field">{isKn ? "ಜಮೀನಿನ ಹೆಸರು*" : hi ? "खेत का नाम*" : "Farm Name*"}</label>
          <input
            required
            value={form.name}
            onChange={e => set("name", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಉದಾ: ನನ್ನ ಜಮೀನು, ಕಾವೇರಿ ಫಾರ್ಮ್" : hi ? "जैसे: मेरा खेत, नर्मदा फार्म" : "e.g. My Farm, Narmada Farm"}
          />
        </div>
        <div>
          <label className="label-field">{isKn ? "ಗ್ರಾಮ" : hi ? "गाँव" : "Village"}</label>
          <input
            value={form.village_name}
            onChange={e => set("village_name", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಗ್ರಾಮದ ಹೆಸರು" : hi ? "गाँव का नाम" : "Village name"}
          />
        </div>
        <div>
          <label className="label-field">{isKn ? "ಜಿಲ್ಲೆ" : hi ? "जिला" : "District"}</label>
          <input
            value={form.district_name}
            onChange={e => set("district_name", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಜಿಲ್ಲೆ" : hi ? "जिला" : "District"}
          />
        </div>
        <div>
          <label className="label-field">{isKn ? "ರಾಜ್ಯ" : hi ? "राज्य" : "State"}</label>
          <input
            value={form.state_name}
            onChange={e => set("state_name", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ರಾಜ್ಯ" : hi ? "राज्य" : "State"}
          />
        </div>
        <div>
          <label className="label-field">{isKn ? "ವಿಳಾಸ / ಸ್ಥಳ" : hi ? "पता / स्थान" : "Location Text"}</label>
          <input
            value={form.location_text}
            onChange={e => set("location_text", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಸಂಪೂರ್ಣ ವಿಳಾಸ" : hi ? "पूरा पता" : "Full address"}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">{isKn ? "ಟಿಪ್ಪಣಿ" : hi ? "टिप्पणी" : "Notes"}</label>
          <textarea
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            className="input-field resize-none"
            rows={2}
            placeholder={isKn ? "ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ..." : hi ? "अतिरिक्त जानकारी..." : "Additional notes..."}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5 h-9 text-xs">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isKn ? "ಉಳಿಸಿ" : hi ? "सहेजें" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary h-9 text-xs flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" />
          {isKn ? "ರದ್ದುಮಾಡಿ" : hi ? "रद्द करें" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

function FieldForm({ field, farms, onSave, onCancel, lang }: {
  field?: FarmerField;
  farms: Farm[];
  onSave: (data: Partial<FarmerField>) => Promise<void>;
  onCancel: () => void;
  lang: string;
}) {
  const isKn = lang === "kn";
  const hi = lang === "hi";
  const [saving, setSaving] = useState(false);
  const [areaUnit, setAreaUnit] = useState<"acre" | "hectare" | "bigha">(
    (field?.area_unit as any) ?? "acre"
  );
  const [form, setForm] = useState({
    field_name: field?.field_name ?? "",
    farm_id: field?.farm_id ? String(field.farm_id) : "",
    acreage: field?.acreage ? String(field.acreage) : "",
    soil_type: field?.soil_type ?? "",
    current_crop: field?.current_crop ?? "",
    crop_variety: field?.crop_variety ?? "",
    sowing_date: field?.sowing_date ?? "",
    expected_harvest: field?.expected_harvest ?? "",
    irrigation_type: field?.irrigation_type ?? "",
    water_source: field?.water_source ?? "",
    season: field?.season ?? "",
    previous_crop: field?.previous_crop ?? "",
    location_text: field?.location_text ?? "",
    notes: field?.notes ?? "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form, area_unit: areaUnit };
      if (payload.acreage) payload.acreage = parseFloat(payload.acreage);
      if (payload.farm_id) payload.farm_id = parseInt(payload.farm_id);
      else delete payload.farm_id;
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
      <h4 className="text-sm font-bold text-foreground">
        {field
          ? isKn ? "ಪ್ಲಾಟ್ ಸಂಪಾದಿಸಿ" : hi ? "भूखंड संपादित करें" : "Edit Plot"
          : isKn ? "ಹೊಸ ಪ್ಲಾಟ್ ಸೇರಿಸಿ" : hi ? "नया भूखंड जोड़ें" : "Add New Plot"}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label-field">{isKn ? "ಪ್ಲಾಟ್ ಹೆಸರು*" : hi ? "भूखंड का नाम*" : "Plot Name*"}</label>
          <input
            required
            value={form.field_name}
            onChange={e => set("field_name", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಉದಾ: ಪ್ಲಾಟ್-1, ಉತ್ತರ ಭಾಗ" : hi ? "जैसे: खेत-1, उत्तरी भाग" : "e.g. Plot-1, North Section"}
          />
        </div>
        {farms.length > 0 && (
          <div>
            <label className="label-field">{isKn ? "ಜಮೀನು" : hi ? "खेत" : "Farm"}</label>
            <select value={form.farm_id} onChange={e => set("farm_id", e.target.value)} className="input-field">
              <option value="">{isKn ? "ಜಮೀನು ಆಯ್ಕೆಮಾಡಿ" : hi ? "खेत चुनें" : "Select farm"}</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label-field">{isKn ? "ವಿಸ್ತೀರ್ಣ" : hi ? "क्षेत्रफल" : "Area"}</label>
          <div className="flex gap-1.5">
            <input type="number" min="0" step="0.01" value={form.acreage} onChange={e => set("acreage", e.target.value)} className="input-field flex-1" placeholder="0.0" />
            <select value={areaUnit} onChange={e => setAreaUnit(e.target.value as any)} className="input-field w-24">
              {AREA_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label-field">{isKn ? "ಮಣ್ಣಿನ ಪ್ರಕಾರ" : hi ? "मिट्टी का प्रकार" : "Soil Type"}</label>
          <select value={form.soil_type} onChange={e => set("soil_type", e.target.value)} className="input-field">
            <option value="">{isKn ? "ಆಯ್ಕೆಮಾಡಿ" : hi ? "चुनें" : "Select"}</option>
            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">{isKn ? "ಪ್ರಸ್ತುತ ಬೆಳೆ" : hi ? "वर्तमान फसल" : "Current Crop"}</label>
          <input
            value={form.current_crop}
            onChange={e => set("current_crop", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಉದಾ: ಗೋಧಿ, ಭತ್ತ, ರಾಗಿ" : hi ? "जैसे: गेहूँ, धान, सोयाबीन" : "e.g. Wheat, Rice"}
          />
        </div>
        <div>
          <label className="label-field">{isKn ? "ತಳಿ / ವೆರೈಟಿ" : hi ? "किस्म / वैरायटी" : "Crop Variety"}</label>
          <input
            value={form.crop_variety}
            onChange={e => set("crop_variety", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಉದಾ: HD-2967, GW-322" : hi ? "जैसे: HD-2967, GW-322" : "e.g. HD-2967, GW-322"}
          />
        </div>
        <div>
          <label className="label-field">{isKn ? "ಬಿತ್ತನೆ ದಿನಾಂಕ" : hi ? "बुआई की तारीख" : "Sowing Date"}</label>
          <input type="date" value={form.sowing_date} onChange={e => set("sowing_date", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-field">{isKn ? "ನಿರೀಕ್ಷಿತ ಕೊಯ್ಲು ದಿನಾಂಕ" : hi ? "कटाई की संभावित तारीख" : "Expected Harvest"}</label>
          <input type="date" value={form.expected_harvest} onChange={e => set("expected_harvest", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-field">{isKn ? "ಋತು / ಹಂಗಾಮು" : hi ? "मौसम" : "Season"}</label>
          <select value={form.season} onChange={e => set("season", e.target.value)} className="input-field">
            <option value="">{isKn ? "ಆಯ್ಕೆಮಾಡಿ" : hi ? "चुनें" : "Select"}</option>
            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">{isKn ? "ನೀರಾವರಿ ವಿಧಾನ" : hi ? "सिंचाई का प्रकार" : "Irrigation Type"}</label>
          <select value={form.irrigation_type} onChange={e => set("irrigation_type", e.target.value)} className="input-field">
            <option value="">{isKn ? "ಆಯ್ಕೆಮಾಡಿ" : hi ? "चुनें" : "Select"}</option>
            {IRRIGATION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">{isKn ? "ಹಿಂದಿನ ಬೆಳೆ" : hi ? "पिछली फसल" : "Previous Crop"}</label>
          <input
            value={form.previous_crop}
            onChange={e => set("previous_crop", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಉದಾ: ಸಾಸಿವೆ, ಕಡಲೆ" : hi ? "जैसे: सरसों, चना" : "e.g. Mustard, Chickpea"}
          />
        </div>
        <div>
          <label className="label-field">{isKn ? "ಸ್ಥಳ / ಸರ್ವೆ ನಂ" : hi ? "स्थान" : "Location"}</label>
          <input
            value={form.location_text}
            onChange={e => set("location_text", e.target.value)}
            className="input-field"
            placeholder={isKn ? "ಸರ್ವೆ ನಂ / ವಿಳಾಸ" : hi ? "खसरा / पता" : "Khasra / Address"}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="label-field">{isKn ? "ಟಿಪ್ಪಣಿ" : hi ? "टिप्पणी" : "Notes"}</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className="input-field resize-none" rows={2} />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5 h-9 text-xs">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isKn ? "ಉಳಿಸಿ" : hi ? "सहेजें" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary h-9 text-xs flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" />
          {isKn ? "ರದ್ದುಮಾಡಿ" : hi ? "रद्द करें" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

export function FarmFieldsTab({ farms, fields, onRefresh, lang }: Props) {
  const isKn = lang === "kn";
  const hi = lang === "hi";
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [editingField, setEditingField] = useState<FarmerField | null>(null);
  const [expandedFarms, setExpandedFarms] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleFarm = (id: number) => {
    setExpandedFarms(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSaveFarm = async (data: Partial<Farm>) => {
    setError(null);
    try {
      if (editingFarm) {
        await farmsApi.update(editingFarm.id, data);
        setEditingFarm(null);
      } else {
        await farmsApi.create(data as any);
        setShowFarmForm(false);
      }
      await onRefresh();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSaveField = async (data: Partial<FarmerField>) => {
    setError(null);
    try {
      if (editingField) {
        await fieldsApi.update(editingField.id, data);
        setEditingField(null);
      } else {
        await fieldsApi.create(data as any);
        setShowFieldForm(false);
      }
      await onRefresh();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeleteField = async (id: number) => {
    if (!confirm(isKn ? "ನೀವು ಈ ಪ್ಲಾಟ್ ಅಳಿಸಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?" : hi ? "क्या आप इस भूखंड को हटाना चाहते हैं?" : "Delete this plot?")) return;
    setDeleting(id);
    try {
      await fieldsApi.delete(id);
      await onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  // Group fields by farm
  const fieldsByFarm: Record<string, FarmerField[]> = {};
  fields.forEach(f => {
    const key = f.farm_id ? String(f.farm_id) : "ungrouped";
    fieldsByFarm[key] = [...(fieldsByFarm[key] ?? []), f];
  });

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Farms section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            {isKn ? "ನನ್ನ ಜಮೀನುಗಳು" : hi ? "मेरे खेत" : "My Farms"} ({farms.length})
          </h3>
          {!showFarmForm && !editingFarm && (
            <button onClick={() => setShowFarmForm(true)} className="btn-primary h-8 text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {isKn ? "ಜಮೀನು ಸೇರಿಸಿ" : hi ? "खेत जोड़ें" : "Add Farm"}
            </button>
          )}
        </div>

        {showFarmForm && (
          <FarmForm onSave={handleSaveFarm} onCancel={() => setShowFarmForm(false)} lang={lang} />
        )}

        {farms.map(farm => (
          <div key={farm.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => toggleFarm(farm.id)}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{farm.name}</p>
                  {(farm.village_name || farm.district_name || farm.state_name) && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />
                      {[farm.village_name, farm.district_name, farm.state_name].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-muted/60 border border-border rounded-full px-2 py-0.5">
                  {fieldsByFarm[String(farm.id)]?.length ?? 0} {isKn ? "ಪ್ಲಾಟ್‌ಗಳು" : hi ? "भूखंड" : "plots"}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setEditingFarm(farm); setShowFarmForm(false); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                {expandedFarms.has(farm.id) ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>

            {editingFarm?.id === farm.id && (
              <div className="p-4 border-t border-border">
                <FarmForm farm={farm} onSave={handleSaveFarm} onCancel={() => setEditingFarm(null)} lang={lang} />
              </div>
            )}

            {expandedFarms.has(farm.id) && (
              <div className="p-4 border-t border-border/50 space-y-2 bg-muted/10">
                {(fieldsByFarm[String(farm.id)] ?? []).map(field => (
                  <FieldCard key={field.id} field={field} onEdit={() => { setEditingField(field); setShowFieldForm(false); }} onDelete={() => handleDeleteField(field.id)} deleting={deleting === field.id} lang={lang} />
                ))}
                {(fieldsByFarm[String(farm.id)] ?? []).length === 0 && (
                  <p className="text-[11px] text-muted-foreground py-2">{isKn ? "ಯಾವುದೇ ಪ್ಲಾಟ್ ಸೇರಿಸಲಾಗಿಲ್ಲ." : hi ? "कोई भूखंड नहीं जोड़ा गया।" : "No plots added yet."}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {farms.length === 0 && !showFarmForm && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
            <Layers className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">{isKn ? "ಯಾವುದೇ ಜಮೀನು ಸೇರಿಸಲಾಗಿಲ್ಲ." : hi ? "कोई खेत नहीं जोड़ा गया।" : "No farms added yet."}</p>
          </div>
        )}
      </div>

      {/* Fields section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-600" />
            {isKn ? "ಎಲ್ಲಾ ಪ್ಲಾಟ್‌ಗಳು" : hi ? "सभी भूखंड" : "All Plots"} ({fields.length})
          </h3>
          {!showFieldForm && !editingField && (
            <button onClick={() => setShowFieldForm(true)} className="btn-secondary h-8 text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {isKn ? "ಪ್ಲಾಟ್ ಸೇರಿಸಿ" : hi ? "भूखंड जोड़ें" : "Add Plot"}
            </button>
          )}
        </div>

        {showFieldForm && (
          <FieldForm farms={farms} onSave={handleSaveField} onCancel={() => setShowFieldForm(false)} lang={lang} />
        )}

        {editingField && (
          <FieldForm field={editingField} farms={farms} onSave={handleSaveField} onCancel={() => setEditingField(null)} lang={lang} />
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(field => (
            <FieldCard key={field.id} field={field} onEdit={() => { setEditingField(field); setShowFieldForm(false); }} onDelete={() => handleDeleteField(field.id)} deleting={deleting === field.id} lang={lang} />
          ))}
        </div>

        {fields.length === 0 && !showFieldForm && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
            <Sprout className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">{isKn ? "ಯಾವುದೇ ಪ್ಲಾಟ್ ಸೇರಿಸಲಾಗಿಲ್ಲ." : hi ? "कोई भूखंड नहीं जोड़ा गया।" : "No plots added yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldCard({ field, onEdit, onDelete, deleting, lang }: {
  field: FarmerField;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
  lang: string;
}) {
  const isKn = lang === "kn";
  const hi = lang === "hi";
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">{field.field_name || (isKn ? "ಪ್ಲಾಟ್" : hi ? "भूखंड" : "Plot")}</p>
          {field.location_text && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-2.5 w-2.5" /> {field.location_text}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} disabled={deleting} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {field.acreage && (
          <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
            {field.acreage} {field.area_unit || "acre"}
          </span>
        )}
        {field.current_crop && (
          <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 flex items-center gap-1">
            <Sprout className="h-2.5 w-2.5" /> {field.current_crop}
          </span>
        )}
        {field.soil_type && (
          <span className="text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">
            {field.soil_type}
          </span>
        )}
        {field.irrigation_type && (
          <span className="text-[10px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 rounded-full px-2 py-0.5 flex items-center gap-1">
            <Droplets className="h-2.5 w-2.5" /> {field.irrigation_type}
          </span>
        )}
      </div>
      {field.sowing_date && (
        <p className="text-[10px] text-muted-foreground">
          {isKn ? "ಬಿತ್ತನೆ:" : hi ? "बुआई:" : "Sown:"} {new Date(field.sowing_date).toLocaleDateString(isKn ? "kn-IN" : hi ? "hi-IN" : "en-IN")}
          {field.expected_harvest && ` → ${isKn ? "ಕೊಯ್ಲು:" : hi ? "कटाई:" : "Harvest:"} ${new Date(field.expected_harvest).toLocaleDateString(isKn ? "kn-IN" : hi ? "hi-IN" : "en-IN")}`}
        </p>
      )}
    </div>
  );
}
