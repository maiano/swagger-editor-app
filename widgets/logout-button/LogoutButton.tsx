"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  };

  return <Button onClick={logout}>Logout</Button>;
}
