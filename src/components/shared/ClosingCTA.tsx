import type { ReactNode } from "react";

export default function ClosingCTA({ id, eyebrow, heading, support, action, headingClassName = "" }: {
  id?: string;
  eyebrow?: string;
  heading: ReactNode;
  headingClassName?: string;
  support?: ReactNode;
  action?: ReactNode;
}) {
  return <section id={id} className="site-section border-b border-white/10 bg-[#172b31]">
    <div className="site-container grid items-start gap-8 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-8">
        {eyebrow && <p className="site-eyebrow mb-3 text-[#9bd3c8]">{eyebrow}</p>}
        <h2 className={`font-display text-[30px] font-light leading-tight text-white md:text-4xl ${headingClassName}`}>{heading}</h2>
        {support && <div className="mt-5 max-w-2xl space-y-4 font-body text-base leading-[1.6] text-slate-300">{support}</div>}
      </div>
      {action && <div className="min-w-0 lg:col-span-4 lg:justify-self-end [&>*]:max-w-full [&>*]:whitespace-normal [&>*]:h-auto [&>*]:min-h-11 [&>*]:py-2">{action}</div>}
    </div>
  </section>;
}
