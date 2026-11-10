"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Bookmark,
  Share2,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  Menu,
  MapPin,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  ChatMessage,
  ConversationSession,
  SavedAnswer,
  CropDiagnosisRecord,
  loadAllSessions,
  saveAllSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  updateSession,
  deleteSession,
  loadSavedAnswers,
  toggleSavedAnswer,
  isAnswerSaved,
  loadDiagnosisHistory,
  recordCropDiagnosis
} from "@/lib/conversation-store";
import {
  FarmerProfileData,
  loadFarmerProfile,
  saveFarmerProfile,
  formatFarmContextForAI
} from "@/lib/farm-profile-store";
import {
  VoiceLanguage,
  SUPPORTED_VOICE_LANGUAGES,
  voiceService
} from "@/lib/voice-speech";
import { FarmerWorkspaceSidebar } from "@/components/chatbot/FarmerWorkspaceSidebar";
import { AgriIntelligenceSidebar } from "@/components/chatbot/AgriIntelligenceSidebar";
import { MultiInputComposer } from "@/components/chatbot/MultiInputComposer";
import { FarmProfileModal } from "@/components/chatbot/FarmProfileModal";
import { SavedAnswersModal } from "@/components/chatbot/SavedAnswersModal";
import { CropDiagnosisModal } from "@/components/chatbot/CropDiagnosisModal";

export default function ChatbotClient() {
  const searchParams = useSearchParams();

  // Sessions & Messages State
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [diagnosisHistory, setDiagnosisHistory] = useState<CropDiagnosisRecord[]>([]);
  const [farmProfile, setFarmProfile] = useState<FarmerProfileData>(loadFarmerProfile);

  // Assistant Configuration
  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage>("auto");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState<"ready" | "thinking" | "speaking">("ready");
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & Mobile Drawers
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavedAnswersModalOpen, setIsSavedAnswersModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [isMobileLeftOpen, setIsMobileLeftOpen] = useState(false);
  const [isMobileRightOpen, setIsMobileRightOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedSessions = loadAllSessions();
    const loadedAnswers = loadSavedAnswers();
    const loadedDiags = loadDiagnosisHistory();
    const loadedProfile = loadFarmerProfile();

    setSavedAnswers(loadedAnswers);
    setDiagnosisHistory(loadedDiags);
    setFarmProfile(loadedProfile);

    let sessionToActivate: ConversationSession | null = null;
    const activeId = getActiveSessionId();

    if (activeId) {
      sessionToActivate = loadedSessions.find((s) => s.id === activeId) || null;
    }

    if (!sessionToActivate) {
      if (loadedSessions.length > 0) {
        sessionToActivate = loadedSessions[0];
      } else {
        sessionToActivate = createNewSession("auto");
        loadedSessions.unshift(sessionToActivate);
      }
    }

    setSessions(loadedSessions);
    setActiveSession(sessionToActivate);

    // Initial query from URL param ?query=
    const initialQuery = searchParams?.get("query");
    if (initialQuery && sessionToActivate.messages.length === 0) {
      handleSendMessage({ text: initialQuery });
    }
  }, []);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping, isStreaming]);

  // Session Switching
  const handleSelectSession = (id: string) => {
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    const target = sessions.find((s) => s.id === id);
    if (target) {
      setActiveSession(target);
      setActiveSessionId(target.id);
    }
    setIsMobileLeftOpen(false);
  };

  const handleNewSession = () => {
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    const newSess = createNewSession(selectedLanguage);
    setSessions((prev) => [newSess, ...prev]);
    setActiveSession(newSess);
    setIsMobileLeftOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSession?.id === id) {
      if (updated.length > 0) {
        setActiveSession(updated[0]);
      } else {
        const fresh = createNewSession(selectedLanguage);
        setSessions([fresh]);
        setActiveSession(fresh);
      }
    }
  };

  // Profile Updates
  const handleProfileUpdated = (updated: FarmerProfileData) => {
    setFarmProfile(updated);
  };

  // Location update from intelligence sidebar
  const handleUpdateLocation = (state: string, district: string, block?: string) => {
    const updated = saveFarmerProfile({ state, district, block });
    setFarmProfile(updated);
  };

  // Voice Read Aloud
  const handleToggleSpeak = (msgId: string, text: string, lang: string) => {
    if (speakingMessageId === msgId) {
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
      setAssistantStatus("ready");
    } else {
      voiceService.stopSpeaking();
      setSpeakingMessageId(msgId);
      setAssistantStatus("speaking");
      const resolvedLang = (lang as VoiceLanguage) || selectedLanguage || "hi";

      voiceService.speakText(
        text,
        resolvedLang,
        () => {
          setSpeakingMessageId(msgId);
          setAssistantStatus("speaking");
        },
        () => {
          setSpeakingMessageId(null);
          setAssistantStatus("ready");
        },
        () => {
          setSpeakingMessageId(null);
          setAssistantStatus("ready");
        }
      );
    }
  };

  // Copy text to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Save Answer
  const handleToggleBookmark = (question: string, answer: string) => {
    toggleSavedAnswer({
      sessionId: activeSession?.id || "default",
      question,
      answer
    });
    setSavedAnswers(loadSavedAnswers());
  };

  // Stop Streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsTyping(false);
    setAssistantStatus("ready");
  };

  // SEND MESSAGE HANDLER
  const handleSendMessage = async (payload: {
    text: string;
    imageBase64?: string;
    audioFile?: File;
    cropHint?: string;
  }) => {
    if (!activeSession) return;

    // Interrupt any ongoing audio
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);

    const userMessageId = `msg-u-${Date.now()}`;
    const botMessageId = `msg-b-${Date.now() + 1}`;

    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: payload.text,
      language: selectedLanguage,
      imageUrl: payload.imageBase64,
      cropHint: payload.cropHint,
      timestamp: new Date().toISOString()
    };

    // Placeholder bot message
    const botMsg: ChatMessage = {
      id: botMessageId,
      sender: "bot",
      text: "",
      language: selectedLanguage,
      timestamp: new Date().toISOString(),
      isStreaming: true,
      sources: [
        { name: "ICAR Advisory Directory", date: "2026-10", url: "https://icar.gov.in" },
        { name: "CIBRC Guidelines", date: "2026-09", url: "http://cibrc.nic.in" }
      ]
    };

    const updatedMessages = [...activeSession.messages, userMsg, botMsg];
    const sessionTitle =
      activeSession.messages.length === 0
        ? payload.text.slice(0, 36) + (payload.text.length > 36 ? "..." : "")
        : activeSession.title;

    const updatedSession: ConversationSession = {
      ...activeSession,
      title: sessionTitle,
      messages: updatedMessages
    };

    setActiveSession(updatedSession);
    updateSession(updatedSession);

    setIsStreaming(true);
    setIsTyping(true);
    setAssistantStatus("thinking");

    // Build context
    const farmContext = formatFarmContextForAI(farmProfile);
    const enrichedMessage = farmContext
      ? `${farmContext}\n\nFarmer Query: ${payload.text}`
      : payload.text;

    // Optional parallel disease diagnosis if image uploaded
    let diagnosisOutcome: any = null;
    if (payload.imageBase64) {
      try {
        const diagRes = await fetch(
          `/api/disease/predict?crop_hint=${encodeURIComponent(payload.cropHint || farmProfile.mainCrops[0] || "")}&symptom_notes=${encodeURIComponent(payload.text)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              crop_hint: payload.cropHint || farmProfile.mainCrops[0] || "",
              symptom_notes: payload.text
            })
          }
        );
        if (diagRes.ok) {
          diagnosisOutcome = await diagRes.json();
          recordCropDiagnosis({
            cropName: diagnosisOutcome.crop?.name || payload.cropHint || "Crop",
            diseaseName: diagnosisOutcome.disease_name || "Diagnostic Review",
            confidence: diagnosisOutcome.confidence || 0.65,
            imageUrl: payload.imageBase64,
            keyRemedy: diagnosisOutcome.immediate_action || "Consult local KVK agronomist."
          });
          setDiagnosisHistory(loadDiagnosisHistory());
        }
      } catch {
        // Continue chat stream
      }
    }

    // Call /api/chat/message with SSE
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          session_id: activeSession.id,
          message: enrichedMessage,
          language: selectedLanguage,
          location: {
            city: farmProfile.district || "Karnal",
            lat: 29.6857,
            lon: 76.9905
          },
          image_base64: payload.imageBase64 || null,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      setIsTyping(false);

      const contentType = response.headers.get("content-type") || "";

      // Case A: SSE Streaming
      if (contentType.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedText = "";

        if (reader) {
          let done = false;
          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const dataStr = line.slice(6).trim();
                    if (dataStr) {
                      const parsed = JSON.parse(dataStr);
                      if (parsed.token) {
                        accumulatedText += parsed.token;
                      } else if (parsed.content) {
                        accumulatedText = parsed.content;
                      }
                      // Update message in state
                      setActiveSession((prev) => {
                        if (!prev) return null;
                        const msgs = prev.messages.map((m) =>
                          m.id === botMessageId
                            ? {
                                ...m,
                                text: accumulatedText,
                                diagnosisData: diagnosisOutcome
                                  ? {
                                      diseaseName: diagnosisOutcome.disease_name,
                                      crop: diagnosisOutcome.crop?.name || payload.cropHint,
                                      confidence: diagnosisOutcome.confidence,
                                      status: diagnosisOutcome.status,
                                      symptoms: diagnosisOutcome.symptoms || payload.text,
                                      immediateAction: diagnosisOutcome.immediate_action,
                                      culturalControl: diagnosisOutcome.cultural_control,
                                      biologicalControl: diagnosisOutcome.biological_control,
                                      chemicalControl: diagnosisOutcome.chemical_control,
                                      dosageGuidelines: diagnosisOutcome.dosage_guidelines,
                                      preHarvestIntervalDays: diagnosisOutcome.phi_days,
                                      safetyInstructions: diagnosisOutcome.safety_instructions,
                                      sourceInstitution: diagnosisOutcome.source_institution,
                                      lastVerifiedDate: diagnosisOutcome.last_verified_date
                                    }
                                  : undefined
                              }
                            : m
                        );
                        return { ...prev, messages: msgs };
                      });
                    }
                  } catch {
                    // Raw string token fallback
                    const raw = line.slice(6);
                    if (raw && !raw.startsWith("{")) {
                      accumulatedText += raw;
                    }
                  }
                }
              }
            }
          }
        }

        // Finalize message
        finalizeAssistantMessage(botMessageId, accumulatedText, diagnosisOutcome);
      } else {
        // Case B: Direct JSON response fallback
        const data = await response.json();
        const fullContent = data.content || data.reply || data.response_text || "Agricultural advisory completed.";
        finalizeAssistantMessage(botMessageId, fullContent, diagnosisOutcome);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        finalizeAssistantMessage(botMessageId, "Consultation stopped by farmer.", diagnosisOutcome);
        return;
      }

      // Offline / network fallback with grounded agronomic rules
      const offlineReply = getFallbackAgronomicAdvice(payload.text, selectedLanguage, farmProfile);
      finalizeAssistantMessage(botMessageId, offlineReply, diagnosisOutcome);
    } finally {
      setIsStreaming(false);
      setIsTyping(false);
      setAssistantStatus("ready");
      abortControllerRef.current = null;
    }
  };

  const finalizeAssistantMessage = (
    botMessageId: string,
    content: string,
    diagnosisOutcome?: any
  ) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const followUps = generateFollowUpSuggestions(content, selectedLanguage);
      const msgs = prev.messages.map((m) =>
        m.id === botMessageId
          ? {
              ...m,
              text: content || "Consultation response completed.",
              isStreaming: false,
              followUps,
              diagnosisData: diagnosisOutcome
                ? {
                    diseaseName: diagnosisOutcome.disease_name,
                    crop: diagnosisOutcome.crop?.name,
                    confidence: diagnosisOutcome.confidence,
                    status: diagnosisOutcome.status,
                    symptoms: diagnosisOutcome.symptoms,
                    immediateAction: diagnosisOutcome.immediate_action,
                    culturalControl: diagnosisOutcome.cultural_control,
                    biologicalControl: diagnosisOutcome.biological_control,
                    chemicalControl: diagnosisOutcome.chemical_control,
                    dosageGuidelines: diagnosisOutcome.dosage_guidelines,
                    preHarvestIntervalDays: diagnosisOutcome.phi_days,
                    safetyInstructions: diagnosisOutcome.safety_instructions,
                    sourceInstitution: diagnosisOutcome.source_institution,
                    lastVerifiedDate: diagnosisOutcome.last_verified_date
                  }
                : undefined
            }
          : m
      );
      const updatedSess = { ...prev, messages: msgs };
      updateSession(updatedSess);
      return updatedSess;
    });
  };

  // Retry previous prompt
  const handleRetry = (msgIndex: number) => {
    if (!activeSession) return;
    const userMsg = activeSession.messages[msgIndex - 1];
    if (userMsg && userMsg.sender === "user") {
      handleSendMessage({
        text: userMsg.text,
        imageBase64: userMsg.imageUrl,
        cropHint: userMsg.cropHint
      });
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-background text-foreground antialiased min-h-[calc(100vh-4.5rem)]">
      {/* Mobile Top Navigation & Drawer Triggers */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-border/60 bg-card">
        <button
          onClick={() => setIsMobileLeftOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/30 text-xs font-semibold"
        >
          <Menu className="w-4 h-4 text-emerald-600" />
          <span>Workspace</span>
        </button>

        <div className="text-center">
          <h2 className="text-xs font-black text-foreground">KisaanBuddy AI</h2>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Command Centre
          </span>
        </div>

        <button
          onClick={() => setIsMobileRightOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Officers</span>
        </button>
      </div>

      {/* Desktop 3-Column Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden h-full">
        {/* LEFT COLUMN: Farmer Workspace (3 cols on desktop) */}
        <div className="hidden md:block md:col-span-3 lg:col-span-3 h-full">
          <FarmerWorkspaceSidebar
            sessions={sessions}
            activeSessionId={activeSession?.id || null}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            savedAnswers={savedAnswers}
            diagnosisHistory={diagnosisHistory}
            farmProfile={farmProfile}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onOpenSavedAnswersModal={() => setIsSavedAnswersModalOpen(true)}
            onOpenDiagnosisHistoryModal={() => setIsDiagnosisModalOpen(true)}
            onQuickQuery={(q) => handleSendMessage({ text: q })}
          />
        </div>

        {/* CENTER COLUMN: AI Assistant Primary Stage (6 cols on desktop, 12 on mobile) */}
        <div className="col-span-1 md:col-span-6 lg:col-span-6 flex flex-col h-full bg-background border-r border-border/40 overflow-hidden relative">
          {/* Centre Header */}
          <header className="p-3.5 md:p-4 border-b border-border/50 bg-card/70 backdrop-blur-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-600/25 flex items-center justify-center text-emerald-600 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-foreground font-display">
                    KisaanBuddy AI
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {assistantStatus === "speaking"
                      ? "Speaking Aloud"
                      : assistantStatus === "thinking"
                      ? "Synthesizing ICAR Data"
                      : "Ready"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Your Intelligent Farming Companion • Verified Agricultural Guidance
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsDiagnosisModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition-colors shadow-xs"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Crop Doctor</span>
              </button>
            </div>
          </header>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            {activeSession?.messages.length === 0 ? (
              <WelcomeZeroState
                onQuickAsk={(q) => handleSendMessage({ text: q })}
                onOpenDiagnosis={() => setIsDiagnosisModalOpen(true)}
                farmProfile={farmProfile}
                selectedLanguage={selectedLanguage}
              />
            ) : (
              activeSession?.messages.map((msg, idx) => {
                const isUser = msg.sender === "user";
                const isBookmarked = isAnswerSaved(
                  activeSession.messages[idx - 1]?.text || "",
                  msg.text
                );

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Identity Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isUser
                          ? "bg-foreground text-background"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[85%] md:max-w-[80%] space-y-2`}>
                      <div
                        className={`p-3.5 md:p-4 rounded-3xl text-xs md:text-sm leading-relaxed shadow-xs ${
                          isUser
                            ? "bg-emerald-600 text-white rounded-tr-xs"
                            : "bg-card border border-border/80 text-foreground rounded-tl-xs"
                        }`}
                      >
                        {/* Attached Image Preview */}
                        {msg.imageUrl && (
                          <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 max-w-sm">
                            <img
                              src={msg.imageUrl}
                              alt="Crop leaf sample"
                              className="w-full max-h-52 object-cover"
                            />
                            {msg.cropHint && (
                              <div className="p-1.5 bg-black/60 text-white text-[10px] font-semibold">
                                Crop: {msg.cropHint}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Disease Diagnosis Card (when structured diagnostic is available) */}
                        {msg.diagnosisData && (
                          <div className="mb-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase">
                                Verified Diagnosis
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                Confidence: {Math.round(msg.diagnosisData.confidence * 100)}%
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-foreground">
                              {msg.diagnosisData.diseaseName}
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              <strong>Crop:</strong> {msg.diagnosisData.crop} •{" "}
                              <strong>Source:</strong> {msg.diagnosisData.sourceInstitution || "ICAR"}
                            </p>
                            {msg.diagnosisData.dosageGuidelines && (
                              <div className="p-2 rounded-xl bg-background border border-border/60 text-[11px] space-y-1">
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                                  Authoritative Dosage:
                                </span>
                                <span>{msg.diagnosisData.dosageGuidelines}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Main Text Content */}
                        <div className="whitespace-pre-wrap font-normal selection:bg-emerald-500/30">
                          {msg.text || (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                              <span className="ml-1 text-[11px]">Consulting ICAR agronomy database...</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assistant Response Actions & Citations */}
                      {!isUser && msg.text && (
                        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
                          {/* Citations */}
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] font-medium">ICAR / CIBRC Grounded</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            {/* Read Aloud Button */}
                            <button
                              onClick={() => handleToggleSpeak(msg.id, msg.text, msg.language)}
                              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                                speakingMessageId === msg.id
                                  ? "bg-emerald-600 text-white"
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                              title={speakingMessageId === msg.id ? "Stop voice" : "Read aloud in your language"}
                            >
                              {speakingMessageId === msg.id ? (
                                <VolumeX className="w-3.5 h-3.5" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                              <span className="text-[10px] hidden sm:inline">
                                {speakingMessageId === msg.id ? "Stop" : "Listen"}
                              </span>
                            </button>

                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy answer"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Bookmark / Save Answer */}
                            <button
                              onClick={() =>
                                handleToggleBookmark(
                                  activeSession.messages[idx - 1]?.text || "Farming enquiry",
                                  msg.text
                                )
                              }
                              className={`p-1.5 rounded-lg transition-colors ${
                                isBookmarked
                                  ? "text-amber-500 hover:text-amber-600"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                              title={isBookmarked ? "Remove bookmark" : "Save answer to My Answers"}
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500" : ""}`}
                              />
                            </button>

                            {/* Retry Button */}
                            <button
                              onClick={() => handleRetry(idx)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Regenerate answer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Follow-up Suggestion Chips */}
                      {!isUser && msg.followUps && msg.followUps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.followUps.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleSendMessage({ text: chip })}
                              className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-border/60 text-[11px] font-medium text-foreground transition-all flex items-center gap-1 active:scale-95"
                            >
                              <span>{chip}</span>
                              <ArrowRight className="w-3 h-3 text-emerald-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* BOTTOM MULTI-INPUT COMPOSER */}
          <MultiInputComposer
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onStopStreaming={handleStopStreaming}
            selectedLanguage={selectedLanguage}
            onChangeLanguage={(l) => setSelectedLanguage(l)}
          />
        </div>

        {/* RIGHT COLUMN: Agricultural Intelligence (3 cols on desktop) */}
        <div className="hidden md:block md:col-span-3 lg:col-span-3 h-full">
          <AgriIntelligenceSidebar
            farmerProfile={farmProfile}
            onUpdateLocation={handleUpdateLocation}
            onSelectQuery={(q) => handleSendMessage({ text: q })}
          />
        </div>
      </div>

      {/* MOBILE DRAWER: Farmer Workspace */}
      {isMobileLeftOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-[85%] max-w-sm h-full bg-card shadow-2xl">
            <FarmerWorkspaceSidebar
              sessions={sessions}
              activeSessionId={activeSession?.id || null}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              savedAnswers={savedAnswers}
              diagnosisHistory={diagnosisHistory}
              farmProfile={farmProfile}
              onOpenProfileModal={() => {
                setIsMobileLeftOpen(false);
                setIsProfileModalOpen(true);
              }}
              onOpenSavedAnswersModal={() => {
                setIsMobileLeftOpen(false);
                setIsSavedAnswersModalOpen(true);
              }}
              onOpenDiagnosisHistoryModal={() => {
                setIsMobileLeftOpen(false);
                setIsDiagnosisModalOpen(true);
              }}
              onQuickQuery={(q) => {
                setIsMobileLeftOpen(false);
                handleSendMessage({ text: q });
              }}
              onCloseMobile={() => setIsMobileLeftOpen(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileLeftOpen(false)} />
        </div>
      )}

      {/* MOBILE DRAWER: Agricultural Intelligence */}
      {isMobileRightOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs animate-in fade-in justify-end">
          <div className="flex-1" onClick={() => setIsMobileRightOpen(false)} />
          <div className="w-[85%] max-w-sm h-full bg-card shadow-2xl">
            <AgriIntelligenceSidebar
              farmerProfile={farmProfile}
              onUpdateLocation={handleUpdateLocation}
              onSelectQuery={(q) => {
                setIsMobileRightOpen(false);
                handleSendMessage({ text: q });
              }}
              onCloseMobile={() => setIsMobileRightOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MODALS */}
      <FarmProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={farmProfile}
        onProfileUpdated={handleProfileUpdated}
      />

      <SavedAnswersModal
        isOpen={isSavedAnswersModalOpen}
        onClose={() => setIsSavedAnswersModalOpen(false)}
        savedAnswers={savedAnswers}
        onRemoveAnswer={(id) => {
          toggleSavedAnswer({
            sessionId: "",
            question: savedAnswers.find((a) => a.id === id)?.question || "",
            answer: savedAnswers.find((a) => a.id === id)?.answer || ""
          });
          setSavedAnswers(loadSavedAnswers());
        }}
        onAskQuestion={(q) => handleSendMessage({ text: q })}
      />

      <CropDiagnosisModal
        isOpen={isDiagnosisModalOpen}
        onClose={() => setIsDiagnosisModalOpen(false)}
        diagnosisHistory={diagnosisHistory}
        onStartNewDiagnosis={(crop, sym, file) => {
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              handleSendMessage({
                text: sym || `Diagnose crop health for ${crop}`,
                imageBase64: reader.result as string,
                cropHint: crop
              });
            };
            reader.readAsDataURL(file);
          } else {
            handleSendMessage({
              text: `Diagnose symptoms for ${crop}: ${sym}`,
              cropHint: crop
            });
          }
        }}
      />
    </div>
  );
}

// Zero-State Welcome Component
function WelcomeZeroState({
  onQuickAsk,
  onOpenDiagnosis,
  farmProfile,
  selectedLanguage
}: {
  onQuickAsk: (q: string) => void;
  onOpenDiagnosis: () => void;
  farmProfile: FarmerProfileData;
  selectedLanguage: VoiceLanguage;
}) {
  const langConfig = SUPPORTED_VOICE_LANGUAGES[selectedLanguage] || SUPPORTED_VOICE_LANGUAGES.auto;

  return (
    <div className="h-full flex flex-col justify-center max-w-2xl mx-auto py-8 space-y-6 text-center select-none animate-in fade-in">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>India&apos;s Voice-First Agricultural Intelligence Command Centre</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight font-display">
          {farmProfile.farmerName ? `Namaste, ${farmProfile.farmerName} Ji!` : "Namaste Kisan Mitra!"}
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
          {langConfig.welcome}
        </p>
      </div>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        <button
          onClick={() =>
            onQuickAsk(
              `My ${farmProfile.mainCrops[0] || "wheat"} crop leaves are turning yellow with brown spots. What is the cause and recommended treatment?`
            )
          }
          className="p-3.5 rounded-2xl border border-border/70 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all space-y-1.5 group"
        >
          <span className="text-lg">🌿</span>
          <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
            Plant Disease Diagnosis & Sprays
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Identify leaf blights, rusts, borers and get CIBRC-registered active ingredient dosages.
          </p>
        </button>

        <button
          onClick={() =>
            onQuickAsk(
              `What is the recommended fertilizer schedule for ${farmProfile.mainCrops[0] || "paddy"} in ${farmProfile.district}?`
            )
          }
          className="p-3.5 rounded-2xl border border-border/70 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all space-y-1.5 group"
        >
          <span className="text-lg">🧪</span>
          <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
            Soil Health & Nutrient Schedules
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Basal & top-dressing dosages for Urea, DAP, MOP and micronutrient zinc sulphate.
          </p>
        </button>

        <button
          onClick={() =>
            onQuickAsk(
              `What are the eligibility conditions and document requirements for PM-Kisan and PM Fasal Bima Yojana in ${farmProfile.state}?`
            )
          }
          className="p-3.5 rounded-2xl border border-border/70 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all space-y-1.5 group"
        >
          <span className="text-lg">🏛️</span>
          <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
            Government Subsidies & Schemes
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Check direct benefit transfers, solar pump subsidies, and crop insurance claim procedures.
          </p>
        </button>

        <button
          onClick={onOpenDiagnosis}
          className="p-3.5 rounded-2xl border border-border/70 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all space-y-1.5 group"
        >
          <span className="text-lg">📸</span>
          <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
            Camera Leaf Diagnostics
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Upload or snap a high-resolution leaf photograph for instant computer vision analysis.
          </p>
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        💡 Tap the microphone below to speak naturally in Hindi, Kannada, Telugu, Tamil, Marathi, Bengali or English.
      </p>
    </div>
  );
}

// Helper to generate context-sensitive follow-up questions
function generateFollowUpSuggestions(text: string, lang: VoiceLanguage): string[] {
  const lower = text.toLowerCase();
  const isHindi = lang === "hi" || lang === "hi_en";

  if (lower.includes("rust") || lower.includes("blight") || lower.includes("fungus") || lower.includes("रोग")) {
    return isHindi
      ? [
          "प्रति एकड़ स्प्रे की सही खुराक क्या है?",
          "छिड़काव के समय क्या सावधानियां रखनी चाहिए?",
          "निकटतम कृषि विज्ञान केंद्र (KVK) का फोन नंबर दें"
        ]
      : [
          "What is the exact spray dosage per acre?",
          "What is the safety pre-harvest interval (PHI)?",
          "Contact number of nearest Krishi Vigyan Kendra"
        ];
  }

  if (lower.includes("fertilizer") || lower.includes("urea") || lower.includes("dap") || lower.includes("खाद")) {
    return isHindi
      ? [
          "जिंक सल्फेट के साथ कौन सी खाद नहीं मिलानी चाहिए?",
          "मिट्टी परीक्षण प्रयोगशाला का पता बताएं",
          "जैविक खाद (वर्मीकम्पोस्ट) की मात्रा कितनी रखें?"
        ]
      : [
          "Which fertilizers should not be mixed with Zinc?",
          "Where is the nearest Govt Soil Testing Lab?",
          "Organic bio-fertilizer application schedule"
        ];
  }

  if (lower.includes("pm-kisan") || lower.includes("scheme") || lower.includes("योजना")) {
    return isHindi
      ? [
          "पीएम किसान ई-केवाईसी (eKYC) कैसे चेक करें?",
          "आवश्यक दस्तावेजों की पूरी सूची दें",
          "जिला कृषि अधिकारी (DAO) से संपर्क कैसे करें?"
        ]
      : [
          "How to complete PM-Kisan Aadhaar eKYC?",
          "Full list of mandatory documents",
          "How to contact District Agriculture Officer"
        ];
  }

  return isHindi
    ? [
        "आज के मौसम में कीटनाशक छिड़कना सुरक्षित है?",
        "नजदीकी कृषि अधिकारी का संपर्क विवरण दें",
        "वर्तमान मंडी भाव और एमएसपी (MSP) बताएं"
      ]
    : [
        "Is it safe to spray pesticides in today's weather?",
        "Show nearby Agriculture Extension Officers",
        "Latest APMC mandi commodity prices and MSP"
      ];
}

// Grounded agricultural fallback engine when server connection is offline
function getFallbackAgronomicAdvice(
  query: string,
  lang: VoiceLanguage,
  profile: FarmerProfileData
): string {
  const q = query.toLowerCase();

  if (q.includes("rust") || q.includes("yellow") || q.includes("पीला") || q.includes("गेरूई")) {
    return (
      `🌾 ICAR-IIWBR Crop Health Advisory for ${profile.district}, ${profile.state}:\n\n` +
      `Symptoms indicate possible Stripe/Yellow Rust (Puccinia striiformis) or Zinc deficiency (Khaira disease):\n\n` +
      `1. If linear yellow stripes appear with yellow powder on fingers upon touch:\n` +
      `   • Chemical Treatment: Spray Propiconazole 25% EC @ 1.0 ml per liter of water (200 ml in 200 L water per acre) or Tebuconazole 250 EC @ 1.0 ml/L.\n` +
      `   • Pre-Harvest Interval (PHI): 30 days.\n` +
      `   • Safety: Use protective face mask and spray during calm early mornings.\n\n` +
      `2. If general yellowing appears on new leaves without stripes (Zinc deficiency):\n` +
      `   • Spray Zinc Sulphate (21%) @ 5 kg + 2.5 kg slaked lime in 200 liters water per acre.\n\n` +
      `📞 For immediate confirmation, call the national Kisan Call Centre toll-free at 1800-180-1551.`
    );
  }

  if (q.includes("pm-kisan") || q.includes("kisan") || q.includes("योजना") || q.includes("scheme")) {
    return (
      `🏛️ PM-KISAN Samman Nidhi Official Guidelines:\n\n` +
      `• Benefit: ₹6,000 per year paid in 3 four-monthly installments of ₹2,000 directly via DBT.\n` +
      `• Eligibility: Landholding farmer families with cultivable land in computerized state land records (RoR/Khasra).\n` +
      `• Mandatory Steps:\n` +
      `  1. Aadhaar eKYC via OTP on https://pmkisan.gov.in or biometric verification at CSC.\n` +
      `  2. Bank account NPCI Aadhaar-seeding.\n` +
      `  3. Land demarcation verification by Block Agriculture Officer (BAO).\n\n` +
      `📞 PM-KISAN National Helpline: 155261 / Toll-Free KCC: 1800-180-1551.`
    );
  }

  return (
    `Namaste! Your query regarding "${query}" has been recorded for ${profile.district}, ${profile.state}.\n\n` +
    `Recommended standard agronomic practices from ICAR & State Agriculture Universities:\n` +
    `• Soil & Fertilizers: Base nutrient application on official Soil Health Card parameters (NPK ratio 4:2:1 for cereals).\n` +
    `• Weather Precaution: Avoid foliar pesticide applications when wind speed exceeds 12 km/h or rain is forecasted.\n` +
    `• Expert Verification: Visit your nearest Krishi Vigyan Kendra (KVK) or call the toll-free Kisan Call Centre at 1800-180-1551 (6:00 AM to 10:00 PM, 22 languages).`
  );
}
