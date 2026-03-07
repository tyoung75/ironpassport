import { getAllCities } from "../../lib/city-data";
import styles from "./city-page.module.css";

const CURRENT_YEAR = new Date().getFullYear();

export const metadata = {
  title: `Best Gyms by City (${CURRENT_YEAR}) — Iron Passport`,
  description: `Browse the world's best gyms for travelers. City-by-city guides with day pass info, equipment ratings, and recovery facilities. The global database of great gyms.`,
  alternates: {
    canonical: "https://ironpassport.com/best-gyms",
  },
  openGraph: {
    title: `Best Gyms by City (${CURRENT_YEAR}) — Iron Passport`,
    description:
      "Browse the world's best gyms for travelers. City-by-city guides with day pass info, equipment ratings, and recovery facilities.",
    url: "https://ironpassport.com/best-gyms",
    siteName: "Iron Passport",
    type: "website",
  },
};

export default function BestGymsIndex() {
  const cities = getAllCities();

  // Group cities by region
  const byRegion = {};
  for (const city of cities) {
    const region = city.region || "Other";
    if (!byRegion[region]) byRegion[region] = [];
    byRegion[region].push(city);
  }

  // Sort regions for display
  const regionOrder = [
    "Northeast",
    "Southeast",
    "South",
    "Midwest",
    "West",
    "Mountain West",
    "Europe",
    "East Asia",
    "Southeast Asia",
    "Middle East",
    "Oceania",
  ];
  const sortedRegions = Object.keys(byRegion).sort(
    (a, b) => (regionOrder.indexOf(a) === -1 ? 99 : regionOrder.indexOf(a)) -
              (regionOrder.indexOf(b) === -1 ? 99 : regionOrder.indexOf(b))
  );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ironpassport.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Best Gyms by City",
        item: "https://ironpassport.com/best-gyms",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className={styles.breadcrumbSep}>/</span>
          <span>Best Gyms</span>
        </nav>

        <header className={styles.hero}>
          <h1 className={styles.h1}>
            Best Gyms by City ({CURRENT_YEAR})
          </h1>
          <p className={styles.subtitle}>
            The global database of great gyms · {cities.length} cities ·{" "}
            {cities.reduce((a, c) => a + c.gymCount, 0)} gyms ranked
          </p>
          <p className={styles.intro}>
            Iron Passport rates and ranks the best gyms in cities around the
            world for travelers. Each guide includes equipment scores,
            cleanliness ratings, day pass info, recovery facilities, and
            atmosphere reviews — everything you need to find a great workout
            while traveling.
          </p>
        </header>

        {sortedRegions.map((region) => (
          <section key={region} className={styles.regionGroup}>
            <h2 className={styles.regionTitle}>{region}</h2>
            <div className={styles.cityGrid}>
              {byRegion[region].map((city) => (
                <a
                  key={city.slug}
                  href={`/best-gyms/${city.slug}`}
                  className={styles.cityCard}
                >
                  <div className={styles.cityCardName}>{city.name}</div>
                  <div className={styles.cityCardCountry}>{city.country}</div>
                  <div className={styles.cityCardGyms}>
                    {city.gymCount} top gyms ranked
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>
            Don&apos;t See Your City?
          </h2>
          <p className={styles.ctaText}>
            Use Iron Passport&apos;s AI-powered search to find the best gyms
            in any destination worldwide.
          </p>
          <a href="/" className={styles.ctaButton}>
            Search Any City
          </a>
        </div>
      </main>
    </>
  );
}
