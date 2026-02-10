// src/components/events/EventCard.tsx
import React from "react";
import { Link } from "react-router-dom";

export type EventCardProps = {
  id: string; // slug/filename without .json
  title: string;
  date?: string;
  location?: string;
  venue?: string;
  coverImage?: string; // preferred image prop
  imageKey?: string; // optional fallback prop name you’re using in content
  excerpt?: string;
};

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  location,
  venue,
  coverImage,
  imageKey,
  excerpt,
}) => {
  const img = coverImage ?? imageKey;

  return (
    <Link
      to={`/events/${id}`}
      className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
    >
      {img && (
        <img
          src={img}
          alt={title}
          className="mb-4 h-40 w-full object-cover rounded"
        />
      )}

      <h3 className="text-xl font-semibold group-hover:text-slate-900">
        {title}
      </h3>

      <div className="text-slate-600 space-x-2">
        {date && (
          <span className="text-slate-500">
            {new Date(date).toLocaleDateString()}
          </span>
        )}
        {(venue || location) && (
          <>
            <span>•</span>
            <span>{venue ?? location}</span>
          </>
        )}
      </div>

      {excerpt && <p className="mt-2 text-slate-700 line-clamp-3">{excerpt}</p>}
    </Link>
  );
};

export default EventCard;
