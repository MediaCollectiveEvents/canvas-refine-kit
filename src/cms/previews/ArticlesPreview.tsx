import type { PreviewEntry } from "./HomepagePreview";
import type { Article } from "@/lib/contentMetadata";
import ArticleContent from "@/components/shared/ArticleContent";
import ArticleAttribution from "@/components/shared/ArticleAttribution";
import { contentImage } from "@/lib/contentImages";
export default function ArticlesPreview({ entry }: { entry: PreviewEntry }) {
  const value = entry.getIn(["data"]);
  const data = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function" ? value.toJS() : value;
  const posts = data && typeof data === "object" && "posts" in data && Array.isArray(data.posts) ? data.posts as Article[] : [];
  return <main className="mx-auto max-w-3xl space-y-12 p-6">{posts.map(post => <article key={post.slug}>
    <p>{post.category} · {post.date}</p><h1 className="font-display text-3xl">{post.title}</h1>
    {contentImage(post.image) && <img src={contentImage(post.image)} alt={post.title} className="my-4 max-h-64 object-contain" />}
    <p className="my-4">{post.excerpt}</p><ArticleAttribution article={post} /><ArticleContent body={post.body} />
  </article>)}</main>;
}
