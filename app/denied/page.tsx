import { getCurrentUser } from "@/lib/auth";

export default async function DeniedPage() {
  const user = await getCurrentUser();
  return (
    <main className="mx-auto mt-24 max-w-sm text-center">
      <h1 className="text-xl font-semibold">Not authorized</h1>
      <p className="mt-2 text-sm">
        {user?.email ? `${user.email} is signed in, but` : "This account"} isn&apos;t an
        administrator. Only profiles flagged as superadmin in the database can use this tool.
      </p>
      <form action="/auth/signout" method="post" className="mt-4">
        <button type="submit" className="btn-primary">
          Log out
        </button>
      </form>
    </main>
  );
}
