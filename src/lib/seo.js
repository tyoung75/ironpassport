/**
 * SEO utilities for Iron Passport
 * Centralized metadata, structured data, and canonical helpers.
 */

const SITE_URL = "https://ironpassport.com";
const SITE_NAME = "Iron Passport";
const DEFAULT_TITLE = "Iron Passport – Find the Best Gyms Wherever You Travel";
const DEFAULT_DESCRIPTION =
  "Find, compare, and review gyms worldwide. AI-powered gym rankings for business trips, vacations, and adventures. Day passes, scores, and travel times.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Build Next.js metadata object for a page.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  noindex = false,
  ogImage,
} = {}) {
  const url = `${SITE_URL}${path.endsWith("/") ? path : path + "/"}`;
  const meta = {
    title: title || DEFAULT_TITLE,
    description: description || DEFAULT_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title || DEFAULT_TITLE,
      description: description || DEFAULT_DESCRIPTION,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: ogImage || OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title || DEFAULT_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title || DEFAULT_TITLE,
      description: description || DEFAULT_DESCRIPTION,
      images: [ogImage || OG_IMAGE],
    },
  };

  if (noindex) {
    meta.robots = { index: false, follow: false };
  }

  return meta;
}

/**
 * Generate JSON-LD WebSite schema for the homepage.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate JSON-LD Organization schema.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: [],
  };
}

/**
 * Generate JSON-LD BreadcrumbList schema.
 * @param {Array<{name: string, url: string}>} items
 */
export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate JSON-LD FAQPage schema.
 * @param {Array<{question: string, answer: string}>} faqs
 */
export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD LocalBusiness schema for a gym.
 */
export function gymSchema(gym) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    name: gym.name,
    description: gym.description || gym.whyRecommended,
  };
  if (gym.address) schema.address = { "@type": "PostalAddress", streetAddress: gym.address };
  if (gym.city) {
    schema.address = schema.address || { "@type": "PostalAddress" };
    schema.address.addressLocality = gym.city;
  }
  if (gym.contactPhone) schema.telephone = gym.contactPhone;
  if (gym.contactEmail) schema.email = gym.contactEmail;
  if (gym.contactWebsite) schema.url = gym.contactWebsite;
  return schema;
}

/**
 * Generate JSON-LD for a city / destination page.
 */
export function citySchema(cityName, gyms = []) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best Gyms in ${cityName}`,
    description: `Top-rated gyms for travelers visiting ${cityName}`,
    numberOfItems: gyms.length,
    itemListElement: gyms.map((gym, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: gymSchema(gym),
    })),
  };
}

/**
 * Render a JSON-LD script tag string (for use in dangerouslySetInnerHTML).
 */
export function jsonLdScript(schema) {
  return JSON.stringify(schema);
}

export { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, OG_IMAGE };
