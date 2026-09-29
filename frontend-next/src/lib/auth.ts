"use client";

import { useEffect, useState } from "react";

const EVENT_NAME = "kisaanbuddy-auth-change";
const LS_KEY = "kb_user"; // localStorage key — stores non-sensitive user profile only (no tokens)

let sessionUser: AuthUser | null = null;
// Tracks when a session was last written so we can protect against clearing a
// freshly-set session before the browser has had a chance to send the cookie.
let _sessionWrittenAt = 0;
// Raised to 30 s to cover Render.com cold-start delays (10-15 s) plus the
// time needed for cookie propagation and the /me round-trip.
const SESSION_GRACE_MS = 30000;

export type AuthUser = {
  id: number;
  email: string;
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
export type LoginResult =
  | { ok: true; name?: string; user: AuthUser }
  | { ok: false; error: string };

// ---------------------- localStorage persistence ----------------------
// We persist the non-sensitive user profile in localStorage so the UI can
// display the logged-in state immediately on page reload without waiting for
// the /me round-trip (which can be slow on Render.com cold starts).
// The actual auth tokens stay in HttpOnly cookies — localStorage only holds
// display information and is validated against the server on every load.

function persistUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(LS_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  } catch {
    // localStorage may be blocked in private/incognito mode — ignore silently
  }
}

function loadPersistedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// Authentication is cookie-only. Never persist bearer tokens in web storage.
export function getAuthHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
  };
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const isMultipart = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isMultipart ? {} : getAuthHeaders()),
    ...(options.headers || {}),
  };
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    try {
      const refreshRes = await fetch("/api/auth/refresh-session", {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.status === 200) {
        // Retry original request with cookies
        response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });

        // Sync local session user cache if success
        const meRes = await fetch("/api/auth/me", {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (meRes.status === 200) {
          const user = await meRes.json();
          writeSession(user);
        }
      } else {
        writeSession(null);
      }
    } catch {
      writeSession(null);
    }
  }

  return response;
}

// ---------------------- low-level storage helpers ----------------------

const FOUNDER_ADMIN_EMAILS = [
  "aditya@kisaanbuddy.com",
  "utkarsh@kisaanbuddy.com",
  "yash@kisaanbuddy.com",
  "admin@kisaanbuddy.com",
];

function writeSession(user: AuthUser | null) {
  if (user && user.email && FOUNDER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    user.role = "Admin";
    if (user.email.toLowerCase() === "aditya@kisaanbuddy.com" && !user.profile_image) {
      user.profile_image = "/aditya.png";
    }
  }
  sessionUser = user;
  if (user !== null) {
    // Record the time so we can protect this session during cookie propagation.
    _sessionWrittenAt = Date.now();
  }
  // Persist to localStorage so page reloads don't lose the logged-in state
  persistUser(user);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

function readSession(): AuthUser | null {
  // In-memory cache first; fall back to localStorage on fresh page load
  if (sessionUser !== null) return sessionUser;
  const persisted = loadPersistedUser();
  if (persisted) {
    // Restore into memory (without dispatching an event — caller will handle UI)
    sessionUser = persisted;
  }
  return sessionUser;
}

let initPromise: Promise<AuthUser | null> | null = null;

export function verifySessionOnLoad(): Promise<AuthUser | null> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.status === 200) {
        const user = await res.json();
        writeSession(user);
        return user;
      }

      if (res.status === 401) {
        // Grace-period check: if a session was written very recently (e.g. right
        // after OTP verification), the browser may not have had time to attach the
        // new cookie to this /me request yet.  In that case, trust the in-memory
        // session and skip the writeSession(null) that would trigger a loop back to
        // the login page.
        const withinGrace = Date.now() - _sessionWrittenAt < SESSION_GRACE_MS;
        const currentSession = readSession();
        if (withinGrace && currentSession) {
          return currentSession;
        }

        // Try to refresh the access token using the long-lived refresh cookie
        const refreshRes = await fetch("/api/auth/refresh-session", {
          method: "POST",
          credentials: "include",
        });
        if (refreshRes.status === 200) {
          const retryRes = await fetch("/api/auth/me", {
            headers: getAuthHeaders(),
            credentials: "include",
          });
          if (retryRes.status === 200) {
            const user = await retryRes.json();
            writeSession(user);
            return user;
          }
        }

        // Re-check grace period after the refresh attempt — the refresh
        // round-trip itself can take several seconds on cold-start servers.
        // If we are still within the grace window, preserve the in-memory
        // session rather than wiping it and sending the user back to /login.
        const stillWithinGrace = Date.now() - _sessionWrittenAt < SESSION_GRACE_MS;
        const sessionAfterRefresh = readSession();
        if (stillWithinGrace && sessionAfterRefresh) {
          return sessionAfterRefresh;
        }

        // Refresh token is also invalid — clear everything
        writeSession(null);
        return null;
      }

      if (res.status === 403) {
        writeSession(null);
        return null;
      }

      // For any other status (5xx, network errors handled by catch below),
      // preserve the in-memory/localStorage state so the user isn't kicked out
      // just because the backend is temporarily unreachable.
      return readSession();
    } catch (err) {
      // Network error (Render.com sleeping, no internet, etc.) — keep the user
      // logged in based on the persisted session. The next page load or action
      // will re-verify once the server is back up.
      return readSession();
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}


// ---------------------- public API -------------------------------------

export async function registerUser(
  email: string,
  password: string,
  name?: string,
  phone_number?: string
): Promise<RegisterResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name ? name.trim() : "";
  const cleanPhone = phone_number ? phone_number.trim() : "";
  if (!cleanEmail || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: cleanEmail,
        password,
        name: cleanName || undefined,
        phone_number: cleanPhone || undefined,
      }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.detail || "Registration failed. Please try again." };
    }

    return await verifyAndLogin(cleanEmail, password);
  } catch (error) {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function verifyAndLogin(email: string, password: string): Promise<LoginResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { ok: false, error: "Please enter both email and password." };
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: cleanEmail, password }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.detail || "Invalid email or password." };
    }

    const { user } = data;
    writeSession(user);
    return { ok: true, name: user.name, user };
  } catch (error) {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function googleLogin(credential: string): Promise<LoginResult> {
  try {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ credential }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.detail || "Google authentication failed." };
    }

    const { user } = data;
    writeSession(user);
    return { ok: true, name: user.name, user };
  } catch (error) {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function sendOtp(phone: string): Promise<{ ok: boolean; error?: string; resendAfter?: number }> {
  try {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ phone_number: phone }),
      credentials: "include",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const fallback = response.status === 504 || response.status === 502
        ? "Server is waking up (cold start). Please retry in 10-15 seconds."
        : "Failed to send OTP.";
      return { ok: false, error: data.detail || fallback };
    }
    return { ok: true, resendAfter: data.resend_after };
  } catch (error) {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export type VerifyOtpResult =
  | { ok: true; registered: true; user: AuthUser }
  | { ok: true; registered: false; registrationToken: string }
  | { ok: false; error: string };

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResult> {
  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ phone_number: phone, otp }),
      credentials: "include",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const fallback = response.status === 504 || response.status === 502
        ? "Server is waking up. Please retry in a few seconds."
        : "Invalid OTP code.";
      return { ok: false, error: data.detail || fallback };
    }

    if (data.registered) {
      writeSession(data.user);
      return { ok: true, registered: true, user: data.user };
    } else {
      return { ok: true, registered: false, registrationToken: data.registration_token };
    }
  } catch (error) {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function completeOtpRegistration(
  registrationToken: string,
  name: string
): Promise<{ ok: boolean; user?: AuthUser; error?: string }> {
  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ registration_token: registrationToken, name }),
      credentials: "include",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: data.detail || "Registration failed." };
    }

    writeSession(data.user);
    return { ok: true, user: data.user };
  } catch (error) {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function logoutUser() {
  try {
    await fetchWithAuth("/api/auth/logout", { method: "POST" });
  } catch (error) {
    // Local state still clears if the network request cannot complete.
  } finally {
    writeSession(null);
  }
}

export function getCurrentUser(): AuthUser | null {
  return readSession();
}

/** React hook — returns the current session (or null) and re-renders on change. */
export function useAuth(): { user: AuthUser | null; ready: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Immediately restore from localStorage/in-memory cache so the UI shows
    // the logged-in state right away without any loading flicker.
    const cached = readSession();
    setUser(cached);
    if (cached !== null) {
      setReady(true);
    }

    // Quietly verify the session against the server in the background.
    // If verification succeeds, update the user with fresh data from the server.
    // If verification fails (token expired etc.), clear state and redirect to login.
    verifySessionOnLoad().then((verifiedUser) => {
      setUser(verifiedUser);
      setReady(true);
    });

    const handleAuthChange = () => {
      const current = readSession();
      setUser(current);
      // An auth-change event means a definitive write happened; mark ready.
      setReady(true);
    };
    window.addEventListener(EVENT_NAME, handleAuthChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleAuthChange);
    };
  }, []);

  return { user, ready };
}
