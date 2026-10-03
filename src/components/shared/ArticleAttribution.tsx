import { getArticleAttribution } from "@/lib/contributors";
import type { Article } from "@/lib/contentMetadata";
import { getRelatedOrganisations } from "@/lib/organisations";
export default function ArticleAttribution({ article }: { article: Article }) {
  const attribution = getArticleAttribution(article);
  const related = getRelatedOrganisations(article);
  return <div className="space-y-2 text-sm text-muted-foreground">
    {(attribution.author || attribution.organisation) && <p>{attribution.author && `By ${attribution.author}`}{attribution.author && attribution.organisation && " · "}{attribution.organisation}</p>}
    {related.length > 0 && <p>Related organisations: {related.map((organisation, index) => <span key={organisation.id}>{index > 0 && " · "}<a className="underline underline-offset-4" href={`/partners#organisation-${organisation.id}`}>{organisation.name || organisation.alt || organisation.id}</a></span>)}</p>}
  </div>;
}
