// public/admin/cms.js

// Decap CMS exposes React.createElement as window.h inside the preview iframe.
const h = window.h || (window.React && window.React.createElement);

// Helper: safely convert Immutable.js structures to plain JS
const toJS = (data) =>
  data && typeof data.toJS === "function" ? data.toJS() : data || {};

/* =========================================================================
   HOMEPAGE PREVIEW
   ========================================================================= */

const HomepagePreview = ({ entry }) => {
  if (!h) return null;

  const data = toJS(entry.getIn(["data"]));
  const hero = data.hero || {};
  const sections = data.sections || [];

  const root = {
    fontFamily: "system-ui, sans-serif",
    background: "#020617",
    color: "#e5e7eb",
    minHeight: "100vh",
  };

  const heroStyle = {
    padding: "3rem 1.5rem 2.5rem",
    background: "radial-gradient(circle at top left, #1e293b, #020617)",
    borderBottom: "1px solid #1f2937",
  };

  const inner = {
    maxWidth: "60rem",
    margin: "0 auto",
  };

  const pillWrap = {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  };

  const pill = {
    padding: "0.35rem 0.75rem",
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: "999px",
    fontSize: "0.8rem",
  };

  return h(
    "div",
    { style: root },
    h(
      "section",
      { style: heroStyle },
      h(
        "div",
        { style: inner },
        hero.subtitle &&
          h(
            "p",
            {
              style: {
                color: "#38bdf8",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
              },
            },
            hero.subtitle,
          ),
        h(
          "h1",
          {
            style: {
              fontSize: "2rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            },
          },
          hero.title || "Homepage Hero",
        ),
        hero.description &&
          h(
            "p",
            { style: { fontSize: "1rem", lineHeight: 1.6, color: "#cbd5e1" } },
            hero.description,
          ),
      ),
    ),
    h(
      "section",
      { style: { padding: "2rem 1.5rem" } },
      h(
        "div",
        { style: inner },
        h(
          "h2",
          { style: { fontSize: "1.15rem", fontWeight: 600 } },
          "Sections",
        ),
        h(
          "div",
          { style: pillWrap },
          sections.length === 0
            ? h(
                "span",
                { style: { color: "#64748b" } },
                "No sections added yet.",
              )
            : sections.map((slug, i) =>
                h("span", { key: i, style: pill }, slug),
              ),
        ),
      ),
    ),
  );
};

/* =========================================================================
   ABOUT PAGE PREVIEW
   ========================================================================= */

const AboutPreview = ({ entry }) => {
  if (!h) return null;

  const data = toJS(entry.getIn(["data"]));
  const hero = data.hero || {};
  const sections = data.sections || [];

  const root = {
    fontFamily: "system-ui, sans-serif",
    background: "#020617",
    color: "#e5e7eb",
    minHeight: "100vh",
  };

  const heroStyle = {
    padding: "3rem 1.5rem 2rem",
    borderBottom: "1px solid #1f2937",
  };

  const inner = {
    maxWidth: "56rem",
    margin: "0 auto",
  };

  const badgeList = {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  };

  const badge = {
    fontSize: "0.8rem",
    padding: "0.35rem 0.75rem",
    background: "#0b1120",
    border: "1px solid #1f2937",
    borderRadius: "999px",
  };

  return h(
    "div",
    { style: root },

    // HERO
    h(
      "section",
      { style: heroStyle },
      h(
        "div",
        { style: inner },
        hero.eyebrow &&
          h(
            "p",
            {
              style: {
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#38bdf8",
              },
            },
            hero.eyebrow,
          ),
        h(
          "h1",
          { style: { fontSize: "2rem", fontWeight: 700 } },
          hero.title || "About Title",
        ),
        hero.description &&
          h(
            "p",
            {
              style: {
                fontSize: "1rem",
                lineHeight: 1.6,
                marginTop: "0.5rem",
                color: "#cbd5e1",
              },
            },
            hero.description,
          ),
      ),
    ),

    // SECTIONS LIST
    h(
      "section",
      { style: { padding: "2rem 1.5rem" } },
      h(
        "div",
        { style: inner },
        h(
          "h2",
          { style: { fontSize: "1.15rem", fontWeight: 600 } },
          "Sections",
        ),
        h(
          "div",
          { style: badgeList },
          sections.length === 0
            ? h(
                "span",
                { style: { color: "#64748b" } },
                "No sections added yet.",
              )
            : sections.map((slug, i) =>
                h("span", { key: i, style: badge }, slug),
              ),
        ),
      ),
    ),
  );
};

/* =========================================================================
   FAQ PREVIEW
   ========================================================================= */

const FaqPreview = ({ entry }) => {
  if (!h) return null;

  const data = toJS(entry.getIn(["data"]));
  const items = data.items || [];

  const root = {
    fontFamily: "system-ui, sans-serif",
    background: "#020617",
    color: "#e5e7eb",
    padding: "2rem 1.5rem",
  };

  return h(
    "div",
    { style: root },
    h("h1", { style: { fontSize: "1.75rem", marginBottom: "1rem" } }, "FAQs"),
    items.map((qa, i) =>
      h(
        "div",
        {
          key: i,
          style: {
            border: "1px solid #1f2937",
            borderRadius: "0.75rem",
            padding: "1rem 1.25rem",
            marginBottom: "1rem",
          },
        },
        h(
          "h2",
          {
            style: {
              fontSize: "1rem",
              marginBottom: "0.4rem",
              fontWeight: 600,
            },
          },
          qa.question || "Question…",
        ),
        h(
          "p",
          { style: { fontSize: "0.9rem", color: "#cbd5e1" } },
          qa.answer || "",
        ),
      ),
    ),
  );
};

/* =========================================================================
   SETTINGS PREVIEW
   ========================================================================= */

const SettingsPreview = ({ entry }) => {
  if (!h) return null;

  const data = toJS(entry.getIn(["data"]));
  const palette = data.palette || {};
  const nav = data.nav || [];
  const footer = data.footer || {};

  return h(
    "div",
    {
      style: {
        background: "#020617",
        fontFamily: "system-ui, sans-serif",
        color: "#e5e7eb",
        minHeight: "100vh",
        padding: "2rem 1.5rem",
      },
    },
    h("h1", { style: { fontSize: "1.6rem" } }, "Settings Preview"),
    h(
      "h2",
      { style: { fontSize: "1.1rem", marginTop: "1.5rem" } },
      "Navigation",
    ),
    h(
      "ul",
      null,
      nav.map((item, i) =>
        h(
          "li",
          { key: i, style: { marginBottom: "0.2rem" } },
          item.label || "Label",
          " → ",
          item.href || "#",
        ),
      ),
    ),
    h("h2", { style: { marginTop: "1.75rem", fontSize: "1.1rem" } }, "Palette"),
    h(
      "ul",
      null,
      Object.keys(palette).map((key) =>
        h("li", { key }, key, ": ", palette[key] || "(unset)"),
      ),
    ),
    h("h2", { style: { marginTop: "1.75rem", fontSize: "1.1rem" } }, "Footer"),
    h("p", null, footer.text || "(no text)"),
  );
};

/* =========================================================================
   SPONSORS / SPEAKERS / PARTNERS PAGE PREVIEWS
   ========================================================================= */

const genericList = (heading, items) =>
  h(
    "div",
    {
      style: {
        background: "#020617",
        color: "#e5e7eb",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem 1.5rem",
        minHeight: "100vh",
      },
    },
    h("h1", { style: { fontSize: "1.6rem", marginBottom: "1rem" } }, heading),
    items.length === 0
      ? h("p", { style: { color: "#64748b" } }, "No items yet.")
      : items.map((item, i) =>
          h(
            "div",
            {
              key: i,
              style: {
                border: "1px solid #1f2937",
                padding: "1rem 1.25rem",
                borderRadius: "0.75rem",
                marginBottom: "1rem",
              },
            },
            h("strong", null, item.name || "Name"),
            item.description &&
              h(
                "p",
                {
                  style: {
                    fontSize: "0.9rem",
                    color: "#cbd5e1",
                    marginTop: "0.3rem",
                  },
                },
                item.description,
              ),
          ),
        ),
  );

const SponsorsPreview = ({ entry }) =>
  genericList("Sponsors", toJS(entry.getIn(["data", "items"])) || []);
const SpeakersPreview = ({ entry }) =>
  genericList("Speakers", toJS(entry.getIn(["data", "items"])) || []);
const PartnersPagePreview = ({ entry }) =>
  genericList("Partners", toJS(entry.getIn(["data", "items"])) || []);

/* =========================================================================
   BLOG POST PREVIEW
   ========================================================================= */

const BlogPostPreview = ({ entry }) => {
  if (!h) return null;

  const data = toJS(entry.get("data"));
  const { title, author, date, body } = data;

  const root = {
    background: "#020617",
    color: "#e5e7eb",
    minHeight: "100vh",
    padding: "2.5rem 1.5rem",
    fontFamily: "system-ui, sans-serif",
  };

  return h(
    "div",
    { style: root },
    h("h1", { style: { fontSize: "2rem" } }, title || "Post title…"),
    (author || date) &&
      h(
        "p",
        {
          style: { fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.3rem" },
        },
        [author, date].filter(Boolean).join(" · "),
      ),
    body &&
      h(
        "div",
        {
          style: {
            marginTop: "1.25rem",
            lineHeight: 1.6,
            fontSize: "1rem",
            color: "#cbd5e1",
          },
        },
        body,
      ),
  );
};

/* =========================================================================
   SINGLE EVENT PREVIEW (events collection)
   ========================================================================= */

const EventPreview = ({ entry }) => {
  if (!h) return null;

  const data = toJS(entry.get("data"));
  const { title, date, location, summary, externalUrl } = data;

  const root = {
    background: "#020617",
    color: "#e5e7eb",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
    padding: "2rem 1.5rem",
  };

  return h(
    "div",
    { style: root },
    h(
      "h1",
      { style: { fontSize: "1.75rem", marginBottom: "0.5rem" } },
      title || "Event title…",
    ),
    (date || location) &&
      h(
        "p",
        { style: { fontSize: "0.85rem", color: "#94a3b8" } },
        [date, location].filter(Boolean).join(" · "),
      ),
    summary &&
      h(
        "p",
        { style: { marginTop: "1rem", lineHeight: 1.6, fontSize: "0.95rem" } },
        summary,
      ),
    externalUrl &&
      h(
        "p",
        { style: { marginTop: "1rem", fontSize: "0.8rem" } },
        "Link: ",
        h("span", { style: { color: "#38bdf8" } }, externalUrl),
      ),
  );
};

/* =========================================================================
   TYPE-SPECIFIC SHARED SECTION PREVIEWS
   ========================================================================= */

const AboutIntroSectionPreview = (data) => {
  const { heading, body, extended } = data;
  return h(
    "div",
    {
      style: {
        background: "#020617",
        color: "#e5e7eb",
        padding: "2rem 1.5rem",
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
      },
    },
    h(
      "div",
      { style: { maxWidth: "48rem", margin: "0 auto" } },
      h(
        "h2",
        {
          style: {
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          },
        },
        heading || "About Us",
      ),
      body &&
        h(
          "p",
          {
            style: {
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "#cbd5e1",
              marginBottom: "0.75rem",
            },
          },
          body,
        ),
      extended &&
        h(
          "p",
          {
            style: {
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#94a3b8",
            },
          },
          extended,
        ),
    ),
  );
};

const WhoAttendsSectionPreview = (data) => {
  const {
    heading,
    audienceGroups = [],
    statistics = {},
    highlights = [],
  } = data;

  const root = {
    background: "#020617",
    color: "#e5e7eb",
    fontFamily: "system-ui, sans-serif",
    padding: "2rem 1.5rem",
    minHeight: "100vh",
  };

  const inner = {
    maxWidth: "64rem",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0,2fr) minmax(0,1.5fr)",
    gap: "1.5rem",
  };

  const statBox = {
    borderRadius: "0.75rem",
    border: "1px solid #1f2937",
    padding: "0.75rem 0.9rem",
    background: "#020617",
    marginBottom: "0.5rem",
  };

  return h(
    "div",
    { style: root },
    h(
      "div",
      { style: inner },
      // Left
      h(
        "div",
        null,
        h(
          "h2",
          {
            style: {
              fontSize: "1.6rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            },
          },
          heading || "Who Attends",
        ),
        audienceGroups.length > 0 &&
          h(
            "ul",
            { style: { fontSize: "0.9rem", color: "#cbd5e1" } },
            audienceGroups.map((item, i) =>
              h(
                "li",
                { key: i, style: { marginBottom: "0.25rem" } },
                "• ",
                item,
              ),
            ),
          ),
      ),
      // Right
      h(
        "div",
        null,
        h(
          "div",
          null,
          statistics.companies &&
            h(
              "div",
              { style: statBox },
              h(
                "div",
                { style: { fontSize: "0.75rem", color: "#94a3b8" } },
                "Companies",
              ),
              h("div", { style: { fontWeight: 600 } }, statistics.companies),
            ),
          statistics.boardLevel &&
            h(
              "div",
              { style: statBox },
              h(
                "div",
                { style: { fontSize: "0.75rem", color: "#94a3b8" } },
                "Board-level execs",
              ),
              h("div", { style: { fontWeight: 600 } }, statistics.boardLevel),
            ),
          statistics.founders &&
            h(
              "div",
              { style: statBox },
              h(
                "div",
                { style: { fontSize: "0.75rem", color: "#94a3b8" } },
                "Founders",
              ),
              h("div", { style: { fontWeight: 600 } }, statistics.founders),
            ),
        ),
        highlights.length > 0 &&
          h(
            "ul",
            {
              style: {
                fontSize: "0.85rem",
                color: "#cbd5e1",
                marginTop: "0.75rem",
              },
            },
            highlights.map((item, i) =>
              h(
                "li",
                { key: i, style: { marginBottom: "0.2rem" } },
                "• ",
                item,
              ),
            ),
          ),
      ),
    ),
  );
};

const ValuePillarsSectionPreview = (data) => {
  const {
    title = "Our Value",
    accentWord = "Pillars",
    description,
    values = [],
  } = data;

  const root = {
    background: "#020617",
    color: "#e5e7eb",
    fontFamily: "system-ui, sans-serif",
    padding: "2rem 1.5rem",
    minHeight: "100vh",
  };

  const inner = {
    maxWidth: "64rem",
    margin: "0 auto",
  };

  const grid = {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    marginTop: "1.25rem",
  };

  const card = {
    borderRadius: "0.75rem",
    border: "1px solid #1f2937",
    padding: "0.9rem 1rem",
    background: "#020617",
  };

  return h(
    "div",
    { style: root },
    h(
      "div",
      { style: inner },
      h(
        "h2",
        { style: { fontSize: "1.6rem", fontWeight: 700 } },
        title,
        " ",
        h("span", { style: { color: "#38bdf8" } }, accentWord),
      ),
      description &&
        h(
          "p",
          {
            style: {
              marginTop: "0.5rem",
              fontSize: "0.95rem",
              color: "#cbd5e1",
            },
          },
          description,
        ),
      h(
        "div",
        { style: grid },
        values.length === 0
          ? h(
              "p",
              { style: { color: "#64748b", fontSize: "0.9rem" } },
              "No value items yet.",
            )
          : values.map((val, i) =>
              h(
                "div",
                { key: i, style: card },
                h(
                  "h3",
                  { style: { fontSize: "1rem", fontWeight: 600 } },
                  val.title || "Value title",
                ),
                val.description &&
                  h(
                    "p",
                    {
                      style: {
                        fontSize: "0.85rem",
                        color: "#cbd5e1",
                        marginTop: "0.35rem",
                      },
                    },
                    val.description,
                  ),
              ),
            ),
      ),
    ),
  );
};

const PartnersSectionPreview = (data) => {
  const { heading, description, logos = [] } = data;

  const root = {
    background: "#020617",
    color: "#e5e7eb",
    fontFamily: "system-ui, sans-serif",
    padding: "2rem 1.5rem",
    minHeight: "100vh",
  };

  const inner = {
    maxWidth: "60rem",
    margin: "0 auto",
    textAlign: "center",
  };

  const grid = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    justifyContent: "center",
    marginTop: "1.5rem",
  };

  const pill = {
    padding: "0.4rem 0.9rem",
    borderRadius: "999px",
    border: "1px solid #1f2937",
    background: "#020617",
    fontSize: "0.85rem",
  };

  return h(
    "div",
    { style: root },
    h(
      "div",
      { style: inner },
      h(
        "h2",
        { style: { fontSize: "1.6rem", fontWeight: 700 } },
        heading || "Partners",
      ),
      description &&
        h(
          "p",
          {
            style: {
              marginTop: "0.5rem",
              color: "#cbd5e1",
              fontSize: "0.95rem",
            },
          },
          description,
        ),
      logos.length > 0 &&
        h(
          "div",
          { style: grid },
          logos.map((logo, i) => {
            const name =
              typeof logo === "string" ? logo : logo.name || "Partner";
            return h("span", { key: i, style: pill }, name);
          }),
        ),
    ),
  );
};

const TestimonialsSectionPreview = (data) => {
  const { heading = "Testimonials", description, items = [] } = data;

  const root = {
    background: "#020617",
    color: "#e5e7eb",
    fontFamily: "system-ui, sans-serif",
    padding: "2rem 1.5rem",
    minHeight: "100vh",
  };

  const inner = {
    maxWidth: "60rem",
    margin: "0 auto",
  };

  const grid = {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    marginTop: "1.25rem",
  };

  const card = {
    borderRadius: "0.75rem",
    border: "1px solid #1f2937",
    padding: "1rem 1.25rem",
    background: "#020617",
  };

  return h(
    "div",
    { style: root },
    h(
      "div",
      { style: inner },
      h("h2", { style: { fontSize: "1.6rem", fontWeight: 700 } }, heading),
      description &&
        h(
          "p",
          {
            style: {
              marginTop: "0.5rem",
              color: "#cbd5e1",
              fontSize: "0.95rem",
            },
          },
          description,
        ),
      h(
        "div",
        { style: grid },
        items.length === 0
          ? h(
              "p",
              { style: { color: "#64748b", fontSize: "0.9rem" } },
              "No testimonials yet.",
            )
          : items.map((t, i) =>
              h(
                "div",
                { key: i, style: card },
                t.quote &&
                  h(
                    "p",
                    {
                      style: {
                        fontStyle: "italic",
                        marginBottom: "0.75rem",
                        fontSize: "0.9rem",
                      },
                    },
                    "“",
                    t.quote,
                    "”",
                  ),
                (t.name || t.role || t.company) &&
                  h(
                    "div",
                    {
                      style: {
                        fontSize: "0.8rem",
                        color: "#94a3b8",
                      },
                    },
                    t.name && h("span", { style: { fontWeight: 600 } }, t.name),
                    (t.role || t.company) &&
                      h(
                        "span",
                        null,
                        " · ",
                        [t.role, t.company].filter(Boolean).join(", "),
                      ),
                  ),
              ),
            ),
      ),
    ),
  );
};

const SimpleCtaSectionPreview = (data, defaultHeading, defaultBody) => {
  const { heading = defaultHeading, body = defaultBody, cta = {} } = data;
  const label = cta.label || "Learn more";

  return h(
    "div",
    {
      style: {
        background: "#020617",
        color: "#e5e7eb",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem 1.5rem",
        minHeight: "100vh",
        textAlign: "center",
      },
    },
    h(
      "h2",
      {
        style: { fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" },
      },
      heading,
    ),
    body &&
      h(
        "p",
        {
          style: {
            maxWidth: "40rem",
            margin: "0.5rem auto 1.5rem",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            color: "#cbd5e1",
          },
        },
        body,
      ),
    h(
      "span",
      {
        style: {
          display: "inline-block",
          padding: "0.45rem 1.1rem",
          borderRadius: "999px",
          border: "1px solid #38bdf8",
          fontSize: "0.85rem",
          color: "#38bdf8",
        },
      },
      label,
    ),
  );
};

const EventFormatsSectionPreview = (data) => {
  const {
    title = "Event",
    accentWord = "Formats",
    description,
    values = [],
  } = data;

  const root = {
    background: "#020617",
    color: "#e5e7eb",
    fontFamily: "system-ui, sans-serif",
    padding: "2rem 1.5rem",
    minHeight: "100vh",
  };

  const inner = {
    maxWidth: "64rem",
    margin: "0 auto",
  };

  const grid = {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    marginTop: "1.25rem",
  };

  const card = {
    borderRadius: "0.75rem",
    border: "1px solid #1f2937",
    padding: "0.9rem 1rem",
    background: "#020617",
  };

  return h(
    "div",
    { style: root },
    h(
      "div",
      { style: inner },
      h(
        "h2",
        { style: { fontSize: "1.6rem", fontWeight: 700 } },
        title,
        " ",
        h("span", { style: { color: "#38bdf8" } }, accentWord),
      ),
      description &&
        h(
          "p",
          {
            style: {
              marginTop: "0.5rem",
              fontSize: "0.95rem",
              color: "#cbd5e1",
            },
          },
          description,
        ),
      h(
        "div",
        { style: grid },
        values.length === 0
          ? h(
              "p",
              { style: { color: "#64748b", fontSize: "0.9rem" } },
              "No event formats defined.",
            )
          : values.map((v, i) =>
              h(
                "div",
                { key: i, style: card },
                h(
                  "h3",
                  { style: { fontSize: "1rem", fontWeight: 600 } },
                  v.title || "Format",
                ),
                v.description &&
                  h(
                    "p",
                    {
                      style: {
                        marginTop: "0.35rem",
                        fontSize: "0.85rem",
                        color: "#cbd5e1",
                      },
                    },
                    v.description,
                  ),
              ),
            ),
      ),
    ),
  );
};

const OurStorySectionPreview = (data) => {
  const { title = "Our Story", accentWord, body } = data;

  return h(
    "div",
    {
      style: {
        background: "#020617",
        color: "#e5e7eb",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem 1.5rem",
        minHeight: "100vh",
      },
    },
    h(
      "h2",
      {
        style: { fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" },
      },
      title,
      accentWord && " ",
      accentWord && h("span", { style: { color: "#38bdf8" } }, accentWord),
    ),
    body &&
      h(
        "p",
        {
          style: {
            maxWidth: "48rem",
            lineHeight: 1.6,
            fontSize: "0.95rem",
            color: "#cbd5e1",
          },
        },
        body,
      ),
  );
};

const MissionValuesSectionPreview = (data) => {
  const {
    title = "Mission & Values",
    accentWord,
    description,
    values = [],
  } = data;

  const root = {
    background: "#020617",
    color: "#e5e7eb",
    fontFamily: "system-ui, sans-serif",
    padding: "2rem 1.5rem",
    minHeight: "100vh",
  };

  const inner = {
    maxWidth: "64rem",
    margin: "0 auto",
  };

  const grid = {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    marginTop: "1.25rem",
  };

  const card = {
    borderRadius: "0.75rem",
    border: "1px solid #1f2937",
    padding: "0.9rem 1rem",
    background: "#020617",
  };

  return h(
    "div",
    { style: root },
    h(
      "div",
      { style: inner },
      h(
        "h2",
        { style: { fontSize: "1.6rem", fontWeight: 700 } },
        title,
        accentWord && " ",
        accentWord && h("span", { style: { color: "#38bdf8" } }, accentWord),
      ),
      description &&
        h(
          "p",
          {
            style: {
              marginTop: "0.5rem",
              fontSize: "0.95rem",
              color: "#cbd5e1",
            },
          },
          description,
        ),
      h(
        "div",
        { style: grid },
        values.length === 0
          ? h(
              "p",
              { style: { color: "#64748b", fontSize: "0.9rem" } },
              "No values defined.",
            )
          : values.map((v, i) =>
              h(
                "div",
                { key: i, style: card },
                h(
                  "h3",
                  { style: { fontSize: "1rem", fontWeight: 600 } },
                  v.title || "Value",
                ),
                v.description &&
                  h(
                    "p",
                    {
                      style: {
                        marginTop: "0.35rem",
                        fontSize: "0.85rem",
                        color: "#cbd5e1",
                      },
                    },
                    v.description,
                  ),
              ),
            ),
      ),
    ),
  );
};

const JoinUsSectionPreview = (data) => {
  const { title = "Join Us", accentWord, body, cta = {} } = data;
  const label = cta.label || "Join Us";

  return SimpleCtaSectionPreview(
    {
      heading: `${title}${accentWord ? " " + accentWord : ""}`,
      body,
      cta: { label },
    },
    "Join Us",
    body,
  );
};

const EventsSectionPreview = (data) => {
  const {
    title = "Featured",
    accentWord = "Events",
    description = "",
    items = [],
  } = data;

  const sectionStyle = {
    padding: "2rem 1.5rem",
    background: "#020617",
    color: "white",
    border: "1px solid #1e2937",
    borderRadius: "1rem",
    marginBottom: "2rem",
    fontFamily: "system-ui, sans-serif",
  };

  const cardGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginTop: "1.5rem",
  };

  const cardStyle = {
    border: "1px solid #2a3348",
    borderRadius: "0.75rem",
    padding: "1rem 1.25rem",
    background: "#131a28",
    color: "#e5e7eb",
  };

  const headerStyle = {
    marginBottom: "1rem",
  };

  const mainTitle = {
    fontSize: "1.25rem",
    fontWeight: 700,
  };

  const accentStyle = {
    color: "#38bdf8",
  };

  const descStyle = {
    fontSize: "0.9rem",
    color: "#cbd5e1",
  };

  const eventTitleStyle = {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.25rem",
  };

  const metaStyle = {
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginBottom: "0.5rem",
  };

  const summaryStyle = {
    fontSize: "0.85rem",
    lineHeight: 1.5,
    marginBottom: "0.75rem",
  };

  const linkStyle = {
    fontSize: "0.8rem",
    color: "#38bdf8",
    textDecoration: "underline",
  };

  return h(
    "section",
    { style: sectionStyle },
    h(
      "div",
      { style: headerStyle },
      h(
        "h2",
        { style: mainTitle },
        title,
        " ",
        h("span", { style: accentStyle }, accentWord),
      ),
      description && h("p", { style: descStyle }, description),
    ),
    h(
      "div",
      { style: cardGrid },
      items.length === 0
        ? h(
            "p",
            { style: { color: "#94a3b8", fontSize: "0.9rem" } },
            "No events added yet.",
          )
        : items.map((ev, idx) =>
            h(
              "div",
              { key: idx, style: cardStyle },
              h(
                "div",
                { style: eventTitleStyle },
                ev.title || "Untitled Event",
              ),
              h(
                "div",
                { style: metaStyle },
                `${ev.date || ""}${ev.location ? " · " + ev.location : ""}`,
              ),
              ev.summary && h("p", { style: summaryStyle }, ev.summary),
              ev.externalUrl &&
                h(
                  "a",
                  { href: ev.externalUrl, style: linkStyle },
                  "View Event →",
                ),
            ),
          ),
    ),
  );
};

/* =========================================================================
   UNIFIED SHARED-SECTIONS PREVIEW
   ========================================================================= */

const SectionsPreview = ({ entry }) => {
  if (!h) return null;

  const data = toJS(entry.getIn(["data"]));
  const type = data.type;

  switch (type) {
    case "aboutIntro":
      return AboutIntroSectionPreview(data);
    case "whoAttends":
      return WhoAttendsSectionPreview(data);
    case "valuePillars":
      return ValuePillarsSectionPreview(data);
    case "partners":
      return PartnersSectionPreview(data);
    case "testimonials":
      return TestimonialsSectionPreview(data);
    case "joinCommunity":
      return SimpleCtaSectionPreview(
        data,
        "Join the Community",
        data.body ||
          "Be part of a growing network of leaders, innovators, and creators.",
      );
    case "newHere":
      return SimpleCtaSectionPreview(
        data,
        "New Here?",
        data.body ||
          "If you're joining us for the first time, welcome. Our events are warm and relaxed.",
      );
    case "forBrands":
      return SimpleCtaSectionPreview(
        data,
        "For Brands & Partners",
        data.body ||
          "We collaborate with organisations who share our commitment to thoughtful experiences.",
      );
    case "eventFormats":
      return EventFormatsSectionPreview(data);
    case "ourStory":
      return OurStorySectionPreview(data);
    case "missionValues":
      return MissionValuesSectionPreview(data);
    case "joinUs":
      return JoinUsSectionPreview(data);
    case "events":
      return EventsSectionPreview(data);
    default:
      // Generic fallback
      return h(
        "div",
        {
          style: {
            background: "#020617",
            color: "#e5e7eb",
            minHeight: "100vh",
            padding: "2rem 1.5rem",
            fontFamily: "system-ui, sans-serif",
          },
        },
        h(
          "h1",
          { style: { fontSize: "1.5rem", marginBottom: "0.75rem" } },
          "Section type: ",
          type || "unknown",
        ),
        h(
          "p",
          { style: { fontSize: "0.95rem", color: "#cbd5e1" } },
          data.description ||
            data.body ||
            "This section does not have a specific preview template yet.",
        ),
      );
  }
};

/* =========================================================================
   REGISTER PREVIEWS
   ========================================================================= */

if (window.CMS) {
  CMS.registerPreviewTemplate("homepage", HomepagePreview);
  CMS.registerPreviewTemplate("about", AboutPreview);
  CMS.registerPreviewTemplate("faq", FaqPreview);
  CMS.registerPreviewTemplate("settings", SettingsPreview);
  CMS.registerPreviewTemplate("sponsors", SponsorsPreview);
  CMS.registerPreviewTemplate("speakers", SpeakersPreview);
  CMS.registerPreviewTemplate("partners", PartnersPagePreview);
  CMS.registerPreviewTemplate("blog", BlogPostPreview);
  CMS.registerPreviewTemplate("events", EventPreview);

  // Unified shared-section previews
  CMS.registerPreviewTemplate("sections", SectionsPreview);
}
