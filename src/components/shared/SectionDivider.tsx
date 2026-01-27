import { cn } from "@/lib/utils";
interface SectionDividerProps {
  variant?: "single" | "triple";
  className?: string;
  /** Use for post-hero gradient transition */
  gradient?: boolean;
}
const SectionDivider = ({
  variant = "single",
  className,
  gradient = false
}: SectionDividerProps) => {
  if (gradient) {
    return <div className={cn("relative h-24 bg-gradient-to-b from-primary to-background overflow-hidden", className)}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>;
  }
  return <div className={cn("relative py-8", className)}>
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {variant === "single" ? <div className="flex justify-center">
          <div className="w-3 h-3 rounded-full bg-primary/60 ring-4 ring-primary/20" />
        </div> : <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-lime))]" />
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-cyan))]" />
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-red))]" />
        </div>}
    </div>;
};
export default SectionDivider;