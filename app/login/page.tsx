import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signIn() {
  "use server";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });

  if (error || !data.url) {
    redirect("/login?error=signin");
  }

  redirect(data.url);
}

async function signOut() {
  "use server";

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/login?error=signout");
  }

  redirect("/login");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-md space-y-6 p-8">
      <h1 className="text-2xl font-bold">MockLab login test</h1>

      {params.error && (
        <p role="alert">
          Authentication failed. Please try again.
        </p>
      )}

      {user ? (
        <>
          <p>Signed in as: {user.email}</p>
          <form action={signOut}>
            <button className="rounded border px-4 py-2">
              Sign out
            </button>
          </form>
        </>
      ) : (
        <form action={signIn}>
          <button className="rounded border px-4 py-2">
            Continue with Google
          </button>
        </form>
      )}
    </main>
  );
}