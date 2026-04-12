import { signOut } from "@/app/dashboard/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="button-secondary" type="submit">
        Sign out
      </button>
    </form>
  );
}
