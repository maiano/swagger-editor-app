import Header from "@/widgets/header/Header";
import { MainClientProviders } from "./main-client-providers";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell flex flex-col">
      <Header />
      <MainClientProviders>
        <main className="app-container flex-1 px-4 py-4 lg:px-8">{children}</main>
      </MainClientProviders>
    </div>
  );
}
