import { authenticate } from "@/app/auth/actions";

export function AuthForm() {
  return (
    <form action={authenticate} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">Email</span>
          <input className="input" type="email" name="email" placeholder="you@company.com" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-white/75">Password</span>
          <input className="input" type="password" name="password" placeholder="At least 6 characters" minLength={6} required />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-white/75">Mode</span>
        <select className="input" name="mode" defaultValue="signin">
          <option value="signin">Sign in to an existing account</option>
          <option value="signup">Create a new account</option>
        </select>
      </label>

      <button className="button-primary w-full" type="submit">
        Continue with email
      </button>
    </form>
  );
}
