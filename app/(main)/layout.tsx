import HeaderContent from "@/widgets/header-content/HeaderContent";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header
        className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur"
        data-scroll-behavior="smooth"
      >
        <HeaderContent />
      </header>
      {children}
    </>
  );
}
