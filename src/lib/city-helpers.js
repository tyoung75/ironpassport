/**
 * Pure helper functions for city pages.
 * No data fetching — just scoring, colors, and FAQ generation.
 */

const CURRENT_YEAR = new Date().getFullYear();

/** Scoring criteria with weights */
export const GYM_CRITERIA = [
  { key: "equipment", label: "Equipment", icon: "⊕", weight: 0.2 },
  { key: "cleanliness", label: "Cleanliness", icon: "✦", weight: 0.18 },
  { key: "amenities", label: "Amenities", icon: "◉", weight: 0.14 },
  { key: "staff", label: "Staff & Trainers", icon: "◈", weight: 0.12 },
  { key: "atmosphere", label: "Atmosphere", icon: "◎", weight: 0.11 },
  { key: "value", label: "Value", icon: "◇", weight: 0.1 },
  { key: "recovery", label: "Recovery", icon: "⊛", weight: 0.08 },
  { key: "classes", label: "Classes", icon: "◫", weight: 0.07 },
];

export function calcOverallScore(scores) {
  if (!scores) return 0;
  return Math.round(
    GYM_CRITERIA.reduce((a, c) => a + (scores[c.key] || 0) * c.weight, 0)
  );
}

export function scoreColor(s) {
  if (s >= 85) return "#FFD700";
  if (s >= 72) return "#c8a84b";
  if (s >= 58) return "#94a3b8";
  return "#6b7280";
}

/** Generate city-specific FAQs */
export function generateCityFAQs(cityName, country) {
  return [
    {
      question: `What are the best gyms in ${cityName} for travelers?`,
      answer: `Iron Passport ranks the top gyms in ${cityName} based on equipment quality, cleanliness, atmosphere, recovery facilities, and day pass availability. Our ${CURRENT_YEAR} rankings highlight gyms that specifically cater to visiting fitness enthusiasts.`,
    },
    {
      question: `Can I get a day pass at gyms in ${cityName}?`,
      answer: `Yes, many top gyms in ${cityName} offer day passes ranging from $10 to $40 depending on the facility. Some premium gyms also offer weekly passes for extended stays. Check individual gym listings for current pricing.`,
    },
    {
      question: `What should I look for in a ${cityName} gym as a visitor?`,
      answer: `When choosing a gym in ${cityName}, consider proximity to your hotel, day pass availability, equipment variety, cleanliness, and locker/shower facilities. Iron Passport scores gyms on all these criteria so you can find the best fit.`,
    },
    {
      question: `Are there 24-hour gyms in ${cityName}?`,
      answer: `${cityName} has several gyms with extended hours or 24/7 access. Check our detailed gym profiles for hours of operation and whether guest access is available during off-peak hours.`,
    },
    {
      question: `How much does a gym day pass cost in ${cityName}?`,
      answer: `Day pass prices in ${cityName} typically range from $10 to $40, with most mid-range gyms charging $15\u2013$25. Premium facilities with recovery amenities, pools, or saunas may charge more. Weekly passes often offer better value for stays longer than 3 days.`,
    },
    {
      question: `What gym equipment is standard in ${cityName} gyms?`,
      answer: `Most top-rated gyms in ${cityName} offer free weights, power racks, cable machines, and cardio equipment. Higher-rated facilities include specialty equipment like competition benches, platforms, and recovery tools such as saunas and cold plunge pools.`,
    },
  ];
}

export { CURRENT_YEAR };
