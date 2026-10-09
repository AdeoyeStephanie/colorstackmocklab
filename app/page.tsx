import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import App from "@/App";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return <App />;
}