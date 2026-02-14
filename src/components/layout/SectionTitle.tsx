import { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  if (typeof children === "string") {
    const words = children.trim().split(/\s+/);
    const [first, ...rest] = words;
    const second = rest.join(" ");

    return (
      <div className="text-center mb-10">
        <h2 className="font-sans font-light text-white text-4xl md:text-5xl tracking-tight leading-tight">
          {first}{" "}
          {second && <span className="italic text-primary">{second}</span>}
        </h2>
      </div>
    );
  }

  return (
    <div className="text-center mb-10">
      <h2 className="font-sans font-light text-white text-4xl md:text-5xl tracking-tight leading-tight">
        {children}
      </h2>
    </div>
  );
}
