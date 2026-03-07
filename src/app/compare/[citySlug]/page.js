import { getCityBySlug, getAllCitySlugs } from "@/lib/data";
import { GYM_CRITERIA, scoreColor, calcOverallScore, CURRENT_YEAR } from "@/lib/city-helpers";

export async function generateStaticParams() {
  const slugs = await getAllCitySlugs();
  if (slugs.length === 0) return [{ citySlug: "_placeholder" }];
  return slugs.map((citySlug) => ({ citySlug }));
}

export async function generateMetadata({ params }) {
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) {
    return { title: "City Not Found — Iron Passport" };
  }

  const title = `Compare Gyms in ${city.name} (${CURRENT_YEAR}) | Iron Passport`;
  const description = `Side-by-side comparison of the top ${city.gyms.length} gyms in ${city.name}. Compare equipment, cleanliness, atmosphere, recovery, day pass prices, and overall scores.`;
  const url = `https://ironpassport.com/compare/${city.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Iron Passport",
      type: "website",
    },
  };
}

const cellStyle = {
  padding: "10px 12px",
  fontSize: 12,
  color: "rgba(255,255,255,0.7)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const headerCellStyle = {
  ...cellStyle,
  color: "#c8a84b",
  fontSize: 9,
  letterSpacing: 2,
  textTransform: "uppercase",
  fontWeight: 600,
  position: "sticky",
  top: 0,
  background: "#090807",
};

const labelCellStyle = {
  ...cellStyle,
  textAlign: "left",
  fontWeight: 500,
  color: "#f0ebe0",
  position: "sticky",
  left: 0,
  background: "#090807",
  zIndex: 1,
};

export default async function ComparePage({ params }) {
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug);

  if (!city || city.gyms.length === 0) {
    return (
      <main style={{ minHeight: "100vh", background: "#090807", color: "#f0ebe0", padding: "40px 24px", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 28 }}>No Comparison Available</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
          No gym data found for this city. <a href="/best-gyms" style={{ color: "#c8a84b" }}>Browse all cities</a>.
        </p>
      </main>
    );
  }

  const gyms = city.gyms;

  return (
    <main style={{ minHeight: "100vh", background: "#090807", color: "#f0ebe0", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      {/* Breadcrumbs */}
      <nav style={{ padding: "20px 24px 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
        <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Home</a>
        <span style={{ margin: "0 6px" }}>/</span>
        <a href="/best-gyms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Best Gyms</a>
        <span style={{ margin: "0 6px" }}>/</span>
        <a href={`/best-gyms/${city.slug}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{city.name}</a>
        <span style={{ margin: "0 6px" }}>/</span>
        <span style={{ color: "#c8a84b" }}>Compare</span>
      </nav>

      {/* Hero */}
      <header style={{ padding: "24px 24px 0", maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
          Compare Gyms in {city.name}
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
          Side-by-side comparison of {gyms.length} top-rated gyms · {CURRENT_YEAR}
        </p>
      </header>

      {/* Comparison table */}
      <div style={{ padding: "0 24px 60px", maxWidth: 1200, margin: "0 auto", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, textAlign: "left" }}>Category</th>
              {gyms.map((gym) => (
                <th key={gym.slug} style={headerCellStyle}>
                  <a href={gym.profilePath} style={{ color: "#c8a84b", textDecoration: "none" }}>
                    {gym.name}
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Type */}
            <tr>
              <td style={labelCellStyle}>Type</td>
              {gyms.map((gym) => (
                <td key={gym.slug} style={cellStyle}>{gym.type}</td>
              ))}
            </tr>

            {/* Overall Score */}
            <tr>
              <td style={{ ...labelCellStyle, fontWeight: 700 }}>Overall Score</td>
              {gyms.map((gym) => (
                <td key={gym.slug} style={{ ...cellStyle, fontWeight: 700, fontSize: 18 }}>
                  <span style={{ color: scoreColor(gym.overallScore) }}>{gym.overallScore}</span>
                </td>
              ))}
            </tr>

            {/* Individual scores */}
            {GYM_CRITERIA.map((c) => (
              <tr key={c.key}>
                <td style={labelCellStyle}>{c.label}</td>
                {gyms.map((gym) => {
                  const val = gym.scores[c.key] || 0;
                  return (
                    <td key={gym.slug} style={cellStyle}>
                      <span style={{ color: scoreColor(val) }}>{val || "\u2014"}</span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Day Pass */}
            <tr>
              <td style={labelCellStyle}>Day Pass</td>
              {gyms.map((gym) => (
                <td key={gym.slug} style={{ ...cellStyle, color: gym.dayPassPrice ? "#c8a84b" : "rgba(255,255,255,0.3)" }}>
                  {gym.dayPassPrice || "\u2014"}
                </td>
              ))}
            </tr>

            {/* Week Pass */}
            <tr>
              <td style={labelCellStyle}>Week Pass</td>
              {gyms.map((gym) => (
                <td key={gym.slug} style={{ ...cellStyle, color: gym.weekPassPrice ? "#c8a84b" : "rgba(255,255,255,0.3)" }}>
                  {gym.weekPassPrice || "\u2014"}
                </td>
              ))}
            </tr>

            {/* Neighborhood */}
            <tr>
              <td style={labelCellStyle}>Neighborhood</td>
              {gyms.map((gym) => (
                <td key={gym.slug} style={cellStyle}>{gym.neighborhood || "\u2014"}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Back links */}
      <div style={{ textAlign: "center", padding: "0 24px 40px" }}>
        <a href={`/best-gyms/${city.slug}`} style={{ color: "#c8a84b", fontSize: 14, textDecoration: "none" }}>
          ← Back to Best Gyms in {city.name}
        </a>
      </div>
    </main>
  );
}
