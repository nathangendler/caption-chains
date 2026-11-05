import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-line px-6 py-3">
      <Link href="/" className="font-semibold">
        Prompt Chains
      </Link>
      <div className="ml-auto flex flex-wrap items-center gap-3 text-sm">
        <ThemeToggle />
        {user && (
          <>
            <span className="text-muted">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn-primary btn-xs">
                Log out
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  );
}
