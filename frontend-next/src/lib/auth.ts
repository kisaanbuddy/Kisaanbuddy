"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "krishi_user";
const TOKEN_KEY = "krishi_token";
const EVENT_NAME = "krishi-auth-change";

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

// Helper to get authorization headers
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  return fetch(url, { ...options, headers });
}

// ---------------------- low-level storage helpers ----------------------

function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null, token: string | null) {
  if (typeof window === "undefined") return;
  if (user && token) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

// ---------------------- public API -------------------------------------

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<RegisterResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  if (!cleanEmail || !password || !cleanName) {
    return { ok: false, error: "All fields are required." };
  }
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password, name: cleanName }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.detail || "Registration failed. Please try again." };
    }

    // Auto-login the new user after successful registration
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.detail || "Invalid email or password." };
    }

    const { token, user } = data;
    writeSession(user, token);
    return { ok: true, name: user.name, user };
  } catch (error) {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function googleLogin(credential: string): Promise<LoginResult> {
  try {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.detail || "Google authentication failed." };
    }

    const { token, user } = data;
    writeSession(user, token);
    return { ok: true, name: user.name, user };
  } catch (error) {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export async function logoutUser() {
  try {
    await fetchWithAuth("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout request failed", error);
  } finally {
    writeSession(null, null);
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
    let active = true;

    // Check if session exists in localStorage first for immediate UI paint
    const localUser = readSession();
    if (localUser) {
      setUser(localUser);
    }

    // Verify session integrity with the backend
    async function verifySession() {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
      if (!token) {
        if (active) {
          setUser(null);
          setReady(true);
        }
        return;
      }

      try {
        const response = await fetchWithAuth("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          if (active) {
            setUser(userData);
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
          }
        } else {
          // Session expired or invalid on backend
          if (active) {
            setUser(null);
            writeSession(null, null);
          }
        }
      } catch (error) {
        // network failure, we can keep the local session but flag it or proceed
        console.warn("Backend auth verification failed, using local session state.", error);
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    verifySession();

    const handler = () => {
      if (active) {
        setUser(readSession());
      }
    };
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);

    return () => {
      active = false;
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { user, ready };
}
