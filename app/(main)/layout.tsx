import { Locale } from "next-intl";
import { cookies } from "next/headers";

import { loadSavedSchema } from "@/server/schema";
import { getUser } from "@/shared/lib/supabase/utils";
import Header from "@/widgets/header/Header";

import { MainClientProviders } from "./main-client-providers";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const savedSchema = user ? await loadSavedSchema(user.id) : null;

  async function changeLocaleAction(locale: Locale) {
    "use server";
    const store = await cookies();
    store.set("locale", locale);
  }

  return (
    <div className="app-shell flex flex-col">
      <Header changeLocaleAction={changeLocaleAction} />
      <MainClientProviders initialSchemaText={savedSchema?.content} isAuthenticated={Boolean(user)}>
        <main className="app-container flex-1 px-4 py-4 lg:px-8">{children}</main>
      </MainClientProviders>
    </div>
  );
}
