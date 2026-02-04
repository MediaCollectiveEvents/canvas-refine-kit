// src/components/sections/HomeIntroSection.tsx
import React from "react";

interface HomeIntroSectionProps {
  title: string;
  body: string; // HTML string from homepage.json
}

const HomeIntroSection: React.FC<HomeIntroSectionProps> = ({ title, body }) => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6 text-foreground">{title}</h2>
        <div
          className="prose prose-slate mx-auto text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </section>
  );
};

export default HomeIntroSection;
