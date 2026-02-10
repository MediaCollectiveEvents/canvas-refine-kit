import React from "react";
import { Link } from "react-router-dom";

export type BlogPostCardProps = {
  slug: string;
  title: string;
  date?: string;
  coverImage?: string;
  excerpt?: string;
};

const BlogPostCard: React.FC<BlogPostCardProps> = ({
  slug,
  title,
  date,
  coverImage,
  excerpt,
}) => {
  return (
    <Link
      to={`/blog/${slug}`}
      className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
    >
      {coverImage && (
        <img
          src={coverImage}
          alt={title}
          className="mb-4 h-40 w-full object-cover rounded"
        />
      )}
      <h3 className="text-xl font-semibold group-hover:text-slate-900">
        {title}
      </h3>
      {date && (
        <p className="text-slate-500">{new Date(date).toLocaleDateString()}</p>
      )}
      {excerpt && <p className="mt-2 text-slate-700 line-clamp-3">{excerpt}</p>}
    </Link>
  );
};

export default BlogPostCard;
