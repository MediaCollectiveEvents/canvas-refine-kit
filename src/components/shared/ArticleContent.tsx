import { articleParagraphs } from "@/lib/contentMetadata";
export default function ArticleContent({ body }: { body?: string }) {
  return <div className="prose prose-invert max-w-none">{articleParagraphs(body).map((paragraph, index) => {
    if (paragraph.startsWith("## ") && !paragraph.includes("\n")) return <h2 key={index} className="mt-10 mb-5 font-display text-3xl font-light text-white">{paragraph.slice(3)}</h2>;
    const lines = paragraph.split("\n");
    if (lines.every(line => line.startsWith("- "))) return <ul key={index} className="mb-5 list-disc pl-6 font-body text-lg leading-[1.7]">{lines.map((line, i) => <li key={i}>{line.slice(2)}</li>)}</ul>;
    return <p key={index} className="mb-5 whitespace-pre-line font-body text-lg leading-[1.7] last:mb-0">{paragraph}</p>;
  })}</div>;
}
