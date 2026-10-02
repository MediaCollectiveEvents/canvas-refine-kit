import { articleParagraphs } from "@/lib/contentMetadata";
export default function ArticleContent({ body }: { body?: string }) {
  return <div className="prose prose-invert max-w-none">{articleParagraphs(body).map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}</div>;
}
