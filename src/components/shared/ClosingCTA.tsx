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
    <div className="site-container">
      <div className="min-w-0">
        {eyebrow && <p className="mb-6 font-display text-sm font-normal uppercase tracking-[0.18em] text-[#9bd3c8] sm:text-base lg:text-[28px]">{eyebrow}</p>}
        <h2 className={`font-display text-[32px] font-light leading-[1.12] tracking-[-0.035em] text-white sm:text-5xl lg:text-[64px] xl:text-[72px] ${headingClassName}`}>{heading}</h2>
        {support && <div className="mt-5 max-w-2xl space-y-4 font-body text-base leading-[1.6] text-slate-300">{support}</div>}
      </div>
      {action && <div className="mt-8 min-w-0 md:mt-10 [&>*]:max-w-full [&>*]:whitespace-normal [&>*]:h-auto [&>*]:min-h-11 [&>*]:py-2">{action}</div>}
    </div>
  </section>;
}
