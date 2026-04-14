"use client";

import { useEffect, useRef, useState } from "react";

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

type GuidedVoiceConfirmFieldProps = {
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  confirmLabel?: string;
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

function appendTranscript(existingValue: string, transcript: string) {
  const trimmedExisting = existingValue.trim();
  const trimmedTranscript = transcript.trim();

  if (!trimmedExisting) {
    return trimmedTranscript;
  }

  if (!trimmedTranscript) {
    return trimmedExisting;
  }

  return `${trimmedExisting} ${trimmedTranscript}`.replace(/\s+/g, " ").trim();
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

function StopIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <rect x="5.5" y="5.5" width="9" height="9" rx="1.8" />
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

export default function GuidedVoiceConfirmField({
  name,
  label,
  value,
  onChange,
  onConfirm,
  placeholder,
  helperText,
  multiline = false,
  rows = 4,
  required = false,
  disabled = false,
  confirmLabel = "Confirm input"
}: GuidedVoiceConfirmFieldProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    helperText ?? "Type your answer, speak it, or combine both before confirming."
  );
  const [isListening, setIsListening] = useState(false);
  const [hasError, setHasError] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const keepListeningRef = useRef(false);
  const confirmAfterStopRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const latestValueRef = useRef(value);
  const appendBaseRef = useRef("");
  const onChangeRef = useRef(onChange);
  const onConfirmRef = useRef(onConfirm);
  const helperTextRef = useRef(
    helperText ?? "Type your answer, speak it, or combine both before confirming."
  );

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
    onConfirmRef.current = onConfirm;
    helperTextRef.current =
      helperText ?? "Type your answer, speak it, or combine both before confirming.";
  }, [helperText, onChange, onConfirm]);

  useEffect(() => {
    if (!isListening && !hasError) {
      setStatusMessage(helperTextRef.current);
    }
  }, [hasError, helperText, isListening]);

  useEffect(() => {
    const Recognition = getRecognitionCtor();

    if (!Recognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setHasError(false);
      setIsListening(true);
      setStatusMessage("Listening. Keep speaking until you tap stop or confirm.");
    };

    recognition.onresult = (event) => {
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
      onChangeRef.current(
        appendTranscript(appendBaseRef.current, `${finalTranscript} ${interimTranscript}`)
      );
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") {
        return;
      }

      keepListeningRef.current = false;
      confirmAfterStopRef.current = false;
      setIsListening(false);
      setHasError(true);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setStatusMessage("Microphone access was denied.");
        return;
      }

      setStatusMessage("Voice input ran into an issue. You can keep typing or try the mic again.");
    };

    recognition.onend = () => {
      if (keepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          keepListeningRef.current = false;
        }
      }

      setIsListening(false);
      const nextValue = latestValueRef.current.trim();

      if (confirmAfterStopRef.current) {
        confirmAfterStopRef.current = false;
        onConfirmRef.current?.(nextValue);
        setStatusMessage(nextValue ? "Input confirmed." : "Enter a value before confirming.");
        setHasError(required && !nextValue);
        return;
      }

      setHasError(false);
      setStatusMessage(
        nextValue
          ? "Voice captured. You can edit the text, keep speaking, or confirm it."
          : helperTextRef.current
      );
    };

    recognitionRef.current = recognition;

    return () => {
      keepListeningRef.current = false;
      confirmAfterStopRef.current = false;

      if (!recognitionRef.current) {
        return;
      }

      recognitionRef.current.onstart = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;

      try {
        recognitionRef.current.stop();
      } catch {
        recognitionRef.current.abort?.();
      }
    };
  }, [required]);

  function startListening() {
    if (!recognitionRef.current || disabled) {
      return;
    }

    keepListeningRef.current = true;
    confirmAfterStopRef.current = false;
    finalTranscriptRef.current = "";
    appendBaseRef.current = latestValueRef.current;

    try {
      recognitionRef.current.start();
    } catch {
      setHasError(true);
      setStatusMessage("Microphone is already active. Finish that session or try again.");
    }
  }

  function stopListening() {
    keepListeningRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch {
      setIsListening(false);
    }
  }

  function handleMicClick() {
    if (!isSupported || disabled) {
      setHasError(true);
      setStatusMessage("Voice input is unavailable in this browser.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  }

  function handleConfirm() {
    const trimmedValue = latestValueRef.current.trim();

    if (isListening) {
      confirmAfterStopRef.current = true;
      keepListeningRef.current = false;

      try {
        recognitionRef.current?.stop();
      } catch {
        confirmAfterStopRef.current = false;
        onConfirmRef.current?.(trimmedValue);
      }
      return;
    }

    if (!trimmedValue) {
      setHasError(required);
      setStatusMessage("Enter a value before confirming.");
      return;
    }

    setHasError(false);
    setStatusMessage("Input confirmed.");
    onConfirmRef.current?.(trimmedValue);
  }

  const sharedFieldClasses =
    "w-full rounded-[20px] border bg-white px-4 text-sm leading-7 text-slate-900 outline-none transition focus:border-cyan-300";

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            title={isListening ? "Stop voice input" : "Start voice input"}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
              isListening
                ? "border-cyan-300/45 bg-cyan-50 text-cyan-700 shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                : "border-slate-200/80 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
            } disabled:cursor-not-allowed disabled:opacity-45`}
          >
            {isListening ? <StopIcon /> : <MicIcon />}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={disabled || (required && !value.trim())}
            aria-label={confirmLabel}
            title={confirmLabel}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/35 bg-[linear-gradient(135deg,#0ea5e9,#6366f1)] text-white shadow-[0_18px_30px_-18px_rgba(99,102,241,0.65)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <CheckIcon />
          </button>
        </div>
      </div>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => {
            setHasError(false);
            onChangeRef.current(event.target.value);
          }}
          rows={rows}
          className={`${sharedFieldClasses} min-h-[140px] py-4`}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          name={name}
          type="text"
          value={value}
          onChange={(event) => {
            setHasError(false);
            onChangeRef.current(event.target.value);
          }}
          className={`${sharedFieldClasses} h-12`}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      <p className={`text-sm leading-6 ${hasError ? "text-rose-700" : "text-slate-500"}`}>
        {statusMessage}
      </p>
    </div>
  );
}
