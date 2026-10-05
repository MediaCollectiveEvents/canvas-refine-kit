import type { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export function PreviewProviders({ route, children }: { route: string; children: ReactNode }) {
  return <HelmetProvider><MemoryRouter initialEntries={[route]}>
    <div className="min-h-screen text-white" style={{ backgroundColor: "var(--background-dark)" }}>{children}</div>
  </MemoryRouter></HelmetProvider>;
}

export default function PreviewLayout({ route, children, ownMain = false }: { route: string; children: ReactNode; ownMain?: boolean }) {
  return <PreviewProviders route={route}>
    <div className="min-h-screen bg-background">
      <Header />
      {ownMain ? children : <main className="pt-[88px] sm:pt-[96px] lg:pt-[104px]">{children}</main>}
      <Footer />
    </div>
  </PreviewProviders>;
}
