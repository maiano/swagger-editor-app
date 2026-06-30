import Header from "@/widgets/header/Header";
import { MainClientProviders } from "./main-client-providers";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainClientProviders>
      <main className="app-container flex-1 px-4 py-4 lg:px-8">
        <Header />
        {children}
      </main>
    </MainClientProviders>
  );
}
