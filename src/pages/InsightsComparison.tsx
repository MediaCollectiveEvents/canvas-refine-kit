import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/shared/Seo";
import PageHero from "@/components/shared/PageHero";
import OriginalRenderer from "@/components/sections/OriginalInsightsRenderer";
import RevisedRenderer from "@/components/sections/BlogPageRenderer";
import originalPage from "@/content/originalInsightsPreview.json";
import revisedPage from "@/content/blogPage.json";
import { getArticles } from "@/lib/articles";

export default function InsightsComparison() {
  const [params, setParams] = useSearchParams();
  const revised = params.get("design") === "revised";
  const page = revised ? revisedPage : originalPage;
  const Renderer = revised ? RevisedRenderer : OriginalRenderer;
  const posts = getArticles();
  return <div className="min-h-screen bg-background">
    <Seo title="Insights design comparison — Staging" noindex />
    <Header />
    <main id="main-content" tabIndex={-1} className="site-header-clearance">
      <section aria-label="Design comparison controls" className="border-b border-white/15 bg-[#08111f] py-5">
        <div className="site-container flex flex-wrap items-center justify-between gap-4">
          <div><p className="font-display text-xs uppercase tracking-widest text-[#9bd3c8]">Staging preview only</p><h1 className="mt-1 font-display text-xl text-white">Compare Insights designs</h1><p className="mt-1 text-sm text-slate-300">Same articles, original and revised layouts. Switch to compare at full page width.</p></div>
          <div className="flex flex-wrap items-center gap-3">
            {(["original", "revised"] as const).map(design => <button key={design} type="button" aria-pressed={revised === (design === "revised")} onClick={() => setParams({design}, {replace:true})} className={`min-h-11 rounded border px-4 font-display text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${revised === (design === "revised") ? "border-primary bg-primary text-[#08111f]" : "border-white/30 text-white"}`}>{design === "original" ? "Original design" : "Revised design"}</button>)}
            <Link to="/insights" className="text-sm text-primary hover:underline">Exit comparison</Link>
          </div>
        </div>
      </section>
      <PageHero presentation="business" editorialCoherence eyebrow={page.hero.eyebrow} title={page.hero.title} description={page.hero.description} image={page.hero.image} />
      <Renderer key={revised ? "revised" : "original"} sections={page.sections} posts={posts} />
    </main>
    <Footer hideAttendanceCTA />
  </div>;
}
