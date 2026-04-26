"use client";

import { usePathname } from "next/navigation";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { useAuth } from "@/lib/auth";

const HIDE_ON = ["/", "/login", "/signup"];

/**
 * Wraps AssistantWidget so it only renders for logged-in users on
 * protected pages. Avoids cluttering the landing/auth screens.
 */
export function AssistantGate() {
  const pathname = usePathname();
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user) return null;
  if (HIDE_ON.includes(pathname || "")) return null;

  return <AssistantWidget />;
}
