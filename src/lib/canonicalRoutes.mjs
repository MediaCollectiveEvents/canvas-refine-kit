export const SITE_ORIGIN = "https://www.mediacollective.events";

const pages = [
  ["/", "home"], ["/events", "events"], ["/community", "community"],
  ["/partners", "partners"], ["/faq", "faq"], ["/privacy-policy", "privacy-policy"],
];

// Build inventory only: this does not register or change React Router routes.
// Match the canonical event resolver's unique positive integer IDs.
export function getCanonicalRoutes(source) {
  const records = Array.isArray(source) ? source : Array.isArray(source?.events) ? source.events : [];
  const validId = id => Number.isSafeInteger(id) && id > 0;
  const counts = new Map();
  for (const row of records) if (validId(row?.id)) counts.set(row.id, (counts.get(row.id) || 0) + 1);
  const ids = records.filter(row => validId(row?.id) && counts.get(row.id) === 1).map(row => row.id).sort((a, b) => a - b);
  return [...pages, ...ids.map(id => [`/events/${id}`, `event-${id}`])].map(([path, name]) => ({
    path, url: `${SITE_ORIGIN}${path}`, file: `seo-pages/${name}.html`,
  }));
}

export const ERROR_SHELL_FILE = "seo-pages/404.html";
