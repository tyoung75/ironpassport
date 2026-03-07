/**
 * @deprecated — This file is no longer used by any page component.
 * Data now comes from Supabase via src/lib/data.js.
 * Helper functions moved to src/lib/city-helpers.js.
 * This file is only kept for the one-time migration script (scripts/migrate-data.mjs).
 * Safe to delete after migration is complete.
 */

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Data freshness rules.
 * - Gym data older than STALE_DAYS without verification is considered stale.
 * - Verified data has a longer window (REVERIFY_DAYS) before needing refresh.
 * - Static city pages are regenerated at build time; dynamic pages should
 *   revalidate every REVALIDATE_SECONDS to pick up DB changes.
 */
export const FRESHNESS = {
  STALE_DAYS: 90,           // Unverified data goes stale after 90 days
  REVERIFY_DAYS: 180,       // Verified data needs re-check after 180 days
  REVALIDATE_SECONDS: 86400, // ISR: re-render pages at most once per day (86400s)
};

/** Check if a gym record is stale based on updated_at / verified_at */
export function isGymStale(gym) {
  const now = Date.now();
  const staleCutoff = now - FRESHNESS.STALE_DAYS * 86400000;
  const reverifyCutoff = now - FRESHNESS.REVERIFY_DAYS * 86400000;
  const updatedAt = gym.updated_at ? new Date(gym.updated_at).getTime() : 0;
  const verifiedAt = gym.verified_at ? new Date(gym.verified_at).getTime() : 0;
  if (verifiedAt && verifiedAt > reverifyCutoff) return false;
  return updatedAt < staleCutoff;
}

/** Converts a city name to a URL slug */
export function cityToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Converts a slug back to a display name (used as fallback) */
export function slugToCity(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Generate a stable, unique slug for a gym from name + city.
 * Matches the DB slug format: "gym-name-city-name"
 */
export function gymSlug(gym) {
  const name = (gym.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const city = (gym.city || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${name}-${city}`;
}

/** Generate a gym profile page path from gym data */
export function gymToPath(gym) {
  return `/gym/${gymSlug(gym)}`;
}

/** Scoring criteria with weights — matches IronPassport.jsx */
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

/**
 * Generate city-specific FAQs.
 * TODO: Replace with hand-written FAQs per city for better SEO.
 */
function generateCityFAQs(cityName, country) {
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
      answer: `Day pass prices in ${cityName} typically range from $10 to $40, with most mid-range gyms charging $15–$25. Premium facilities with recovery amenities, pools, or saunas may charge more. Weekly passes often offer better value for stays longer than 3 days.`,
    },
    {
      question: `What gym equipment is standard in ${cityName} gyms?`,
      answer: `Most top-rated gyms in ${cityName} offer free weights, power racks, cable machines, and cardio equipment. Higher-rated facilities include specialty equipment like competition benches, platforms, and recovery tools such as saunas and cold plunge pools.`,
    },
  ];
}

/**
 * Full city data. Each entry represents one city page.
 *
 * DATA NOTES:
 * - `gyms` arrays contain sample data. Replace with real gym data from
 *   Supabase queries or API calls for production.
 * - `nearbyDestinations` should list slugs of nearby cities that also
 *   have pages (for internal linking).
 * - `relatedCities` are thematically related cities (similar vibe, etc.)
 */
const CITY_DATA = {
  "new-york": {
    name: "New York",
    country: "United States",
    region: "Northeast",
    description: `New York City is a world-class fitness destination with gyms ranging from gritty powerlifting dens to luxury wellness clubs. Whether you're visiting Manhattan for business or exploring Brooklyn, you'll find top-tier training facilities within walking distance of most hotels.`,
    nearbyDestinations: ["boston", "philadelphia"],
    relatedCities: ["los-angeles", "chicago", "london"],
    gyms: [
      {
        name: "Dogpound NYC",
        type: "Luxury Club",
        address: "275 Bowery, New York, NY 10002",
        neighborhood: "Lower East Side",
        city: "New York",
        country: "United States",
        description: "Celebrity-favorite high-end training facility with top-tier equipment and personal trainers. Known for its intense atmosphere and results-driven approach.",
        scores: { equipment: 95, cleanliness: 96, amenities: 90, staff: 94, atmosphere: 92, value: 55, recovery: 88, classes: 82 },
        dayPassPrice: "$40",
        weekPassPrice: null,
        passNotes: "By reservation only",
        contactWebsite: "https://dogpound.com",
        tags: ["luxury", "personal-training", "celebrity"],
        highlights: [{ icon: "💎", label: "Vibe", value: "Ultra-premium" }, { icon: "🏋️", label: "Equipment", value: "World-class" }, { icon: "⭐", label: "Trainers", value: "Elite-level" }, { icon: "📍", label: "Location", value: "Lower East Side" }],
      },
      {
        name: "Mid City Gym",
        type: "Traditional Gym",
        address: "243 W 49th St, New York, NY 10019",
        neighborhood: "Midtown",
        city: "New York",
        country: "United States",
        description: "Midtown's go-to gym for serious lifters with a no-nonsense atmosphere. Great free weight selection and friendly staff who welcome drop-ins.",
        scores: { equipment: 88, cleanliness: 80, amenities: 70, staff: 85, atmosphere: 90, value: 82, recovery: 60, classes: 55 },
        dayPassPrice: "$20",
        weekPassPrice: "$60",
        passNotes: "Walk-ins welcome",
        contactWebsite: null,
        tags: ["traditional", "free-weights", "midtown"],
        highlights: [{ icon: "💪", label: "Vibe", value: "Old-school iron" }, { icon: "🏋️", label: "Free Weights", value: "Extensive" }, { icon: "💰", label: "Day Pass", value: "$20" }, { icon: "📍", label: "Location", value: "Times Square area" }],
      },
      {
        name: "Equinox Hudson Yards",
        type: "Luxury Club",
        address: "35 Hudson Yards, New York, NY 10001",
        neighborhood: "Hudson Yards",
        city: "New York",
        country: "United States",
        description: "Flagship Equinox location in the iconic Hudson Yards development. Features rooftop pool, extensive recovery facilities, and premium equipment throughout.",
        scores: { equipment: 94, cleanliness: 95, amenities: 96, staff: 88, atmosphere: 85, value: 50, recovery: 92, classes: 90 },
        dayPassPrice: "$40",
        weekPassPrice: null,
        passNotes: "Guest pass through member referral",
        contactWebsite: "https://equinox.com",
        tags: ["luxury", "pool", "recovery", "classes"],
        highlights: [{ icon: "🏊", label: "Pool", value: "Rooftop" }, { icon: "🧖", label: "Recovery", value: "Sauna + steam" }, { icon: "🏙️", label: "Views", value: "Hudson River" }, { icon: "📍", label: "Location", value: "Hudson Yards" }],
      },
      {
        name: "Bev Francis Powerhouse Gym",
        type: "Powerlifting / Olympic",
        address: "77 Heisser Ct, Farmingdale, NY 11735",
        neighborhood: "Long Island",
        city: "New York",
        country: "United States",
        description: "Legendary bodybuilding gym with competition-grade equipment and an atmosphere that inspires PRs. A pilgrimage site for serious lifters.",
        scores: { equipment: 96, cleanliness: 78, amenities: 65, staff: 80, atmosphere: 98, value: 85, recovery: 55, classes: 40 },
        dayPassPrice: "$20",
        weekPassPrice: "$50",
        passNotes: "Walk-ins welcome, lockers available",
        contactWebsite: "https://bevfrancis.com",
        tags: ["bodybuilding", "powerlifting", "legendary"],
        highlights: [{ icon: "🏆", label: "Status", value: "Legendary" }, { icon: "💪", label: "Equipment", value: "Competition-grade" }, { icon: "🔥", label: "Atmosphere", value: "Hardcore" }, { icon: "💰", label: "Day Pass", value: "$20" }],
      },
      {
        name: "Chelsea Piers Fitness",
        type: "Luxury Club",
        address: "62 Chelsea Piers, New York, NY 10011",
        neighborhood: "Chelsea",
        city: "New York",
        country: "United States",
        description: "Massive 150,000 sq ft facility on the Hudson River with pools, rock climbing, boxing ring, and extensive gym floor. Perfect for travelers wanting variety.",
        scores: { equipment: 90, cleanliness: 88, amenities: 95, staff: 82, atmosphere: 80, value: 60, recovery: 85, classes: 92 },
        dayPassPrice: "$35",
        weekPassPrice: "$100",
        passNotes: "Day passes available at front desk",
        contactWebsite: "https://chelseapiers.com/fitness",
        tags: ["mega-gym", "pool", "climbing", "boxing"],
        highlights: [{ icon: "📐", label: "Size", value: "150,000 sq ft" }, { icon: "🧗", label: "Extras", value: "Climbing wall" }, { icon: "🏊", label: "Pool", value: "Indoor pool" }, { icon: "📍", label: "Location", value: "Waterfront" }],
      },
    ],
  },
  austin: {
    name: "Austin",
    country: "United States",
    region: "South",
    description: `Austin's fitness scene matches its "Keep It Weird" ethos — you'll find everything from outdoor boot camps on Town Lake to serious powerlifting gyms in warehouse spaces. The city's health-conscious culture means travelers have excellent options year-round.`,
    nearbyDestinations: ["houston", "dallas", "san-antonio"],
    relatedCities: ["denver", "nashville", "portland"],
    gyms: [
      {
        name: "Castle Hill Fitness",
        type: "Traditional Gym",
        address: "1112 N Lamar Blvd, Austin, TX 78703",
        neighborhood: "Castle Hill",
        city: "Austin",
        country: "United States",
        description: "Austin's premier independent gym with a strong community feel. Excellent free weights, functional training area, and group classes.",
        scores: { equipment: 88, cleanliness: 86, amenities: 82, staff: 90, atmosphere: 88, value: 75, recovery: 78, classes: 85 },
        dayPassPrice: "$20",
        weekPassPrice: "$55",
        passNotes: "Walk-ins welcome",
        contactWebsite: "https://castlehillfitness.com",
        tags: ["independent", "community", "classes"],
        highlights: [{ icon: "🏠", label: "Vibe", value: "Community-driven" }, { icon: "💪", label: "Equipment", value: "Comprehensive" }, { icon: "🧘", label: "Classes", value: "Wide variety" }, { icon: "📍", label: "Location", value: "Central Austin" }],
      },
      {
        name: "Hyde Park Gym",
        type: "Powerlifting / Olympic",
        address: "4125 Guadalupe St, Austin, TX 78751",
        neighborhood: "Hyde Park",
        city: "Austin",
        country: "United States",
        description: "No-frills hardcore gym that's an Austin institution. Legendary among local lifters for its raw atmosphere and solid equipment.",
        scores: { equipment: 85, cleanliness: 72, amenities: 55, staff: 80, atmosphere: 95, value: 90, recovery: 40, classes: 30 },
        dayPassPrice: "$10",
        weekPassPrice: "$30",
        passNotes: "Cash preferred",
        contactWebsite: null,
        tags: ["hardcore", "powerlifting", "old-school"],
        highlights: [{ icon: "🔥", label: "Vibe", value: "Hardcore" }, { icon: "💰", label: "Value", value: "Unbeatable" }, { icon: "🏋️", label: "Focus", value: "Powerlifting" }, { icon: "📍", label: "Location", value: "Hyde Park" }],
      },
      {
        name: "Big Tex Gym",
        type: "Traditional Gym",
        address: "6200 N Lamar Blvd, Austin, TX 78752",
        neighborhood: "North Lamar",
        city: "Austin",
        country: "United States",
        description: "Spacious gym with solid equipment selection and a welcoming atmosphere. Great for out-of-town visitors who want a reliable workout.",
        scores: { equipment: 82, cleanliness: 80, amenities: 72, staff: 85, atmosphere: 82, value: 85, recovery: 55, classes: 60 },
        dayPassPrice: "$15",
        weekPassPrice: "$40",
        passNotes: "Walk-ins welcome",
        contactWebsite: null,
        tags: ["traditional", "spacious", "welcoming"],
        highlights: [{ icon: "📐", label: "Size", value: "Spacious" }, { icon: "💰", label: "Day Pass", value: "$15" }, { icon: "👋", label: "Vibe", value: "Welcoming" }, { icon: "📍", label: "Location", value: "North Austin" }],
      },
      {
        name: "Onnit Gym",
        type: "Traditional Gym",
        address: "4401 Freidrich Ln, Austin, TX 78744",
        neighborhood: "South Austin",
        city: "Austin",
        country: "United States",
        description: "The flagship Onnit training facility featuring unconventional equipment, steel maces, battle ropes, and a focus on total human optimization.",
        scores: { equipment: 92, cleanliness: 90, amenities: 85, staff: 88, atmosphere: 90, value: 65, recovery: 82, classes: 88 },
        dayPassPrice: "$25",
        weekPassPrice: "$70",
        passNotes: "Reservations recommended",
        contactWebsite: "https://onnit.com/gym",
        tags: ["functional", "unconventional", "optimization"],
        highlights: [{ icon: "🔧", label: "Equipment", value: "Unconventional" }, { icon: "🧠", label: "Focus", value: "Total optimization" }, { icon: "⚡", label: "Training", value: "Functional" }, { icon: "📍", label: "Location", value: "South Austin" }],
      },
    ],
  },
  london: {
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    description: `London's gym scene is as diverse as the city itself. From elite training facilities in Mayfair to gritty bodybuilding gyms in East London, travelers will find world-class options in every borough. Many gyms offer flexible day pass options perfect for business travelers and tourists.`,
    nearbyDestinations: ["edinburgh", "paris", "dublin"],
    relatedCities: ["new-york", "tokyo", "sydney"],
    gyms: [
      {
        name: "Third Space Canary Wharf",
        type: "Luxury Club",
        address: "Canada Square, London E14 5AH",
        neighborhood: "Canary Wharf",
        city: "London",
        country: "United Kingdom",
        description: "Premium London gym with Olympic pool, combat zone, hypoxic chamber, and top-tier strength equipment. The gold standard for London fitness.",
        scores: { equipment: 95, cleanliness: 94, amenities: 96, staff: 90, atmosphere: 88, value: 50, recovery: 92, classes: 90 },
        dayPassPrice: "£35",
        weekPassPrice: null,
        passNotes: "Day passes available, book online",
        contactWebsite: "https://thirdspace.london",
        tags: ["luxury", "pool", "combat", "recovery"],
        highlights: [{ icon: "🏊", label: "Pool", value: "Olympic-size" }, { icon: "🥊", label: "Combat", value: "Full zone" }, { icon: "🧖", label: "Recovery", value: "Extensive" }, { icon: "📍", label: "Location", value: "Canary Wharf" }],
      },
      {
        name: "Muscleworks Gym",
        type: "Powerlifting / Olympic",
        address: "148 Curtain Rd, London EC2A 3AT",
        neighborhood: "Shoreditch",
        city: "London",
        country: "United Kingdom",
        description: "East London's premier bodybuilding gym with a serious, focused atmosphere. Packed with heavy iron and frequented by competitive lifters.",
        scores: { equipment: 90, cleanliness: 76, amenities: 62, staff: 78, atmosphere: 94, value: 80, recovery: 50, classes: 35 },
        dayPassPrice: "£12",
        weekPassPrice: "£35",
        passNotes: "Walk-ins welcome",
        contactWebsite: "https://muscleworksgym.co.uk",
        tags: ["bodybuilding", "hardcore", "east-london"],
        highlights: [{ icon: "💪", label: "Vibe", value: "Hardcore" }, { icon: "🏋️", label: "Equipment", value: "Heavy iron" }, { icon: "💰", label: "Value", value: "Great" }, { icon: "📍", label: "Location", value: "Shoreditch" }],
      },
      {
        name: "1Rebel",
        type: "HIIT / Bootcamp",
        address: "63 St Mary Axe, London EC3A 8AA",
        neighborhood: "City of London",
        city: "London",
        country: "United Kingdom",
        description: "High-energy boutique fitness studio with nightclub-inspired atmosphere. Classes include Ride (cycling), Reshape (HIIT), and Rumble (boxing).",
        scores: { equipment: 85, cleanliness: 92, amenities: 88, staff: 86, atmosphere: 92, value: 60, recovery: 65, classes: 95 },
        dayPassPrice: "£25",
        weekPassPrice: null,
        passNotes: "Book per class",
        contactWebsite: "https://1rebel.com",
        tags: ["boutique", "hiit", "cycling", "boxing"],
        highlights: [{ icon: "🎵", label: "Vibe", value: "Nightclub energy" }, { icon: "🥊", label: "Classes", value: "Ride, Reshape, Rumble" }, { icon: "✨", label: "Facilities", value: "Premium" }, { icon: "📍", label: "Location", value: "City of London" }],
      },
      {
        name: "Gymbox Farringdon",
        type: "Traditional Gym",
        address: "78 Turnmill St, London EC1M 5QU",
        neighborhood: "Farringdon",
        city: "London",
        country: "United Kingdom",
        description: "London's most creative gym chain with boxing rings, aerial arts, and DJs during peak hours. Unique atmosphere that makes working out feel like an event.",
        scores: { equipment: 86, cleanliness: 88, amenities: 85, staff: 82, atmosphere: 90, value: 65, recovery: 70, classes: 92 },
        dayPassPrice: "£20",
        weekPassPrice: "£55",
        passNotes: "Day passes at reception",
        contactWebsite: "https://gymbox.com",
        tags: ["creative", "boxing", "dj", "unique"],
        highlights: [{ icon: "🎧", label: "Extras", value: "Live DJs" }, { icon: "🥊", label: "Boxing", value: "Full ring" }, { icon: "🎪", label: "Classes", value: "Aerial arts" }, { icon: "📍", label: "Location", value: "Farringdon" }],
      },
    ],
  },
  "los-angeles": {
    name: "Los Angeles",
    country: "United States",
    region: "West",
    description: `Los Angeles is the birthplace of gym culture. From the legendary Gold's Gym in Venice Beach to cutting-edge studios in West Hollywood, LA offers unmatched variety for fitness travelers. Year-round sunshine means outdoor training is always an option.`,
    nearbyDestinations: ["san-diego", "san-francisco"],
    relatedCities: ["miami", "new-york", "austin"],
    gyms: [
      {
        name: "Gold's Gym Venice",
        type: "Traditional Gym",
        address: "360 Hampton Dr, Venice, CA 90291",
        neighborhood: "Venice Beach",
        city: "Los Angeles",
        country: "United States",
        description: "The 'Mecca of Bodybuilding' — the most famous gym in the world. A pilgrimage for any serious lifter visiting LA.",
        scores: { equipment: 92, cleanliness: 78, amenities: 72, staff: 80, atmosphere: 98, value: 75, recovery: 60, classes: 65 },
        dayPassPrice: "$25",
        weekPassPrice: "$65",
        passNotes: "Day passes at front desk",
        contactWebsite: "https://goldsgym.com/venice",
        tags: ["legendary", "bodybuilding", "venice-beach"],
        highlights: [{ icon: "🏆", label: "Status", value: "The Mecca" }, { icon: "🌊", label: "Location", value: "Venice Beach" }, { icon: "💪", label: "Vibe", value: "Legendary" }, { icon: "📸", label: "Must-see", value: "Wall of fame" }],
      },
      {
        name: "Unbreakable Performance Center",
        type: "Luxury Club",
        address: "8447 Wilshire Blvd, Beverly Hills, CA 90211",
        neighborhood: "Beverly Hills",
        city: "Los Angeles",
        country: "United States",
        description: "High-end performance training center frequented by athletes and celebrities. Features cutting-edge equipment and recovery tech.",
        scores: { equipment: 96, cleanliness: 95, amenities: 92, staff: 94, atmosphere: 90, value: 45, recovery: 95, classes: 80 },
        dayPassPrice: "$50",
        weekPassPrice: null,
        passNotes: "By appointment",
        contactWebsite: "https://unbreakable.com",
        tags: ["elite", "performance", "celebrity", "recovery"],
        highlights: [{ icon: "💎", label: "Tier", value: "Ultra-elite" }, { icon: "🏋️", label: "Equipment", value: "Cutting-edge" }, { icon: "❄️", label: "Recovery", value: "Cryo + plunge" }, { icon: "📍", label: "Location", value: "Beverly Hills" }],
      },
      {
        name: "Barbell Brigade",
        type: "Powerlifting / Olympic",
        address: "1601 Griffith Park Blvd, Los Angeles, CA 90026",
        neighborhood: "Silver Lake",
        city: "Los Angeles",
        country: "United States",
        description: "Community-driven powerlifting and bodybuilding gym founded by Bart Kwan. Welcoming atmosphere with serious equipment.",
        scores: { equipment: 90, cleanliness: 82, amenities: 70, staff: 88, atmosphere: 92, value: 80, recovery: 55, classes: 50 },
        dayPassPrice: "$20",
        weekPassPrice: "$55",
        passNotes: "Drop-ins welcome",
        contactWebsite: "https://barbellbrigade.com",
        tags: ["powerlifting", "community", "content-creator"],
        highlights: [{ icon: "🎥", label: "Known for", value: "YouTube community" }, { icon: "💪", label: "Focus", value: "Powerlifting" }, { icon: "👥", label: "Vibe", value: "Community" }, { icon: "📍", label: "Location", value: "Silver Lake" }],
      },
    ],
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    region: "East Asia",
    description: `Tokyo's fitness scene blends cutting-edge technology with traditional discipline. From massive chain gyms near major stations to tiny underground lifting dens, the city caters to every training style. Language barriers are minimal at most foreigner-friendly facilities.`,
    nearbyDestinations: ["seoul", "shanghai"],
    relatedCities: ["london", "singapore", "hong-kong"],
    gyms: [
      {
        name: "Gold's Gym Harajuku",
        type: "Traditional Gym",
        address: "1-5-8 Jingumae, Shibuya, Tokyo 150-0001",
        neighborhood: "Harajuku",
        city: "Tokyo",
        country: "Japan",
        description: "One of Tokyo's most popular Gold's locations with excellent equipment, English-speaking staff, and a central location near Harajuku Station.",
        scores: { equipment: 88, cleanliness: 92, amenities: 80, staff: 82, atmosphere: 78, value: 70, recovery: 65, classes: 72 },
        dayPassPrice: "¥3,300",
        weekPassPrice: null,
        passNotes: "Day pass (visitor registration required)",
        contactWebsite: "https://goldsgym.jp",
        tags: ["chain", "foreigner-friendly", "central"],
        highlights: [{ icon: "🗾", label: "Access", value: "Foreigner-friendly" }, { icon: "🚉", label: "Transit", value: "2min from station" }, { icon: "🏋️", label: "Equipment", value: "Comprehensive" }, { icon: "📍", label: "Location", value: "Harajuku" }],
      },
      {
        name: "Anytime Fitness Roppongi",
        type: "Traditional Gym",
        address: "6-1-24 Roppongi, Minato, Tokyo 106-0032",
        neighborhood: "Roppongi",
        city: "Tokyo",
        country: "Japan",
        description: "24/7 gym in Tokyo's international district. Perfect for jet-lagged travelers who want to train at odd hours. Clean and well-maintained.",
        scores: { equipment: 78, cleanliness: 90, amenities: 72, staff: 75, atmosphere: 70, value: 75, recovery: 50, classes: 40 },
        dayPassPrice: "¥2,200",
        weekPassPrice: null,
        passNotes: "Members can use global pass; non-members inquire at desk",
        contactWebsite: "https://anytimefitness.co.jp",
        tags: ["24-hour", "international", "convenient"],
        highlights: [{ icon: "🕐", label: "Hours", value: "24/7" }, { icon: "🌍", label: "Access", value: "Global pass accepted" }, { icon: "✨", label: "Cleanliness", value: "Immaculate" }, { icon: "📍", label: "Location", value: "Roppongi" }],
      },
      {
        name: "Total Workout Roppongi Hills",
        type: "Luxury Club",
        address: "Roppongi Hills North Tower B1, 6-2-31 Roppongi, Minato, Tokyo",
        neighborhood: "Roppongi Hills",
        city: "Tokyo",
        country: "Japan",
        description: "Ultra-premium fitness facility in the iconic Roppongi Hills complex. Personal training focused with world-class recovery amenities.",
        scores: { equipment: 92, cleanliness: 96, amenities: 94, staff: 92, atmosphere: 85, value: 45, recovery: 90, classes: 78 },
        dayPassPrice: "¥5,500",
        weekPassPrice: null,
        passNotes: "Trial sessions available, reservation required",
        contactWebsite: "https://totalworkout.jp",
        tags: ["luxury", "personal-training", "recovery"],
        highlights: [{ icon: "💎", label: "Tier", value: "Ultra-premium" }, { icon: "🧖", label: "Recovery", value: "Full spa" }, { icon: "👔", label: "Clientele", value: "Business elite" }, { icon: "📍", label: "Location", value: "Roppongi Hills" }],
      },
    ],
  },
  miami: {
    name: "Miami",
    country: "United States",
    region: "Southeast",
    description: `Miami's fitness culture is fueled by year-round sunshine and a health-conscious, appearance-driven lifestyle. From South Beach outdoor gyms to elite training facilities in Brickell, the city offers diverse options for traveling fitness enthusiasts.`,
    nearbyDestinations: ["orlando", "tampa"],
    relatedCities: ["los-angeles", "austin", "houston"],
    gyms: [
      {
        name: "Iron Addicts Gym",
        type: "Powerlifting / Olympic",
        address: "951 NW 7th Ave, Miami, FL 33136",
        neighborhood: "Overtown",
        city: "Miami",
        country: "United States",
        description: "CT Fletcher's legendary hardcore gym. Raw, intense atmosphere with serious lifters. Not for the faint of heart.",
        scores: { equipment: 88, cleanliness: 70, amenities: 55, staff: 78, atmosphere: 96, value: 85, recovery: 40, classes: 30 },
        dayPassPrice: "$15",
        weekPassPrice: "$40",
        passNotes: "Walk-ins welcome",
        contactWebsite: null,
        tags: ["hardcore", "powerlifting", "legendary"],
        highlights: [{ icon: "🔥", label: "Vibe", value: "Hardcore" }, { icon: "💪", label: "Focus", value: "Heavy lifting" }, { icon: "💰", label: "Value", value: "Excellent" }, { icon: "📍", label: "Location", value: "Central Miami" }],
      },
      {
        name: "Anatomy Fitness",
        type: "Luxury Club",
        address: "1220 Brickell Ave, Miami, FL 33131",
        neighborhood: "Brickell",
        city: "Miami",
        country: "United States",
        description: "Miami's premier luxury fitness club with rooftop pool, full spa, and stunning city views. Popular with business travelers staying in Brickell.",
        scores: { equipment: 90, cleanliness: 94, amenities: 96, staff: 88, atmosphere: 85, value: 50, recovery: 90, classes: 88 },
        dayPassPrice: "$35",
        weekPassPrice: "$100",
        passNotes: "Guest passes available",
        contactWebsite: "https://anatomyfitness.com",
        tags: ["luxury", "pool", "spa", "views"],
        highlights: [{ icon: "🏊", label: "Pool", value: "Rooftop" }, { icon: "🧖", label: "Spa", value: "Full service" }, { icon: "🌇", label: "Views", value: "City skyline" }, { icon: "📍", label: "Location", value: "Brickell" }],
      },
      {
        name: "Elev8tion Fitness",
        type: "Traditional Gym",
        address: "7220 NW 36th St, Miami, FL 33166",
        neighborhood: "Doral",
        city: "Miami",
        country: "United States",
        description: "Well-equipped gym with a strong community feel. Great for travelers staying near the airport area with solid equipment and friendly staff.",
        scores: { equipment: 84, cleanliness: 82, amenities: 75, staff: 86, atmosphere: 82, value: 80, recovery: 60, classes: 70 },
        dayPassPrice: "$15",
        weekPassPrice: "$45",
        passNotes: "Walk-ins welcome",
        contactWebsite: null,
        tags: ["community", "airport-area", "welcoming"],
        highlights: [{ icon: "👥", label: "Vibe", value: "Community" }, { icon: "✈️", label: "Convenience", value: "Near airport" }, { icon: "💰", label: "Day Pass", value: "$15" }, { icon: "📍", label: "Location", value: "Doral" }],
      },
    ],
  },
  chicago: {
    name: "Chicago",
    country: "United States",
    region: "Midwest",
    description: `Chicago's gym scene is as tough as its winters. The city boasts an impressive mix of powerlifting gyms, boxing clubs, and modern fitness studios. Whether you're visiting the Loop for business or exploring Lincoln Park, quality training is always close by.`,
    nearbyDestinations: ["detroit", "minneapolis"],
    relatedCities: ["new-york", "boston", "philadelphia"],
    gyms: [
      {
        name: "Quads Gym",
        type: "Powerlifting / Olympic",
        address: "3727 N Ravenswood Ave, Chicago, IL 60613",
        neighborhood: "Lakeview",
        city: "Chicago",
        country: "United States",
        description: "Chicago's premier powerlifting gym with competition equipment, platforms, and a dedicated strongman area. A must-visit for serious lifters.",
        scores: { equipment: 94, cleanliness: 78, amenities: 62, staff: 85, atmosphere: 95, value: 82, recovery: 50, classes: 45 },
        dayPassPrice: "$15",
        weekPassPrice: "$40",
        passNotes: "Walk-ins welcome",
        contactWebsite: "https://quadsgym.com",
        tags: ["powerlifting", "strongman", "competition"],
        highlights: [{ icon: "🏋️", label: "Focus", value: "Powerlifting" }, { icon: "🏆", label: "Equipment", value: "Competition-grade" }, { icon: "💰", label: "Value", value: "Great" }, { icon: "📍", label: "Location", value: "Lakeview" }],
      },
      {
        name: "East Bank Club",
        type: "Luxury Club",
        address: "500 N Kingsbury St, Chicago, IL 60654",
        neighborhood: "River North",
        city: "Chicago",
        country: "United States",
        description: "Chicago's iconic luxury athletic club spanning 450,000 sq ft with indoor/outdoor pools, tennis courts, and premium gym equipment.",
        scores: { equipment: 90, cleanliness: 92, amenities: 96, staff: 88, atmosphere: 82, value: 50, recovery: 88, classes: 90 },
        dayPassPrice: "$30",
        weekPassPrice: null,
        passNotes: "Guest passes through members",
        contactWebsite: "https://eastbankclub.com",
        tags: ["luxury", "mega-club", "pool", "tennis"],
        highlights: [{ icon: "📐", label: "Size", value: "450,000 sq ft" }, { icon: "🏊", label: "Pools", value: "Indoor + outdoor" }, { icon: "🎾", label: "Extras", value: "Tennis courts" }, { icon: "📍", label: "Location", value: "River North" }],
      },
      {
        name: "Chicago Athletic Club",
        type: "Traditional Gym",
        address: "12 S Michigan Ave, Chicago, IL 60603",
        neighborhood: "The Loop",
        city: "Chicago",
        country: "United States",
        description: "Historic athletic club in the heart of the Loop. Great for business travelers with solid equipment and a classic atmosphere.",
        scores: { equipment: 82, cleanliness: 88, amenities: 85, staff: 84, atmosphere: 80, value: 60, recovery: 75, classes: 78 },
        dayPassPrice: "$25",
        weekPassPrice: "$70",
        passNotes: "Guest passes available",
        contactWebsite: null,
        tags: ["historic", "downtown", "business-friendly"],
        highlights: [{ icon: "🏛️", label: "Vibe", value: "Historic" }, { icon: "💼", label: "Ideal for", value: "Business travel" }, { icon: "🏙️", label: "Location", value: "Michigan Ave" }, { icon: "📍", label: "Area", value: "The Loop" }],
      },
    ],
  },
  denver: {
    name: "Denver",
    country: "United States",
    region: "Mountain West",
    description: `Denver's fitness community thrives at 5,280 feet. The Mile High City's active outdoor culture translates into excellent gym facilities, from CrossFit boxes to climbing gyms. Altitude training here gives an extra edge. Expect a health-conscious, welcoming gym scene.`,
    nearbyDestinations: ["austin", "phoenix"],
    relatedCities: ["austin", "portland", "seattle"],
    gyms: [
      {
        name: "Armbrust Pro Gym",
        type: "Powerlifting / Olympic",
        address: "4444 Morrison Rd, Denver, CO 80219",
        neighborhood: "Westwood",
        city: "Denver",
        country: "United States",
        description: "Denver's most serious bodybuilding and powerlifting gym. Massive facility with competition equipment and a no-nonsense training environment.",
        scores: { equipment: 94, cleanliness: 76, amenities: 65, staff: 82, atmosphere: 95, value: 85, recovery: 55, classes: 40 },
        dayPassPrice: "$12",
        weekPassPrice: "$35",
        passNotes: "Walk-ins welcome",
        contactWebsite: "https://armbrustprogym.com",
        tags: ["bodybuilding", "powerlifting", "competition"],
        highlights: [{ icon: "🏋️", label: "Focus", value: "Bodybuilding" }, { icon: "💪", label: "Equipment", value: "Competition-grade" }, { icon: "💰", label: "Value", value: "Excellent" }, { icon: "📍", label: "Location", value: "Westwood" }],
      },
      {
        name: "Movement RiNo",
        type: "Traditional Gym",
        address: "1155 Canyon Blvd, Denver, CO 80302",
        neighborhood: "RiNo",
        city: "Denver",
        country: "United States",
        description: "Massive climbing gym with extensive fitness floor. Perfect for travelers who want both climbing and traditional training under one roof.",
        scores: { equipment: 85, cleanliness: 90, amenities: 88, staff: 86, atmosphere: 88, value: 70, recovery: 72, classes: 82 },
        dayPassPrice: "$25",
        weekPassPrice: "$60",
        passNotes: "Day passes include climbing and gym",
        contactWebsite: "https://movementgyms.com",
        tags: ["climbing", "fitness", "community"],
        highlights: [{ icon: "🧗", label: "Climbing", value: "World-class walls" }, { icon: "💪", label: "Gym", value: "Full fitness floor" }, { icon: "👥", label: "Vibe", value: "Community" }, { icon: "📍", label: "Location", value: "RiNo District" }],
      },
      {
        name: "Colorado Athletic Club Tabor Center",
        type: "Luxury Club",
        address: "1200 17th St, Denver, CO 80202",
        neighborhood: "Downtown",
        city: "Denver",
        country: "United States",
        description: "Denver's premier downtown athletic club with pool, full spa, and excellent gym equipment. Ideal for business travelers in the city center.",
        scores: { equipment: 88, cleanliness: 92, amenities: 94, staff: 86, atmosphere: 80, value: 55, recovery: 88, classes: 85 },
        dayPassPrice: "$30",
        weekPassPrice: "$80",
        passNotes: "Guest passes at front desk",
        contactWebsite: "https://wellbridge.com",
        tags: ["luxury", "downtown", "pool", "spa"],
        highlights: [{ icon: "🏊", label: "Pool", value: "Indoor" }, { icon: "🧖", label: "Spa", value: "Full service" }, { icon: "💼", label: "Ideal for", value: "Business travel" }, { icon: "📍", label: "Location", value: "Downtown" }],
      },
    ],
  },
  barcelona: {
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    description: `Barcelona combines Mediterranean lifestyle with serious fitness culture. The city offers everything from beachfront outdoor gyms to high-end training facilities in the Eixample district. Many gyms here cater to international visitors with flexible pass options.`,
    nearbyDestinations: ["madrid", "lisbon"],
    relatedCities: ["miami", "los-angeles", "rome"],
    gyms: [
      {
        name: "DIR Diagonal",
        type: "Luxury Club",
        address: "Carrer de Ganduxer, 25-27, 08021 Barcelona",
        neighborhood: "Sarrià-Sant Gervasi",
        city: "Barcelona",
        country: "Spain",
        description: "Barcelona's leading premium gym chain. The Diagonal location features Olympic pool, extensive free weights, and top-tier facilities.",
        scores: { equipment: 90, cleanliness: 92, amenities: 94, staff: 85, atmosphere: 82, value: 60, recovery: 88, classes: 90 },
        dayPassPrice: "€20",
        weekPassPrice: "€55",
        passNotes: "Day passes available at reception",
        contactWebsite: "https://dir.cat",
        tags: ["premium", "pool", "classes", "central"],
        highlights: [{ icon: "🏊", label: "Pool", value: "Olympic" }, { icon: "🏋️", label: "Equipment", value: "Top-tier" }, { icon: "🧘", label: "Classes", value: "Wide variety" }, { icon: "📍", label: "Location", value: "Upper Barcelona" }],
      },
      {
        name: "McFIT Barcelona",
        type: "Traditional Gym",
        address: "Carrer de Tarragona, 109, 08015 Barcelona",
        neighborhood: "Sants",
        city: "Barcelona",
        country: "Spain",
        description: "Affordable European chain gym with solid equipment and 24/7 access. Great budget option for travelers who just need a reliable workout.",
        scores: { equipment: 78, cleanliness: 80, amenities: 68, staff: 70, atmosphere: 72, value: 90, recovery: 45, classes: 50 },
        dayPassPrice: "€8",
        weekPassPrice: "€20",
        passNotes: "Flexible pass options",
        contactWebsite: "https://mcfit.com",
        tags: ["budget", "24-hour", "chain"],
        highlights: [{ icon: "🕐", label: "Hours", value: "24/7" }, { icon: "💰", label: "Value", value: "Budget-friendly" }, { icon: "🏋️", label: "Equipment", value: "Solid basics" }, { icon: "📍", label: "Location", value: "Sants" }],
      },
      {
        name: "Sagrada Fitness",
        type: "Traditional Gym",
        address: "Carrer de Mallorca, 201, 08036 Barcelona",
        neighborhood: "Eixample",
        city: "Barcelona",
        country: "United States",
        description: "Well-equipped independent gym in the heart of Eixample. Popular with locals and tourists for its central location and quality equipment.",
        scores: { equipment: 84, cleanliness: 85, amenities: 76, staff: 82, atmosphere: 80, value: 78, recovery: 60, classes: 72 },
        dayPassPrice: "€12",
        weekPassPrice: "€35",
        passNotes: "Walk-ins welcome",
        contactWebsite: null,
        tags: ["independent", "central", "tourist-friendly"],
        highlights: [{ icon: "📍", label: "Location", value: "Near Sagrada Familia" }, { icon: "💪", label: "Equipment", value: "Quality" }, { icon: "🌍", label: "Crowd", value: "International" }, { icon: "💰", label: "Day Pass", value: "€12" }],
      },
    ],
  },
  dubai: {
    name: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    description: `Dubai's gym scene reflects the city's love of luxury and excess. World-class facilities with cutting-edge equipment, recovery technology, and premium amenities are the norm. Many hotels include gym access, but dedicated facilities offer a far superior training experience.`,
    nearbyDestinations: ["abu-dhabi", "doha"],
    relatedCities: ["singapore", "tokyo", "london"],
    gyms: [
      {
        name: "Warehouse Gym DIFC",
        type: "Traditional Gym",
        address: "Gate Village 3, DIFC, Dubai",
        neighborhood: "DIFC",
        city: "Dubai",
        country: "United Arab Emirates",
        description: "Dubai's original strength gym with an industrial aesthetic and serious lifters. The DIFC location is perfect for business travelers in the financial district.",
        scores: { equipment: 92, cleanliness: 88, amenities: 80, staff: 86, atmosphere: 92, value: 65, recovery: 70, classes: 75 },
        dayPassPrice: "AED 100",
        weekPassPrice: "AED 250",
        passNotes: "Day passes available",
        contactWebsite: "https://thewarehousegym.com",
        tags: ["strength", "industrial", "business-district"],
        highlights: [{ icon: "🏗️", label: "Vibe", value: "Industrial" }, { icon: "💪", label: "Focus", value: "Strength" }, { icon: "💼", label: "Ideal for", value: "Business travel" }, { icon: "📍", label: "Location", value: "DIFC" }],
      },
      {
        name: "GymNation Al Quoz",
        type: "Traditional Gym",
        address: "Al Quoz Industrial Area 1, Dubai",
        neighborhood: "Al Quoz",
        city: "Dubai",
        country: "United Arab Emirates",
        description: "Massive budget-friendly gym with impressive equipment variety. One of Dubai's best value options without sacrificing quality.",
        scores: { equipment: 86, cleanliness: 82, amenities: 78, staff: 80, atmosphere: 80, value: 92, recovery: 60, classes: 70 },
        dayPassPrice: "AED 50",
        weekPassPrice: "AED 120",
        passNotes: "Walk-ins welcome",
        contactWebsite: "https://gymnation.ae",
        tags: ["budget", "massive", "value"],
        highlights: [{ icon: "📐", label: "Size", value: "Massive" }, { icon: "💰", label: "Value", value: "Best in Dubai" }, { icon: "🏋️", label: "Equipment", value: "Extensive" }, { icon: "📍", label: "Location", value: "Al Quoz" }],
      },
      {
        name: "Fitness First Platinum",
        type: "Luxury Club",
        address: "Mall of the Emirates, Dubai",
        neighborhood: "Al Barsha",
        city: "Dubai",
        country: "United Arab Emirates",
        description: "Premium Fitness First location in Mall of the Emirates with pool, group classes, and luxury amenities. Convenient for tourists.",
        scores: { equipment: 88, cleanliness: 92, amenities: 90, staff: 84, atmosphere: 78, value: 55, recovery: 82, classes: 85 },
        dayPassPrice: "AED 120",
        weekPassPrice: "AED 300",
        passNotes: "Guest passes at reception",
        contactWebsite: "https://fitnessfirstme.com",
        tags: ["luxury", "mall", "pool", "convenient"],
        highlights: [{ icon: "🏊", label: "Pool", value: "Indoor" }, { icon: "🛍️", label: "Location", value: "Mall of Emirates" }, { icon: "✨", label: "Tier", value: "Platinum" }, { icon: "📍", label: "Area", value: "Al Barsha" }],
      },
    ],
  },
  sydney: {
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: `Sydney's fitness culture is shaped by its outdoor lifestyle and beach proximity. The city offers everything from harbourside luxury gyms to no-frills lifting warehouses. Most facilities welcome travelers with flexible day pass options.`,
    nearbyDestinations: ["melbourne", "brisbane"],
    relatedCities: ["los-angeles", "miami", "london"],
    gyms: [
      {
        name: "City Gym Sydney",
        type: "Traditional Gym",
        address: "107 Crown St, Darlinghurst NSW 2010",
        neighborhood: "Darlinghurst",
        city: "Sydney",
        country: "Australia",
        description: "Sydney's most iconic independent gym with a strong community and excellent equipment. A local institution that welcomes travelers.",
        scores: { equipment: 88, cleanliness: 82, amenities: 72, staff: 88, atmosphere: 90, value: 78, recovery: 55, classes: 65 },
        dayPassPrice: "A$22",
        weekPassPrice: "A$55",
        passNotes: "Walk-ins welcome",
        contactWebsite: "https://citygym.com.au",
        tags: ["independent", "community", "iconic"],
        highlights: [{ icon: "🏠", label: "Status", value: "Sydney institution" }, { icon: "💪", label: "Equipment", value: "Comprehensive" }, { icon: "👥", label: "Vibe", value: "Community" }, { icon: "📍", label: "Location", value: "Darlinghurst" }],
      },
      {
        name: "Fitness First Platinum Bond St",
        type: "Luxury Club",
        address: "30 Bond St, Sydney NSW 2000",
        neighborhood: "CBD",
        city: "Sydney",
        country: "Australia",
        description: "Premium gym in Sydney's CBD with excellent equipment, pool, and recovery facilities. Ideal for business travelers staying in the city center.",
        scores: { equipment: 88, cleanliness: 92, amenities: 90, staff: 84, atmosphere: 78, value: 55, recovery: 85, classes: 82 },
        dayPassPrice: "A$35",
        weekPassPrice: "A$90",
        passNotes: "Guest passes at reception",
        contactWebsite: "https://fitnessfirst.com.au",
        tags: ["premium", "cbd", "pool", "recovery"],
        highlights: [{ icon: "🏊", label: "Pool", value: "Indoor" }, { icon: "💼", label: "Ideal for", value: "Business travel" }, { icon: "🧖", label: "Recovery", value: "Sauna + steam" }, { icon: "📍", label: "Location", value: "Sydney CBD" }],
      },
      {
        name: "Bondi Platinum Fitness",
        type: "Traditional Gym",
        address: "34 Campbell Parade, Bondi Beach NSW 2026",
        neighborhood: "Bondi Beach",
        city: "Sydney",
        country: "Australia",
        description: "Steps from Bondi Beach with ocean views from the cardio floor. The perfect post-surf or pre-beach workout spot.",
        scores: { equipment: 80, cleanliness: 84, amenities: 75, staff: 82, atmosphere: 88, value: 68, recovery: 55, classes: 70 },
        dayPassPrice: "A$25",
        weekPassPrice: "A$65",
        passNotes: "Walk-ins welcome",
        contactWebsite: null,
        tags: ["beach", "views", "bondi"],
        highlights: [{ icon: "🌊", label: "Views", value: "Ocean" }, { icon: "🏖️", label: "Location", value: "Bondi Beach" }, { icon: "🏄", label: "Pair with", value: "Surfing" }, { icon: "📍", label: "Area", value: "Bondi" }],
      },
    ],
  },
  singapore: {
    name: "Singapore",
    country: "Singapore",
    region: "Southeast Asia",
    description: `Singapore's compact size means world-class gyms are always a short MRT ride away. The city-state's fitness scene is booming with both international chains and local boutique studios. Expect immaculate facilities, high standards, and air-conditioned comfort.`,
    nearbyDestinations: ["bangkok", "kuala-lumpur"],
    relatedCities: ["tokyo", "hong-kong", "dubai"],
    gyms: [
      {
        name: "Gym Pod",
        type: "Traditional Gym",
        address: "80 Duxton Rd, Singapore 089540",
        neighborhood: "Duxton",
        city: "Singapore",
        country: "Singapore",
        description: "Boutique-style gym with private training pods and excellent free weight selection. Clean, modern, and well-designed for focused training.",
        scores: { equipment: 88, cleanliness: 94, amenities: 80, staff: 86, atmosphere: 85, value: 68, recovery: 65, classes: 55 },
        dayPassPrice: "S$30",
        weekPassPrice: "S$80",
        passNotes: "Walk-ins welcome",
        contactWebsite: null,
        tags: ["boutique", "private", "modern"],
        highlights: [{ icon: "🔒", label: "Privacy", value: "Training pods" }, { icon: "✨", label: "Cleanliness", value: "Immaculate" }, { icon: "🏋️", label: "Equipment", value: "Premium" }, { icon: "📍", label: "Location", value: "Duxton" }],
      },
      {
        name: "True Fitness Suntec City",
        type: "Luxury Club",
        address: "3 Temasek Blvd, Suntec City, Singapore 038983",
        neighborhood: "Marina Bay",
        city: "Singapore",
        country: "Singapore",
        description: "Full-service premium gym with pool, group classes, and extensive recovery amenities. Central location perfect for business travelers.",
        scores: { equipment: 86, cleanliness: 92, amenities: 92, staff: 84, atmosphere: 80, value: 55, recovery: 85, classes: 88 },
        dayPassPrice: "S$40",
        weekPassPrice: "S$100",
        passNotes: "Trial passes available",
        contactWebsite: "https://truefitness.com.sg",
        tags: ["premium", "pool", "central", "business"],
        highlights: [{ icon: "🏊", label: "Pool", value: "Indoor" }, { icon: "🧘", label: "Classes", value: "Extensive" }, { icon: "💼", label: "Ideal for", value: "Business travel" }, { icon: "📍", label: "Location", value: "Suntec City" }],
      },
      {
        name: "The Gym Pod Tanjong Pagar",
        type: "Powerlifting / Olympic",
        address: "72 Tanjong Pagar Rd, Singapore 088493",
        neighborhood: "Tanjong Pagar",
        city: "Singapore",
        country: "Singapore",
        description: "Serious strength-focused gym with platforms, competition racks, and a dedicated lifting community. Singapore's best for powerlifters.",
        scores: { equipment: 92, cleanliness: 88, amenities: 68, staff: 84, atmosphere: 90, value: 72, recovery: 50, classes: 40 },
        dayPassPrice: "S$25",
        weekPassPrice: "S$65",
        passNotes: "Walk-ins welcome",
        contactWebsite: null,
        tags: ["powerlifting", "platforms", "community"],
        highlights: [{ icon: "🏋️", label: "Focus", value: "Powerlifting" }, { icon: "🏆", label: "Equipment", value: "Competition-grade" }, { icon: "👥", label: "Community", value: "Strong" }, { icon: "📍", label: "Location", value: "Tanjong Pagar" }],
      },
    ],
  },
};

/** All available city slugs */
export const ALL_CITY_SLUGS = Object.keys(CITY_DATA);

/** Get city data by slug, returns null if not found */
export function getCityData(slug) {
  const data = CITY_DATA[slug];
  if (!data) return null;

  const gyms = data.gyms.map((gym) => ({
    ...gym,
    overallScore: calcOverallScore(gym.scores),
    profilePath: gymToPath(gym),
  }));

  // Sort by overall score descending
  gyms.sort((a, b) => b.overallScore - a.overallScore);

  return {
    ...data,
    slug,
    gyms,
    faqs: generateCityFAQs(data.name, data.country),
    year: CURRENT_YEAR,
  };
}

/** Get all cities with basic info (for index page and sitemap) */
export function getAllCities() {
  return ALL_CITY_SLUGS.map((slug) => {
    const data = CITY_DATA[slug];
    return {
      slug,
      name: data.name,
      country: data.country,
      region: data.region,
      gymCount: data.gyms.length,
    };
  });
}

/** Get nearby destination data for internal linking */
export function getNearbyDestinations(slug) {
  const data = CITY_DATA[slug];
  if (!data) return [];
  return (data.nearbyDestinations || [])
    .filter((s) => CITY_DATA[s])
    .map((s) => ({
      slug: s,
      name: CITY_DATA[s].name,
      country: CITY_DATA[s].country,
      gymCount: CITY_DATA[s].gyms.length,
    }));
}

/** Get related city data for internal linking */
export function getRelatedCities(slug) {
  const data = CITY_DATA[slug];
  if (!data) return [];
  return (data.relatedCities || [])
    .filter((s) => CITY_DATA[s])
    .map((s) => ({
      slug: s,
      name: CITY_DATA[s].name,
      country: CITY_DATA[s].country,
      gymCount: CITY_DATA[s].gyms.length,
    }));
}
