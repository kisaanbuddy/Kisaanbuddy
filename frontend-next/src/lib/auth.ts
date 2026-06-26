"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "kisaanbuddy_user";
const TOKEN_KEY = "kisaanbuddy_token";
const EVENT_NAME = "kisaanbuddy-auth-change";

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

// Helper to get request headers (no Bearer token)
export function getAuthHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
  };
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
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
    } catch (e) {
      console.error("Silent refresh failed:", e);
    }
  }

  return response;
}

// ---------------------- low-level storage helpers ----------------------

function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    let raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      raw = window.localStorage.getItem("krishi_user");
      if (raw) {
        window.localStorage.setItem(SESSION_KEY, raw);
        window.localStorage.removeItem("krishi_user");
        const token = window.localStorage.getItem("krishi_token");
        if (token) {
          window.localStorage.setItem(TOKEN_KEY, token);
          window.localStorage.removeItem("krishi_token");
        }
      }
    }
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null, token?: string | null) {
  if (typeof window === "undefined") return;

  initPromise = null;

  if (user) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  } else {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
  }

  window.dispatchEvent(new Event(EVENT_NAME));
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
      }

      if (res.status === 401 || res.status === 403) {
        writeSession(null);
        return null;
      }

      console.warn("Transient server error during session verification:", res.status);
      return readSession();
    } catch (err) {
      console.error("Failed to verify session on load:", err);
      return readSession();
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
  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
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

export async function sendOtp(phone: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ phone_number: phone }),
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.detail || "Failed to send OTP." };
    }
    return { ok: true };
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
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.detail || "Invalid OTP code." };
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
    const data = await response.json();
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
    console.error("Logout request failed", error);
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
    const cached = readSession();
    setUser(cached);
    setReady(cached !== null);

    verifySessionOnLoad().then((verifiedUser) => {
      setUser(verifiedUser);
      setReady(true);
    });

    const handleAuthChange = () => {
      setUser(readSession());
    };
    window.addEventListener(EVENT_NAME, handleAuthChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleAuthChange);
    };
  }, []);

  return { user, ready };
}
