"use client";

import { ClipboardEvent, KeyboardEvent, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/language";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  disabled?: boolean;
};

const OTP_LENGTH = 6;

export function OtpInput({ value, onChange, onComplete, disabled = false }: OtpInputProps) {
  const { t } = useLanguage();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || "");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const setDigits = (next: string[]) => {
    const newValue = next.join("").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(newValue);
    // Auto-submit when all 6 digits are filled
    if (newValue.length === OTP_LENGTH && onComplete) {
      // Small delay so React can flush the state update before form submission
      setTimeout(() => onComplete(), 50);
    }
  };
  
  const fillFrom = (index: number, rawValue: string) => {
    const incoming = rawValue.replace(/\D/g, "").slice(0, OTP_LENGTH - index).split("");
    if (!incoming.length) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    const next = [...digits];
    incoming.forEach((digit, offset) => { next[index + offset] = digit; });
    setDigits(next);
    inputs.current[Math.min(index + incoming.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key !== "Backspace" || digits[index] || index === 0) return;
    event.preventDefault();
    const next = [...digits];
    next[index - 1] = "";
    setDigits(next);
    inputs.current[index - 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    // Auto-submit on paste if all 6 digits received
    if (pasted.length === OTP_LENGTH && onComplete) {
      setTimeout(() => onComplete(), 50);
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-2.5" role="group" aria-label={t("ui.auth.otp_group") }>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { inputs.current[index] = element; }}
          aria-label={`${t("ui.auth.otp_digit")} ${index + 1}`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          className={`h-12 sm:h-13 min-w-0 flex-1 rounded-lg border text-center font-mono text-xl font-bold transition-all outline-none ${
            digit 
              ? "border-primary/60 bg-primary/5 text-foreground" 
              : "border-border bg-background text-foreground hover:border-border/80"
          } focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={disabled}
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          onChange={(event) => fillFrom(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={handlePaste}
          pattern="[0-9]*"
          type="text"
          value={digit}
        />
      ))}
    </div>
  );
}
