"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button type="button" onClick={signIn} disabled={pending} className="btn-primary">
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </button>
      {error && <p className="text-sm font-semibold">{error}</p>}
    </div>
  );
}
