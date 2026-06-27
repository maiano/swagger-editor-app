import { createClient } from "@/shared/lib/supabase/server";
import { MainEditorScreen } from "@/widgets/main-editor-screen";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }
  const displayName = user.user_metadata.display_name;
  return (
    <main className="app-shell flex flex-1 px-4 py-6 md:px-6">
      <div className="app-container">
        <Suspense>{`Welcome, ${displayName}`}</Suspense>
        <MainEditorScreen />
      </div>
    </main>
  );
}
