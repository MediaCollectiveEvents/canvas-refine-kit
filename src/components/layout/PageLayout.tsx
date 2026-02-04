// src/components/layout/PageLayout.tsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* GLOBAL TOP PADDING BELOW FIXED HEADER */}
      <main className="pt-32">{children}</main>

      <Footer />
    </div>
  );
}
