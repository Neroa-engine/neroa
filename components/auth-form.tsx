import Link from "next/link";
import { authenticate } from "@/app/auth/actions";
import { PasswordField } from "@/components/auth/password-field";

type AuthFormProps = {
  next?: string;
  initialEmail?: string;
};

export function AuthForm({ next, initialEmail }: AuthFormProps) {
  return (
    <form action={authenticate} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="input"
            type="email"
            name="email"
            defaultValue={initialEmail}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </label>
        <PasswordField
          label="Password"
          name="password"
          placeholder="Your account password"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">Use the account password tied to this email.</span>
        <Link
          href={`/forgot-password${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-cyan-700 transition hover:text-cyan-900"
        >
          Forgot password?
        </Link>
      </div>

      <button className="button-primary w-full" type="submit">
        Sign in to continue
      </button>
    </form>
  );
}
