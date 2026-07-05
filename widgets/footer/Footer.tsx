import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { routes } from "@/shared/config/routes";

export async function Footer() {
  const common = await getTranslations("Common");
  const footer = await getTranslations("Footer");

  return (
    <footer className="border-panel-border border-t">
      <div className="app-container text-muted-foreground flex min-h-12 items-center justify-between gap-4 px-4 py-3 text-xs lg:px-8">
        <span>{common("appName")}</span>
        <Link href={routes.about} className="hover:text-foreground transition-colors">
          {footer("about")}
        </Link>
      </div>
    </footer>
  );
}
