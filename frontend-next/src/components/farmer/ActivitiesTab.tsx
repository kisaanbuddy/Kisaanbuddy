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

function ActivityForm({ fields, onSave, onCancel, lang }: {
  fields: FarmerField[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  lang: string;
}) {
  const hi = lang === "hi";
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
      <h4 className="text-sm font-bold text-foreground">{hi ? "नई प्रविष्टि जोड़ें" : "Add New Entry"}</h4>

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
            {hi ? cat === "activity" ? "गतिविधि" : cat === "expense" ? "खर्च" : "आय" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-field">{hi ? "विवरण*" : "Title/Description*"}</label>
          <input required value={form.title} onChange={e => set("title", e.target.value)} className="input-field" placeholder={hi ? "जैसे: यूरिया का छिड़काव किया" : "e.g. Applied Urea to wheat field"} />
        </div>
        <div>
          <label className="label-field">{hi ? "तारीख*" : "Date*"}</label>
          <input required type="date" value={form.activity_date} onChange={e => set("activity_date", e.target.value)} className="input-field" />
        </div>
        {fields.length > 0 && (
          <div>
            <label className="label-field">{hi ? "भूखंड" : "Field/Plot"}</label>
            <select value={form.field_id} onChange={e => set("field_id", e.target.value)} className="input-field">
              <option value="">{hi ? "सभी खेत" : "All fields"}</option>
              {fields.map(f => <option key={f.id} value={f.id}>{f.field_name || `Field ${f.id}`}{f.current_crop ? ` (${f.current_crop})` : ""}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label-field">{hi ? "गतिविधि का प्रकार" : "Activity Type"}</label>
          <select value={form.activity_type} onChange={e => set("activity_type", e.target.value)} className="input-field">
            {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        {category !== "activity" && (
          <div>
            <label className="label-field">{hi ? "राशि (₹)" : "Amount (₹)"}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} className="input-field pl-7" placeholder="0.00" />
            </div>
          </div>
        )}
        <div>
          <label className="label-field">{hi ? "मात्रा" : "Quantity"}</label>
          <div className="flex gap-1.5">
            <input type="number" min="0" step="0.01" value={form.quantity} onChange={e => set("quantity", e.target.value)} className="input-field flex-1" placeholder="0" />
            <input value={form.unit} onChange={e => set("unit", e.target.value)} className="input-field w-20" placeholder={hi ? "इकाई" : "unit"} />
          </div>
        </div>
        <div>
          <label className="label-field">{hi ? "मजदूर संख्या" : "Labour Count"}</label>
          <input type="number" min="0" value={form.labour_count} onChange={e => set("labour_count", e.target.value)} className="input-field" placeholder="0" />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">{hi ? "टिप्पणी" : "Notes"}</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className="input-field resize-none" rows={2} placeholder={hi ? "अतिरिक्त जानकारी..." : "Additional details..."} />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5 h-9 text-xs">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {hi ? "डायरी में सहेजें" : "Save to Diary"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary h-9 text-xs flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" />
          {hi ? "रद्द करें" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

export function ActivitiesTab({ activities, fields, onRefresh, lang }: Props) {
  const hi = lang === "hi";
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
    if (!confirm(hi ? "क्या आप इस प्रविष्टि को हटाना चाहते हैं?" : "Delete this entry?")) return;
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
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{hi ? "कुल व्यय" : "Total Expense"}</p>
          <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1">₹{totalExpense.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{hi ? "कुल आय" : "Total Income"}</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl border p-4 ${netProfit >= 0 ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{hi ? "शुद्ध लाभ" : "Net Profit"}</p>
          <p className={`text-xl font-black mt-1 ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {netProfit >= 0 ? "+" : "−"}₹{Math.abs(netProfit).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-foreground">{hi ? "बहीखाता रिकॉर्ड" : "Farm Diary"} ({activities.length})</h3>
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
                {hi ? cat === "all" ? "सभी" : cat === "activity" ? "गतिविधि" : cat === "expense" ? "खर्च" : "आय" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary h-8 text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {hi ? "जोड़ें" : "Add Entry"}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <ActivityForm fields={fields} onSave={handleSave} onCancel={() => setShowForm(false)} lang={lang} />
      )}

      {/* Activity list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground/25 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {hi ? "कोई प्रविष्टि नहीं मिली।" : "No entries found."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(act => (
            <div key={act.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                act.category === "income" ? "bg-emerald-500" :
                act.category === "expense" ? "bg-red-500" : "bg-indigo-500"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    act.category === "expense" ? "bg-red-500/10 text-red-700 dark:text-red-400" :
                    act.category === "income" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
                    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                  }`}>
                    {hi ? act.category === "activity" ? "गतिविधि" : act.category === "expense" ? "खर्च" : "आय" : act.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{act.activity_date}</span>
                  {getFieldName(act.field_id) && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                      {getFieldName(act.field_id)}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-foreground mt-0.5">{act.title}</p>
                {act.quantity && (
                  <p className="text-[11px] text-muted-foreground">
                    {act.quantity} {act.unit}
                    {act.labour_count ? ` • ${act.labour_count} ${hi ? "मजदूर" : "workers"}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {act.amount ? (
                  <span className={`text-sm font-bold ${act.category === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {act.category === "income" ? "+" : "−"}₹{act.amount.toLocaleString()}
                  </span>
                ) : null}
                <button
                  onClick={() => handleDelete(act.id)}
                  disabled={deleting === act.id}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  {deleting === act.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
