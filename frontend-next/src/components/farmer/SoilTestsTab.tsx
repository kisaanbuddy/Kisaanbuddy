/**
 * Soil Tests Tab — record and view soil test results.
 */
"use client";

import { useState } from "react";
import {
  FlaskConical, Plus, Trash2, Edit3, Save, X, Loader2, BadgeCheck,
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import type { SoilTest, FarmerField } from "@/lib/farmer-api";
import { soilTestsApi, getSoilHealthScore } from "@/lib/farmer-api";
import { FARMER_I18N } from "@/lib/farmer-i18n";

interface Props {
  soilTests: SoilTest[];
  fields: FarmerField[];
  onRefresh: () => Promise<void>;
  lang: string;
}

const PH_LABELS: Record<string, { veryAcidic: string; acidic: string; optimal: string; slightlyAlkaline: string; alkaline: string }> = {
  en: { veryAcidic: "Very Acidic", acidic: "Acidic", optimal: "Optimal", slightlyAlkaline: "Slightly Alkaline", alkaline: "Alkaline" },
  hi: { veryAcidic: "अत्यधिक अम्लीय", acidic: "अम्लीय", optimal: "इष्टतम", slightlyAlkaline: "हल्का क्षारीय", alkaline: "क्षारीय" },
  kn: { veryAcidic: "ಅತ್ಯಂತ ಆಮ್ಲೀಯ", acidic: "ಆಮ್ಲೀಯ", optimal: "ಉತ್ತಮ ಮಟ್ಟ", slightlyAlkaline: "ಸ್ವಲ್ಪ ಕ್ಷಾರೀಯ", alkaline: "ಕ್ಷಾರೀಯ" },
  mr: { veryAcidic: "खूप आम्लयुक्त", acidic: "आम्लयुक्त", optimal: "योग्य (उत्कृष्ट)", slightlyAlkaline: "किंचित अल्कली", alkaline: "क्षारयुक्त" },
  te: { veryAcidic: "చాలా ఆమ్ల", acidic: "ఆమ్ల", optimal: "అనుకూలమైనది", slightlyAlkaline: "స్వల్ప క్షార", alkaline: "క్షార" },
  ta: { veryAcidic: "அதிக அமிலத்தன்மை", acidic: "அமிலத்தன்மை", optimal: "ஏற்ற அளவு", slightlyAlkaline: "லேசான காரத்தன்மை", alkaline: "காரத்தன்மை" },
  gu: { veryAcidic: "અતિશય એસિડિક", acidic: "એસિડિક", optimal: "આદર્શ", slightlyAlkaline: "સહેજ આલ્કલાઇન", alkaline: "આલ્કલાઇન" },
  bn: { veryAcidic: "অত্যধিক আম্লিক", acidic: "আম্লিক", optimal: "অনুকূল", slightlyAlkaline: "সামান্য ক্ষারীয়", alkaline: "ক্ষারীয়" },
  pa: { veryAcidic: "ਬਹੁਤ ਤੇਜ਼ਾਬੀ", acidic: "ਤੇਜ਼ਾਬੀ", optimal: "ਸਹੀ ਪੱਧਰ", slightlyAlkaline: "ਹਲਕਾ ਖਾਰਾ", alkaline: "ਖਾਰਾ" },
  ml: { veryAcidic: "കൂടുതൽ അമ്ലഗുണം", acidic: "അമ്ലഗുണം", optimal: "ഏറ്റവും അനുയോജ്യം", slightlyAlkaline: "നേരിയ ക്ഷാരം", alkaline: "ക്ഷാരഗുണം" },
  hi_en: { veryAcidic: "Very Acidic", acidic: "Acidic", optimal: "Optimal", slightlyAlkaline: "Slightly Alkaline", alkaline: "Alkaline" },
};

const LEVEL_LABELS: Record<string, { low: string; medium: string; high: string }> = {
  en: { low: "Low", medium: "Medium", high: "High" },
  hi: { low: "कम", medium: "मध्यम", high: "उच्च" },
  kn: { low: "ಕಡಿಮೆ", medium: "ಮಧ್ಯಮ", high: "ಹೆಚ್ಚು" },
  mr: { low: "कमी", medium: "मध्यम", high: "जास्त" },
  te: { low: "తక్కువ", medium: "మధ్యస్థం", high: "ఎక్కువ" },
  ta: { low: "குறைவு", medium: "மிதமானது", high: "அதிகம்" },
  gu: { low: "ઓછું", medium: "મધ્યમ", high: "વધુ" },
  bn: { low: "কম", medium: "মাঝারি", high: "বেশি" },
  pa: { low: "ਘੱਟ", medium: "ਦਰਮਿਆਨਾ", high: "ਵੱਧ" },
  ml: { low: "കുറവ്", medium: "ഇടത്തരം", high: "കൂടുതൽ" },
  hi_en: { low: "Low", medium: "Medium", high: "High" },
};

const PH_STATUS = (ph: number, lang = "en") => {
  const l = PH_LABELS[lang] || PH_LABELS.en;
  if (ph < 5.5) return { label: l.veryAcidic, color: "text-red-600" };
  if (ph < 6.0) return { label: l.acidic, color: "text-orange-600" };
  if (ph <= 7.5) return { label: l.optimal, color: "text-emerald-600" };
  if (ph <= 8.0) return { label: l.slightlyAlkaline, color: "text-amber-600" };
  return { label: l.alkaline, color: "text-red-600" };
};

const N_STATUS = (n: number, lang = "en") => {
  const l = LEVEL_LABELS[lang] || LEVEL_LABELS.en;
  if (n < 140) return { label: l.low, color: "text-red-600", icon: TrendingDown };
  if (n < 280) return { label: l.medium, color: "text-amber-600", icon: Minus };
  return { label: l.high, color: "text-emerald-600", icon: TrendingUp };
};

function SoilTestForm({ test, fields, onSave, onCancel, lang }: {
  test?: SoilTest;
  fields: FarmerField[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  lang: string;
}) {
  const t = FARMER_I18N[lang] || FARMER_I18N.en;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    field_id: test?.field_id ? String(test.field_id) : "",
    test_date: test?.test_date ?? new Date().toISOString().split("T")[0],
    lab_name: test?.lab_name ?? "",
    soil_type: test?.soil_type ?? "",
    soil_ph: test?.soil_ph !== null && test?.soil_ph !== undefined ? String(test.soil_ph) : "",
    nitrogen_kg_ha: test?.nitrogen_kg_ha !== null && test?.nitrogen_kg_ha !== undefined ? String(test.nitrogen_kg_ha) : "",
    phosphorus_kg_ha: test?.phosphorus_kg_ha !== null && test?.phosphorus_kg_ha !== undefined ? String(test.phosphorus_kg_ha) : "",
    potassium_kg_ha: test?.potassium_kg_ha !== null && test?.potassium_kg_ha !== undefined ? String(test.potassium_kg_ha) : "",
    organic_carbon_pct: test?.organic_carbon_pct !== null && test?.organic_carbon_pct !== undefined ? String(test.organic_carbon_pct) : "",
    ec_ds_m: test?.ec_ds_m !== null && test?.ec_ds_m !== undefined ? String(test.ec_ds_m) : "",
    is_verified: test?.is_verified ?? false,
    notes: test?.notes ?? "",
  });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (payload.field_id) payload.field_id = parseInt(payload.field_id);
      else delete payload.field_id;
      const numFields = ["soil_ph", "nitrogen_kg_ha", "phosphorus_kg_ha", "potassium_kg_ha", "organic_carbon_pct", "ec_ds_m"];
      numFields.forEach(k => { if (payload[k]) payload[k] = parseFloat(payload[k]); else delete payload[k]; });
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border border-teal-500/20 bg-teal-500/5">
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-teal-600" />
        {test ? t.edit : t.addSoilTest}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label-field">{t.date}*</label>
          <input required type="date" value={form.test_date} onChange={e => set("test_date", e.target.value)} className="input-field" />
        </div>
        {fields.length > 0 && (
          <div>
            <label className="label-field">{t.fieldPlot}</label>
            <select value={form.field_id} onChange={e => set("field_id", e.target.value)} className="input-field">
              <option value="">{t.allFields}</option>
              {fields.map(f => <option key={f.id} value={f.id}>{f.field_name || `Field ${f.id}`}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label-field">{t.labName}</label>
          <input
            value={form.lab_name}
            onChange={e => set("lab_name", e.target.value)}
            className="input-field"
            placeholder="e.g. ICAR Lab, KVK"
          />
        </div>
        <div>
          <label className="label-field">{t.soilType}</label>
          <input
            value={form.soil_type}
            onChange={e => set("soil_type", e.target.value)}
            className="input-field"
            placeholder="e.g. Loamy, Clay, Red"
          />
        </div>

        <div>
          <label className="label-field">Soil pH (0–14)</label>
          <input type="number" step="0.01" min="0" max="14" value={form.soil_ph} onChange={e => set("soil_ph", e.target.value)} className="input-field" placeholder="e.g. 6.5" />
        </div>
        <div>
          <label className="label-field">{t.nitrogen} kg/ha</label>
          <input type="number" step="0.1" min="0" value={form.nitrogen_kg_ha} onChange={e => set("nitrogen_kg_ha", e.target.value)} className="input-field" placeholder="e.g. 245" />
        </div>
        <div>
          <label className="label-field">{t.phosphorus} kg/ha</label>
          <input type="number" step="0.1" min="0" value={form.phosphorus_kg_ha} onChange={e => set("phosphorus_kg_ha", e.target.value)} className="input-field" placeholder="e.g. 18" />
        </div>
        <div>
          <label className="label-field">{t.potassium} kg/ha</label>
          <input type="number" step="0.1" min="0" value={form.potassium_kg_ha} onChange={e => set("potassium_kg_ha", e.target.value)} className="input-field" placeholder="e.g. 180" />
        </div>
        <div>
          <label className="label-field">{t.organicCarbon} (%)</label>
          <input type="number" step="0.01" min="0" max="100" value={form.organic_carbon_pct} onChange={e => set("organic_carbon_pct", e.target.value)} className="input-field" placeholder="e.g. 0.65" />
        </div>
        <div>
          <label className="label-field">{t.conductivity} (dS/m)</label>
          <input type="number" step="0.01" min="0" value={form.ec_ds_m} onChange={e => set("ec_ds_m", e.target.value)} className="input-field" placeholder="e.g. 0.45" />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_verified} onChange={e => set("is_verified", e.target.checked)} className="h-4 w-4 rounded border-border text-primary accent-primary" />
            <span className="text-xs font-medium text-foreground">{t.verifiedBadge}</span>
          </label>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="label-field">{t.notes}</label>
          <textarea
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            className="input-field resize-none"
            rows={2}
            placeholder={t.notes + "..."}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5 h-9 text-xs">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {t.save}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary h-9 text-xs flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" />
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

export function SoilTestsTab({ soilTests, fields, onRefresh, lang }: Props) {
  const t = FARMER_I18N[lang] || FARMER_I18N.en;
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<SoilTest | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: any) => {
    setError(null);
    try {
      if (editingTest) {
        await soilTestsApi.update(editingTest.id, data);
        setEditingTest(null);
      } else {
        await soilTestsApi.create(data);
        setShowForm(false);
      }
      await onRefresh();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    setDeleting(id);
    try {
      await soilTestsApi.delete(id);
      await onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const getFieldName = (id?: number | null) => {
    if (!id) return t.allFields;
    return fields.find(f => f.id === id)?.field_name ?? `Field ${id}`;
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-teal-600" />
          {t.soilTestsTitle} ({soilTests.length})
        </h3>
        {!showForm && !editingTest && (
          <button onClick={() => setShowForm(true)} className="btn-primary h-8 text-xs flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t.addSoilTest}
          </button>
        )}
      </div>

      {(showForm || editingTest) && (
        <SoilTestForm
          test={editingTest ?? undefined}
          fields={fields}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTest(null); }}
          lang={lang}
        />
      )}

      {soilTests.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3">
          <FlaskConical className="h-10 w-10 text-muted-foreground/25 mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">
            {t.noSoilTests}
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary h-9 text-xs mx-auto flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t.addSoilTest}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {soilTests.map(test => {
            const score = getSoilHealthScore(test);
            const phStatus = test.soil_ph ? PH_STATUS(test.soil_ph, lang) : null;
            const nStatus = test.nitrogen_kg_ha ? N_STATUS(test.nitrogen_kg_ha, lang) : null;
            const ocLevel = LEVEL_LABELS[lang] || LEVEL_LABELS.en;

            return (
              <div key={test.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {new Date(test.test_date).toLocaleDateString()}
                      </span>
                      {test.is_verified && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                          <BadgeCheck className="h-2.5 w-2.5" /> {t.verifiedBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getFieldName(test.field_id)}
                      {test.lab_name && ` • ${test.lab_name}`}
                      {test.soil_type && ` • ${test.soil_type}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${score >= 70 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" : score >= 40 ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"}`}>
                      {t.soilHealthScore}: {score}%
                    </span>
                    <button onClick={() => { setEditingTest(test); setShowForm(false); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(test.id)} disabled={deleting === test.id} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      {deleting === test.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {test.soil_ph !== null && test.soil_ph !== undefined && (
                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">pH</p>
                      <p className="text-lg font-black text-foreground">{test.soil_ph.toFixed(1)}</p>
                      {phStatus && <p className={`text-[10px] font-bold ${phStatus.color}`}>{phStatus.label}</p>}
                    </div>
                  )}
                  {test.nitrogen_kg_ha !== null && test.nitrogen_kg_ha !== undefined && (
                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">{t.nitrogen}</p>
                      <p className="text-lg font-black text-foreground">{test.nitrogen_kg_ha}</p>
                      {nStatus && <p className={`text-[10px] font-bold ${nStatus.color}`}>{nStatus.label}</p>}
                    </div>
                  )}
                  {test.phosphorus_kg_ha !== null && test.phosphorus_kg_ha !== undefined && (
                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">{t.phosphorus}</p>
                      <p className="text-lg font-black text-foreground">{test.phosphorus_kg_ha}</p>
                    </div>
                  )}
                  {test.potassium_kg_ha !== null && test.potassium_kg_ha !== undefined && (
                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">{t.potassium}</p>
                      <p className="text-lg font-black text-foreground">{test.potassium_kg_ha}</p>
                    </div>
                  )}
                  {test.organic_carbon_pct !== null && test.organic_carbon_pct !== undefined && (
                    <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">{t.organicCarbon} %</p>
                      <p className="text-lg font-black text-foreground">{test.organic_carbon_pct}%</p>
                      <p className={`text-[10px] font-bold ${test.organic_carbon_pct >= 0.75 ? "text-emerald-600" : test.organic_carbon_pct >= 0.5 ? "text-amber-600" : "text-red-600"}`}>
                        {test.organic_carbon_pct >= 0.75 ? ocLevel.high : test.organic_carbon_pct >= 0.5 ? ocLevel.medium : ocLevel.low}
                      </p>
                    </div>
                  )}
                </div>

                {test.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">{test.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
