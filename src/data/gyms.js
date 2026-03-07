/**
 * @deprecated — This file is no longer used by any page component.
 * Data now comes from Supabase via src/lib/data.js.
 * This file is only kept for the one-time migration script (scripts/migrate-data.mjs).
 * Safe to delete after migration is complete.
 */

import { generateGymSlug, generateCitySlug } from "../lib/slugify.js";

const RAW_GYMS = [
  // ── New York City ──────────────────────────────────────────────────────────
  {
    id: 1,
    name: "Dogpound",
    type: "Luxury Gym",
    address: "275 Bowery, New York, NY 10003",
    neighborhood: "East Village",
    city: "New York City",
    country: "United States",
    description: "Dogpound is a celebrity-favorite luxury training facility in Manhattan's East Village. Known for its personalized training approach and A-list clientele, the gym features top-of-the-line equipment, a sleek industrial-chic interior, and some of NYC's most sought-after trainers. Perfect for travelers who want an elite, no-nonsense workout experience.",
    scores: { equipment: 95, cleanliness: 97, amenities: 88, staff: 96, atmosphere: 92, value: 55, recovery: 82, classes: 78 },
    dayPassPrice: "$50",
    weekPassPrice: "$200",
    passNotes: "Day passes available via app booking. Includes locker and towel service.",
    contactPhone: "+1 212-933-0055",
    contactEmail: null,
    contactWebsite: "https://www.dogpound.com",
    contactInstagram: "@dogpound",
    tags: ["luxury", "celebrity trainers", "personal training", "boutique", "Manhattan"],
    highlights: [
      { icon: "💎", label: "Vibe", value: "Elite & exclusive" },
      { icon: "🏋️", label: "Specialty", value: "Personal training" },
      { icon: "📍", label: "Location", value: "East Village, Manhattan" },
      { icon: "⭐", label: "Known For", value: "Celebrity clientele" },
    ],
    equipmentList: ["Technogym Skill Row", "Assault Bikes", "Custom cable machines", "Free weights to 150lb", "Plyo boxes", "Battle ropes", "TRX stations"],
    recoveryAmenities: ["Cold plunge", "Stretching area", "Foam rollers"],
    hotelProximity: "Walking distance from Bowery Hotel, The Standard East Village. 10-minute cab to most Midtown hotels.",
    nearbyHotels: [
      { name: "Bowery Hotel", distance: "2-minute walk" },
      { name: "The Standard East Village", distance: "5-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },
  {
    id: 2,
    name: "Mid City Gym",
    type: "Traditional Gym",
    address: "243 W 49th St, New York, NY 10019",
    neighborhood: "Midtown",
    city: "New York City",
    country: "United States",
    description: "Mid City Gym is a no-frills, old-school gym in the heart of Times Square. A favorite among Broadway performers and Midtown workers, it offers an honest lifting experience without the premium price tag. The equipment is well-maintained, the atmosphere is welcoming, and day passes make it ideal for traveling lifters.",
    scores: { equipment: 82, cleanliness: 78, amenities: 65, staff: 85, atmosphere: 88, value: 92, recovery: 45, classes: 40 },
    dayPassPrice: "$15",
    weekPassPrice: "$50",
    passNotes: "Cash or card at the front desk. No reservation needed.",
    contactPhone: "+1 212-757-0300",
    contactEmail: null,
    contactWebsite: null,
    contactInstagram: null,
    tags: ["old-school", "affordable", "Midtown", "bodybuilding", "drop-in friendly"],
    highlights: [
      { icon: "💪", label: "Vibe", value: "Old-school iron" },
      { icon: "💰", label: "Value", value: "$15 day pass" },
      { icon: "📍", label: "Location", value: "Times Square area" },
      { icon: "🎭", label: "Known For", value: "Broadway crowd" },
    ],
    equipmentList: ["Full free weight area", "Smith machines", "Cable stations", "Dumbbells to 120lb", "Leg press", "Hack squat"],
    recoveryAmenities: ["Basic stretching area"],
    hotelProximity: "Surrounded by Midtown hotels. Walking distance from most Times Square properties.",
    nearbyHotels: [
      { name: "Marriott Marquis", distance: "3-minute walk" },
      { name: "Hilton Times Square", distance: "5-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },
  {
    id: 3,
    name: "Equinox Hudson Yards",
    type: "Luxury Gym",
    address: "35 Hudson Yards, New York, NY 10001",
    neighborhood: "Hudson Yards",
    city: "New York City",
    country: "United States",
    description: "The flagship Equinox at Hudson Yards is one of the most impressive gym facilities in the world. Spanning multiple floors with floor-to-ceiling windows, a rooftop pool, luxury spa, and every piece of equipment imaginable. This is where fitness meets five-star hospitality.",
    scores: { equipment: 98, cleanliness: 96, amenities: 99, staff: 90, atmosphere: 94, value: 40, recovery: 95, classes: 92 },
    dayPassPrice: "$60",
    weekPassPrice: null,
    passNotes: "Day pass with guest policy. Must be accompanied by a member or purchase directly.",
    contactPhone: "+1 212-367-0044",
    contactEmail: null,
    contactWebsite: "https://www.equinox.com",
    contactInstagram: "@equinox",
    tags: ["luxury", "pool", "spa", "classes", "Hudson Yards", "flagship"],
    highlights: [
      { icon: "🏊", label: "Pool", value: "Rooftop infinity pool" },
      { icon: "🧖", label: "Spa", value: "Full-service spa & sauna" },
      { icon: "📐", label: "Size", value: "60,000+ sq ft" },
      { icon: "🌅", label: "Views", value: "Hudson River panoramas" },
    ],
    equipmentList: ["Full Technogym suite", "Olympic platforms", "Assault runners", "Concept2 rowers", "Dumbbells to 150lb", "Pilates reformers", "Boxing ring"],
    recoveryAmenities: ["Steam room", "Sauna", "Cold plunge", "Spa treatments", "Eucalyptus towels"],
    hotelProximity: "Connected to the Equinox Hotel. 5 minutes from Hudson Yards hotels.",
    nearbyHotels: [
      { name: "Equinox Hotel", distance: "Same building" },
      { name: "The Shed", distance: "2-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Los Angeles ────────────────────────────────────────────────────────────
  {
    id: 4,
    name: "Gold's Gym Venice",
    type: "Bodybuilding Gym",
    address: "360 Hampton Dr, Venice, CA 90291",
    neighborhood: "Venice Beach",
    city: "Los Angeles",
    country: "United States",
    description: "The legendary 'Mecca of Bodybuilding' where Arnold Schwarzenegger trained. Gold's Gym Venice is a pilgrimage site for serious lifters worldwide. The outdoor Muscle Beach section, massive free weight area, and unmistakable atmosphere make this the most iconic gym on Earth for traveling fitness enthusiasts.",
    scores: { equipment: 90, cleanliness: 72, amenities: 70, staff: 78, atmosphere: 99, value: 80, recovery: 55, classes: 65 },
    dayPassPrice: "$25",
    weekPassPrice: "$75",
    passNotes: "Day passes available at the front desk. Expect crowds on weekends.",
    contactPhone: "+1 310-392-6004",
    contactEmail: null,
    contactWebsite: "https://www.goldsgym.com/venice",
    contactInstagram: "@goldsgymvenice",
    tags: ["bodybuilding", "iconic", "Venice Beach", "outdoor", "legendary", "Muscle Beach"],
    highlights: [
      { icon: "🏆", label: "Legacy", value: "Mecca of Bodybuilding" },
      { icon: "🌊", label: "Location", value: "Venice Beach boardwalk" },
      { icon: "💪", label: "Specialty", value: "Free weights & bodybuilding" },
      { icon: "📸", label: "Must-Do", value: "Outdoor Muscle Beach" },
    ],
    equipmentList: ["Massive free weight area", "Hammer Strength full line", "Olympic platforms", "Dumbbells to 200lb", "Cable crossovers", "Outdoor area"],
    recoveryAmenities: ["Stretching area", "Foam rollers"],
    hotelProximity: "Steps from Venice Beach hotels. 15-minute drive from LAX airport hotels.",
    nearbyHotels: [
      { name: "Hotel Erwin", distance: "5-minute walk" },
      { name: "Venice V Hotel", distance: "8-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },
  {
    id: 5,
    name: "Unbreakable Performance Center",
    type: "Performance Gym",
    address: "8447 Wilshire Blvd, Beverly Hills, CA 90211",
    neighborhood: "Beverly Hills",
    city: "Los Angeles",
    country: "United States",
    description: "Founded by celebrity trainer Jay Glazer, Unbreakable Performance Center caters to professional athletes and actors. With MMA training areas, a turf field, and heavy-duty lifting equipment, this is where LA's elite come to push their limits. Day passes are available but limited.",
    scores: { equipment: 94, cleanliness: 90, amenities: 85, staff: 95, atmosphere: 93, value: 50, recovery: 88, classes: 80 },
    dayPassPrice: "$40",
    weekPassPrice: "$150",
    passNotes: "Limited day passes. Book in advance via website.",
    contactPhone: "+1 310-657-0200",
    contactEmail: null,
    contactWebsite: "https://www.unbreakableperformance.com",
    contactInstagram: "@unbreakableperformance",
    tags: ["performance", "celebrity", "MMA", "Beverly Hills", "athlete training"],
    highlights: [
      { icon: "🥊", label: "MMA", value: "Full MMA training area" },
      { icon: "🏈", label: "Athletes", value: "Pro athlete clientele" },
      { icon: "🌿", label: "Turf", value: "Indoor turf field" },
      { icon: "⭐", label: "Founded By", value: "Jay Glazer" },
    ],
    equipmentList: ["Turf field", "MMA cage", "Olympic platforms", "Prowler sleds", "Battle ropes", "Kettlebells", "Dumbbells to 150lb"],
    recoveryAmenities: ["Cryotherapy", "Cold plunge", "Infrared sauna", "Massage"],
    hotelProximity: "Central Beverly Hills location. Walking distance from luxury hotels on Wilshire.",
    nearbyHotels: [
      { name: "Beverly Wilshire", distance: "5-minute walk" },
      { name: "SLS Beverly Hills", distance: "3-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Chicago ────────────────────────────────────────────────────────────────
  {
    id: 6,
    name: "Quads Gym",
    type: "Powerlifting Gym",
    address: "3727 N Ravenswood Ave, Chicago, IL 60613",
    neighborhood: "Lakeview",
    city: "Chicago",
    country: "United States",
    description: "Quads Gym is Chicago's premier hardcore lifting destination. With competition-grade equipment, chalk-friendly policies, and a community of serious lifters, it's the go-to spot for powerlifters and bodybuilders visiting the Windy City. The no-nonsense atmosphere and competitive pricing make it a traveler favorite.",
    scores: { equipment: 92, cleanliness: 80, amenities: 60, staff: 88, atmosphere: 95, value: 88, recovery: 50, classes: 35 },
    dayPassPrice: "$15",
    weekPassPrice: "$45",
    passNotes: "Walk-ins welcome. Cash or card.",
    contactPhone: "+1 773-472-4500",
    contactEmail: null,
    contactWebsite: "https://www.quadsgym.com",
    contactInstagram: "@quadsgym",
    tags: ["powerlifting", "hardcore", "chalk friendly", "Lakeview", "affordable"],
    highlights: [
      { icon: "🏋️", label: "Focus", value: "Powerlifting & bodybuilding" },
      { icon: "💰", label: "Day Pass", value: "$15" },
      { icon: "🔩", label: "Equipment", value: "Competition-grade" },
      { icon: "🏙️", label: "Area", value: "Lakeview, near Wrigley" },
    ],
    equipmentList: ["Eleiko bars & plates", "Mono lift", "Reverse hyper", "GHR", "Belt squat", "Dumbbells to 175lb", "Strongman implements"],
    recoveryAmenities: ["Foam rollers", "Stretching mats"],
    hotelProximity: "10-minute Uber from downtown Loop hotels. Near Wrigleyville accommodations.",
    nearbyHotels: [
      { name: "Hotel Zachary", distance: "10-minute walk" },
      { name: "Hyatt Regency Chicago", distance: "15-minute drive" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Miami ──────────────────────────────────────────────────────────────────
  {
    id: 7,
    name: "Elev8tion Fitness",
    type: "Premium Gym",
    address: "1676 Alton Rd, Miami Beach, FL 33139",
    neighborhood: "South Beach",
    city: "Miami",
    country: "United States",
    description: "Elev8tion Fitness is South Beach's top gym for serious lifters. With a massive free weight area, ocean-close location, and late-night hours, it fits perfectly into the Miami Beach lifestyle. The gym attracts a mix of local athletes, bodybuilders, and fitness-minded travelers.",
    scores: { equipment: 88, cleanliness: 85, amenities: 75, staff: 82, atmosphere: 90, value: 78, recovery: 60, classes: 55 },
    dayPassPrice: "$20",
    weekPassPrice: "$60",
    passNotes: "Day passes at the desk. Extended hours until midnight on weekends.",
    contactPhone: "+1 305-534-4400",
    contactEmail: null,
    contactWebsite: null,
    contactInstagram: "@elev8tionfitness",
    tags: ["South Beach", "bodybuilding", "late night", "free weights", "Miami"],
    highlights: [
      { icon: "🌊", label: "Location", value: "Steps from South Beach" },
      { icon: "🌙", label: "Hours", value: "Open until midnight" },
      { icon: "💪", label: "Focus", value: "Free weights & bodybuilding" },
      { icon: "🌴", label: "Vibe", value: "Miami Beach energy" },
    ],
    equipmentList: ["Full dumbbell rack to 150lb", "Multiple squat racks", "Hammer Strength machines", "Cable crossovers", "Leg press stations"],
    recoveryAmenities: ["Stretching area", "Foam rollers"],
    hotelProximity: "Central South Beach. Walking distance from most Ocean Drive and Collins Ave hotels.",
    nearbyHotels: [
      { name: "The Setai", distance: "8-minute walk" },
      { name: "Faena Hotel", distance: "10-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Austin ─────────────────────────────────────────────────────────────────
  {
    id: 8,
    name: "Castle Hill Fitness",
    type: "Full-Service Gym",
    address: "1112 N Lamar Blvd, Austin, TX 78703",
    neighborhood: "Downtown",
    city: "Austin",
    country: "United States",
    description: "Castle Hill Fitness is Austin's premier independent gym, blending serious training facilities with a wellness-focused approach. The downtown location features a beautiful outdoor pool, extensive group fitness schedule, and a welcoming atmosphere that embodies the 'Keep Austin Weird' spirit.",
    scores: { equipment: 86, cleanliness: 90, amenities: 88, staff: 92, atmosphere: 90, value: 75, recovery: 78, classes: 85 },
    dayPassPrice: "$25",
    weekPassPrice: "$75",
    passNotes: "Day and week passes available online or at front desk.",
    contactPhone: "+1 512-478-4567",
    contactEmail: "info@castlehillfitness.com",
    contactWebsite: "https://www.castlehillfitness.com",
    contactInstagram: "@castlehillfitness",
    tags: ["independent", "pool", "classes", "downtown Austin", "wellness"],
    highlights: [
      { icon: "🏊", label: "Pool", value: "Outdoor pool & sundeck" },
      { icon: "🧘", label: "Classes", value: "60+ classes per week" },
      { icon: "🌳", label: "Location", value: "Near Zilker Park" },
      { icon: "🤝", label: "Community", value: "Welcoming to visitors" },
    ],
    equipmentList: ["Free weights", "Functional training area", "Cardio deck", "Yoga studio", "Pilates reformers", "Olympic platforms"],
    recoveryAmenities: ["Sauna", "Steam room", "Massage therapy", "Outdoor pool"],
    hotelProximity: "Central downtown Austin. 5 minutes from most Congress Ave hotels.",
    nearbyHotels: [
      { name: "Hotel San José", distance: "10-minute walk" },
      { name: "W Austin", distance: "8-minute drive" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Denver ─────────────────────────────────────────────────────────────────
  {
    id: 9,
    name: "Armbrust Pro Gym",
    type: "Bodybuilding Gym",
    address: "6800 E Hampden Ave, Denver, CO 80224",
    neighborhood: "Southeast Denver",
    city: "Denver",
    country: "United States",
    description: "Armbrust Pro Gym is the Rocky Mountain region's most serious bodybuilding and powerlifting gym. With over 50,000 sq ft of equipment, a supplement shop, and a legacy of producing champion athletes, it's a must-visit for any traveling lifter passing through Denver.",
    scores: { equipment: 96, cleanliness: 82, amenities: 75, staff: 85, atmosphere: 94, value: 85, recovery: 65, classes: 50 },
    dayPassPrice: "$15",
    weekPassPrice: "$40",
    passNotes: "Day passes at the front desk. First-timers get a free tour.",
    contactPhone: "+1 303-759-5900",
    contactEmail: null,
    contactWebsite: "https://www.armbrustprogym.com",
    contactInstagram: "@armbrustprogym",
    tags: ["bodybuilding", "powerlifting", "huge", "Denver", "champion gym", "strongman"],
    highlights: [
      { icon: "📐", label: "Size", value: "50,000+ sq ft" },
      { icon: "🏆", label: "Legacy", value: "Champion athletes" },
      { icon: "🏔️", label: "Location", value: "Mile High City" },
      { icon: "💰", label: "Value", value: "$15 day pass" },
    ],
    equipmentList: ["Hammer Strength full line", "Dumbbells to 200lb", "Atlas stones", "Prowler sleds", "Mono lift", "Deadlift platforms", "Strongman area"],
    recoveryAmenities: ["Stretching area", "Tanning beds", "Supplement shop"],
    hotelProximity: "15-minute drive from downtown Denver hotels. Near I-25 corridor.",
    nearbyHotels: [
      { name: "Hyatt Place Denver Tech Center", distance: "5-minute drive" },
      { name: "Embassy Suites Denver", distance: "8-minute drive" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── San Francisco ──────────────────────────────────────────────────────────
  {
    id: 10,
    name: "Fitness SF Castro",
    type: "Full-Service Gym",
    address: "2301 Market St, San Francisco, CA 94114",
    neighborhood: "Castro",
    city: "San Francisco",
    country: "United States",
    description: "Fitness SF Castro is one of San Francisco's best independent gyms, featuring a rooftop deck with stunning city views, a solid free weight area, and a strong community vibe. Popular with locals and visitors alike, it offers day passes and a welcoming atmosphere in the vibrant Castro district.",
    scores: { equipment: 84, cleanliness: 88, amenities: 82, staff: 86, atmosphere: 89, value: 70, recovery: 72, classes: 80 },
    dayPassPrice: "$25",
    weekPassPrice: "$80",
    passNotes: "Day passes available at the front desk. Rooftop access included.",
    contactPhone: "+1 415-348-6377",
    contactEmail: null,
    contactWebsite: "https://www.fitnesssf.com",
    contactInstagram: "@fitnesssf",
    tags: ["rooftop", "Castro", "community", "San Francisco", "views"],
    highlights: [
      { icon: "🌉", label: "Views", value: "Rooftop city panorama" },
      { icon: "🏳️‍🌈", label: "Neighborhood", value: "Vibrant Castro district" },
      { icon: "🏃", label: "Nearby", value: "Close to running trails" },
      { icon: "🤝", label: "Community", value: "Welcoming & inclusive" },
    ],
    equipmentList: ["Free weights", "Hammer Strength", "Cardio machines", "Functional training area", "Rooftop workout deck"],
    recoveryAmenities: ["Steam room", "Sauna", "Stretching area"],
    hotelProximity: "Central SF location. Accessible by MUNI from Union Square hotels.",
    nearbyHotels: [
      { name: "Beck's Motor Lodge", distance: "2-minute walk" },
      { name: "Parker Guest House", distance: "10-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Seattle ────────────────────────────────────────────────────────────────
  {
    id: 11,
    name: "Rain City Fit",
    type: "CrossFit / Functional",
    address: "1401 Western Ave, Seattle, WA 98101",
    neighborhood: "Downtown",
    city: "Seattle",
    country: "United States",
    description: "Rain City Fit brings functional fitness to downtown Seattle with a focus on CrossFit-style programming, Olympic lifting, and community. Drop-in visitors are warmly welcomed, and the waterfront location near Pike Place Market makes it convenient for travelers exploring the city.",
    scores: { equipment: 85, cleanliness: 88, amenities: 70, staff: 90, atmosphere: 88, value: 72, recovery: 55, classes: 92 },
    dayPassPrice: "$25",
    weekPassPrice: "$80",
    passNotes: "Drop-ins welcome. Book a class slot online in advance.",
    contactPhone: "+1 206-555-0123",
    contactEmail: "info@raincityfit.com",
    contactWebsite: null,
    contactInstagram: "@raincityfit",
    tags: ["CrossFit", "functional fitness", "downtown", "waterfront", "drop-in friendly"],
    highlights: [
      { icon: "🌧️", label: "Location", value: "Downtown waterfront" },
      { icon: "✖️", label: "Style", value: "CrossFit & Olympic lifting" },
      { icon: "🐟", label: "Nearby", value: "Pike Place Market" },
      { icon: "👋", label: "Drop-Ins", value: "Always welcome" },
    ],
    equipmentList: ["Rogue rigs", "Olympic platforms", "Assault bikes", "C2 rowers", "Dumbbells", "Kettlebells", "Plyo boxes"],
    recoveryAmenities: ["Foam rollers", "Stretching area"],
    hotelProximity: "Steps from Pike Place Market hotels. Walking distance from most downtown Seattle hotels.",
    nearbyHotels: [
      { name: "Inn at the Market", distance: "3-minute walk" },
      { name: "The Edgewater", distance: "8-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Nashville ──────────────────────────────────────────────────────────────
  {
    id: 12,
    name: "Nashville Strength",
    type: "Powerlifting Gym",
    address: "1008 2nd Ave S, Nashville, TN 37210",
    neighborhood: "SoBro",
    city: "Nashville",
    country: "United States",
    description: "Nashville Strength is Music City's top powerlifting and strength training facility. Located in the SoBro district near Broadway, it caters to serious lifters with calibrated equipment, knowledgeable coaching, and a supportive community. Great day pass value for visiting strength athletes.",
    scores: { equipment: 91, cleanliness: 85, amenities: 62, staff: 90, atmosphere: 92, value: 85, recovery: 50, classes: 55 },
    dayPassPrice: "$15",
    weekPassPrice: "$50",
    passNotes: "Walk-ins welcome. Coaches available for technique sessions.",
    contactPhone: "+1 615-555-0456",
    contactEmail: "info@nashvillestrength.com",
    contactWebsite: null,
    contactInstagram: "@nashvillestrength",
    tags: ["powerlifting", "SoBro", "coaching", "affordable", "Nashville"],
    highlights: [
      { icon: "🎸", label: "City", value: "Music City vibes" },
      { icon: "🏋️", label: "Focus", value: "Powerlifting & strength" },
      { icon: "💰", label: "Value", value: "$15 day pass" },
      { icon: "📍", label: "Near", value: "Broadway & honky-tonks" },
    ],
    equipmentList: ["Calibrated plates", "Competition benches", "Squat racks with mono", "Deadlift platforms", "Belt squat", "SSB bars"],
    recoveryAmenities: ["Stretching area"],
    hotelProximity: "Walking distance from Broadway hotels and SoBro accommodations.",
    nearbyHotels: [
      { name: "JW Marriott Nashville", distance: "8-minute walk" },
      { name: "Thompson Nashville", distance: "5-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Toronto ────────────────────────────────────────────────────────────────
  {
    id: 13,
    name: "Fortis Fitness",
    type: "Powerlifting Gym",
    address: "1 Carlaw Ave, Toronto, ON M4M 2R6",
    neighborhood: "Leslieville",
    city: "Toronto",
    country: "Canada",
    description: "Fortis Fitness is Toronto's premier strength training facility, located in the trendy Leslieville neighborhood. Known for its competition-standard equipment, supportive coaching staff, and welcoming attitude toward drop-in visitors. A must-visit for any serious lifter traveling to Toronto.",
    scores: { equipment: 93, cleanliness: 86, amenities: 65, staff: 92, atmosphere: 93, value: 82, recovery: 55, classes: 60 },
    dayPassPrice: "C$20",
    weekPassPrice: "C$60",
    passNotes: "Drop-ins welcome anytime during staffed hours.",
    contactPhone: "+1 416-555-0789",
    contactEmail: "info@fortisfitness.ca",
    contactWebsite: "https://www.fortisfitness.ca",
    contactInstagram: "@fortisfitness",
    tags: ["powerlifting", "Toronto", "competition equipment", "coaching", "Leslieville"],
    highlights: [
      { icon: "🏋️", label: "Focus", value: "Powerlifting & strength" },
      { icon: "🍁", label: "City", value: "Toronto, Canada" },
      { icon: "🔩", label: "Equipment", value: "Eleiko & Rogue" },
      { icon: "👋", label: "Drop-Ins", value: "Always welcome" },
    ],
    equipmentList: ["Eleiko competition set", "Rogue Monster racks", "Reverse hyper", "GHR", "Belt squat", "Dumbbells to 150lb"],
    recoveryAmenities: ["Stretching area", "Foam rollers"],
    hotelProximity: "15-minute streetcar ride from downtown Toronto hotels.",
    nearbyHotels: [
      { name: "Broadview Hotel", distance: "5-minute walk" },
      { name: "Fairmont Royal York", distance: "15-minute transit" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── London ─────────────────────────────────────────────────────────────────
  {
    id: 14,
    name: "Muscleworks Gym",
    type: "Bodybuilding Gym",
    address: "58-60 Bethnal Green Rd, London E1 6JE",
    neighborhood: "Bethnal Green",
    city: "London",
    country: "United Kingdom",
    description: "Muscleworks is East London's legendary bodybuilding gym, known for its raw atmosphere and serious equipment selection. With multiple floors packed with iron, a dedicated strongman area, and some of London's most knowledgeable staff, it's the UK gym pilgrimage for traveling lifters.",
    scores: { equipment: 91, cleanliness: 75, amenities: 60, staff: 85, atmosphere: 96, value: 85, recovery: 45, classes: 30 },
    dayPassPrice: "£10",
    weekPassPrice: "£30",
    passNotes: "Day pass at reception. Bring your own lock for lockers.",
    contactPhone: "+44 20 7739 4477",
    contactEmail: null,
    contactWebsite: "https://www.muscleworksgym.co.uk",
    contactInstagram: "@muscleworksgym",
    tags: ["bodybuilding", "East London", "hardcore", "strongman", "legendary"],
    highlights: [
      { icon: "💪", label: "Vibe", value: "Hardcore bodybuilding" },
      { icon: "🇬🇧", label: "City", value: "East London" },
      { icon: "💰", label: "Value", value: "£10 day pass" },
      { icon: "🏆", label: "Legacy", value: "London's iconic iron gym" },
    ],
    equipmentList: ["Massive free weight area", "Hammer Strength full line", "Strongman area", "Dumbbells to 80kg", "Multiple cable stations"],
    recoveryAmenities: ["Basic stretching area"],
    hotelProximity: "Near Shoreditch hotels. 5-minute walk from Bethnal Green Tube.",
    nearbyHotels: [
      { name: "Ace Hotel London Shoreditch", distance: "10-minute walk" },
      { name: "The Hoxton Shoreditch", distance: "12-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Tokyo ──────────────────────────────────────────────────────────────────
  {
    id: 15,
    name: "Gold's Gym Harajuku",
    type: "Full-Service Gym",
    address: "6-31-17 Jingumae, Shibuya-ku, Tokyo 150-0001",
    neighborhood: "Harajuku",
    city: "Tokyo",
    country: "Japan",
    description: "Gold's Gym Harajuku is one of Tokyo's most popular gyms for both locals and international visitors. Located in the heart of trendy Harajuku, it offers excellent equipment, clean facilities, and an English-friendly staff — a rarity in Tokyo gyms. Day passes make it easy for travelers.",
    scores: { equipment: 88, cleanliness: 95, amenities: 80, staff: 82, atmosphere: 78, value: 65, recovery: 60, classes: 70 },
    dayPassPrice: "¥2,750",
    weekPassPrice: null,
    passNotes: "Day pass (ビジター利用) available at reception. Photo ID required.",
    contactPhone: "+81 3-3796-5151",
    contactEmail: null,
    contactWebsite: "https://www.goldsgym.jp",
    contactInstagram: "@goldsgymjapan",
    tags: ["Harajuku", "Tokyo", "English-friendly", "international", "clean"],
    highlights: [
      { icon: "🗼", label: "City", value: "Tokyo, Japan" },
      { icon: "🌸", label: "Neighborhood", value: "Trendy Harajuku" },
      { icon: "🗣️", label: "Language", value: "English-friendly staff" },
      { icon: "✨", label: "Cleanliness", value: "Immaculately maintained" },
    ],
    equipmentList: ["Full weight area", "Hammer Strength machines", "Cardio floor", "Stretching area", "Cable machines"],
    recoveryAmenities: ["Shower facilities", "Stretching area", "Lockers"],
    hotelProximity: "Walking distance from Harajuku and Shibuya hotels. Direct JR line access.",
    nearbyHotels: [
      { name: "The Millennials Shibuya", distance: "10-minute walk" },
      { name: "Trunk Hotel", distance: "8-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Mexico City ────────────────────────────────────────────────────────────
  {
    id: 16,
    name: "Sports World Polanco",
    type: "Full-Service Gym",
    address: "Av. Ejército Nacional 843, Polanco, CDMX 11560",
    neighborhood: "Polanco",
    city: "Mexico City",
    country: "Mexico",
    description: "Sports World Polanco is one of Mexico City's premier gym chains, located in the upscale Polanco neighborhood. With modern equipment, a swimming pool, group classes, and a convenient location near major hotels, it's the best option for fitness-minded travelers visiting CDMX.",
    scores: { equipment: 82, cleanliness: 85, amenities: 88, staff: 80, atmosphere: 75, value: 90, recovery: 70, classes: 82 },
    dayPassPrice: "MX$200",
    weekPassPrice: "MX$600",
    passNotes: "Day pass (pase de día) at reception. Photo ID required.",
    contactPhone: "+52 55 5281 4000",
    contactEmail: null,
    contactWebsite: "https://www.sportsworld.com.mx",
    contactInstagram: "@sportsworldmx",
    tags: ["Polanco", "CDMX", "pool", "classes", "modern", "affordable"],
    highlights: [
      { icon: "🇲🇽", label: "City", value: "Mexico City" },
      { icon: "🏊", label: "Pool", value: "Indoor swimming pool" },
      { icon: "💰", label: "Value", value: "~$12 USD day pass" },
      { icon: "📍", label: "Area", value: "Upscale Polanco" },
    ],
    equipmentList: ["Life Fitness machines", "Free weight area", "Swimming pool", "Group fitness studios", "Cardio machines", "Functional training area"],
    recoveryAmenities: ["Steam room", "Swimming pool", "Stretching area"],
    hotelProximity: "In the heart of Polanco hotel district. Walking distance from W, JW Marriott, and Hyatt.",
    nearbyHotels: [
      { name: "W Mexico City", distance: "5-minute walk" },
      { name: "JW Marriott Polanco", distance: "8-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Bangkok ────────────────────────────────────────────────────────────────
  {
    id: 17,
    name: "Base Bangkok",
    type: "Performance Gym",
    address: "Thonglor Soi 16, Sukhumvit, Bangkok 10110",
    neighborhood: "Thonglor",
    city: "Bangkok",
    country: "Thailand",
    description: "Base Bangkok is Thailand's most premium fitness facility, located in the trendy Thonglor district. With a focus on functional fitness, strength training, and recovery, it caters to expats, travelers, and Bangkok's health-conscious elite. The facility includes a recovery lounge with ice baths and compression therapy.",
    scores: { equipment: 90, cleanliness: 92, amenities: 88, staff: 88, atmosphere: 85, value: 75, recovery: 92, classes: 88 },
    dayPassPrice: "฿800",
    weekPassPrice: "฿2,500",
    passNotes: "Day passes available online or at reception. Book classes in advance.",
    contactPhone: "+66 2 123 4567",
    contactEmail: "info@basebangkok.com",
    contactWebsite: "https://www.basebangkok.com",
    contactInstagram: "@basebangkok",
    tags: ["Thonglor", "Bangkok", "functional fitness", "recovery", "premium", "expat-friendly"],
    highlights: [
      { icon: "🏝️", label: "City", value: "Bangkok, Thailand" },
      { icon: "🧊", label: "Recovery", value: "Ice baths & compression" },
      { icon: "🏋️", label: "Style", value: "Functional & strength" },
      { icon: "🌏", label: "Community", value: "Expat-friendly" },
    ],
    equipmentList: ["Rogue racks", "Olympic platforms", "Assault bikes", "Concept2 rowers", "Functional training area", "Turf track"],
    recoveryAmenities: ["Ice bath", "Compression boots", "Infrared sauna", "Massage", "Recovery lounge"],
    hotelProximity: "Central Thonglor. 5-minute walk from BTS Thonglor station. Easy access from Sukhumvit hotels.",
    nearbyHotels: [
      { name: "Marriott Marquis Queen's Park", distance: "10-minute walk" },
      { name: "The Emporium Suites", distance: "BTS 1 stop" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Dubai ──────────────────────────────────────────────────────────────────
  {
    id: 18,
    name: "Warehouse Gym DIFC",
    type: "CrossFit / Functional",
    address: "Gate Village, DIFC, Dubai, UAE",
    neighborhood: "DIFC",
    city: "Dubai",
    country: "United Arab Emirates",
    description: "Warehouse Gym DIFC is Dubai's original functional fitness gym, set in the financial district. With an industrial aesthetic, CrossFit programming, and a strong lifting community, it stands out from Dubai's typical luxury gym scene. Popular with expats and business travelers.",
    scores: { equipment: 87, cleanliness: 88, amenities: 72, staff: 86, atmosphere: 90, value: 65, recovery: 58, classes: 88 },
    dayPassPrice: "AED 100",
    weekPassPrice: "AED 350",
    passNotes: "Day passes available. Book CrossFit classes via app.",
    contactPhone: "+971 4 555 6789",
    contactEmail: "info@thewarehousegym.com",
    contactWebsite: "https://www.thewarehousegym.com",
    contactInstagram: "@warehousegym",
    tags: ["CrossFit", "DIFC", "Dubai", "functional fitness", "industrial", "expat-friendly"],
    highlights: [
      { icon: "🏙️", label: "Location", value: "DIFC Financial District" },
      { icon: "✖️", label: "Style", value: "CrossFit & functional" },
      { icon: "🏗️", label: "Aesthetic", value: "Industrial warehouse" },
      { icon: "🌍", label: "Community", value: "International members" },
    ],
    equipmentList: ["Rogue rigs", "Assault bikes", "Concept2 rowers & SkiErgs", "Olympic platforms", "Dumbbells", "Kettlebells"],
    recoveryAmenities: ["Shower facilities", "Stretching area"],
    hotelProximity: "In DIFC, surrounded by 5-star hotels. Walking distance from several properties.",
    nearbyHotels: [
      { name: "Ritz-Carlton DIFC", distance: "3-minute walk" },
      { name: "Four Seasons DIFC", distance: "5-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Sydney ─────────────────────────────────────────────────────────────────
  {
    id: 19,
    name: "City Gym Sydney",
    type: "Traditional Gym",
    address: "107 Crown St, Darlinghurst, NSW 2010",
    neighborhood: "Darlinghurst",
    city: "Sydney",
    country: "Australia",
    description: "City Gym Sydney is an institution in Darlinghurst, operating since 1978. Known for its inclusive community, solid equipment selection, and convenient location near Kings Cross, it's the go-to gym for travelers looking for an authentic Sydney workout experience.",
    scores: { equipment: 80, cleanliness: 82, amenities: 68, staff: 88, atmosphere: 90, value: 82, recovery: 48, classes: 65 },
    dayPassPrice: "A$20",
    weekPassPrice: "A$60",
    passNotes: "Casual visit passes at reception. No booking required.",
    contactPhone: "+61 2 9360 6247",
    contactEmail: null,
    contactWebsite: "https://www.citygym.com.au",
    contactInstagram: "@citygymsydney",
    tags: ["Darlinghurst", "Sydney", "inclusive", "established", "community"],
    highlights: [
      { icon: "🇦🇺", label: "City", value: "Sydney, Australia" },
      { icon: "📅", label: "Since", value: "Operating since 1978" },
      { icon: "🏳️‍🌈", label: "Community", value: "Inclusive & welcoming" },
      { icon: "📍", label: "Near", value: "Kings Cross & CBD" },
    ],
    equipmentList: ["Free weights", "Cable machines", "Cardio equipment", "Smith machines", "Leg press"],
    recoveryAmenities: ["Stretching area"],
    hotelProximity: "Walking distance from Kings Cross and Potts Point hotels. 10-minute walk to CBD.",
    nearbyHotels: [
      { name: "ADGE Hotel", distance: "3-minute walk" },
      { name: "Ovolo Woolloomooloo", distance: "10-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Cancun ─────────────────────────────────────────────────────────────────
  {
    id: 20,
    name: "Muscle Beach Cancun",
    type: "Bodybuilding Gym",
    address: "Blvd. Kukulcán Km 9.5, Zona Hotelera, Cancún 77500",
    neighborhood: "Hotel Zone",
    city: "Cancun",
    country: "Mexico",
    description: "Muscle Beach Cancun is the Hotel Zone's best gym for serious lifters. Right in the heart of the tourist strip, it offers solid free weight equipment, ocean views, and a no-excuses atmosphere. Perfect for travelers who refuse to skip leg day on vacation.",
    scores: { equipment: 78, cleanliness: 76, amenities: 60, staff: 80, atmosphere: 85, value: 88, recovery: 40, classes: 35 },
    dayPassPrice: "MX$150",
    weekPassPrice: "MX$500",
    passNotes: "Walk-in day passes. Cash preferred.",
    contactPhone: "+52 998 123 4567",
    contactEmail: null,
    contactWebsite: null,
    contactInstagram: "@musclebeachcancun",
    tags: ["Hotel Zone", "Cancun", "bodybuilding", "beach", "vacation gym"],
    highlights: [
      { icon: "🏖️", label: "Location", value: "Cancun Hotel Zone" },
      { icon: "💪", label: "Style", value: "Bodybuilding focus" },
      { icon: "🌊", label: "Views", value: "Near Caribbean beach" },
      { icon: "💰", label: "Value", value: "~$9 USD day pass" },
    ],
    equipmentList: ["Free weight area", "Cable machines", "Dumbbells to 50kg", "Squat racks", "Leg machines"],
    recoveryAmenities: ["Stretching area"],
    hotelProximity: "In the Hotel Zone. Walking distance from major resorts.",
    nearbyHotels: [
      { name: "Hyatt Ziva Cancun", distance: "5-minute walk" },
      { name: "JW Marriott Cancun", distance: "10-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Barcelona ──────────────────────────────────────────────────────────────
  {
    id: 21,
    name: "DIR Diagonal",
    type: "Premium Gym",
    address: "Av. Diagonal 555, 08029 Barcelona",
    neighborhood: "Les Corts",
    city: "Barcelona",
    country: "Spain",
    description: "DIR is Barcelona's premier gym chain, and the Diagonal location is their flagship. With a swimming pool, extensive equipment, group classes, and a sophisticated atmosphere, it's the ideal gym for travelers visiting Barcelona who want a complete fitness experience.",
    scores: { equipment: 86, cleanliness: 90, amenities: 92, staff: 84, atmosphere: 82, value: 72, recovery: 80, classes: 88 },
    dayPassPrice: "€15",
    weekPassPrice: "€50",
    passNotes: "Day pass (pase de día) at reception. Includes pool access.",
    contactPhone: "+34 93 410 2550",
    contactEmail: null,
    contactWebsite: "https://www.dir.cat",
    contactInstagram: "@dirfitness",
    tags: ["Barcelona", "pool", "premium", "classes", "flagship"],
    highlights: [
      { icon: "🇪🇸", label: "City", value: "Barcelona, Spain" },
      { icon: "🏊", label: "Pool", value: "Indoor swimming pool" },
      { icon: "💃", label: "Classes", value: "Extensive group schedule" },
      { icon: "📐", label: "Flagship", value: "DIR's best location" },
    ],
    equipmentList: ["Technogym machines", "Free weight area", "Swimming pool", "Cycling studio", "Yoga studios", "Functional training area"],
    recoveryAmenities: ["Swimming pool", "Sauna", "Steam room", "Spa treatments"],
    hotelProximity: "On Av. Diagonal. Easy metro access from Eixample and Gothic Quarter hotels.",
    nearbyHotels: [
      { name: "Hotel Sofia Barcelona", distance: "3-minute walk" },
      { name: "Gran Hotel Torre Catalunya", distance: "10-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Vancouver ──────────────────────────────────────────────────────────────
  {
    id: 22,
    name: "Tight Club Athletics",
    type: "CrossFit / Functional",
    address: "380 Railway St, Vancouver, BC V6A 1A5",
    neighborhood: "Gastown",
    city: "Vancouver",
    country: "Canada",
    description: "Tight Club Athletics is Vancouver's coolest functional fitness gym, housed in a heritage building in historic Gastown. With a strong CrossFit program, Olympic lifting coaching, and a community-first approach, it's the perfect drop-in gym for fitness travelers visiting Vancouver.",
    scores: { equipment: 86, cleanliness: 87, amenities: 65, staff: 91, atmosphere: 92, value: 75, recovery: 50, classes: 90 },
    dayPassPrice: "C$30",
    weekPassPrice: "C$90",
    passNotes: "Drop-in athletes always welcome. Check schedule for class times.",
    contactPhone: "+1 604-555-0234",
    contactEmail: "hello@tightclub.ca",
    contactWebsite: "https://www.tightclub.ca",
    contactInstagram: "@tightclubathletics",
    tags: ["CrossFit", "Gastown", "Vancouver", "heritage building", "community"],
    highlights: [
      { icon: "🏔️", label: "City", value: "Vancouver, BC" },
      { icon: "🏛️", label: "Space", value: "Heritage Gastown building" },
      { icon: "✖️", label: "Style", value: "CrossFit & Olympic lifting" },
      { icon: "🤝", label: "Community", value: "Drop-ins welcome" },
    ],
    equipmentList: ["Rogue equipment", "Olympic platforms", "Assault bikes", "C2 rowers", "Pull-up rigs", "Kettlebells"],
    recoveryAmenities: ["Stretching area", "Foam rollers"],
    hotelProximity: "Central Gastown. Walking distance from Waterfront Station and downtown hotels.",
    nearbyHotels: [
      { name: "Fairmont Waterfront", distance: "5-minute walk" },
      { name: "Pan Pacific Vancouver", distance: "8-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Houston ────────────────────────────────────────────────────────────────
  {
    id: 23,
    name: "MetroFlex Gym Houston",
    type: "Hardcore Gym",
    address: "7720 Cherry Park Dr, Houston, TX 77095",
    neighborhood: "Northwest Houston",
    city: "Houston",
    country: "United States",
    description: "Part of the legendary MetroFlex brand, this Houston location carries on the tradition of hardcore, no-frills training. With a massive equipment selection, chalk-friendly policies, and a blue-collar atmosphere, it's where Houston's strongest come to train.",
    scores: { equipment: 93, cleanliness: 70, amenities: 55, staff: 82, atmosphere: 96, value: 90, recovery: 40, classes: 30 },
    dayPassPrice: "$10",
    weekPassPrice: "$30",
    passNotes: "Walk-ins always welcome. $10 day pass - best value in Houston.",
    contactPhone: "+1 281-555-0567",
    contactEmail: null,
    contactWebsite: null,
    contactInstagram: "@metroflexhouston",
    tags: ["hardcore", "MetroFlex", "affordable", "Houston", "powerlifting", "bodybuilding"],
    highlights: [
      { icon: "🔩", label: "Vibe", value: "Hardcore & raw" },
      { icon: "💰", label: "Value", value: "$10 day pass" },
      { icon: "🤠", label: "City", value: "Houston, Texas" },
      { icon: "🏋️", label: "Style", value: "Bodybuilding & powerlifting" },
    ],
    equipmentList: ["Extensive free weights", "Hammer Strength full line", "Dumbbells to 200lb", "Strongman equipment", "Multiple squat racks", "Deadlift platforms"],
    recoveryAmenities: ["Basic stretching area"],
    hotelProximity: "Northwest Houston, 25-minute drive from downtown hotels. Near Energy Corridor.",
    nearbyHotels: [
      { name: "La Quinta NW Houston", distance: "5-minute drive" },
      { name: "Hilton Garden Inn Energy Corridor", distance: "10-minute drive" },
    ],
    updatedAt: "2025-12-15",
  },

  // ── Berlin ─────────────────────────────────────────────────────────────────
  {
    id: 24,
    name: "McFIT Berlin Alexanderplatz",
    type: "Budget Gym",
    address: "Alexanderplatz 7, 10178 Berlin",
    neighborhood: "Mitte",
    city: "Berlin",
    country: "Germany",
    description: "McFIT Alexanderplatz is a massive, well-equipped budget gym right in Berlin's city center. With 24/7 access, modern equipment, and extremely affordable pricing, it's the practical choice for budget-conscious travelers who want a solid workout while exploring Berlin.",
    scores: { equipment: 80, cleanliness: 82, amenities: 70, staff: 65, atmosphere: 72, value: 95, recovery: 45, classes: 60 },
    dayPassPrice: "€5",
    weekPassPrice: "€15",
    passNotes: "Tagesgast (day guest) pass at reception. 24/7 access with pass.",
    contactPhone: "+49 30 1234 5678",
    contactEmail: null,
    contactWebsite: "https://www.mcfit.com",
    contactInstagram: "@mcfit",
    tags: ["budget", "24/7", "Berlin", "central", "Alexanderplatz"],
    highlights: [
      { icon: "🇩🇪", label: "City", value: "Berlin, Germany" },
      { icon: "💰", label: "Value", value: "€5 day pass" },
      { icon: "🕐", label: "Hours", value: "Open 24/7" },
      { icon: "📍", label: "Location", value: "Alexanderplatz center" },
    ],
    equipmentList: ["Full machine circuit", "Free weight area", "Cardio machines", "Functional training zone", "Cable machines"],
    recoveryAmenities: ["Stretching area", "Tanning"],
    hotelProximity: "Right at Alexanderplatz. Steps from numerous hotels and transit connections.",
    nearbyHotels: [
      { name: "Park Inn by Radisson Berlin", distance: "2-minute walk" },
      { name: "Motel One Berlin-Alexanderplatz", distance: "3-minute walk" },
    ],
    updatedAt: "2025-12-15",
  },
];

/**
 * Process raw gym data: attach slugs and computed fields.
 */
export const GYMS = RAW_GYMS.map((gym) => ({
  ...gym,
  slug: generateGymSlug(gym.name, gym.city),
  citySlug: generateCitySlug(gym.city),
  overallScore: Math.round(
    (gym.scores.equipment * 0.20 +
     gym.scores.cleanliness * 0.18 +
     gym.scores.amenities * 0.14 +
     gym.scores.staff * 0.12 +
     gym.scores.atmosphere * 0.11 +
     gym.scores.value * 0.10 +
     gym.scores.recovery * 0.08 +
     gym.scores.classes * 0.07)
  ),
}));

/**
 * Get a gym by its slug.
 * @param {string} slug
 * @returns {object|undefined}
 */
export function getGymBySlug(slug) {
  return GYMS.find((g) => g.slug === slug);
}

/**
 * Get all gyms for a given city.
 * @param {string} city
 * @returns {object[]}
 */
export function getGymsByCity(city) {
  const lower = city.toLowerCase();
  return GYMS.filter((g) => g.city.toLowerCase() === lower);
}

/**
 * Get all unique cities with gym counts.
 * @returns {{ city: string, citySlug: string, count: number }[]}
 */
export function getAllCities() {
  const map = {};
  for (const g of GYMS) {
    if (!map[g.city]) map[g.city] = { city: g.city, citySlug: g.citySlug, count: 0 };
    map[g.city].count++;
  }
  return Object.values(map).sort((a, b) => b.count - a.count);
}

/**
 * Get gyms similar to a given gym (same city or same type, excluding self).
 * @param {object} gym
 * @param {number} limit
 * @returns {object[]}
 */
export function getSimilarGyms(gym, limit = 4) {
  return GYMS
    .filter((g) => g.slug !== gym.slug && (g.city === gym.city || g.type === gym.type))
    .sort((a, b) => (a.city === gym.city ? -1 : 1))
    .slice(0, limit);
}

/**
 * Get all gym slugs (for generateStaticParams).
 * @returns {string[]}
 */
export function getAllGymSlugs() {
  return GYMS.map((g) => g.slug);
}
