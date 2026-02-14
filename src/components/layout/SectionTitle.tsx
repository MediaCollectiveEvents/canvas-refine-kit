interface SectionTitleProps {
  children: string;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  const words = children.split(" ");
  const first = words[0];
  const second = words.slice(1).join(" "); // supports multi‑word second half

  return (
    <div className="text-center mb-10">
      <h2 className="font-sans font-light text-white text-4xl md:text-5xl tracking-tight">
        {first}{" "}
        {second && <span className="italic text-primary">{second}</span>}
      </h2>
    </div>
  );
}
