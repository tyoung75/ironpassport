import {
  getCityData,
  ALL_CITY_SLUGS,
  getNearbyDestinations,
  getRelatedCities,
  GYM_CRITERIA,
  scoreColor,
} from "../../../lib/city-data";
import styles from "../city-page.module.css";

/** Generate static params for all city pages */
export function generateStaticParams() {
  return ALL_CITY_SLUGS.map((city) => ({ city }));
}

/** SEO metadata */
export async function generateMetadata({ params }) {
  const { city: citySlug } = await params;
  const city = getCityData(citySlug);
  if (!city) {
    return { title: "City Not Found — Iron Passport" };
  }

  const title = `Best Gyms in ${city.name} (${city.year}) — Iron Passport`;
  const description = `Discover the top-rated gyms in ${city.name}, ${city.country} for travelers. Day pass info, equipment scores, cleanliness ratings, and recovery facilities. Updated for ${city.year}.`;
  const url = `https://ironpassport.com/best-gyms/${city.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Iron Passport",
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Structured data scripts */
function StructuredData({ city }) {
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
      {
        "@type": "ListItem",
        position: 3,
        name: `Best Gyms in ${city.name}`,
        item: `https://ironpassport.com/best-gyms/${city.slug}`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best Gyms in ${city.name} (${city.year})`,
    description: `Top-rated gyms in ${city.name} for travelers, ranked by equipment, cleanliness, atmosphere, and more.`,
    numberOfItems: city.gyms.length,
    itemListElement: city.gyms.map((gym, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: gym.name,
      url: `https://ironpassport.com${gym.profilePath}`,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

/** Breadcrumbs component */
function Breadcrumbs({ cityName }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span className={styles.breadcrumbSep}>/</span>
      <a href="/best-gyms">Best Gyms</a>
      <span className={styles.breadcrumbSep}>/</span>
      <span>{cityName}</span>
    </nav>
  );
}

/** Individual gym card */
function GymCard({ gym, rank }) {
  const overall = gym.overallScore;
  return (
    <article className={styles.gymCard} id={`gym-${rank}`}>
      <div className={styles.gymHeader}>
        <div>
          <div className={styles.gymRank}>#{rank} Ranked</div>
          <h3 className={styles.gymName}>
            <a href={gym.profilePath} className={styles.gymNameLink}>
              {gym.name}
            </a>
          </h3>
          <div className={styles.gymType}>{gym.type}</div>
          <div className={styles.gymNeighborhood}>
            {gym.neighborhood} · {gym.address}
          </div>
        </div>
        <div className={styles.gymScore}>
          <span
            className={styles.gymScoreValue}
            style={{ color: scoreColor(overall) }}
          >
            {overall}
          </span>
          <span className={styles.gymScoreLabel}>Overall</span>
        </div>
      </div>

      <p className={styles.gymDescription}>{gym.description}</p>

      {/* Score breakdown */}
      <div className={styles.scoresGrid}>
        {GYM_CRITERIA.map((c) => (
          <div key={c.key} className={styles.scoreItem}>
            <span className={styles.scoreItemLabel}>{c.label}</span>
            <span
              className={styles.scoreItemValue}
              style={{ color: scoreColor(gym.scores[c.key] || 0) }}
            >
              {gym.scores[c.key] || "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Highlights */}
      {gym.highlights && gym.highlights.length > 0 && (
        <div className={styles.highlights}>
          {gym.highlights.map((h, i) => (
            <span key={i} className={styles.highlight}>
              <span className={styles.highlightIcon}>{h.icon}</span>
              <span>{h.label}:</span>
              <span className={styles.highlightValue}>{h.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Pass info */}
      {(gym.dayPassPrice || gym.weekPassPrice) && (
        <div className={styles.passInfo}>
          {gym.dayPassPrice && (
            <span className={styles.passItem}>
              Day Pass: <span className={styles.passPrice}>{gym.dayPassPrice}</span>
            </span>
          )}
          {gym.weekPassPrice && (
            <span className={styles.passItem}>
              Week Pass: <span className={styles.passPrice}>{gym.weekPassPrice}</span>
            </span>
          )}
          {gym.passNotes && (
            <span className={styles.passNotes}>{gym.passNotes}</span>
          )}
        </div>
      )}

      {/* Tags */}
      {gym.tags && gym.tags.length > 0 && (
        <div className={styles.tags}>
          {gym.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

/** City summary boxes */
function CitySummary({ city }) {
  const gyms = city.gyms;

  // Compute aggregate summaries
  const avgScore = (key) => {
    const vals = gyms.map((g) => g.scores[key]).filter(Boolean);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };

  const dayPassGyms = gyms.filter((g) => g.dayPassPrice);
  const weekPassGyms = gyms.filter((g) => g.weekPassPrice);

  return (
    <div className={styles.summaryGrid}>
      <div className={styles.summaryBox}>
        <div className={styles.summaryBoxTitle}>Equipment</div>
        <p className={styles.summaryBoxText}>
          Average equipment score across {city.name} gyms:{" "}
          <strong style={{ color: scoreColor(avgScore("equipment")) }}>
            {avgScore("equipment")}/100
          </strong>
          . {avgScore("equipment") >= 85
            ? `${city.name} offers exceptional equipment quality across its top gyms.`
            : `${city.name} has solid equipment options for traveling lifters.`}
        </p>
      </div>
      <div className={styles.summaryBox}>
        <div className={styles.summaryBoxTitle}>Cleanliness</div>
        <p className={styles.summaryBoxText}>
          Average cleanliness rating:{" "}
          <strong style={{ color: scoreColor(avgScore("cleanliness")) }}>
            {avgScore("cleanliness")}/100
          </strong>
          . {avgScore("cleanliness") >= 85
            ? "Facilities are consistently well-maintained and hygienic."
            : "Standards vary — check individual gym ratings for details."}
        </p>
      </div>
      <div className={styles.summaryBox}>
        <div className={styles.summaryBoxTitle}>Atmosphere</div>
        <p className={styles.summaryBoxText}>
          Average atmosphere score:{" "}
          <strong style={{ color: scoreColor(avgScore("atmosphere")) }}>
            {avgScore("atmosphere")}/100
          </strong>
          . {city.name}&apos;s gyms range from hardcore lifting dens to
          polished luxury clubs, so there&apos;s a vibe for every traveler.
        </p>
      </div>
      <div className={styles.summaryBox}>
        <div className={styles.summaryBoxTitle}>Recovery</div>
        <p className={styles.summaryBoxText}>
          Average recovery score:{" "}
          <strong style={{ color: scoreColor(avgScore("recovery")) }}>
            {avgScore("recovery")}/100
          </strong>
          . {avgScore("recovery") >= 70
            ? "Good recovery options including saunas, steam rooms, and cold plunge."
            : "Recovery facilities vary — premium clubs tend to offer the best options."}
        </p>
      </div>
      <div className={styles.summaryBox}>
        <div className={styles.summaryBoxTitle}>Day Passes</div>
        <p className={styles.summaryBoxText}>
          {dayPassGyms.length} of {gyms.length} ranked gyms offer day passes
          {dayPassGyms.length > 0 &&
            ` ranging from ${dayPassGyms.map((g) => g.dayPassPrice).join(" to ")}`}
          . Walk-in availability varies by facility.
        </p>
      </div>
      <div className={styles.summaryBox}>
        <div className={styles.summaryBoxTitle}>Week Passes</div>
        <p className={styles.summaryBoxText}>
          {weekPassGyms.length > 0
            ? `${weekPassGyms.length} gyms offer weekly passes (${weekPassGyms
                .map((g) => g.weekPassPrice)
                .join(", ")}), ideal for extended stays.`
            : "Most gyms in this city offer day passes only. Inquire about weekly rates at the front desk."}
        </p>
      </div>
    </div>
  );
}

/** FAQ section */
function FAQSection({ faqs }) {
  return (
    <section className={styles.faqSection}>
      <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
      {faqs.map((faq, i) => (
        <div key={i} className={styles.faqItem}>
          <h3 className={styles.faqQuestion}>{faq.question}</h3>
          <p className={styles.faqAnswer}>{faq.answer}</p>
        </div>
      ))}
    </section>
  );
}

/** Internal links section */
function InternalLinks({ slug }) {
  const nearby = getNearbyDestinations(slug);
  const related = getRelatedCities(slug);

  if (nearby.length === 0 && related.length === 0) return null;

  return (
    <div>
      {nearby.length > 0 && (
        <div className={styles.linksSection}>
          <h3 className={styles.linksTitle}>Nearby Destinations</h3>
          <div className={styles.linksGrid}>
            {nearby.map((dest) => (
              <a
                key={dest.slug}
                href={`/best-gyms/${dest.slug}`}
                className={styles.linkCard}
              >
                <span>
                  Best Gyms in {dest.name}
                </span>
                <span className={styles.linkCardCount}>
                  {dest.gymCount} gyms
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className={styles.linksSection} style={{ marginTop: 16 }}>
          <h3 className={styles.linksTitle}>Similar Cities for Gym Travelers</h3>
          <div className={styles.linksGrid}>
            {related.map((dest) => (
              <a
                key={dest.slug}
                href={`/best-gyms/${dest.slug}`}
                className={styles.linkCard}
              >
                <span>
                  Best Gyms in {dest.name}
                </span>
                <span className={styles.linkCardCount}>
                  {dest.gymCount} gyms
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Main city page — Server Component (crawlable HTML) */
export default async function CityPage({ params }) {
  const { city: citySlug } = await params;
  const city = getCityData(citySlug);

  if (!city) {
    return (
      <main className={styles.page}>
        <Breadcrumbs cityName="Not Found" />
        <h1 className={styles.h1}>City Not Found</h1>
        <p className={styles.intro}>
          We don&apos;t have gym data for this city yet.{" "}
          <a href="/best-gyms" style={{ color: "#c8a84b" }}>
            Browse all cities
          </a>
          .
        </p>
      </main>
    );
  }

  return (
    <>
      <StructuredData city={city} />
      <main className={styles.page}>
        <Breadcrumbs cityName={city.name} />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.h1}>
            Best Gyms in {city.name} ({city.year})
          </h1>
          <p className={styles.subtitle}>
            {city.country} · {city.gyms.length} top-rated gyms · Updated{" "}
            {city.year}
          </p>
          <p className={styles.intro}>{city.description}</p>
        </header>

        {/* City Summary */}
        <h2 className={styles.sectionTitle}>
          {city.name} Gym Scene at a Glance
        </h2>
        <CitySummary city={city} />

        {/* Ranked Gyms */}
        <h2 className={styles.sectionTitle}>
          Top {city.gyms.length} Gyms in {city.name}
        </h2>
        {city.gyms.map((gym, i) => (
          <GymCard key={gym.name} gym={gym} rank={i + 1} />
        ))}

        {/* FAQ */}
        <FAQSection faqs={city.faqs} />

        {/* Internal Links */}
        <InternalLinks slug={city.slug} />

        {/* CTA */}
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>
            Find Your Perfect Gym in {city.name}
          </h2>
          <p className={styles.ctaText}>
            Use Iron Passport&apos;s AI-powered search to get personalized gym
            recommendations based on your training style and trip details.
          </p>
          <a href="/" className={styles.ctaButton}>
            Search Gyms Now
          </a>
        </div>

        {/* Browse all cities link */}
        <p style={{ textAlign: "center", marginTop: 24, color: "#64748b", fontSize: 14 }}>
          <a href="/best-gyms" style={{ color: "#c8a84b" }}>
            ← Browse all city gym guides
          </a>
        </p>
      </main>
    </>
  );
}
