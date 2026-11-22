"use client";
import { useRef, useState } from "react";
import { Mic, X, Square, Send, Pause, Play, RotateCcw } from "lucide-react";
import { useVoice } from "@/lib/voice/VoiceContext";
import { VOICE_LANGUAGES } from "@/lib/voice/commands";

export function GlobalVoiceController() {
  const v = useVoice();
  const [draft, setDraft] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const hi = v.voiceLanguage === "hi" || v.voiceLanguage === "hi_en";
  const label = (en: string, hindi: string) => (hi ? hindi : en);
  const status: Record<string, string> = {
    idle: label("Ready", "तैयार"),
    listening: label("Listening…", "सुन रहे हैं…"),
    processing: label("Understanding your request…", "आपकी बात समझ रहे हैं…"),
    executing: label("Working…", "काम कर रहे हैं…"),
    speaking: label("Speaking…", "बोल रहे हैं…"),
    paused: label("Paused", "रुका हुआ"),
    error: label("Please try again", "कृपया फिर कोशिश करें"),
  };
  const button =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
  function close() {
    v.stopAll();
    v.setIsHudOpen(false);
    trigger.current?.focus();
  }
  return (
    <aside
      data-voice-private
      className="fixed bottom-24 left-3 sm:left-5 z-[70] max-w-[calc(100vw-1.5rem)]"
    >
      {v.isHudOpen && (
        <section
          aria-label={label("Voice assistant", "वॉइस सहायक")}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          className="mb-3 w-[360px] max-w-full max-h-[70dvh] overflow-y-auto rounded-2xl border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold">
              KisaanBuddy · {label("Voice", "वॉइस")}
            </h2>
            <button
              className={button}
              onClick={close}
              aria-label="Close voice assistant"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {label(
              "Press the microphone to speak. Browser recognition may send audio to its speech service. Audio is not stored by this assistant.",
              "बोलने के लिए माइक दबाएं। ब्राउज़र पहचान के लिए ऑडियो अपनी सेवा को भेज सकता है। यह सहायक ऑडियो सेव नहीं करता।",
            )}
          </p>
          <div className="flex items-center gap-3">
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-semibold text-primary"
            >
              {status[v.phase]}
            </p>
            {v.isListening && (
              <div aria-hidden="true" className="flex gap-1 h-8 items-center">
                {[0.4, 0.7, 1, 0.7, 0.4].map((n, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-primary motion-safe:transition-all"
                    style={{ height: Math.max(3, v.audioVolume * n * 0.3) }}
                  />
                ))}
              </div>
            )}
          </div>
          {v.error && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 text-foreground border border-destructive/40 p-3 text-sm"
            >
              {v.error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">
              {label("Spoken language", "बोलने की भाषा")}
              <select
                className="mt-1 w-full rounded-lg bg-background border border-input p-2"
                value={v.voiceLanguage}
                onChange={(e) => {
                  v.stopAll();
                  v.setVoiceLanguage(e.target.value);
                }}
              >
                {Object.entries(VOICE_LANGUAGES).map(([code, [name]]) => (
                  <option value={code} key={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {label("Mode", "मोड")}
              <select
                className="mt-1 w-full rounded-lg bg-background border border-input p-2"
                value={v.mode}
                onChange={(e) => {
                  v.stopAll();
                  v.setMode(e.target.value as "command" | "translate");
                }}
              >
                <option value="command">
                  {label("Commands / Ask", "कमांड / सवाल")}
                </option>
                <option value="translate">
                  {label("Translate speech", "बात का अनुवाद")}
                </option>
              </select>
            </label>
          </div>
          {v.mode === "translate" && (
            <label className="block text-xs">
              {label("Translate into", "इस भाषा में अनुवाद")}
              <select
                className="mt-1 w-full bg-background border border-input rounded-lg p-2"
                value={v.translationTarget}
                onChange={(e) => v.setTranslationTarget(e.target.value)}
              >
                {Object.entries(VOICE_LANGUAGES)
                  .filter(([code]) => code !== "hi_en")
                  .map(([code, [name]]) => (
                    <option value={code} key={code}>
                      {name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!v.recognitionSupported || v.isProcessing}
              className={`${button} flex-1 bg-primary text-primary-foreground`}
              onClick={() =>
                v.isListening ? v.stopListening() : void v.startListening()
              }
            >
              <Mic size={18} />
              {v.isListening
                ? label("Finish", "पूरा करें")
                : label("Speak", "बोलें")}
            </button>
            <button type="button" className={button} onClick={v.stopAll}>
              <Square size={15} />
              {label("Stop", "बंद")}
            </button>
          </div>
          {!v.recognitionSupported && (
            <p className="text-xs text-muted-foreground">
              {label(
                "Speech recognition is unavailable here. Typed commands remain available.",
                "इस ब्राउज़र में आवाज पहचान उपलब्ध नहीं है। कमांड लिख सकते हैं।",
              )}
            </p>
          )}
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={v.continuousMode}
              onChange={v.toggleContinuousMode}
              disabled={!v.recognitionSupported}
            />
            {label(
              "Hands-free while this tab is visible",
              "टैब खुला रहने तक हैंड्स-फ्री",
            )}
          </label>
          {v.transcriptLive && (
            <div className="rounded-xl bg-muted p-3 text-sm">
              <strong>{label("Recognized: ", "पहचाना: ")}</strong>
              {v.transcriptLive}
            </div>
          )}
          {v.lastReply && (
            <div className="rounded-xl border border-border p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
              {v.lastReply}
            </div>
          )}
          {v.pendingConfirmation && (
            <div className="rounded-xl border border-amber-500/50 p-3 space-y-2">
              <p className="text-sm">{v.pendingConfirmation.prompt}</p>
              <div className="flex gap-2">
                <button
                  className={button}
                  onClick={() => void v.confirmPendingAction()}
                >
                  {label("Confirm", "पुष्टि करें")}
                </button>
                <button className={button} onClick={v.cancelPendingAction}>
                  {label("Cancel", "रद्द करें")}
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              className={button}
              onClick={v.pauseAudio}
              aria-label="Pause speech"
            >
              <Pause size={14} />
            </button>
            <button
              className={button}
              onClick={v.resumeAudio}
              aria-label="Resume speech"
            >
              <Play size={14} />
            </button>
            <button
              className={button}
              onClick={v.replayAudio}
              aria-label="Repeat response"
            >
              <RotateCcw size={14} />
            </button>
            <button
              className={button}
              onClick={() => void v.sendVoiceCommand("read this page")}
            >
              {label("Read page", "पेज सुनें")}
            </button>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) {
                void v.sendVoiceCommand(draft);
                setDraft("");
              }
            }}
          >
            <input
              aria-label="Type a command or question"
              className="min-w-0 flex-1 bg-background border border-input rounded-xl px-3 py-2 text-sm"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={label(
                "Type a command or question",
                "कमांड या सवाल लिखें",
              )}
              maxLength={4000}
            />
            <button
              className={button}
              disabled={v.isProcessing || !draft.trim()}
              aria-label="Send command"
            >
              <Send size={16} />
            </button>
          </form>
          <details className="text-xs space-y-3">
            <summary className="cursor-pointer font-semibold">
              {label("Voice settings & availability", "वॉइस सेटिंग्स और उपलब्धता")}
            </summary>
            <label className="block">
              Voice
              <select
                className="w-full bg-background border border-input p-2 rounded-lg"
                value={v.voiceURI}
                onChange={(e) => v.setVoiceURI(e.target.value)}
              >
                <option value="">Automatic matching device voice</option>
                {v.voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                    {voice.localService ? " · device" : " · network"}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Speed: {v.rate.toFixed(2)}×
              <input
                className="w-full"
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={v.rate}
                onChange={(e) => v.setRate(Number(e.target.value))}
              />
            </label>
            <label className="block">
              Volume: {Math.round(v.volume * 100)}%
              <input
                className="w-full"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={v.volume}
                onChange={(e) => v.setVolume(Number(e.target.value))}
              />
            </label>
            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={v.audioMuted}
                onChange={(e) => {
                  v.stopAudio();
                  v.setAudioMuted(e.target.checked);
                }}
              />
              Mute spoken responses
            </label>
            <label className="flex gap-2">
              <input
                type="checkbox"
                disabled={!v.localSupported}
                checked={v.localOnly}
                onChange={(e) => {
                  v.stopAll();
                  v.setLocalOnly(e.target.checked);
                }}
              />
              On-device recognition only (installed language pack required)
            </label>
            <p className="text-muted-foreground">
              Language availability depends on your browser and device. Bhojpuri
              and Maithili are not advertised as supported: choose Hindi as an
              explicit fallback; accuracy is not guaranteed. Automatic
              speech-language detection is not available through this browser
              integration. No background or wake-word listening. Advisor and
              translation services need internet and server configuration; they
              may incur provider or hosting costs.
            </p>
          </details>
        </section>
      )}
      <button
        ref={trigger}
        type="button"
        aria-expanded={v.isHudOpen}
        aria-label={label("Open voice assistant", "वॉइस सहायक खोलें")}
        onClick={() => (v.isHudOpen ? close() : v.setIsHudOpen(true))}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg border border-primary/30 focus-visible:ring-4 focus-visible:ring-ring ${v.isListening ? "motion-safe:animate-pulse shadow-emerald-500/40" : ""}`}
      >
        <Mic size={24} />
      </button>
    </aside>
  );
}
