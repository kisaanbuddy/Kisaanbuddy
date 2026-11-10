"use client";

/**
 * World-Class Press-and-Hold / Toggle Mic Button
 * Features physical spring tactile feedback and glowing audio energy wave rings.
 */
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

export function MicButton({
  listening,
  disabled,
  onToggle,
}: {
  listening: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Start voice input"}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-200 cursor-pointer will-change-transform ${
        listening
          ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400"
          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/20"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {listening ? (
        <MicOff className="h-4.5 w-4.5 relative z-10" />
      ) : (
        <Mic className="h-4.5 w-4.5 relative z-10" />
      )}

      {listening && !prefersReduced && (
        <>
          <motion.span
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-xl bg-rose-500/40 pointer-events-none"
          />
          <motion.span
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.35,
            }}
            className="absolute inset-0 rounded-xl bg-rose-500/25 pointer-events-none"
          />
        </>
      )}
    </motion.button>
  );
}
