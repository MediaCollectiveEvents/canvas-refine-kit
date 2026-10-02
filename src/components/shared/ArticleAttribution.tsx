import type { Article } from "@/lib/contentMetadata";
import { getRelatedOrganisations } from "@/lib/organisations";
export default function ArticleAttribution({ article }: { article: Article }) {
  const related = getRelatedOrganisations(article);
  return <div className="space-y-2 text-sm text-muted-foreground">
    {(article.author || article.organisation) && <p>{article.author && `By ${article.author}`}{article.author && article.organisation && " · "}{article.organisation}</p>}
    {related.length > 0 && <p>Related organisations: {related.map((organisation, index) => <span key={organisation.id}>{index > 0 && " · "}<a className="underline underline-offset-4" href={`/partners#organisation-${organisation.id}`}>{organisation.name || organisation.alt || organisation.id}</a></span>)}</p>}
  </div>;
}
