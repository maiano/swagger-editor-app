"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { useRouter } from "next/navigation";
import { HeaderActionButton } from "@/widgets/header/HeaderLink";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  };

  return (
    <HeaderActionButton type="button" onClick={logout}>
      Logout
    </HeaderActionButton>
  );
}
