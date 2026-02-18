import React from "react";

interface PartnerItem {
  name: string;
  logo: string;
  url?: string;
  tier?: string;
  description?: string;
}

interface PartnersGridProps {
  items: PartnerItem[];
}

const PartnersGrid: React.FC<PartnersGridProps> = ({ items }) => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((partner) => {
            const CardComponent = partner.url ? "a" : "div";

            return (
              <CardComponent
                key={partner.name}
                {...(partner.url
                  ? {
                      href: partner.url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
                className="group rounded-xl border border-border bg-background/60 backdrop-blur-sm p-6 flex flex-col items-center text-center hover:border-primary/60 hover:bg-background/90 transition-colors"
              >
                {partner.logo && (
                  <div className="w-full mb-4 flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-16 w-auto object-contain"
                    />
                  </div>
                )}

                <h3 className="font-display text-lg mb-1">{partner.name}</h3>

                {partner.tier && (
                  <p className="text-xs uppercase tracking-wide text-primary mb-2">
                    {partner.tier}
                  </p>
                )}

                {partner.description && (
                  <p className="text-sm text-muted-foreground">
                    {partner.description}
                  </p>
                )}
              </CardComponent>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartnersGrid;
``;
