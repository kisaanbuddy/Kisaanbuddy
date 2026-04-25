"use client"
/**
 * Floating assistant FAB — mounted once in the root layout.
 * Clicking toggles the ChatPanel with a spring animation.
 *
 * SSR-safe: the panel is dynamically loaded so SpeechSynthesis /
 * SpeechRecognition / MediaRecorder don't execute server-side.
 */
import { AnimatePresence, motion } from "framer-motion"
import { Bot, X } from "lucide-react"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"

// Dynamically import to keep browser-only APIs out of SSR.
const ChatPanel = dynamic(
  () => import("./ChatPanel").then((m) => m.ChatPanel),
  { ssr: false }
)

export function AssistantWidget() {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])

  // Escape to close.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  return (
    <>
      <AnimatePresence>{open && <ChatPanel onClose={close} />}</AnimatePresence>
      <motion.button
        type="button"
        onClick={toggle}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={open}
        aria-label={open ? "Close KrishiAI assistant" : "Open KrishiAI assistant"}
        className="fixed bottom-6 right-4 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-xl shadow-green-500/30 hover:shadow-2xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Bot className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="pointer-events-none absolute inset-0 rounded-full animate-ping bg-green-400/30" />
        )}
      </motion.button>
    </>
  )
}

export default AssistantWidget
