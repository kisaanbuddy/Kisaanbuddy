/**
 * Conversation Sessions & Saved Answers Store.
 *
 * Persists farmer dialogue, bookmarked agricultural advisories, and crop
 * diagnosis history locally with search, export, and deletion capabilities.
 */

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  language: string;
  audioUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
  cropHint?: string;
  symptoms?: string;
  diagnosisData?: {
    diseaseName: string;
    crop: string;
    confidence: number;
    status: string;
    symptoms: string;
    immediateAction?: string;
    culturalControl?: string;
    biologicalControl?: string;
    chemicalControl?: string;
    dosageGuidelines?: string;
    preHarvestIntervalDays?: number;
    safetyInstructions?: string;
    sourceInstitution?: string;
    sourceUrl?: string;
    lastVerifiedDate?: string;
  };
  sources?: {
    name: string;
    url?: string;
    date?: string;
  }[];
  followUps?: string[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  language: string;
}

export interface SavedAnswer {
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  dateSaved: string;
  topic?: string;
}

export interface CropDiagnosisRecord {
  id: string;
  date: string;
  cropName: string;
  diseaseName: string;
  confidence: number;
  imageUrl?: string;
  keyRemedy: string;
  expertContactNumber?: string;
}

const SESSIONS_KEY = "kisaanbuddy_chat_sessions_v2";
const ACTIVE_SESSION_ID_KEY = "kisaanbuddy_active_session_id_v2";
const SAVED_ANSWERS_KEY = "kisaanbuddy_saved_answers_v2";
const DIAGNOSIS_HISTORY_KEY = "kisaanbuddy_diagnosis_history_v2";

export function loadAllSessions(): ConversationSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAllSessions(sessions: ConversationSession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
  } catch {
    // Quota
  }
}

export function getActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
}

export function setActiveSessionId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
}

export function createNewSession(language = "auto"): ConversationSession {
  const newSession: ConversationSession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: "New Farming Consultation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    language
  };
  const sessions = loadAllSessions();
  sessions.unshift(newSession);
  saveAllSessions(sessions);
  setActiveSessionId(newSession.id);
  return newSession;
}

export function updateSession(session: ConversationSession): void {
  const sessions = loadAllSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = { ...session, updatedAt: new Date().toISOString() };
  } else {
    sessions.unshift(session);
  }
  saveAllSessions(sessions);
}

export function deleteSession(sessionId: string): void {
  const sessions = loadAllSessions().filter((s) => s.id !== sessionId);
  saveAllSessions(sessions);
  const activeId = getActiveSessionId();
  if (activeId === sessionId) {
    if (sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
    }
  }
}

export function loadSavedAnswers(): SavedAnswer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_ANSWERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSavedAnswer(answer: Omit<SavedAnswer, "id" | "dateSaved">): boolean {
  if (typeof window === "undefined") return false;
  const current = loadSavedAnswers();
  const exists = current.find((a) => a.question === answer.question && a.answer === answer.answer);
  if (exists) {
    const filtered = current.filter((a) => a.id !== exists.id);
    localStorage.setItem(SAVED_ANSWERS_KEY, JSON.stringify(filtered));
    return false;
  } else {
    const newRecord: SavedAnswer = {
      ...answer,
      id: `ans-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dateSaved: new Date().toISOString()
    };
    current.unshift(newRecord);
    localStorage.setItem(SAVED_ANSWERS_KEY, JSON.stringify(current));
    return true;
  }
}

export function isAnswerSaved(question: string, answer: string): boolean {
  const current = loadSavedAnswers();
  return current.some((a) => a.question === question && a.answer === answer);
}

export function loadDiagnosisHistory(): CropDiagnosisRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DIAGNOSIS_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordCropDiagnosis(record: Omit<CropDiagnosisRecord, "id" | "date">): void {
  if (typeof window === "undefined") return;
  const current = loadDiagnosisHistory();
  const newRecord: CropDiagnosisRecord = {
    ...record,
    id: `diag-${Date.now()}`,
    date: new Date().toISOString()
  };
  current.unshift(newRecord);
  try {
    localStorage.setItem(DIAGNOSIS_HISTORY_KEY, JSON.stringify(current.slice(0, 30)));
  } catch {
    // Quota
  }
}
