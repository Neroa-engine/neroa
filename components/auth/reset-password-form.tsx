"use client";

import { useState } from "react";
import { updatePasswordFromRecovery } from "@/app/signup/actions";
import { PasswordField } from "@/components/auth/password-field";

export function ResetPasswordForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordMatchState =
    confirmPassword.length === 0 ? "neutral" : password === confirmPassword ? "match" : "mismatch";
  const passwordMismatch = passwordMatchState === "mismatch";

  return (
    <form action={updatePasswordFromRecovery} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <PasswordField
        label="New password"
        name="password"
        placeholder="Create a new password"
        autoComplete="new-password"
        helperText="Use at least 6 characters."
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <div
        className={`rounded-[20px] p-3 ${
          passwordMatchState === "mismatch"
            ? "border border-rose-200/80 bg-rose-50/50"
            : passwordMatchState === "match"
              ? "border border-emerald-200/80 bg-emerald-50/50"
              : ""
        }`}
      >
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          helperText={
            passwordMatchState === "mismatch"
              ? "Passwords do not match yet."
              : passwordMatchState === "match"
                ? "Passwords match. You are ready to update the password."
                : "Confirm the same password before updating."
          }
          helperTone={
            passwordMatchState === "mismatch"
              ? "error"
              : passwordMatchState === "match"
                ? "success"
                : "default"
          }
        />
      </div>
      <button className="button-primary w-full" type="submit" disabled={passwordMismatch}>
        Update password
      </button>
    </form>
  );
}
