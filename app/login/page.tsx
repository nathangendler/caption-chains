import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="panel mx-auto mt-24 flex max-w-sm flex-col gap-3 p-6">
      <h1 className="text-xl font-semibold">Prompt Chains</h1>
      <p className="text-sm">This tool is for administrators only. Sign in with Google to continue.</p>
      {error && (
        <p role="alert" className="text-sm font-semibold">
          {error}
        </p>
      )}
      <GoogleSignInButton />
    </main>
  );
}
