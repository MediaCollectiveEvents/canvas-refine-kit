import * as React from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: "default" | "darker" | "accent";
  containerClassName?: string;
}

const PageSection: React.FC<PageSectionProps> = ({
  children,
  className,
  containerClassName,
  variant = "default",
  ...props
}) => {
  const variants = {
    default: "site-surface-dark",
    darker: "site-surface-dark",
    accent: "site-surface-emphasis",
  };

  return (
    <section
      {...props}
      className={cn(
        "site-section w-full relative",
        variants[variant],
        className,
      )}
    >
      <div className={cn("site-container", containerClassName)}>
        {children}
      </div>
    </section>
  );
};

export default PageSection;
