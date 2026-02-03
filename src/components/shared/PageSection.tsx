import * as React from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClassName?: string;
}

/**
 * Global default layout wrapper for all non-hero sections.
 * This now becomes the standard section style across the site.
 */
const PageSection: React.FC<PageSectionProps> = ({
  children,
  className,
  containerClassName,
  ...props
}) => {
  return (
    <section
      {...props}
      className={cn(
        "py-24 md:py-32 px-6 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden",
        className,
      )}
    >
      <div className={cn("container mx-auto max-w-6xl", containerClassName)}>
        {children}
      </div>
    </section>
  );
};

export default PageSection;
