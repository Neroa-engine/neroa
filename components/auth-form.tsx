import { authenticate } from "@/app/auth/actions";

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
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Your account password"
            autoComplete="current-password"
            minLength={6}
            required
          />
        </label>
      </div>

      <button className="button-primary w-full" type="submit">
        Sign in to continue
      </button>
    </form>
  );
}
