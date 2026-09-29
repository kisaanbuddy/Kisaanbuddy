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

export function getAuthHeaders(): Record<string, string> {
  return { "Content-Type": "application/json" };
}

function writeSession(user: AuthUser | null) {
  sessionUser = user;
  if (typeof window !== "undefined") {
    // Remove the legacy UI-only cache left by older releases. It is never read
    // as authentication state by this implementation.
    if (!user) {
      try {
        localStorage.removeItem("kb_user");
      } catch {
        // Storage may be unavailable in private browsing; it is not required.
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

/** Restores only a server-validated, HttpOnly-cookie session. */
export function verifySessionOnLoad(): Promise<AuthUser | null> {
  if (restorePromise) return restorePromise;

  restorePromise = (async () => {
    try {
      let response = await sessionRequest("/api/auth/me", { method: "GET" });
      if (response.status === 401) {
        const refresh = await sessionRequest("/api/auth/refresh-session", { method: "POST" });
        if (refresh.ok) response = await sessionRequest("/api/auth/me", { method: "GET" });
      }
      if (!response.ok) {
        writeSession(null);
        return null;
      }
      const user = (await response.json()) as AuthUser;
      writeSession(user);
      return user;
    } catch {
      // Never use a browser cache as proof of authentication.
      writeSession(null);
      return null;
    } finally {
      restorePromise = null;
    }
  })();
  return restorePromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  useEffect(() => {
    let active = true;
    const restore = () => {
      verifySessionOnLoad().then((user) => {
        if (active) setState({ user, ready: true });
      });
    };
    const onChange = () => {
      if (active) setState({ user: sessionUser, ready: true });
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
    const refresh = await sessionRequest("/api/auth/refresh-session", { method: "POST" });
    if (refresh.ok) response = await fetch(url, { ...options, headers, credentials: "include" });
    else writeSession(null);
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

export async function sendOtp(phone: string): Promise<{ ok: boolean; error?: string; resendAfter?: number }> {
  try {
    const response = await sessionRequest("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ phone_number: phone }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: data.detail || "Failed to send OTP." };
    return { ok: true, resendAfter: data.resend_after };
  } catch {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResult> {
  try {
    const response = await sessionRequest("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone_number: phone, otp }) });
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
