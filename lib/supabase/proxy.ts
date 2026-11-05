import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

// Everything except these needs a signed-in superadmin.
const PUBLIC_PATHS = ["/login", "/denied", "/auth/callback", "/auth/signout"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // Validates the token with Supabase and refreshes it when it has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  let redirectPath: string | null = null;
  if (!user && !isPublic) {
    redirectPath = "/login";
  } else if (user) {
    // RLS lets a user read only their own profile, so this is their own flag.
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .maybeSingle();
    const isSuperadmin = profile?.is_superadmin === true;
    if (!isSuperadmin && !isPublic) {
      redirectPath = "/denied";
    } else if (isSuperadmin && (pathname === "/login" || pathname === "/denied")) {
      redirectPath = "/";
    }
  }

  if (redirectPath === null) {
    return response;
  }
  const url = request.nextUrl.clone();
  url.pathname = redirectPath;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  // Carry over any refreshed session cookies so the session is not dropped.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
