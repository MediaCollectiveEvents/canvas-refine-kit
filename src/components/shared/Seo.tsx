import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { createSeoHead, type SeoProps } from "@/lib/seoHead";

export default function Seo(props: SeoProps) {
  const { pathname } = useLocation();
  const head = createSeoHead(props, pathname);
  return <Helmet>
    {head.title && <title>{head.title}</title>}
    {head.meta.map((meta, index) => <meta key={index} {...meta} />)}
    {head.canonical && <link rel="canonical" href={head.canonical} />}
    {head.jsonLd && <script type="application/ld+json">{head.jsonLd}</script>}
  </Helmet>;
}
