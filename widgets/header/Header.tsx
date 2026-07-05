import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { FileBraces } from "lucide-react";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { getUser } from "@/shared/lib/supabase/utils";
import LanguageSwitcher from "@/widgets/language-switcher/LanguageSwitcher";
import { LogoutButton } from "@/widgets/logout-button/LogoutButton";

import { HeaderLink } from "./HeaderLink";

export default async function Header({
  changeLocaleAction,
}: {
  changeLocaleAction: (locale: Locale) => Promise<void>;
}) {
  const user = await getUser();
  const t = await getTranslations("Common");

  return (
    <header className="app-header border-panel-border sticky top-0 z-50 border-b backdrop-blur">
      <div className="app-header-inner app-container flex items-center justify-between gap-4 px-4 lg:px-8">
        <Link href={routes.home} className="flex items-center gap-2 font-semibold tracking-tight">
          <FileBraces className="text-primary size-5" aria-hidden="true" />
          <span>{t("appName")}</span>
        </Link>
        <nav className="flex items-center gap-1">
          <HeaderLink href={routes.home}>{t("editor")}</HeaderLink>
          <HeaderLink href={routes.about}>{t("about")}</HeaderLink>
          {user ? (
            <>
              <HeaderLink href={routes.history}>{t("history")}</HeaderLink>
              <LogoutButton />
            </>
          ) : (
            <>
              <HeaderLink href={routes.signIn}>{t("signIn")}</HeaderLink>
              <HeaderLink href={routes.signUp}>{t("signUp")}</HeaderLink>
            </>
          )}
          <LanguageSwitcher changeLocaleAction={changeLocaleAction} />
        </nav>
      </div>
    </header>
  );
}
