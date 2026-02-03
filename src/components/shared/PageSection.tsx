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
  // Soft, subtle variants – no hard block backgrounds
  const variants = {
    default: "bg-gradient-to-b from-background to-background/98", // nearly invisible
    darker: "bg-gradient-to-b from-background/98 to-background/90", // tiny contrast shift
    accent:
      "bg-gradient-to-b from-background via-[hsl(var(--icon-cyan)/0.03)] to-background", // 3% glow only
  };

  return (
    <section
      {...props}
      className={cn(
        "py-24 md:py-32 px-6 w-full relative",
        variants[variant],
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
