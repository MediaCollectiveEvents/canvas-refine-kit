import { ReactNode } from "react";

type Align = "center" | "left" | "right";
type Tone = "default" | "muted";

interface SectionTitleProps {
  children: ReactNode;
  /**
   * Optional subline below the main title (small, uppercase, understated).
   * Use for short context like "A snapshot" or "Curated experiences".
   */
  sub?: string;
  /**
   * Optional eyebrow above the title (even subtler than sub).
   * Use sparingly. If you pass both eyebrow and sub, eyebrow appears above, sub below.
   */
  eyebrow?: string;
  /**
   * Text alignment. Defaults to 'center' which suits hero/section intros.
   */
  align?: Align;
  /**
   * Title tone. 'default' is crisp white; 'muted' is a softer white.
   */
  tone?: Tone;
  /**
   * Disable the italic emphasis on the "second part" when children is a string.
   * Defaults to false (keep the italic accent).
   */
  disableEmphasis?: boolean;
}

export default function SectionTitle({
  children,
  sub,
  eyebrow,
  align = "center",
  tone = "default",
  disableEmphasis = false,
}: SectionTitleProps) {
  const isString = typeof children === "string";
  let first: ReactNode = children;
  let second: string | undefined;

  if (isString) {
    const words = (children as string).trim().split(/\s+/);
    first = words[0] ?? "";
    second = words.slice(1).join(" ");
  }

  const wrapAlign =
    align === "left"
      ? "text-left"
      : align === "right"
        ? "text-right"
        : "text-center";

  const titleColor = tone === "muted" ? "text-white/90" : "text-white";
  const subColor = "text-white/60";
  const eyebrowColor = "text-white/50";

  return (
    <div className={`${wrapAlign} mb-10`}>
      {eyebrow && (
        <p
          className={`${eyebrowColor} font-body text-[11px] sm:text-xs uppercase tracking-[0.22em] mb-2`}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={[
          "font-sans font-light",
          titleColor,
          "text-4xl md:text-5xl lg:text-6xl",
          "tracking-tight leading-tight",
        ].join(" ")}
      >
        {isString ? (
          <>
            {first}{" "}
            {second &&
              (disableEmphasis ? (
                <span>{second}</span>
              ) : (
                <span className="italic text-primary/70">{second}</span>
              ))}
          </>
        ) : (
          children
        )}
      </h2>

      {sub && (
        <p
          className={`${subColor} font-body text-sm uppercase tracking-[0.18em] mt-3`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
