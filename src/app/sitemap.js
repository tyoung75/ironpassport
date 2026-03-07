import { getAllGymSlugs, getAllCitySlugs } from "@/lib/data";

export const dynamic = "force-static";

const BASE_URL = "https://ironpassport.com";

export default async function sitemap() {
  const gymSlugs = await getAllGymSlugs();
  const citySlugs = await getAllCitySlugs();

  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/best-gyms`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const cityPages = citySlugs.map((slug) => ({
    url: `${BASE_URL}/best-gyms/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const gymPages = gymSlugs.map((slug) => ({
    url: `${BASE_URL}/gym/${slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const comparePages = citySlugs.map((slug) => ({
    url: `${BASE_URL}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...gymPages, ...comparePages];
}
