/**
 * Activities Tab — backend-connected Khet Diary (farm activities, expenses, income).
 */
"use client";

import { useState } from "react";
import {
  BookOpen, Plus, Trash2, Loader2, Save, X, IndianRupee, TrendingUp,
  ShieldCheck, Filter
} from "lucide-react";
import type { FarmActivity, FarmerField } from "@/lib/farmer-api";
import { activitiesApi } from "@/lib/farmer-api";
import { FARMER_I18N } from "@/lib/farmer-i18n";

interface Props {
  activities: FarmActivity[];
  fields: FarmerField[];
  onRefresh: () => Promise<void>;
  lang: string;
}

const ACTIVITY_TYPES = [
  "sowing", "irrigation", "fertilizer_application", "pesticide_spray",
  "weeding", "harvesting", "soil_testing", "land_preparation", "other"
];

const ACTIVITY_TYPE_LABELS: Record<string, Record<string, string>> = {
  sowing: {
    en: "Sowing", hi: "बुआई", kn: "ಬಿತ್ತನೆ", mr: "पेरणी", te: "విత్తడం",
    ta: "விதைப்பு", gu: "વાવણી", bn: "বপন", pa: "ਬਿਜਾਈ", ml: "നടീൽ", hi_en: "Sowing"
  },
  irrigation: {
    en: "Irrigation", hi: "सिंचाई", kn: "ನೀರಾವರಿ", mr: "सिंचन", te: "నీటిపారుదల",
    ta: "பாசனம்", gu: "પિયત", bn: "সেচ", pa: "ਸਿੰਚਾਈ", ml: "നനയ്ക്കൽ", hi_en: "Irrigation"
  },
  fertilizer_application: {
    en: "Fertilizer Application", hi: "उर्वरक छिड़काव", kn: "ಗೊಬ್ಬರ ಹಾಕುವುದು", mr: "खत व्यवस्थापन", te: "ఎరువుల వినియోగం",
    ta: "உரமிடுதல்", gu: "ખાતર વ્યવસ્થાપન", bn: "সার প্রয়োগ", pa: "ਖਾਦ ਪਾਉਣਾ", ml: "വളപ്രയോഗം", hi_en: "Fertilizer Application"
  },
  pesticide_spray: {
    en: "Pesticide Spray", hi: "कीटनाशक स्प्रे", kn: "ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ", mr: "कीटकनाशक फवारणी", te: "పురుగుమందు పిచికారీ",
    ta: "பூச்சிக்கொல்லி தெளிப்பு", gu: "જંતુનાશક છંટકાવ", bn: "কীটনাশক স্প্রে", pa: "ਕੀਟਨਾਸ਼ਕ ਸਪਰੇਅ", ml: "കീടനാശിനി പ്രയോഗം", hi_en: "Pesticide Spray"
  },
  weeding: {
    en: "Weeding", hi: "निराई-गुड़ाई", kn: "ಕಳೆ ಕೀಳುವುದು", mr: "खुरपणी", te: "కలుపు తీత",
    ta: "களை எடுத்தல்", gu: "નિંદામણ", bn: "আগাছা নিড়ানো", pa: "ਗੋਡੀ", ml: "കളപറിക്കൽ", hi_en: "Weeding"
  },
  harvesting: {
    en: "Harvesting", hi: "कटाई", kn: "ಕೊಯ್ಲು", mr: "कापणी", te: "కోత",
    ta: "அறுவடை", gu: "લણણી", bn: "ফসল কাটা", pa: "ਵਾਢੀ", ml: "വിളവെടുപ്പ്", hi_en: "Harvesting"
  },
  soil_testing: {
    en: "Soil Testing", hi: "मिट्टी परीक्षण", kn: "ಮಣ್ಣು ಪರೀಕ್ಷೆ", mr: "माती परीक्षण", te: "నేల పరీక్ష",
    ta: "மண் பரிசோதனை", gu: "જમીન ચકાસણી", bn: "মাটি পরীক্ষা", pa: "ਮਿੱਟੀ ਪਰਖ", ml: "മണ്ണ് പരിശോധന", hi_en: "Soil Testing"
  },
  land_preparation: {
    en: "Land Preparation", hi: "खेत की तैयारी", kn: "ಭೂಮಿ ಸಿದ್ಧತೆ", mr: "जमीन मशागत", te: "భూమి తయారీ",
    ta: "நிலம் தயாரித்தல்", gu: "જમીન તૈયારી", bn: "জমি প্রস্তুত", pa: "ਜ਼ਮੀਨ ਦੀ ਤਿਆਰੀ", ml: "നിലമൊരുക്കൽ", hi_en: "Land Preparation"
  },
  other: {
    en: "Other", hi: "अन्य", kn: "ಇತರೆ", mr: "इतर", te: "ఇతర",
    ta: "பிற", gu: "અન્ય", bn: "অন্যান্য", pa: "ਹੋਰ", ml: "മറ്റുള്ളവ", hi_en: "Other"
  },
};

function ActivityForm({ fields, onSave, onCancel, lang }: {
  fields: FarmerField[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  lang: string;
}) {
  const t = FARMER_I18N[lang] || FARMER_I18N.en;
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<"activity" | "expense" | "income">("activity");
  const [form, setForm] = useState({
    field_id: "",
    activity_date: new Date().toISOString().split("T")[0],
    activity_type: "other",
    title: "",
    amount: "",
    quantity: "",
    unit: "",
    labour_count: "",
    notes: "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form, category };
      if (payload.field_id) payload.field_id = parseInt(payload.field_id);
      else delete payload.field_id;
      if (payload.amount) payload.amount = parseFloat(payload.amount);
      else delete payload.amount;
      if (payload.quantity) payload.quantity = parseFloat(payload.quantity);
      else delete payload.quantity;
      if (payload.labour_count) payload.labour_count = parseInt(payload.labour_count);
      else delete payload.labour_count;
      if (!payload.unit) delete payload.unit;
      if (!payload.notes) delete payload.notes;
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
      <h4 className="text-sm font-bold text-foreground">
        {t.addEntry}
      </h4>

      {/* Category selector */}
      <div className="flex gap-2">
        {(["activity", "expense", "income"] as const).map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`flex-1 h-9 text-xs font-bold rounded-lg border transition-colors ${category === cat
              ? cat === "income" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40"
              : cat === "expense" ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40"
              : "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/40"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {cat === "activity" ? t.catActivity : cat === "expense" ? t.catExpense : t.catIncome}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-field">{t.titleDesc}</label>
          <input
            required
            value={form.title}
            onChange={e => set("title", e.target.value)}
            className="input-field"
            placeholder={t.titlePlaceholder}
          />
        </div>
        <div>
          <label className="label-field">{t.date}*</label>
          <input required type="date" value={form.activity_date} onChange={e => set("activity_date", e.target.value)} className="input-field" />
        </div>
        {fields.length > 0 && (
          <div>
            <label className="label-field">{t.fieldPlot}</label>
            <select value={form.field_id} onChange={e => set("field_id", e.target.value)} className="input-field">
              <option value="">{t.allFields}</option>
              {fields.map(f => <option key={f.id} value={f.id}>{f.field_name || `Field ${f.id}`}{f.current_crop ? ` (${f.current_crop})` : ""}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label-field">{t.activityType}</label>
          <select value={form.activity_type} onChange={e => set("activity_type", e.target.value)} className="input-field">
            {ACTIVITY_TYPES.map(typeKey => (
              <option key={typeKey} value={typeKey}>
                {ACTIVITY_TYPE_LABELS[typeKey]?.[lang] || ACTIVITY_TYPE_LABELS[typeKey]?.hi || ACTIVITY_TYPE_LABELS[typeKey]?.en || typeKey}
              </option>
            ))}
          </select>
        </div>
        {category !== "activity" && (
          <div>
            <label className="label-field">{t.amount}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} className="input-field pl-7" placeholder="0.00" />
            </div>
          </div>
        )}
        <div>
          <label className="label-field">{t.quantity}</label>
          <div className="flex gap-1.5">
            <input type="number" min="0" step="0.01" value={form.quantity} onChange={e => set("quantity", e.target.value)} className="input-field flex-1" placeholder="0" />
            <input value={form.unit} onChange={e => set("unit", e.target.value)} className="input-field w-20" placeholder={t.unit} />
          </div>
        </div>
        <div>
          <label className="label-field">{t.labourCount}</label>
          <input type="number" min="0" value={form.labour_count} onChange={e => set("labour_count", e.target.value)} className="input-field" placeholder="0" />
        </div>
        <div className="sm:col-span-2">
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
          {t.saveToDiary}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary h-9 text-xs flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" />
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

export function ActivitiesTab({ activities, fields, onRefresh, lang }: Props) {
  const t = FARMER_I18N[lang] || FARMER_I18N.en;
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState<"all" | "activity" | "expense" | "income">("all");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalExpense = activities.filter(a => a.category === "expense").reduce((s, a) => s + (a.amount ?? 0), 0);
  const totalIncome = activities.filter(a => a.category === "income").reduce((s, a) => s + (a.amount ?? 0), 0);
  const netProfit = totalIncome - totalExpense;

  const filtered = catFilter === "all" ? activities : activities.filter(a => a.category === catFilter);

  const handleSave = async (data: any) => {
    setError(null);
    try {
      await activitiesApi.create(data);
      setShowForm(false);
      await onRefresh();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    setDeleting(id);
    try {
      await activitiesApi.delete(id);
      await onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const getFieldName = (id?: number | null) => {
    if (!id) return null;
    return fields.find(f => f.id === id)?.field_name ?? `Field ${id}`;
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t.totalExpense}
          </p>
          <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1">₹{totalExpense.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t.totalIncome}
          </p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl border p-4 ${netProfit >= 0 ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t.netProfit}
          </p>
          <p className={`text-xl font-black mt-1 ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {netProfit >= 0 ? "+" : "−"}₹{Math.abs(netProfit).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-foreground">
            {t.diaryTitle} ({activities.length})
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Filter */}
          <div className="flex gap-1">
            {(["all", "activity", "expense", "income"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${catFilter === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
              >
                {cat === "all" ? t.all : cat === "activity" ? t.catActivity : cat === "expense" ? t.catExpense : t.catIncome}
              </button>
            ))}
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary h-8 text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {t.addEntry}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <ActivityForm
          fields={fields}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          lang={lang}
        />
      )}

      {/* Activities list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
          {t.noActivity}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(act => {
            const isExpense = act.category === "expense";
            const isIncome = act.category === "income";
            const fieldName = getFieldName(act.field_id);
            const typeLabel = act.activity_type ? (ACTIVITY_TYPE_LABELS[act.activity_type]?.[lang] || ACTIVITY_TYPE_LABELS[act.activity_type]?.en || act.activity_type) : null;

            return (
              <div
                key={act.id}
                className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 bg-card transition-colors ${
                  isIncome ? "border-emerald-500/20 hover:border-emerald-500/40"
                  : isExpense ? "border-red-500/20 hover:border-red-500/40"
                  : "border-border hover:border-border/80"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isIncome ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      : isExpense ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                      : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20"
                    }`}>
                      {act.category === "activity" ? t.catActivity : act.category === "expense" ? t.catExpense : t.catIncome}
                    </span>
                    {typeLabel && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        • {typeLabel}
                      </span>
                    )}
                    {fieldName && (
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {fieldName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-foreground">{act.title}</p>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                    <span>{act.activity_date}</span>
                    {act.quantity && (
                      <span>{act.quantity} {act.unit ?? ""}</span>
                    )}
                    {act.labour_count && (
                      <span>{act.labour_count} {t.labourCount.toLowerCase()}</span>
                    )}
                    {act.notes && (
                      <span className="italic truncate max-w-xs">{act.notes}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {act.amount !== null && act.amount !== undefined && (
                    <span className={`text-sm font-black ${isIncome ? "text-emerald-600 dark:text-emerald-400" : isExpense ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                      {isIncome ? "+" : isExpense ? "−" : ""}₹{act.amount.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(act.id)}
                    disabled={deleting === act.id}
                    className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                  >
                    {deleting === act.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
