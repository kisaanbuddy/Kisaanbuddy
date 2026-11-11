"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowDown,
  Building2,
  History,
  MessageSquarePlus,
  PhoneCall,
  SlidersHorizontal,
  Sprout,
  Stethoscope,
  Trash2,
} from "lucide-react";
import {
  ChatMessage,
  ConversationSession,
  CropDiagnosisRecord,
  SavedAnswer,
  clearSessionMessages,
  createNewSession,
  deleteSession as deleteLocalSession,
  getActiveSessionId,
  isAnswerSaved,
  loadAllSessions,
  loadDiagnosisHistory,
  loadSavedAnswers,
  recordCropDiagnosis,
  setActiveSessionId,
  toggleSavedAnswer,
  updateSession,
} from "@/lib/conversation-store";
import {
  DEFAULT_FARMER_PROFILE,
  FarmerProfileData,
  formatFarmContextForAI,
  loadFarmerProfile,
  saveFarmerProfile,
} from "@/lib/farm-profile-store";
import {
  SUPPORTED_VOICE_LANGUAGES,
  VoiceLanguage,
  voiceService,
} from "@/lib/voice-speech";
import {
  AssistantAPIError,
  deleteSession as deleteServerSession,
  streamMessage,
  transcribeAudio,
  type Language,
} from "@/lib/assistant-api";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import {
  AdvisorWelcomeScreen,
  type WelcomeTopicId,
} from "@/components/chatbot/AdvisorWelcomeScreen";
import { ChatMessageBubble } from "@/components/chatbot/ChatMessageBubble";
import {
  MultiInputComposer,
  type ComposerSubmitPayload,
  type MultiInputComposerHandle,
} from "@/components/chatbot/MultiInputComposer";
import { ConversationHistoryDrawer } from "@/components/chatbot/ConversationHistoryDrawer";
import { AgriIntelligenceSidebar } from "@/components/chatbot/AgriIntelligenceSidebar";
import { FarmProfileModal } from "@/components/chatbot/FarmProfileModal";
import { SavedAnswersModal } from "@/components/chatbot/SavedAnswersModal";
import { CropDiagnosisModal } from "@/components/chatbot/CropDiagnosisModal";

const CHATBOT_LANG_KEY = "kisaanbuddy_chatbot_voice_lang";
const CHATBOT_AUTOSPEAK_KEY = "kisaanbuddy_chatbot_autospeak";

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const [header, base64] = dataUrl.split(",");
    if (!header || !base64) return null;
    const mimeMatch = /data:(.*?);base64/.exec(header);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const binary = atob(base64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      arr[i] = binary.charCodeAt(i);
    }
    return new Blob([arr], { type: mime });
  } catch {
    return null;
  }
}

export default function ChatbotClient() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { lang: platformLang } = useLanguage();

  // Sessions & Persisted State (initialized safely to avoid SSR hydration mismatch)
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [diagnosisHistory, setDiagnosisHistory] = useState<CropDiagnosisRecord[]>([]);
  const [farmProfile, setFarmProfile] = useState<FarmerProfileData>(DEFAULT_FARMER_PROFILE);

  // Voice & Streaming State
  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage>("auto");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [assistantStatus, setAssistantStatus] = useState<"ready" | "thinking" | "speaking">("ready");
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Collapsible Drawers & Modals (Both sidebars collapsed by default!)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavedAnswersModalOpen, setIsSavedAnswersModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<MultiInputComposerHandle>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialQueryHandledRef = useRef(false);

  // Sync ref for latest sessions/activeSession inside async handlers
  const activeSessionRef = useRef<ConversationSession | null>(null);
  activeSessionRef.current = activeSession;

  // Hydrate persisted client stores after mount
  useEffect(() => {
    const loadedSessions = loadAllSessions();
    const loadedAnswers = loadSavedAnswers();
    const loadedDiags = loadDiagnosisHistory();
    const loadedProfile = loadFarmerProfile();

    setSavedAnswers(loadedAnswers);
    setDiagnosisHistory(loadedDiags);
    setFarmProfile(loadedProfile);

    try {
      const savedLang = localStorage.getItem(CHATBOT_LANG_KEY) as VoiceLanguage | null;
      if (savedLang && SUPPORTED_VOICE_LANGUAGES[savedLang]) {
        setSelectedLanguage(savedLang);
      } else if (platformLang && SUPPORTED_VOICE_LANGUAGES[platformLang as VoiceLanguage]) {
        setSelectedLanguage(platformLang as VoiceLanguage);
      }
      const savedAutoSpeak = localStorage.getItem(CHATBOT_AUTOSPEAK_KEY);
      if (savedAutoSpeak === "true") setAutoSpeak(true);
    } catch {
      // ignore storage errors
    }

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
    activeSessionRef.current = sessionToActivate;

    const initialQuery = searchParams?.get("query");
    if (initialQuery && !initialQueryHandledRef.current && sessionToActivate.messages.length === 0) {
      initialQueryHandledRef.current = true;
      setTimeout(() => {
        void handleSendMessage({ text: initialQuery }, sessionToActivate!);
      }, 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll behavior
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [activeSession?.messages?.length, isStreaming, scrollToBottom]);

  const handleMessagesScroll = () => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distanceFromBottom > 240);
  };

  // Language & AutoSpeak handlers
  const handleChangeLanguage = (lang: VoiceLanguage) => {
    setSelectedLanguage(lang);
    try {
      localStorage.setItem(CHATBOT_LANG_KEY, lang);
    } catch {
      // ignore
    }
  };

  const handleToggleAutoSpeak = () => {
    setAutoSpeak((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CHATBOT_AUTOSPEAK_KEY, String(next));
      } catch {
        // ignore
      }
      if (!next) {
        voiceService.stopSpeaking();
        setSpeakingMessageId(null);
        setIsAudioPaused(false);
        setAssistantStatus("ready");
      }
      return next;
    });
  };

  // Session Management
  const syncSessionToList = useCallback((updated: ConversationSession) => {
    setActiveSession(updated);
    activeSessionRef.current = updated;
    updateSession(updated);
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  }, []);

  const handleSelectSession = (id: string) => {
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    setIsAudioPaused(false);
    const target = sessions.find((s) => s.id === id);
    if (target) {
      setActiveSession(target);
      activeSessionRef.current = target;
      setActiveSessionId(target.id);
    }
  };

  const handleNewSession = () => {
    if (isStreaming) handleStopStreaming();
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    setIsAudioPaused(false);
    const newSess = createNewSession(selectedLanguage);
    setSessions((prev) => [newSess, ...prev]);
    setActiveSession(newSess);
    activeSessionRef.current = newSess;
  };

  const handleDeleteSession = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (target?.serverSessionId) {
      void deleteServerSession(target.serverSessionId).catch(() => {});
    }
    deleteLocalSession(id);
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSession?.id === id) {
      if (updated.length > 0) {
        setActiveSession(updated[0]);
        activeSessionRef.current = updated[0];
      } else {
        const fresh = createNewSession(selectedLanguage);
        setSessions([fresh]);
        setActiveSession(fresh);
        activeSessionRef.current = fresh;
      }
    }
  };

  const handleClearConversation = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    if (isStreaming) handleStopStreaming();
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    setIsAudioPaused(false);
    if (activeSession.serverSessionId) {
      void deleteServerSession(activeSession.serverSessionId).catch(() => {});
    }
    const cleared = clearSessionMessages(activeSession);
    syncSessionToList(cleared);
  };

  // Profile & Location
  const handleProfileUpdated = (updated: FarmerProfileData) => {
    setFarmProfile(updated);
  };

  const handleUpdateLocation = (state: string, district: string, block?: string) => {
    const updated = saveFarmerProfile({ state, district, block });
    setFarmProfile(updated);
  };

  // Voice Output Playback
  const playMessageVoice = useCallback(
    (msgId: string, text: string, lang: string) => {
      voiceService.stopSpeaking();
      setIsAudioPaused(false);
      setSpeakingMessageId(msgId);
      setAssistantStatus("speaking");
      const resolvedLang = (lang as VoiceLanguage) || selectedLanguage || "hi";

      void voiceService.speakText(
        text,
        resolvedLang,
        () => {
          setSpeakingMessageId(msgId);
          setIsAudioPaused(false);
          setAssistantStatus("speaking");
        },
        () => {
          setSpeakingMessageId(null);
          setIsAudioPaused(false);
          setAssistantStatus("ready");
        },
        () => {
          setSpeakingMessageId(null);
          setIsAudioPaused(false);
          setAssistantStatus("ready");
        }
      );
    },
    [selectedLanguage]
  );

  const handleToggleSpeak = (msgId: string, text: string, lang: string) => {
    if (speakingMessageId === msgId) {
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
      setIsAudioPaused(false);
      setAssistantStatus("ready");
    } else {
      playMessageVoice(msgId, text, lang);
    }
  };

  const handlePauseResumeSpeak = () => {
    if (voiceService.isPausedState()) {
      voiceService.resumeSpeaking();
      setIsAudioPaused(false);
    } else {
      voiceService.pauseSpeaking();
      setIsAudioPaused(true);
    }
  };

  const handleStopSpeak = () => {
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    setIsAudioPaused(false);
    setAssistantStatus("ready");
  };

  // Clipboard & Bookmark
  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBookmark = (question: string, answer: string) => {
    toggleSavedAnswer({
      sessionId: activeSession?.id || "default",
      question,
      answer,
    });
    setSavedAnswers(loadSavedAnswers());
  };

  // Stop Generation
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setActiveTool(null);
    setAssistantStatus("ready");
  };

  // Core Message Send & SSE Streaming Pipeline
  const handleSendMessage = async (
    payload: ComposerSubmitPayload,
    sessionOverride?: ConversationSession,
    regenerateTargetBotId?: string
  ) => {
    const currentSession = sessionOverride || activeSessionRef.current;
    if (!currentSession) return;

    // Barge-in: stop ongoing voice playback
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    setIsAudioPaused(false);

    // Handle uploaded audio note via /api/chat/stt first
    let queryText = payload.text.trim();
    if (payload.audioFile) {
      setIsTranscribingAudio(true);
      try {
        const hint =
          selectedLanguage !== "auto"
            ? (selectedLanguage as Exclude<Language, "auto">)
            : undefined;
        const sttRes = await transcribeAudio(payload.audioFile, hint);
        if (sttRes.transcript?.trim()) {
          queryText =
            queryText && queryText !== "Voice audio enquiry"
              ? `${queryText}\n${sttRes.transcript.trim()}`
              : sttRes.transcript.trim();
        }
      } catch {
        // Proceed with text if any, or warn clearly
        if (!queryText || queryText === "Voice audio enquiry") {
          setIsTranscribingAudio(false);
          const errBot: ChatMessage = {
            id: `msg-err-${Date.now()}`,
            sender: "bot",
            text: "Uploaded audio could not be transcribed right now. Please tap the microphone button to speak directly or type your question.",
            language: selectedLanguage,
            timestamp: new Date().toISOString(),
            isError: true,
          };
          syncSessionToList({
            ...currentSession,
            messages: [...currentSession.messages, errBot],
          });
          return;
        }
      } finally {
        setIsTranscribingAudio(false);
      }
    }

    if (!queryText && !payload.imageBase64) return;

    const botMessageId = regenerateTargetBotId || `msg-b-${Date.now() + 1}`;
    let workingMessages: ChatMessage[];

    if (regenerateTargetBotId) {
      workingMessages = currentSession.messages.map((m) =>
        m.id === regenerateTargetBotId
          ? {
              ...m,
              text: "",
              usedTools: [],
              followUps: [],
              isOfflineFallback: false,
              isError: false,
              isStreaming: true,
              timestamp: new Date().toISOString(),
            }
          : m
      );
    } else {
      const userMessageId = `msg-u-${Date.now()}`;
      const userMsg: ChatMessage = {
        id: userMessageId,
        sender: "user",
        text: queryText,
        language: selectedLanguage,
        imageUrl: payload.imageBase64,
        cropHint: payload.cropHint,
        timestamp: new Date().toISOString(),
      };

      const botMsg: ChatMessage = {
        id: botMessageId,
        sender: "bot",
        text: "",
        language: selectedLanguage,
        timestamp: new Date().toISOString(),
        isStreaming: true,
        usedTools: [],
      };

      workingMessages = [...currentSession.messages, userMsg, botMsg];
    }

    const sessionTitle =
      currentSession.messages.length === 0 && !regenerateTargetBotId
        ? queryText.slice(0, 42) + (queryText.length > 42 ? "..." : "")
        : currentSession.title;

    const updatedSession: ConversationSession = {
      ...currentSession,
      title: sessionTitle,
      messages: workingMessages,
    };

    syncSessionToList(updatedSession);
    setIsStreaming(true);
    setActiveTool(null);
    setAssistantStatus("thinking");

    // Optional parallel Crop Doctor vision inference when an image is attached
    let diagnosisOutcome: any = null;
    if (payload.imageBase64) {
      try {
        const formData = new FormData();
        const fileToSend =
          payload.imageFile ||
          (() => {
            const blob = dataUrlToBlob(payload.imageBase64!);
            return blob ? new File([blob], "crop_leaf.jpg", { type: blob.type }) : null;
          })();

        if (fileToSend) {
          formData.append("file", fileToSend);
        }
        const resolvedCropHint = payload.cropHint || farmProfile.mainCrops[0] || "";
        if (resolvedCropHint) formData.append("crop_hint", resolvedCropHint);
        formData.append("symptom_notes", queryText);

        const diagRes = await fetch(
          `/api/disease/predict?crop_hint=${encodeURIComponent(
            resolvedCropHint
          )}&symptom_notes=${encodeURIComponent(queryText)}`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (diagRes.ok) {
          diagnosisOutcome = await diagRes.json();
          if (diagnosisOutcome?.disease_name) {
            recordCropDiagnosis({
              cropName:
                (typeof diagnosisOutcome.crop === "string"
                  ? diagnosisOutcome.crop
                  : diagnosisOutcome.crop?.name) ||
                payload.cropHint ||
                "Crop",
              diseaseName: diagnosisOutcome.disease_name,
              confidence: diagnosisOutcome.confidence ?? 0,
              imageUrl: payload.imageBase64,
              keyRemedy:
                diagnosisOutcome.immediate_action || "Consult local KVK agronomist.",
            });
            setDiagnosisHistory(loadDiagnosisHistory());
          }
        }
      } catch {
        // Vision service unavailable; continue with chat orchestrator
      }
    }

    // Prepare Farm Context for AI
    const farmContext = formatFarmContextForAI(farmProfile);
    const enrichedMessage = farmContext
      ? `${farmContext}\n\nFarmer Query: ${queryText}`
      : queryText;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const buildDiagnosisData = (d: any) =>
      d && d.disease_name
        ? {
            diseaseName: d.disease_name,
            crop:
              (typeof d.crop === "string" ? d.crop : d.crop?.name) ||
              payload.cropHint ||
              "Crop",
            confidence: d.confidence ?? 0,
            status: d.status || "uncertain",
            symptoms: d.symptoms || queryText,
            immediateAction: d.immediate_action,
            culturalControl: d.cultural_control,
            biologicalControl: d.biological_control,
            chemicalControl: d.chemical_control,
            dosageGuidelines: d.dosage_guidelines,
            preHarvestIntervalDays: d.phi_days,
            safetyInstructions: d.safety_instructions,
            sourceInstitution: d.source_institution,
            lastVerifiedDate: d.last_verified_date,
          }
        : undefined;

    const locationHint =
      farmProfile.district || farmProfile.state
        ? { city: farmProfile.district || farmProfile.state }
        : null;

    let accumulatedText = "";
    let resolvedLang: VoiceLanguage = selectedLanguage;
    let serverSessionId = currentSession.serverSessionId;
    const toolsUsed: string[] = [];

    try {
      for await (const evt of streamMessage(
        {
          session_id: serverSessionId || null,
          message: enrichedMessage,
          language: selectedLanguage as Language,
          location: locationHint,
          image_base64: payload.imageBase64 || null,
          stream: true,
        },
        abortController.signal
      )) {
        if (evt.type === "session") {
          if (evt.session_id) serverSessionId = evt.session_id;
          if (evt.language && SUPPORTED_VOICE_LANGUAGES[evt.language as VoiceLanguage]) {
            resolvedLang = evt.language as VoiceLanguage;
          }
        } else if (evt.type === "tool_start") {
          setActiveTool(evt.name);
          if (!toolsUsed.includes(evt.name)) toolsUsed.push(evt.name);
        } else if (evt.type === "tool_end") {
          setActiveTool(null);
        } else if (evt.type === "token") {
          accumulatedText += evt.text;
          setActiveSession((prev) => {
            if (!prev) return null;
            const nextMsgs = prev.messages.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    text: accumulatedText,
                    usedTools: [...toolsUsed],
                    diagnosisData: buildDiagnosisData(diagnosisOutcome),
                  }
                : m
            );
            const nextSess = { ...prev, serverSessionId, messages: nextMsgs };
            activeSessionRef.current = nextSess;
            return nextSess;
          });
        } else if (evt.type === "done") {
          if (evt.session_id) serverSessionId = evt.session_id;
          if (evt.language && SUPPORTED_VOICE_LANGUAGES[evt.language as VoiceLanguage]) {
            resolvedLang = evt.language as VoiceLanguage;
          }
          if (evt.used_tools?.length) {
            for (const t of evt.used_tools) {
              if (!toolsUsed.includes(t)) toolsUsed.push(t);
            }
          }
        } else if (evt.type === "error") {
          throw new AssistantAPIError(
            evt.message || "Assistant error",
            evt.status_code ?? 503,
            evt.code
          );
        }
      }

      finalizeAssistantMessage(
        botMessageId,
        accumulatedText,
        resolvedLang,
        toolsUsed,
        serverSessionId,
        buildDiagnosisData(diagnosisOutcome),
        false
      );
    } catch (err: any) {
      if (err?.name === "AbortError") {
        finalizeAssistantMessage(
          botMessageId,
          accumulatedText || "Consultation paused by farmer.",
          resolvedLang,
          toolsUsed,
          serverSessionId,
          buildDiagnosisData(diagnosisOutcome),
          false
        );
        return;
      }

      const apiErr = err instanceof AssistantAPIError ? err : null;
      const isStructuredBackendError =
        apiErr &&
        (apiErr.status === 400 ||
          apiErr.status === 402 ||
          apiErr.status === 413 ||
          apiErr.status === 422 ||
          apiErr.status === 429 ||
          Boolean(apiErr.code));

      if (isStructuredBackendError && apiErr) {
        const errorText =
          `### Notice\n${apiErr.message}\n\n` +
          `### When to Contact an Agricultural Expert\n` +
          `- For urgent farming assistance, call the toll-free **Kisan Call Centre: 1800-180-1551** or open **Agri Dept & Helplines** in the top bar.`;
        finalizeAssistantMessage(
          botMessageId,
          errorText,
          selectedLanguage,
          toolsUsed,
          serverSessionId,
          buildDiagnosisData(diagnosisOutcome),
          false,
          true
        );
      } else {
        // Honest Reality-First Offline / Server Unreachable Fallback
        const offlineReply = getOfflineAgronomicReference(queryText, selectedLanguage, farmProfile);
        finalizeAssistantMessage(
          botMessageId,
          offlineReply,
          selectedLanguage,
          toolsUsed,
          serverSessionId,
          buildDiagnosisData(diagnosisOutcome),
          true,
          false
        );
      }
    } finally {
      setIsStreaming(false);
      setActiveTool(null);
      abortControllerRef.current = null;
    }
  };

  const finalizeAssistantMessage = (
    botMessageId: string,
    content: string,
    msgLang: VoiceLanguage,
    usedTools: string[],
    serverSessionId?: string,
    diagnosisData?: ChatMessage["diagnosisData"],
    isOfflineFallback = false,
    isError = false
  ) => {
    const finalContent =
      content.trim() ||
      "Unable to generate an answer right now. Please try again or contact Kisan Call Centre at 1800-180-1551.";
    const followUps = generateFollowUpSuggestions(finalContent, msgLang);

    setActiveSession((prev) => {
      if (!prev) return null;
      const msgs = prev.messages.map((m) =>
        m.id === botMessageId
          ? {
              ...m,
              text: finalContent,
              language: msgLang,
              isStreaming: false,
              usedTools,
              isOfflineFallback,
              isError,
              followUps,
              diagnosisData,
            }
          : m
      );
      const updatedSess: ConversationSession = {
        ...prev,
        serverSessionId: serverSessionId || prev.serverSessionId,
        messages: msgs,
      };
      activeSessionRef.current = updatedSess;
      updateSession(updatedSess);
      setSessions((list) => {
        const idx = list.findIndex((s) => s.id === updatedSess.id);
        if (idx >= 0) {
          const copy = [...list];
          copy[idx] = updatedSess;
          return copy;
        }
        return [updatedSess, ...list];
      });
      return updatedSess;
    });

    if (autoSpeak && finalContent && !isOfflineFallback && !isError) {
      playMessageVoice(botMessageId, finalContent, msgLang);
    } else {
      setAssistantStatus("ready");
    }
  };

  // Clean in-place Regenerate Response (no duplicate user bubble)
  const handleRegenerate = (botMsgIndex: number) => {
    if (!activeSession || isStreaming) return;
    // Find nearest preceding user message
    for (let i = botMsgIndex - 1; i >= 0; i--) {
      const candidate = activeSession.messages[i];
      if (candidate.sender === "user") {
        const targetBot = activeSession.messages[botMsgIndex];
        void handleSendMessage(
          {
            text: candidate.text,
            imageBase64: candidate.imageUrl,
            cropHint: candidate.cropHint,
          },
          activeSession,
          targetBot.id
        );
        return;
      }
    }
  };

  // Welcome Card Trigger
  const handleWelcomeCardSelect = (_topic: WelcomeTopicId, prompt: string) => {
    void handleSendMessage({ text: prompt });
  };

  // Drag & Drop leaf images into chat
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };
  const handleDragLeave = () => setIsDraggingFile(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        void handleSendMessage({
          text: "Please examine this crop photograph for any disease, pest, or nutrient issue.",
          imageBase64: reader.result as string,
          imageFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const messages = activeSession?.messages || [];
  const hasMessages = messages.length > 0;
  const lastAssistantIndex = [...messages]
    .reverse()
    .findIndex((m) => m.sender === "bot");
  const latestBotIdx = lastAssistantIndex >= 0 ? messages.length - 1 - lastAssistantIndex : -1;

  return (
    <div
      data-fullwidth="true"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] flex overflow-hidden bg-[#F5F9F5] dark:bg-stone-950 text-foreground antialiased"
    >
      {/* Drag & Drop Leaf Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-emerald-900/20 backdrop-blur-xs border-2 border-dashed border-emerald-600 flex items-center justify-center pointer-events-none">
          <div className="px-6 py-4 rounded-3xl bg-white dark:bg-stone-900 shadow-xl border border-emerald-200 text-center space-y-1">
            <Sprout className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-[#143325] dark:text-emerald-100">
              Drop crop leaf photograph here for AI diagnosis
            </p>
          </div>
        </div>
      )}

      {/* MAIN CENTRAL AI CONVERSATION STAGE */}
      <div className="flex-1 min-w-0 h-full flex flex-col relative">
        {/* Clean Minimal Workspace Bar */}
        <div className="shrink-0 h-12 sm:h-13 px-3 sm:px-5 border-b border-emerald-900/10 dark:border-stone-800 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md flex items-center justify-between gap-2 z-20">
          {/* Left: History Drawer Toggle + New Chat */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-900/10 dark:border-stone-700 bg-[#F8FBF8] dark:bg-stone-800 hover:border-emerald-600/40 text-xs font-semibold text-[#143325] dark:text-stone-200 transition-colors"
              title="Open conversation history & farm profile"
            >
              <History className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden xs:inline">History</span>
              {sessions.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 font-bold">
                  {sessions.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleNewSession}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              title="Start new conversation"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Live Advisor Status */}
            <div className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  assistantStatus === "thinking" || isStreaming
                    ? "bg-amber-500 animate-ping"
                    : assistantStatus === "speaking"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-emerald-600"
                }`}
              />
              <span>
                {activeTool
                  ? `Running ${activeTool.replace(/_/g, " ")}...`
                  : assistantStatus === "speaking"
                  ? "Speaking Response"
                  : isStreaming || assistantStatus === "thinking"
                  ? "Thinking..."
                  : "KisaanBuddy AI Ready"}
              </span>
            </div>
          </div>

          {/* Right: Clear, Farm Context, Crop Doctor & Collapsible Agriculture Dept Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {hasMessages && (
              <button
                type="button"
                onClick={handleClearConversation}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-900/10 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 dark:hover:bg-rose-950/40 text-xs font-medium text-[#4B5D50] dark:text-stone-300 transition-colors"
                title="Clear current conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-900/10 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-600/40 text-xs font-medium text-[#1D2B22] dark:text-stone-200 transition-colors"
              title="Edit your farm soil, crop & location details"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="max-w-[110px] truncate">{farmProfile.district || "Farm"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDiagnosisModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-900/10 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-600/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors"
              title="Crop Disease Clinic & History"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Crop Doctor</span>
            </button>

            {/* Dedicated Collapsible Agriculture Dept & Helplines Button */}
            <button
              type="button"
              onClick={() => setIsDirectoryOpen((prev) => !prev)}
              aria-expanded={isDirectoryOpen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                isDirectoryOpen
                  ? "bg-emerald-700 border-emerald-700 text-white"
                  : "bg-white dark:bg-stone-900 border-emerald-600/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
              title="Toggle verified Agriculture Department Centres & Helplines"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Agri Dept &amp; Helplines</span>
              <span className="sm:hidden flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
                <span>Help</span>
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Primary Conversation Area */}
        <div
          ref={messagesScrollRef}
          onScroll={handleMessagesScroll}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          {!hasMessages ? (
            <AdvisorWelcomeScreen
              onSelectCard={handleWelcomeCardSelect}
              onStartVoice={() => composerRef.current?.startVoice()}
              onOpenLeafPhoto={() => composerRef.current?.openGallery()}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              farmProfile={farmProfile}
              selectedLanguage={selectedLanguage}
              userName={user?.name}
            />
          ) : (
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-7 space-y-5">
              {messages.map((msg, idx) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  isLatestAssistant={idx === latestBotIdx}
                  activeTool={idx === latestBotIdx ? activeTool : null}
                  isBookmarked={isAnswerSaved(
                    messages[idx - 1]?.text || "",
                    msg.text
                  )}
                  isSpeakingThis={speakingMessageId === msg.id}
                  isAudioPaused={speakingMessageId === msg.id && isAudioPaused}
                  isCopied={copiedId === msg.id}
                  onToggleSpeak={() => handleToggleSpeak(msg.id, msg.text, msg.language)}
                  onPauseResumeSpeak={handlePauseResumeSpeak}
                  onStopSpeak={handleStopSpeak}
                  onCopy={() => handleCopy(msg.id, msg.text)}
                  onBookmark={() =>
                    handleToggleBookmark(
                      messages[idx - 1]?.text || "Farming enquiry",
                      msg.text
                    )
                  }
                  onRegenerate={() => handleRegenerate(idx)}
                  onFollowUpClick={(chip) => void handleSendMessage({ text: chip })}
                  onOpenDirectory={() => setIsDirectoryOpen(true)}
                />
              ))}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>

        {/* Scroll to Bottom Floating Pill */}
        {showScrollDown && hasMessages && (
          <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
            <button
              type="button"
              onClick={() => scrollToBottom("smooth")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-emerald-900/15 dark:border-stone-700 shadow-md text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 transition-all"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Latest</span>
            </button>
          </div>
        )}

        {/* Bottom-Fixed Multimodal & Voice-First Composer */}
        <MultiInputComposer
          ref={composerRef}
          onSendMessage={(payload) => void handleSendMessage(payload)}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          selectedLanguage={selectedLanguage}
          onChangeLanguage={handleChangeLanguage}
          autoSpeak={autoSpeak}
          onToggleAutoSpeak={handleToggleAutoSpeak}
          isTranscribingAudio={isTranscribingAudio}
        />
      </div>

      {/* OPTIONAL COLLAPSIBLE RIGHT-SIDE PANEL: AGRICULTURE DEPARTMENT & HELPLINES */}
      {isDirectoryOpen && (
        <>
          {/* Desktop Docked Collapsible Panel */}
          <div className="hidden lg:block w-[380px] xl:w-[410px] h-full shrink-0 animate-in slide-in-from-right duration-200">
            <AgriIntelligenceSidebar
              farmerProfile={farmProfile}
              onUpdateLocation={handleUpdateLocation}
              onSelectQuery={(q) => void handleSendMessage({ text: q })}
              onClose={() => setIsDirectoryOpen(false)}
            />
          </div>

          {/* Mobile / Tablet Slide-Over Drawer */}
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <div
              className="flex-1 bg-black/45 backdrop-blur-xs"
              onClick={() => setIsDirectoryOpen(false)}
            />
            <div className="w-[88%] max-w-sm h-full bg-white dark:bg-stone-900 shadow-2xl animate-in slide-in-from-right duration-200">
              <AgriIntelligenceSidebar
                farmerProfile={farmProfile}
                onUpdateLocation={handleUpdateLocation}
                onSelectQuery={(q) => {
                  setIsDirectoryOpen(false);
                  void handleSendMessage({ text: q });
                }}
                onClose={() => setIsDirectoryOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      {/* COLLAPSIBLE LEFT DRAWER: CONVERSATION HISTORY & FARM CONTEXT */}
      <ConversationHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSession?.id || null}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        savedAnswers={savedAnswers}
        diagnosisHistory={diagnosisHistory}
        farmProfile={farmProfile}
        authUserName={user?.name}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSavedAnswersModal={() => setIsSavedAnswersModalOpen(true)}
        onOpenDiagnosisHistoryModal={() => setIsDiagnosisModalOpen(true)}
      />

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
          const target = savedAnswers.find((a) => a.id === id);
          toggleSavedAnswer({
            sessionId: "",
            question: target?.question || "",
            answer: target?.answer || "",
          });
          setSavedAnswers(loadSavedAnswers());
        }}
        onAskQuestion={(q) => void handleSendMessage({ text: q })}
      />

      <CropDiagnosisModal
        isOpen={isDiagnosisModalOpen}
        onClose={() => setIsDiagnosisModalOpen(false)}
        diagnosisHistory={diagnosisHistory}
        onStartNewDiagnosis={(crop, sym, file) => {
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              void handleSendMessage({
                text: sym || `Diagnose crop health for ${crop}`,
                imageBase64: reader.result as string,
                imageFile: file,
                cropHint: crop,
              });
            };
            reader.readAsDataURL(file);
          } else {
            void handleSendMessage({
              text: `Diagnose symptoms for ${crop}: ${sym}`,
              cropHint: crop,
            });
          }
        }}
      />
    </div>
  );
}

function generateFollowUpSuggestions(text: string, lang: VoiceLanguage): string[] {
  const lower = text.toLowerCase();
  const isHindi = lang === "hi" || lang === "auto";
  const isHinglish = lang === "hi_en";
  const isKannada = lang === "kn";

  if (
    lower.includes("rust") ||
    lower.includes("blight") ||
    lower.includes("fungus") ||
    lower.includes("disease") ||
    lower.includes("रोग") ||
    lower.includes("झुलसा") ||
    lower.includes("ರೋಗ")
  ) {
    if (isKannada) {
      return [
        "ಸಿಂಪಡಣೆ ಮಾಡುವಾಗ ಯಾವ ಸುರಕ್ಷತಾ ಕ್ರಮಗಳನ್ನು ಪಾಲಿಸಬೇಕು?",
        "ಇದಕ್ಕೆ ಜೈವಿಕ ಅಥವಾ ಸಾವಯವ ಪರಿಹಾರ ಇದೆಯೇ?",
        "ಸಮೀಪದ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK) ಸಂಪರ್ಕ ಹೇಗೆ?",
      ];
    }
    if (isHinglish) {
      return [
        "Spray karte samay kya savdhani aur safety rakhni chahiye?",
        "Kya iska jaivik / organic upchar bhi hai?",
        "Nazdeeki KVK expert se kaise baat karein?",
      ];
    }
    return isHindi
      ? [
          "छिड़काव के समय कौन-सी सावधानियां रखनी चाहिए?",
          "क्या इसका जैविक उपचार भी संभव है?",
          "नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क कैसे करें?",
        ]
      : [
          "What safety precautions and pre-harvest interval apply?",
          "Are there organic or biological control options?",
          "How can I verify this with my nearest KVK?",
        ];
  }

  if (
    lower.includes("fertilizer") ||
    lower.includes("urea") ||
    lower.includes("dap") ||
    lower.includes("खाद") ||
    lower.includes("यूरिया") ||
    lower.includes("ಗೊಬ್ಬರ")
  ) {
    if (isKannada) {
      return [
        "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ (Soil Health Card) ಆಧಾರದ ಮೇಲೆ ಪ್ರಮಾಣ ಹೇಗೆ ಬದಲಾಗುತ್ತದೆ?",
        "ಯಾವ ಗೊಬ್ಬರಗಳನ್ನು ಒಟ್ಟಿಗೆ ಬೆರೆಸಬಾರದು?",
        "ಸಾವಯವ ಗೊಬ್ಬರವನ್ನು ಎಷ್ಟು ಹಾಕಬೇಕು?",
      ];
    }
    if (isHinglish) {
      return [
        "Soil Health Card test kahan karwayein?",
        "Zinc Sulphate aur DAP ko ek saath mila sakte hain?",
        "Jaivik khad ki matra kitni rakhein?",
      ];
    }
    return isHindi
      ? [
          "मिट्टी परीक्षण (Soil Health Card) कहाँ करवाएं?",
          "जिंक सल्फेट और DAP को साथ मिला सकते हैं?",
          "जैविक खाद की मात्रा कितनी रखें?",
        ]
      : [
          "How do I adjust dosage using a Soil Health Card?",
          "Which fertilizers should not be mixed together?",
          "Recommended organic manure supplement",
        ];
  }

  if (
    lower.includes("pm-kisan") ||
    lower.includes("scheme") ||
    lower.includes("pmfby") ||
    lower.includes("योजना") ||
    lower.includes("ಯೋಜನೆ")
  ) {
    if (isKannada) {
      return [
        "ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಯಾವ ದಾಖಲೆಗಳು ಬೇಕಾಗುತ್ತವೆ?",
        "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸುವುದು ಹೇಗೆ?",
        "ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳನ್ನು ತೋರಿಸಿ",
      ];
    }
    if (isHinglish) {
      return [
        "Apply karne ke liye kaun-se documents chahiye?",
        "PM-KISAN status kaise check karein?",
        "Official helpline numbers batayein",
      ];
    }
    return isHindi
      ? [
          "आवेदन के लिए कौन-से दस्तावेज़ जरूरी हैं?",
          "पीएम-किसान eKYC की स्थिति कैसे जांचें?",
          "सरकारी सहायता हेल्पलाइन नंबर बताएं",
        ]
      : [
          "What documents are required to apply?",
          "How to verify status on the official portal?",
          "Official toll-free scheme helpline numbers",
        ];
  }

  if (isKannada) {
    return [
      "ಇಂದಿನ ಹವಾಮಾನದಲ್ಲಿ ಸಿಂಪಡಣೆ ಮಾಡುವುದು ಸುರಕ್ಷಿತವೇ?",
      "ಇತ್ತೀಚಿನ AGMARKNET ಮಂಡಿ ದರಗಳನ್ನು ತೋರಿಸಿ",
      "ಸಮೀಪದ ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಸಂಪರ್ಕ ತೋರಿಸಿ",
    ];
  }
  if (isHinglish) {
    return [
      "Aaj ke mausam me spray karna safe hai?",
      "Taaza AGMARKNET mandi bhav batayein",
      "Nazdeeki Krishi officer ka contact dikhayein",
    ];
  }
  return isHindi
    ? [
        "आज के मौसम में छिड़काव करना सुरक्षित है?",
        "ताज़ा मंडी भाव की जानकारी दें",
        "नजदीकी कृषि अधिकारी का संपर्क दिखाएं",
      ]
    : [
        "Is today's weather suitable for spraying?",
        "Check latest AGMARKNET mandi rates",
        "Show nearby Agriculture Dept contacts",
      ];
}

function getOfflineAgronomicReference(
  query: string,
  lang: VoiceLanguage,
  profile: FarmerProfileData
): string {
  const isHindi = lang === "hi" || lang === "auto";
  const locationLabel = [profile.district, profile.state].filter(Boolean).join(", ") || "your district";

  if (isHindi) {
    return (
      `### समस्या की पहचान\n` +
      `अभी लाइव AI सर्वर से संपर्क नहीं हो पा रहा है, इसलिए आपका प्रश्न ("${query}") ऑफ़लाइन संदर्भ मोड में देखा गया है।\n\n` +
      `### अनुशंसित समाधान\n` +
      `- लाइव मौसम, मंडी भाव, फसल रोग मॉडल और सरकारी योजनाओं की ताज़ा जानकारी के लिए कृपया इंटरनेट कनेक्शन जांचकर **Regenerate** दबाएं।\n` +
      `- बिना पक्की पहचान के किसी भी रासायनिक कीटनाशक या खाद की मात्रा का उपयोग न करें।\n\n` +
      `### सावधानियां\n` +
      `- ⚠️ तेज़ हवा (>12 km/h) या बारिश के आसार में किसी भी दवा का छिड़काव न करें।\n` +
      `- किसी भी उत्पाद के पैकेट पर लिखे लेबल और सुरक्षा निर्देश (मास्क, दस्ताने) का पालन करें।\n\n` +
      `### कृषि विशेषज्ञ से कब संपर्क करें\n` +
      `- 📞 **किसान कॉल सेंटर (निःशुल्क हेल्पलाइन): 1800-180-1551** (सुबह 6:00 से रात 10:00 बजे तक, 22 भाषाओं में)।\n` +
      `- या ऊपर **"Agri Dept & Helplines"** बटन दबाकर ${locationLabel} के सत्यापित कृषि विज्ञान केंद्र (KVK) से सीधे बात करें।`
    );
  }

  return (
    `### Problem Identified\n` +
    `The live AI advisor server could not be reached right now, so live weather, mandi rates, and vision diagnostics are temporarily unavailable for your query ("${query}").\n\n` +
    `### Recommended Solution\n` +
    `- Please verify your network connection and click **Regenerate** to fetch live ICAR/AGMARKNET-grounded guidance.\n` +
    `- Do not apply unverified chemical pesticide dosages without confirming the exact crop, growth stage, and product label.\n\n` +
    `### Precautions\n` +
    `- ⚠️ Avoid foliar spraying during high winds (>12 km/h) or before expected rainfall.\n` +
    `- Always wear protective gloves, mask, and full sleeves when handling crop protection inputs.\n\n` +
    `### When to Contact an Agricultural Expert\n` +
    `- 📞 Call the official toll-free **Kisan Call Centre: 1800-180-1551** (6:00 AM – 10:00 PM, 22 Indian languages).\n` +
    `- Open **Agri Dept & Helplines** in the top bar for verified KVK and District Agriculture Officer contacts in ${locationLabel}.`
  );
}
