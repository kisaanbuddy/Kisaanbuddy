"use client";

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";

const EVENT_NAME = "kisaanbuddy-auth-change";

export type AuthUser = {
  id: number;
  email: string | null;
  name?: string;
  phone_number: string;
  role: string;
  provider: string;
  profile_image?: string;
  created_at: string;
  last_login_at?: string;
  last_seen_at?: string;
};

export type RegisterResult = { ok: true } | { ok: false; error: string };
export type LoginResult = { ok: true; name?: string; user: AuthUser } | { ok: false; error: string };
export type VerifyOtpResult =
  | { ok: true; registered: true; user: AuthUser }
  | { ok: true; registered: false; registrationToken: string }
  | { ok: false; error: string };

type AuthState = { user: AuthUser | null; ready: boolean };
const AuthContext = createContext<AuthState | undefined>(undefined);

// This is only an in-memory view of a session confirmed by the server. The
// browser never stores an access token, refresh token, OTP, or authoritative
// "logged in" marker in web storage.
let sessionUser: AuthUser | null = null;
let restorePromise: Promise<AuthUser | null> | null = null;
let refreshSessionPromise: Promise<boolean> | null = null;

export async function doRefreshSession(): Promise<boolean> {
  if (refreshSessionPromise) return refreshSessionPromise;
  refreshSessionPromise = (async () => {
    try {
      const res = await sessionRequest("/api/auth/refresh-session", { method: "POST" });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshSessionPromise = null;
    }
  })();
  return refreshSessionPromise;
}

export function getAuthHeaders(): Record<string, string> {
  return { "Content-Type": "application/json" };
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("kb_user") || localStorage.getItem("kb_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null) {
  sessionUser = user;
  if (typeof window !== "undefined") {
    if (!user) {
      try {
        localStorage.removeItem("kb_user");
        sessionStorage.removeItem("kb_user");
      } catch {
        // Storage may be unavailable in private browsing; it is not required.
      }
    } else {
      try {
        localStorage.setItem("kb_user", JSON.stringify(user));
        sessionStorage.setItem("kb_user", JSON.stringify(user));
      } catch {
      }
    }
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

function sessionRequest(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
    credentials: "include",
    cache: "no-store",
  });
}

/** Restores only a server-validated, HttpOnly-cookie session.
 *  Retries on network errors (backend cold start) but not on auth failures. */
export function verifySessionOnLoad(): Promise<AuthUser | null> {
  if (restorePromise) return restorePromise;

  restorePromise = (async () => {
    const MAX_ATTEMPTS = 3;
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        // Exponential back-off: 1 s, then 2 s — gives Render time to wake up.
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
      try {
        let response = await sessionRequest("/api/auth/me", { method: "GET" });

        if (response.status === 401) {
          const refreshed = await doRefreshSession();
          if (refreshed) {
            response = await sessionRequest("/api/auth/me", { method: "GET" });
          }
        }

        if (response.ok) {
          const user = (await response.json()) as AuthUser;
          writeSession(user);
          restorePromise = null;
          return user;
        }

        // Definitive auth failure (401/403) — stop retrying, not a transient error.
        if (response.status === 401 || response.status === 403) break;

        // 5xx or other transient error — retry.
        lastError = new Error(`HTTP ${response.status}`);
      } catch (err) {
        // Network error / fetch abort — backend may still be starting.
        lastError = err;
      }
    }

    // If all attempts failed due to network unreachable (Render waking up), keep cached user
    if (lastError) {
      const cached = getStoredUser();
      if (cached) {
        restorePromise = null;
        return cached;
      }
    }

    // All attempts exhausted or definitive auth failure confirmed by server.
    writeSession(null);
    restorePromise = null;
    return null;
  })();

  return restorePromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const cached = getStoredUser();
    return { user: cached, ready: !!cached };
  });

  useEffect(() => {
    let active = true;
    const restore = () => {
      verifySessionOnLoad().then((user) => {
        if (active) setState({ user, ready: true });
      });
    };
    const onChange = () => {
      if (active) setState({ user: sessionUser || getStoredUser(), ready: true });
    };
    window.addEventListener(EVENT_NAME, onChange);
    restore();

    // Silently re-validate every 14 minutes so the 15-minute access cookie is
    // refreshed before it expires.  This keeps the user logged in indefinitely
    // without any action on their part.
    const REFRESH_MS = 14 * 60 * 1000;
    const interval = setInterval(() => {
      restorePromise = null; // force a fresh network call
      verifySessionOnLoad().then((user) => {
        if (active) setState({ user, ready: true });
      });
    }, REFRESH_MS);

    return () => {
      active = false;
      window.removeEventListener(EVENT_NAME, onChange);
      clearInterval(interval);
    };
  }, []);

  return createElement(AuthContext.Provider, { value: state }, children);
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function getCurrentUser(): AuthUser | null {
  return sessionUser;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const isMultipart = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = { ...(isMultipart ? {} : getAuthHeaders()), ...(options.headers || {}) };
  let response = await fetch(url, { ...options, headers, credentials: "include" });
  if (response.status === 401) {
    const refreshed = await doRefreshSession();
    if (refreshed) {
      response = await fetch(url, { ...options, headers, credentials: "include" });
    }
  }
  return response;
}

export async function registerUser(email: string, password: string, name?: string, phone_number?: string): Promise<RegisterResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) return { ok: false, error: "Email and password are required." };
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) return { ok: false, error: "Please enter a valid email address." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  try {
    const response = await sessionRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password, name: name?.trim() || undefined, phone_number: phone_number?.trim() || undefined }),
    });
    const data = await response.json();
    if (!response.ok) return { ok: false, error: data.detail || "Registration failed. Please try again." };
    return verifyAndLogin(cleanEmail, password);
  } catch {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function verifyAndLogin(email: string, password: string): Promise<LoginResult> {
  if (!email.trim() || !password) return { ok: false, error: "Please enter both email and password." };
  try {
    const response = await sessionRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    const data = await response.json();
    if (!response.ok) return { ok: false, error: data.detail || "Invalid email or password." };
    writeSession(data.user);
    return { ok: true, name: data.user.name, user: data.user };
  } catch {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function googleLogin(credential: string): Promise<LoginResult> {
  try {
    const response = await sessionRequest("/api/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
    const data = await response.json();
    if (!response.ok) return { ok: false, error: data.detail || "Google authentication failed." };
    writeSession(data.user);
    return { ok: true, name: data.user.name, user: data.user };
  } catch {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export function normalizeIndianPhone(input: string): string {
  if (!input) return "";
  let digits = input.trim().replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isValidIndianPhone(phone: string): boolean {
  const clean = normalizeIndianPhone(phone);
  const regex = /^[6-9]\d{9}$/;
  const fakeNumbers = [
    "0000000000",
    "1111111111",
    "2222222222",
    "3333333333",
    "4444444444",
    "5555555555",
    "1234567890",
  ];
  return regex.test(clean) && !fakeNumbers.includes(clean);
}

export async function sendOtp(phone: string): Promise<{ ok: boolean; error?: string; resendAfter?: number }> {
  try {
    const cleanPhone = normalizeIndianPhone(phone);
    const response = await sessionRequest("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ phone_number: cleanPhone }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: data.detail || "Failed to send OTP." };
    return { ok: true, resendAfter: data.resend_after };
  } catch {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResult> {
  try {
    const cleanPhone = normalizeIndianPhone(phone);
    const cleanOtp = otp.trim().replace(/[^0-9]/g, "");
    const response = await sessionRequest("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone_number: cleanPhone, otp: cleanOtp }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: data.detail || "Invalid OTP code." };
    if (data.registered) {
      writeSession(data.user);
      return { ok: true, registered: true, user: data.user };
    }
    return { ok: true, registered: false, registrationToken: data.registration_token };
  } catch {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function completeOtpRegistration(registrationToken: string, name: string): Promise<{ ok: boolean; user?: AuthUser; error?: string }> {
  try {
    const response = await sessionRequest("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ registration_token: registrationToken, name }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: data.detail || "Registration failed." };
    writeSession(data.user);
    return { ok: true, user: data.user };
  } catch {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function logoutUser() {
  try {
    // The server revokes the DB session and expires both HttpOnly cookies.
    await sessionRequest("/api/auth/logout", { method: "POST" });
  } finally {
    writeSession(null);
  }
}
