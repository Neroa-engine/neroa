"use client";

import { useEffect, useRef, useState } from "react";

export type VoiceInputState = "idle" | "listening" | "processing" | "transcript_ready" | "error";

type VoiceInputButtonProps = {
  onTranscript: (transcript: string) => void;
  onStatusChange: (state: VoiceInputState, message: string) => void;
  stopSignal?: number;
  disabled?: boolean;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

function getRecognitionCtor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function MicIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M10 12.25A2.75 2.75 0 0 0 12.75 9.5V5.75A2.75 2.75 0 1 0 7.25 5.75V9.5A2.75 2.75 0 0 0 10 12.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.75 9.75A4.25 4.25 0 0 0 14.25 9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 12.75V16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.5 16.25H12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M5 10.25L8.25 13.5L15 6.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function VoiceInputButton({
  onTranscript,
  onStatusChange,
  stopSignal = 0,
  disabled = false
}: VoiceInputButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [displayState, setDisplayState] = useState<VoiceInputState>("idle");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mountedRef = useRef(false);
  const shouldKeepListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  const onStatusChangeRef = useRef(onStatusChange);
  const readyResetTimeoutRef = useRef<number | null>(null);
  const lastStopSignalRef = useRef(stopSignal);
  const completionMessageRef = useRef("Transcript ready. Press Send when ready.");

  function clearReadyResetTimeout() {
    if (readyResetTimeoutRef.current !== null) {
      window.clearTimeout(readyResetTimeoutRef.current);
      readyResetTimeoutRef.current = null;
    }
  }

  function setStatus(state: VoiceInputState, message: string) {
    setDisplayState(state);
    onStatusChangeRef.current(state, message);
  }

  function resetToIdleSoon() {
    clearReadyResetTimeout();
    readyResetTimeoutRef.current = window.setTimeout(() => {
      if (!mountedRef.current || shouldKeepListeningRef.current) {
        return;
      }

      setStatus("idle", "Tap the mic and speak naturally. Press Send when ready.");
    }, 1500);
  }

  function startListening() {
    const recognition = recognitionRef.current;

    if (!recognition || disabled) {
      return;
    }

    finalTranscriptRef.current = "";
    shouldKeepListeningRef.current = true;
    clearReadyResetTimeout();

    try {
      recognition.start();
    } catch {
      setStatus("error", "Microphone is already active. Try again.");
      resetToIdleSoon();
    }
  }

  function finalizeTranscriptStatus(message: string) {
    const transcript = finalTranscriptRef.current.trim();

    if (transcript) {
      setStatus("transcript_ready", message);
      return;
    }

    setStatus("error", "Couldn't hear that, try again.");
  }

  function stopListening(message = "Voice stopped. Press Enter again to send.") {
    shouldKeepListeningRef.current = false;
    completionMessageRef.current = message;
    setStatus("processing", "Finalizing voice input...");

    try {
      recognitionRef.current?.stop();
    } catch {
      finalizeTranscriptStatus(message);
      resetToIdleSoon();
    }
  }

  function handleClick() {
    if (!isSupported || disabled) {
      setStatus("error", "Voice input is unavailable in this browser.");
      resetToIdleSoon();
      return;
    }

    if (shouldKeepListeningRef.current) {
      stopListening();
      return;
    }

    startListening();
  }

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange, onTranscript]);

  useEffect(() => {
    if (stopSignal === lastStopSignalRef.current) {
      return;
    }

    lastStopSignalRef.current = stopSignal;

    if (shouldKeepListeningRef.current) {
      stopListening();
    }
  }, [stopSignal]);

  useEffect(() => {
    mountedRef.current = true;

    const Recognition = getRecognitionCtor();

    if (!Recognition) {
      setIsSupported(false);
      setStatus("error", "Voice input is unavailable in this browser.");

      return () => {
        mountedRef.current = false;
      };
    }

    setIsSupported(true);
    setStatus("idle", "Tap the mic and speak naturally. Press Send when ready.");

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!mountedRef.current) {
        return;
      }

      setStatus("listening", "Listening...");
    };

    recognition.onresult = (event) => {
      if (!mountedRef.current) {
        return;
      }

      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index]?.[0]?.transcript ?? "";

        if (event.results[index]?.isFinal) {
          finalTranscript += `${text} `;
        } else {
          interimTranscript += text;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      const combined = `${finalTranscript}${interimTranscript}`.replace(/\s+/g, " ").trim();
      onTranscriptRef.current(combined);
    };

    recognition.onerror = (event) => {
      if (!mountedRef.current) {
        return;
      }

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldKeepListeningRef.current = false;
        setStatus("error", "Microphone access was denied.");
        resetToIdleSoon();
        return;
      }

      if (event.error === "aborted") {
        return;
      }

      shouldKeepListeningRef.current = false;
      setStatus("error", "Couldn't hear that, try again.");
      resetToIdleSoon();
    };

    recognition.onend = () => {
      if (!mountedRef.current) {
        return;
      }

      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          shouldKeepListeningRef.current = false;
          setStatus("error", "Recognition restart failed.");
          resetToIdleSoon();
          return;
        }
      }

      const transcript = finalTranscriptRef.current.trim();

      if (transcript) {
        finalizeTranscriptStatus(completionMessageRef.current);
      } else {
        setStatus("idle", "Tap the mic and speak naturally. Press Send when ready.");
      }

      completionMessageRef.current = "Transcript ready. Press Send when ready.";
      resetToIdleSoon();
    };

    recognitionRef.current = recognition;

    return () => {
      mountedRef.current = false;
      shouldKeepListeningRef.current = false;
      clearReadyResetTimeout();

      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;

        try {
          recognitionRef.current.stop();
        } catch {
          recognitionRef.current.abort?.();
        }
      }
    };
  }, []);

  const visualState = !isSupported
    ? "unsupported"
    : displayState === "listening"
      ? "listening"
      : displayState === "processing"
        ? "processing"
        : displayState === "transcript_ready"
          ? "ready"
          : displayState === "error"
            ? "error"
            : "idle";

  const className =
    visualState === "listening"
      ? "border-cyan-400/35 bg-cyan-400/12 text-cyan-100 shadow-[0_0_0_4px_rgba(56,189,248,0.08)]"
      : visualState === "processing"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
        : visualState === "ready"
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
          : visualState === "error"
            ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
            : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={isSupported ? "Use voice input" : "Voice input is not supported in this browser"}
      aria-label="Use voice input"
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${className} disabled:cursor-not-allowed disabled:opacity-45`}
    >
      {visualState === "ready" ? <CheckIcon /> : <MicIcon />}
    </button>
  );
}
