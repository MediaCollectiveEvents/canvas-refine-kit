import SectionWrapper from "../layout/SectionWrapper";
import type { GetInvolvedSection as InvolvedContent } from "@/lib/homepage";

export default function GetInvolvedSection({ section }: { section: InvolvedContent }) {
  return <div id="get-involved" className="scroll-mt-28">
    <SectionWrapper variant="dark" padding="lux" animateOnScroll={false} className="border-b border-white/10 text-[#f7f3eb]">
      <span aria-hidden="true" className="mb-5 block h-0.5 w-12 bg-[#35C5BB]" />
      <h2 className="site-heading !font-medium">{section.heading}</h2>
      <p className="mt-4 text-base leading-[1.5] text-[#f7f3eb]/75 md:text-lg">{section.intro}</p>
      <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
        {section.items.map(item => <div key={item.heading} className="flex min-w-0 flex-col border-t border-[#8FC7C1]/20 pt-6">
          <h3 className="font-display text-2xl font-medium">{item.heading}</h3>
          <p className="mt-3 mb-6 max-w-[40ch] text-base leading-[1.5] text-[#f7f3eb]/75">{item.body}</p>
          <a href={item.cta.url} className="mt-auto self-start text-[#35C5BB] underline underline-offset-4 hover:text-[#a9e5df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{item.cta.label} <span aria-hidden="true">→</span></a>
        </div>)}
      </div>
    </SectionWrapper>
  </div>;
}
