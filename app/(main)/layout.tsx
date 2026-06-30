import { getUser } from "@/shared/lib/supabase/utils";
import { loadSavedSchema } from "@/server/schema";
import Header from "@/widgets/header/Header";

import { MainClientProviders } from "./main-client-providers";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const savedSchema = user ? await loadSavedSchema(user.id) : null;

  return (
    <div className="app-shell flex flex-col">
      <Header />
      <MainClientProviders initialSchemaText={savedSchema?.content}>
        <main className="app-container flex-1 px-4 py-4 lg:px-8">{children}</main>
      </MainClientProviders>
    </div>
  );
}
