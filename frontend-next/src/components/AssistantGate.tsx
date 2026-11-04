"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

const VoiceAssistantModal = dynamic(
  () => import("@/components/assistant/VoiceAssistantModal").then((m) => m.VoiceAssistantModal),
  { ssr: false }
);

const HIDE_ON = ["/login", "/signup", "/forgot-password", "/reset-password", "/admin"];

/**
 * Mounts the persistent assistant and voice assistant modal on every farmer-facing page.
 */
export function AssistantGate() {
  const pathname = usePathname();

  if (HIDE_ON.some((path) => (pathname || "").startsWith(path))) return null;

  return (
    <>
      <AssistantWidget />
      <VoiceAssistantModal />
    </>
  );
}
