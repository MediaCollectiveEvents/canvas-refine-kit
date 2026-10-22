import type { ReactNode } from "react";
import type { EventItem } from "@/lib/events";

export const paragraphs = (text: string) => text.split(/\n\s*\n/).filter(Boolean);
export function Narrative({ text }: { text: string }) {
  return <div className="space-y-4">{paragraphs(text).map((copy, i) => <p key={i}>{copy}</p>)}</div>;
}
export function Section({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  return <section id={title.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-48 border-t border-white/10 py-8 md:py-10">
    <h2 className="mb-5 font-display text-2xl font-light md:text-3xl">{title}</h2>
    <div className={`${wide ? "" : "max-w-[70ch]"} text-base leading-[1.7] text-foreground/80 md:text-lg`}>{children}</div>
  </section>;
}

export function Audience({ text }: { text: string }) {
  const audience = paragraphs(text);
  return <Section title="Who Attends">
    <p>{audience[0]}</p>
    {audience[1] && <ul className="my-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">{audience[1].split("\n").filter(Boolean).map(label => <li key={label} className="border-l-2 border-primary/40 pl-4">{label}</li>)}</ul>}
    {audience.slice(2).map((copy, i) => <p key={i}>{copy}</p>)}
  </Section>;
}

export function Programme({ title, items }: { title: string; items: NonNullable<EventItem["programme"]> }) {
  if (!items.length) return null;
  return <Section title={title} wide>
    <ol className="divide-y divide-white/10">{items.map((item, i) => {
      const [heading, ...copy] = paragraphs(item.description);
      return <li key={i} className="grid gap-4 py-6 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
        <h3 className="font-display text-base font-medium tracking-wide text-primary">{heading}</h3>
        <div className="max-w-[65ch]">{item.time && <p className="mb-2 text-primary">{item.time}</p>}<Narrative text={copy.join("\n\n")} /></div>
      </li>;
    })}</ol>
  </Section>;
}
