import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Admin = {
  id: string;
  email: string | null;
  firstName: string | null;
  avatarUrl: string | null;
  isSuperadmin: boolean;
};

// The signed-in user's own profile, or null when nobody is signed in.
export const getCurrentUser = cache(async (): Promise<Admin | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, avatar_url, is_superadmin")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }
  return {
    id: user.id,
    email: data?.email ?? user.email ?? null,
    firstName: data?.first_name ?? null,
    avatarUrl: data?.avatar_url ?? null,
    isSuperadmin: data?.is_superadmin === true,
  };
});

// Every admin page and action calls this; the proxy is only the first line.
export async function requireSuperadmin(): Promise<Admin> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.isSuperadmin) {
    redirect("/denied");
  }
  return user;
}
