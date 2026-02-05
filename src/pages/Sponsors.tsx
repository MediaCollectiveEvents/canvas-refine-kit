// src/pages/Sponsors.tsx

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Sponsors() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Sponsors
          </h1>
          <p className="text-muted-foreground text-lg">
            This page is currently being prepared. Sponsor content will be
            managed via CMS.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
