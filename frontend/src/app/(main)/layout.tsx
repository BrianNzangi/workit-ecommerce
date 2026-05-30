import { Suspense } from "react";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import ScrollToTop from "@/components/ui/scroll-to-top";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-20" />}>
        <Header />
      </Suspense>
      <main className="grow">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
