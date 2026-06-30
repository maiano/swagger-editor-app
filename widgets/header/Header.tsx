import { getUser } from "@/shared/lib/supabase/utils";
import { FileBraces } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "../logout-button/LogoutButton";
import { routes } from "@/shared/config/routes";
import { HeaderLink } from "./HeaderLink";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="app-header border-panel-border sticky top-0 z-50 border-b backdrop-blur">
      <div className="app-header-inner app-container flex items-center justify-between gap-4 px-4 lg:px-8">
        <Link href={routes.home} className="flex items-center gap-2 font-semibold tracking-tight">
          <FileBraces className="text-primary size-5" aria-hidden="true" />
          <span>Swagger/OpenAPI UI</span>
        </Link>
        <nav className="flex items-center gap-1">
          <HeaderLink href={routes.home}>Editor</HeaderLink>
          <HeaderLink href={routes.about}>About</HeaderLink>
          {user ? (
            <>
              <HeaderLink href={routes.history}>History</HeaderLink>
              <LogoutButton />
            </>
          ) : (
            <>
              <HeaderLink href={routes.signIn}>Sign in</HeaderLink>
              <HeaderLink href={routes.signUp}>Sign up</HeaderLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
