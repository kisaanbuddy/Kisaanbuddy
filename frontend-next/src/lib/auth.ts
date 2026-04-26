"use client";

/**
 * Lightweight client-side auth — stores the user's email in localStorage.
 * Suitable for demo / college-project scope. Replace with a real backend
 * (NextAuth, Supabase, Firebase Auth) for production.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "krishi_user";
const EVENT_NAME = "krishi-auth-change";

export type AuthUser = {
  email: string;
  name?: string;
  loginAt: number;
};

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export function loginUser(email: string, name?: string) {
  if (typeof window === "undefined") return;
  const user: AuthUser = {
    email: email.trim().toLowerCase(),
    name: name?.trim() || undefined,
    loginAt: Date.now(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  emitChange();
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  emitChange();
}

export function getCurrentUser(): AuthUser | null {
  return readUser();
}

/** React hook that returns the current user (or null) and re-renders on change. */
export function useAuth(): { user: AuthUser | null; ready: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readUser());
    setReady(true);

    const handler = () => setUser(readUser());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { user, ready };
}
