"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { createClient } from "@/shared/lib/supabase/client";
import { HeaderActionButton } from "@/widgets/header/HeaderLink";

export function LogoutButton() {
  const t = useTranslations("LogoutButton");
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  };

  return (
    <HeaderActionButton type="button" onClick={logout}>
      {t("label")}
    </HeaderActionButton>
  );
}
