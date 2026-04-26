"use client";

/**
 * Lightweight client-side auth — stores user records + active session
 * in localStorage. Signup creates a real record; login verifies email +
 * password against that record. Replace with a real backend (NextAuth,
 * Supabase, Firebase Auth) for production scale.
 */

import { useEffect, useState } from "react";

const SESSION_KEY = "krishi_user";
const USERS_KEY = "krishi_users";
const EVENT_NAME = "krishi-auth-change";

export type AuthUser = {
  email: string;
  name?: string;
  loginAt: number;
};

type RegisteredUser = {
  email: string;
  password: string; // demo-only — real backend would hash this server-side
  name: string;
  createdAt: number;
};

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

function writeSession(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

function readAllUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RegisteredUser[]) : [];
  } catch {
    return [];
  }
}

function writeAllUsers(users: RegisteredUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ---------------------- public API -------------------------------------

export type RegisterResult = { ok: true } | { ok: false; error: string };
export type LoginResult =
  | { ok: true; name?: string }
  | { ok: false; error: string };

export function registerUser(
  email: string,
  password: string,
  name: string
): RegisterResult {
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

  const users = readAllUsers();
  if (users.find((u) => u.email === cleanEmail)) {
    return {
      ok: false,
      error: "An account with this email already exists. Please sign in instead.",
    };
  }
  users.push({
    email: cleanEmail,
    password,
    name: cleanName,
    createdAt: Date.now(),
  });
  writeAllUsers(users);

  // Auto-login the new user.
  writeSession({ email: cleanEmail, name: cleanName, loginAt: Date.now() });
  return { ok: true };
}

export function verifyAndLogin(email: string, password: string): LoginResult {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { ok: false, error: "Please enter both email and password." };
  }

  const users = readAllUsers();
  const user = users.find((u) => u.email === cleanEmail);
  if (!user) {
    return {
      ok: false,
      error: "No account found with this email. Please sign up first.",
    };
  }
  if (user.password !== password) {
    return { ok: false, error: "Incorrect password. Please try again." };
  }

  writeSession({ email: user.email, name: user.name, loginAt: Date.now() });
  return { ok: true, name: user.name };
}

export function logoutUser() {
  writeSession(null);
}

export function getCurrentUser(): AuthUser | null {
  return readSession();
}

/** React hook — returns the current session (or null) and re-renders on change. */
export function useAuth(): { user: AuthUser | null; ready: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setReady(true);

    const handler = () => setUser(readSession());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { user, ready };
}
