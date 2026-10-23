"use client";

import { usePathname } from "next/navigation";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

const HIDE_ON = ["/login", "/signup", "/forgot-password", "/reset-password", "/admin"];

/**
 * Mounts the persistent assistant on every farmer-facing page. Public
 * questions and navigation remain available before sign-in; profile and
 * publishing routes still enforce their existing page and server auth.
 */
export function AssistantGate() {
  const pathname = usePathname();

  if (HIDE_ON.some((path) => (pathname || "").startsWith(path))) return null;

  return <AssistantWidget />;
}
