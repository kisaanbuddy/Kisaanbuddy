"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Bookmark,
  Stethoscope,
  User,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CloudSun,
  Coins,
  Building2,
  X
} from "lucide-react";
import { ConversationSession, SavedAnswer, CropDiagnosisRecord } from "@/lib/conversation-store";
import { FarmerProfileData } from "@/lib/farm-profile-store";

interface FarmerWorkspaceSidebarProps {
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  savedAnswers: SavedAnswer[];
  diagnosisHistory: CropDiagnosisRecord[];
  farmProfile: FarmerProfileData;
  onOpenProfileModal: () => void;
  onOpenSavedAnswersModal: () => void;
  onOpenDiagnosisHistoryModal: () => void;
  onQuickQuery: (query: string) => void;
  onCloseMobile?: () => void;
}

export function FarmerWorkspaceSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  savedAnswers,
  diagnosisHistory,
  farmProfile,
  onOpenProfileModal,
  onOpenSavedAnswersModal,
  onOpenDiagnosisHistoryModal,
  onQuickQuery,
  onCloseMobile
}: FarmerWorkspaceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside className="w-full h-full flex flex-col bg-card border-r border-border/60 select-none overflow-hidden">
      {/* Top Header & New Conversation */}
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              🌾
            </div>
            <span className="text-xs font-bold tracking-tight text-foreground uppercase">Farmer Workspace</span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Farming Consultation</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past questions..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border/60 bg-background/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Scrollable Center: Tabs & Sessions */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {/* Quick Access Badges */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenSavedAnswersModal}
            className="p-2.5 rounded-xl border border-border/60 bg-background hover:bg-muted/40 transition-colors text-left flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {savedAnswers.length}
              </span>
            </div>
            <span className="text-[11px] font-bold text-foreground">Saved Answers</span>
            <span className="text-[10px] text-muted-foreground">Bookmarked advice</span>
          </button>

          <button
            onClick={onOpenDiagnosisHistoryModal}
            className="p-2.5 rounded-xl border border-border/60 bg-background hover:bg-muted/40 transition-colors text-left flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                {diagnosisHistory.length}
              </span>
            </div>
            <span className="text-[11px] font-bold text-foreground">Diagnosis History</span>
            <span className="text-[10px] text-muted-foreground">Crop leaf checks</span>
          </button>
        </div>

        {/* My Farm Profile Summary Card */}
        <div className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">My Farm Profile</span>
            </div>
            <button
              onClick={onOpenProfileModal}
              className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Edit
            </button>
          </div>
          <p className="text-[11px] text-foreground font-medium truncate">
            {farmProfile.farmerName || "Kisan Mitra"} • {farmProfile.district}, {farmProfile.state}
          </p>
          <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
            <span className="px-1.5 py-0.5 rounded-md bg-background border border-border/40">
              {farmProfile.farmSizeAcres} Acres
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-background border border-border/40 capitalize">
              {farmProfile.soilType} Soil
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-background border border-border/40">
              {farmProfile.mainCrops.slice(0, 2).join(", ")}
            </span>
          </div>
        </div>

        {/* Recent Conversations List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Recent Consultations
            </span>
            <span className="text-[10px] text-muted-foreground">{filteredSessions.length}</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground space-y-1">
              <MessageSquare className="w-5 h-5 mx-auto text-muted-foreground/40" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const lastMsg = session.messages[session.messages.length - 1]?.text || "Consultation started";

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer text-left transition-all ${
                    isActive
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                      : "hover:bg-muted/60 text-foreground border border-transparent"
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? "text-emerald-600" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-semibold truncate leading-tight">{session.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5 leading-normal">{lastMsg}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-muted-foreground transition-opacity"
                    title="Delete consultation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Topic Prompts */}
        <div className="pt-2 border-t border-border/50 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            Quick Agriculture Prompts
          </span>
          <div className="space-y-1">
            {[
              { label: "🌾 Yellow rust on wheat leaves", query: "My wheat leaves have yellow stripes and powdery dust. What is this disease and what dosage of Propiconazole should I spray?" },
              { label: "💧 Drip irrigation subsidy status", query: "What is the subsidy percentage for drip irrigation in my state and what documents are required to apply?" },
              { label: "🏛️ PM-Kisan 19th installment eligibility", query: "How do I check my PM-Kisan eKYC and installment release status in land records?" },
              { label: "🧪 Recommended NPK for basmati paddy", query: "What is the recommended basal and top dressing fertilizer schedule for Basmati paddy per acre?" }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => onQuickQuery(item.query)}
                className="w-full text-left p-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors leading-tight truncate flex items-center justify-between group"
              >
                <span className="truncate">{item.label}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 text-emerald-600" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border/50 bg-muted/20 text-[10px] text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          ICAR-grounded intelligence
        </span>
        <span className="font-mono text-[9px] opacity-75">v2.4 Command Centre</span>
      </div>
    </aside>
  );
}
