"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const GlobalVoiceController = dynamic(
  () => import("@/components/voice/GlobalVoiceController").then((m) => m.GlobalVoiceController),
  { ssr: false }
);

const HIDE_ON = ["/login", "/signup", "/forgot-password", "/reset-password", "/admin"];

/**
 * Mounts the persistent global voice controller across all pages.
 */
export function AssistantGate() {
  const pathname = usePathname();

  if (HIDE_ON.some((path) => (pathname || "").startsWith(path))) return null;

  return <GlobalVoiceController />;
}
