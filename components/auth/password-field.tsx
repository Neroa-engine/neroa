"use client";

import type { ChangeEventHandler } from "react";
import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  name: string;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
  required?: boolean;
  helperText?: string;
  helperTone?: "default" | "success" | "error";
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export function PasswordField({
  label,
  name,
  placeholder,
  autoComplete,
  minLength = 6,
  required = true,
  helperText,
  helperTone = "default",
  defaultValue,
  value,
  onChange
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
          aria-controls={inputId}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <input
        id={inputId}
        className="input"
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
      {helperText ? (
        <p
          className={`text-xs leading-6 ${
            helperTone === "error"
              ? "text-rose-700"
              : helperTone === "success"
                ? "text-emerald-700"
                : "text-slate-500"
          }`}
        >
          {helperText}
        </p>
      ) : null}
    </label>
  );
}
