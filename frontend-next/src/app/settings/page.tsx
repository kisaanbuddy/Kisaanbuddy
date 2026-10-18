"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Shield,
  Languages,
  MapPin,
  Lock,
  Download,
  HelpCircle,
  LogOut,
  Check,
  RotateCw,
  Phone,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useAuth, logoutUser } from "@/lib/auth";
import { useLanguage, SELECTABLE_LANGS, LANG_NAMES, LANG_DETAILS, Lang } from "@/lib/language";
import { farmerProfileApi } from "@/lib/farmer-api";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLanguageChange = async (newLang: Lang) => {
    setLang(newLang);
    try {
      setSaving(true);
      await farmerProfileApi.update({ preferred_language: newLang });
      setSuccessMsg("Language preference saved.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.warn("Language preference save warning:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const profile = await farmerProfileApi.get().catch(() => null);
      const exportBlob = new Blob(
        [
          JSON.stringify(
            {
              export_date: new Date().toISOString(),
              farmer: user?.name,
              profile: profile,
            },
            null,
            2
          ),
        ],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kisaanbuddy-farm-records-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export data.");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <Settings className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Account & Farm Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, language preferences, farm privacy, and data security.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Account Details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Farmer Identity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-slate-500 block mb-1">Name:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {user?.name || "Kisaan Saathi"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-slate-500 block mb-1">Registered Phone / Email:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {user?.phone_number || user?.email || "Not provided"}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Link
            href="/profile"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Edit Complete Profile & Farm Fields →
          </Link>
        </div>
      </div>

      {/* 2. Preferred Language */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Language / भाषा
            </h2>
          </div>
          {saving && <RotateCw className="w-4 h-4 animate-spin text-emerald-600" />}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Select your primary language for advice, weather alerts, and voice readout:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {SELECTABLE_LANGS.map((code) => {
            const isSelected = lang === code;
            return (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as Lang)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>
                  <div className="text-xs font-bold">
                    {LANG_DETAILS[code as Lang]?.native || LANG_NAMES[code as Lang]}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {LANG_DETAILS[code as Lang]?.en || code}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Privacy & Farm Data Protection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Data Privacy & Ownership
          </h2>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          At KisaanBuddy, your farm data belongs entirely to you. We only use your location and crop details to compute accurate weather risks, pest forecasts, and mandi recommendations. We never sell your private plot coordinates or financial records to third-party brokers.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download All My Farm Data (JSON)</span>
          </button>

          <Link
            href="/privacy"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Read Privacy Policy</span>
          </Link>
        </div>
      </div>

      {/* 4. Support & Direct Assistance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Help & Agricultural Support
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Need assistance with pest outbreaks, soil card interpretation, or app usage?
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://wa.me/919999999999?text=Hello%20KisaanBuddy%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Kisan Helpline</span>
          </a>

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact Support Page</span>
          </Link>
        </div>
      </div>

      {/* 5. Logout */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of KisaanBuddy</span>
        </button>
      </div>
    </div>
  );
}
