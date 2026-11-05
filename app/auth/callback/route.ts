import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function loginError(request: NextRequest, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    const reason =
      request.nextUrl.searchParams.get("error_description") ??
      "Sign-in was cancelled or failed.";
    return loginError(request, reason);
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return loginError(request, error.message);
  }
  // The proxy sends non-admins to /denied from here.
  return NextResponse.redirect(new URL("/", request.url));
}
