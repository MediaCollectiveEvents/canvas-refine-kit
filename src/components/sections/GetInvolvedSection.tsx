import SectionWrapper from "../layout/SectionWrapper";
import type { GetInvolvedSection as InvolvedContent } from "@/lib/homepage";

export default function GetInvolvedSection({ section, onRegister }: { section: InvolvedContent; onRegister?: () => void }) {
  return <div id="get-involved" className="scroll-mt-28">
    <SectionWrapper variant="dark" padding="lux" animateOnScroll={false} className="border-b border-white/10 text-[#f7f3eb]">
      <h2 className="site-heading !font-medium">{section.heading}</h2>
      {section.intro && <p className="mt-4 text-base leading-[1.5] text-[#f7f3eb]/75 md:text-lg">{section.intro}</p>}
      <div className="mt-10 grid gap-y-10 md:grid-cols-2 xl:grid-cols-4">
        {section.items.map(item => <div key={item.heading} className="flex min-w-0 flex-col border-t border-[#8FC7C1]/20 pt-6 first:border-t-0 md:border-t-0 md:border-l md:px-4 md:pt-7 md:odd:border-l-0 md:odd:pl-0 md:even:pr-0 xl:px-5 xl:odd:border-l xl:odd:pl-5 xl:even:pr-5 xl:first:border-l-0 xl:first:pl-0 xl:last:pr-0">
          <h3 className="font-display text-2xl font-medium leading-tight md:text-[1.75rem]">{item.heading}</h3>
          <p className="mt-4 mb-8 max-w-[36ch] text-base leading-[1.6] text-[#f7f3eb]/75">{item.body}</p>
          {item.heading === "Guest" && onRegister ? <button type="button" onClick={onRegister} className="font-display mt-auto inline-flex min-h-11 items-center self-start text-base font-medium text-[#35C5BB] no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{item.cta.label}</button> : <a href={item.cta.url} className="font-display mt-auto inline-flex min-h-11 items-center self-start text-base font-medium text-[#35C5BB] no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{item.cta.label}</a>}
        </div>)}
      </div>
    </SectionWrapper>
  </div>;
}
