"use client";

import React, { useState } from "react";
import {
  Bookmark,
  History,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  ConversationSession,
  CropDiagnosisRecord,
  SavedAnswer,
} from "@/lib/conversation-store";
import { FarmerProfileData } from "@/lib/farm-profile-store";

interface ConversationHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  savedAnswers: SavedAnswer[];
  diagnosisHistory: CropDiagnosisRecord[];
  farmProfile: FarmerProfileData;
  authUserName?: string | null;
  onOpenProfileModal: () => void;
  onOpenSavedAnswersModal: () => void;
  onOpenDiagnosisHistoryModal: () => void;
}

export function ConversationHistoryDrawer({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  savedAnswers,
  diagnosisHistory,
  farmProfile,
  authUserName,
  onOpenProfileModal,
  onOpenSavedAnswersModal,
  onOpenDiagnosisHistoryModal,
}: ConversationHistoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayName = farmProfile.farmerName || authUserName || "Kisan Mitra";

  return (
    <div className="fixed inset-0 z-50 flex">
      <aside className="w-[86%] max-w-xs sm:w-80 h-full bg-white dark:bg-stone-900 border-r border-emerald-900/10 dark:border-stone-800 shadow-2xl flex flex-col select-none animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-emerald-900/10 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-[#143325] dark:text-stone-100">
                Consultations &amp; Farm
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-500 hover:bg-emerald-950/5 dark:hover:bg-stone-800"
              aria-label="Close history drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Farming Consultation</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-emerald-900/15 dark:border-stone-700 bg-[#F8FBF8] dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
          {/* Farm Profile Card */}
          <div className="p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/25 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                <User className="w-3.5 h-3.5" />
                <span>My Farm Profile</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfileModal();
                }}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Edit
              </button>
            </div>
            <p className="text-xs font-semibold text-foreground truncate">
              {displayName} • {farmProfile.district}, {farmProfile.state}
            </p>
            <div className="flex flex-wrap gap-1 text-[10px] text-[#4B5D50] dark:text-stone-400">
              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-stone-700">
                {farmProfile.farmSizeAcres} Acres
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-stone-700 capitalize">
                {farmProfile.soilType}
              </span>
              {farmProfile.mainCrops[0] && (
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-stone-700">
                  {farmProfile.mainCrops.slice(0, 2).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Saved & Diagnosis Shortcuts */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSavedAnswersModal();
              }}
              className="p-2.5 rounded-2xl border border-emerald-900/10 dark:border-stone-800 bg-[#F8FBF8] dark:bg-stone-900/80 hover:border-emerald-500/40 text-left space-y-1 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  {savedAnswers.length}
                </span>
              </div>
              <span className="block text-[11px] font-bold text-foreground">Saved Answers</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDiagnosisHistoryModal();
              }}
              className="p-2.5 rounded-2xl border border-emerald-900/10 dark:border-stone-800 bg-[#F8FBF8] dark:bg-stone-900/80 hover:border-emerald-500/40 text-left space-y-1 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  {diagnosisHistory.length}
                </span>
              </div>
              <span className="block text-[11px] font-bold text-foreground">Leaf Scans</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Conversation History
              </span>
              <span className="text-[10px] text-stone-400">{filteredSessions.length}</span>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500 space-y-1">
                <MessageSquare className="w-5 h-5 mx-auto opacity-40" />
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const lastMsg =
                  session.messages[session.messages.length - 1]?.text || "Empty consultation";

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      onClose();
                    }}
                    className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                        : "hover:bg-stone-100 dark:hover:bg-stone-800/70 border border-transparent text-foreground"
                    }`}
                  >
                    <MessageSquare
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        isActive ? "text-emerald-600" : "text-stone-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-xs font-semibold truncate">{session.title}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {lastMsg}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="absolute right-2 top-2.5 opacity-60 sm:opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-stone-400 transition-opacity"
                      title="Delete conversation"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-emerald-900/10 dark:border-stone-800 bg-[#F8FBF8] dark:bg-stone-950 text-[11px] text-[#4B5D50] dark:text-stone-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Synced with Farm Context</span>
        </div>
      </aside>
      <div className="flex-1 bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
