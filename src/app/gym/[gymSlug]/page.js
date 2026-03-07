import { GYMS, getGymBySlug, getSimilarGyms, getGymsByCity } from "../../../data/gyms";
import GymProfileClient from "./GymProfileClient";

const SITE_URL = "https://www.ironpassport.com";

/**
 * Generate static params for all gym profile pages.
 */
export function generateStaticParams() {
  return GYMS.map((g) => ({ gymSlug: g.slug }));
}

/**
 * Generate SEO metadata for each gym page.
 */
export async function generateMetadata({ params }) {
  const { gymSlug } = await params;
  const gym = getGymBySlug(gymSlug);
  if (!gym) {
    return { title: "Gym Not Found | Iron Passport" };
  }

  const title = `${gym.name} Day Pass, Amenities & Review | Iron Passport`;
  const description = `${gym.name} in ${gym.neighborhood ? gym.neighborhood + ", " : ""}${gym.city}: ${gym.dayPassPrice ? `day pass from ${gym.dayPassPrice}` : "day pass info"}, equipment scores, cleanliness rating, recovery amenities, and nearby hotels for traveling lifters.`;
  const url = `${SITE_URL}/gym/${gym.slug}/`;

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
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Build JSON-LD structured data for this gym page.
 */
function buildStructuredData(gym) {
  const schemas = [];

  // LocalBusiness / SportsActivityLocation
  const business = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    name: gym.name,
    description: gym.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: gym.address,
      addressLocality: gym.city,
      addressCountry: gym.country,
    },
    url: gym.contactWebsite || `${SITE_URL}/gym/${gym.slug}/`,
  };
  if (gym.contactPhone) business.telephone = gym.contactPhone;
  if (gym.contactEmail) business.email = gym.contactEmail;
  if (gym.latitude && gym.longitude) {
    business.geo = {
      "@type": "GeoCoordinates",
      latitude: gym.latitude,
      longitude: gym.longitude,
    };
  }
  if (gym.dayPassPrice) {
    business.priceRange = gym.dayPassPrice;
  }
  if (gym.overallScore) {
    business.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (gym.overallScore / 20).toFixed(1), // convert 0-100 to 0-5
      bestRating: "5",
      worstRating: "1",
      ratingCount: 1,
    };
  }
  schemas.push(business);

  // BreadcrumbList
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Best Gyms in ${gym.city}`,
        item: `${SITE_URL}/city/${gym.citySlug}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: gym.name,
        item: `${SITE_URL}/gym/${gym.slug}/`,
      },
    ],
  });

  // FAQPage
  const faqs = [];
  if (gym.dayPassPrice) {
    faqs.push({
      "@type": "Question",
      name: `How much is a day pass at ${gym.name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `A day pass at ${gym.name} costs ${gym.dayPassPrice}.${gym.passNotes ? " " + gym.passNotes : ""}`,
      },
    });
  }
  faqs.push({
    "@type": "Question",
    name: `What type of gym is ${gym.name}?`,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${gym.name} is a ${gym.type} located in ${gym.neighborhood ? gym.neighborhood + ", " : ""}${gym.city}, ${gym.country}.`,
    },
  });
  if (gym.equipmentList && gym.equipmentList.length > 0) {
    faqs.push({
      "@type": "Question",
      name: `What equipment does ${gym.name} have?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${gym.name} features: ${gym.equipmentList.join(", ")}.`,
      },
    });
  }
  if (gym.recoveryAmenities && gym.recoveryAmenities.length > 0) {
    faqs.push({
      "@type": "Question",
      name: `Does ${gym.name} have recovery amenities?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes, ${gym.name} offers: ${gym.recoveryAmenities.join(", ")}.`,
      },
    });
  }

  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs,
    });
  }

  return schemas;
}

/**
 * Gym profile page — server component for SEO.
 */
export default async function GymProfilePage({ params }) {
  const { gymSlug } = await params;
  const gym = getGymBySlug(gymSlug);

  if (!gym) {
    return (
      <div style={{ minHeight: "100vh", background: "#090807", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
        <div style={{ textAlign: "center", color: "#f0ebe0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 28, marginBottom: 8 }}>Gym Not Found</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>This gym page doesn't exist yet.</p>
          <a href="/" style={{ color: "#c8a84b", fontSize: 14, marginTop: 16, display: "inline-block" }}>Back to Iron Passport</a>
        </div>
      </div>
    );
  }

  const similarGyms = getSimilarGyms(gym);
  const cityGyms = getGymsByCity(gym.city);
  const structuredData = buildStructuredData(gym);

  return (
    <>
      {structuredData.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <GymProfileClient gym={gym} similarGyms={similarGyms} cityGyms={cityGyms} />
    </>
  );
}
