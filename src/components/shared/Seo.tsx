import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import homepageContent from "@/content/homepage.json";
import { organisationData, serializeStructuredData, SITE_ORIGIN } from "@/lib/structuredData";

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

const Seo = ({
  title,
  description,
  keywords,
  ogImage = homepageContent.seo.ogImage,
  url,
  type = "website",
  noindex = false,
  structuredData,
}: SeoProps) => {
  const { pathname } = useLocation();
  const origin = SITE_ORIGIN;
  const canonical = new URL(url ?? pathname, origin).href;
  const socialImage = ogImage ? new URL(ogImage, origin).href : undefined;
  return (
    <Helmet>
      {/* Basic SEO */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, follow" />}
      {!noindex && <script type="application/ld+json">{serializeStructuredData({
        "@context": "https://schema.org",
        "@graph": [organisationData(), ...(structuredData ? [structuredData] : [])],
      })}</script>}

      {/* OpenGraph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={socialImage} />
      <meta property="og:type" content={type} />
      {!noindex && <meta property="og:url" content={canonical} />}
      {!noindex && <link rel="canonical" href={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && (
        <meta name="twitter:description" content={description} />
      )}
      <meta name="twitter:image" content={socialImage} />
    </Helmet>
  );
};

export default Seo;
