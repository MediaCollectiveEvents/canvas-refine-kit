import { articleParagraphs } from "@/lib/contentMetadata";
export default function ArticleContent({ body }: { body?: string }) {
  return <div className="prose prose-invert max-w-none">{articleParagraphs(body).map((paragraph, index) => <p key={index} className="mb-5 whitespace-pre-line font-body text-lg leading-[1.7] last:mb-0">{paragraph}</p>)}</div>;
}
