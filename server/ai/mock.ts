// Realistic sample responses used when GEMINI_API_KEY is not set, so every
// AI feature can be built and demoed without an API key.
import type {
  BookingSuggestions,
  DailyPlan,
  DestinationIdea,
  DestinationIdeasInput,
  GenerateTripInput,
  GeneratedTrip,
  Itinerary,
  LocalPlace,
  LocalSecretsQueryInput,
  VisaQueryInput,
  VisaRequirement,
} from "@shared/schema";
import { CITIES_BY_COUNTRY, MAIN_AIRPORT, cityName, countryName, monthName } from "@shared/reference-data";

// --- Trips ------------------------------------------------------------------

const ACTIVITIES: Record<string, [string, string, string]> = {
  landmarks: ["Walk the historic centre of {city}", "Visit {city}'s most famous landmark", "Sunset from an observation deck in {city}"],
  food: ["Breakfast crawl through a {city} morning market", "Cooking class with a local chef", "Street-food tour in {city}'s night market"],
  shopping: ["Browse independent boutiques in {city}", "Outlet and department-store run", "Late-night shopping street in {city}"],
  adventure: ["Guided hike outside {city}", "Cycling tour through {city}'s neighbourhoods", "Kayak or river cruise at dusk"],
  culture: ["Temple and shrine visits around {city}", "Museum afternoon in {city}", "Traditional performance in {city}"],
  photo: ["Golden-hour photo walk in {city}", "Colourful street-art district", "Skyline night shots in {city}"],
  nature: ["Botanical garden morning in {city}", "Day trip to a nearby national park", "Riverside or seaside walk"],
  nightlife: ["Late brunch and slow morning", "Rooftop bar hopping in {city}", "Live music in {city}'s nightlife district"],
};

const DAY_THEMES = ["Arrival & first impressions", "Icons of the city", "Local life", "Hidden corners", "Day trip", "Slow day", "Last looks & pasalubong"];

function round(n: number) {
  return Math.max(0, Math.round(n / 10) * 10);
}

function buildItinerary(input: GenerateTripInput, cities: string[], style: "budget" | "experience"): Itinerary {
  // Budget plan uses ~85% of the budget; experience plan goes ~35% over.
  const total = input.budget * (style === "budget" ? 0.85 : 1.35);
  const perDay = total / input.duration;
  const prefs = input.preferences.length ? input.preferences : ["landmarks"];

  const dailyPlans: DailyPlan[] = Array.from({ length: input.duration }, (_, i) => {
    const city = cities[Math.floor((i * cities.length) / input.duration)];
    const pref = prefs[i % prefs.length];
    const [morning, afternoon, evening] = (ACTIVITIES[pref] ?? ACTIVITIES.landmarks).map((a) =>
      a.replace("{city}", city),
    );
    const stay = style === "budget" ? `Well-reviewed hostel or business hotel in central ${city}` : `Boutique hotel in a prime ${city} neighbourhood`;
    return {
      day: i + 1,
      title: i === 0 ? `Arrive in ${city}` : i === input.duration - 1 ? DAY_THEMES[6] : DAY_THEMES[1 + (i % 5)],
      activities: [
        { time: "Morning", description: morning, cost: round(perDay * 0.08) },
        { time: "Afternoon", description: afternoon, cost: round(perDay * 0.12) },
        { time: "Evening", description: evening, cost: round(perDay * 0.1) },
      ],
      accommodation: { name: stay, cost: round(perDay * 0.4) },
      meals: {
        breakfast: { description: style === "budget" ? "Convenience-store or bakery breakfast" : "Hotel breakfast buffet", cost: round(perDay * 0.05) },
        lunch: { description: style === "budget" ? "Local set meal" : "Popular local restaurant", cost: round(perDay * 0.1) },
        dinner: { description: style === "budget" ? "Night-market dinner" : "Chef's tasting dinner", cost: round(perDay * 0.15) },
      },
    };
  });

  const totalCost = dailyPlans.reduce(
    (sum, d) =>
      sum +
      d.activities.reduce((s, a) => s + a.cost, 0) +
      d.accommodation.cost +
      d.meals.breakfast.cost +
      d.meals.lunch.cost +
      d.meals.dinner.cost,
    0,
  );

  return {
    summary:
      style === "budget"
        ? `A value-first plan that keeps you under budget with public transport, local eateries and free sights.`
        : `A comfort-first plan with better stays, guided experiences and memorable meals.`,
    dailyPlans,
    totalCost,
  };
}

export function mockTrip(input: GenerateTripInput): GeneratedTrip {
  const country = countryName(input.destinationCountry);
  const picked = (input.selectedCities ?? []).map((c) => cityName(input.destinationCountry, c));
  const cities = picked.length ? picked : (CITIES_BY_COUNTRY[input.destinationCountry] ?? [{ name: country }]).slice(0, 2).map((c) => c.name);

  return {
    tripName: `${input.duration} days in ${cities.join(" & ")} · ${monthName(input.travelMonth)}`,
    budgetItinerary: buildItinerary(input, cities, "budget"),
    experienceItinerary: buildItinerary(input, cities, "experience"),
    bookings: mockBookings(input, cities),
  };
}

/** Budget carriers fly these from the Philippines; long-haul falls back to Philippine Airlines. */
const BUDGET_CARRIER_COUNTRIES = new Set(["JPN", "KOR", "SGP", "THA", "VNM", "MYS", "IDN", "HKG", "TWN", "AUS"]);

function mockBookings(input: GenerateTripInput, cities: string[]): BookingSuggestions {
  const to = MAIN_AIRPORT[input.destinationCountry] ?? "";
  const fare = round(input.budget * 0.3);
  const flights = BUDGET_CARRIER_COUNTRIES.has(input.destinationCountry)
    ? [
        { airline: "Cebu Pacific", from: input.originAirport, to, estimatedFare: fare, note: "Usually the cheapest; add baggage when booking, it costs more at the airport." },
        { airline: "AirAsia", from: input.originAirport, to, estimatedFare: round(fare * 1.08), note: "Watch for seat sales; good if Cebu Pacific times don't suit you." },
      ]
    : [{ airline: "Philippine Airlines", from: input.originAirport, to, estimatedFare: round(fare * 1.6), note: "Full-service with checked baggage included." }];
  const [first, second = first] = cities;
  return {
    flights,
    stays: [
      { name: `${first} Central Hostel`, city: first, area: "City centre", style: "budget", pricePerNight: round(input.budget * 0.04), why: "Walkable to the main sights and the train station." },
      { name: `Hotel ${second} Station`, city: second, area: "Near the main station", style: "budget", pricePerNight: round(input.budget * 0.06), why: "Easy airport transfers and day trips." },
      { name: `The ${first} Grand`, city: first, area: "Upscale district", style: "experience", pricePerNight: round(input.budget * 0.12), why: "Great views, breakfast included, near nightlife." },
    ],
    activities: [
      { name: `${first} city pass`, city: first, price: round(input.budget * 0.05), why: "Covers transport and top attractions in one ticket." },
      { name: `${first} street food tour`, city: first, price: round(input.budget * 0.04), why: "Taste local dishes with a guide who knows the stalls." },
      { name: `Day trip from ${second}`, city: second, price: round(input.budget * 0.06), why: "See the countryside without planning transport." },
    ],
  };
}

// --- Destination ideas ---------------------------------------------------------

/** Rough best months, highlights and daily cost (PHP, excl. flights) per destination. */
const SEASONS: { code: string; city: string; months: number[]; weather: string; happening: string; visa: string; perDay: number; fare: number }[] = [
  { code: "JPN", city: "Tokyo", months: [3, 4, 10, 11], weather: "Mild and dry, 12-20°C", happening: "Cherry blossoms (late Mar-Apr) or autumn leaves (Nov)", visa: "Visa required (free, via agency)", perDay: 6500, fare: 14000 },
  { code: "KOR", city: "Seoul", months: [4, 5, 9, 10], weather: "Cool and clear, 10-22°C", happening: "Spring blossoms or autumn foliage season", visa: "Visa required (free up to 59 days)", perDay: 5500, fare: 12000 },
  { code: "TWN", city: "Taipei", months: [10, 11, 12, 3], weather: "Comfortable, 18-25°C", happening: "Night-market season; hot-spring weather in winter", visa: "Check eligibility for visa-free entry", perDay: 4500, fare: 9000 },
  { code: "THA", city: "Bangkok", months: [11, 12, 1, 2], weather: "Dry season, 25-32°C", happening: "Loy Krathong (Nov) and cooler, dry days", visa: "Visa-free (ASEAN)", perDay: 3500, fare: 8000 },
  { code: "VNM", city: "Hanoi", months: [3, 4, 10, 11], weather: "Warm and dry, 20-28°C", happening: "Best light for Ha Long Bay cruises", visa: "Visa-free up to 21 days", perDay: 3000, fare: 9000 },
  { code: "SGP", city: "Singapore", months: [2, 3, 4, 7, 8], weather: "Hot and humid year-round, ~31°C", happening: "Great Singapore Sale (Jun-Jul), Chinese New Year lights", visa: "Visa-free up to 30 days", perDay: 7000, fare: 7000 },
  { code: "MYS", city: "Kuala Lumpur", months: [5, 6, 7, 8], weather: "Drier mid-year, ~32°C", happening: "Food festivals and mega-sales season", visa: "Visa-free up to 30 days", perDay: 3500, fare: 7000 },
  { code: "IDN", city: "Bali", months: [5, 6, 7, 8, 9], weather: "Dry season, sunny, ~30°C", happening: "Best beach and rice-terrace weather", visa: "Visa-free (ASEAN)", perDay: 4000, fare: 10000 },
  { code: "HKG", city: "Hong Kong", months: [10, 11, 12], weather: "Cool and clear, 18-25°C", happening: "Wine & Dine Festival, Christmas lights", visa: "Visa-free up to 14 days", perDay: 6000, fare: 6000 },
  { code: "AUS", city: "Sydney", months: [9, 10, 11, 3, 4], weather: "Spring/autumn, 18-25°C", happening: "Spring festivals and whale-watching season", visa: "Visitor visa required", perDay: 9000, fare: 25000 },
];

export function mockDestinationIdeas(input: DestinationIdeasInput): DestinationIdea[] {
  const month = Number(input.date.slice(5, 7));
  const cost = (s: (typeof SEASONS)[number]) => s.fare + s.perDay * input.days;
  const inSeason = (s: (typeof SEASONS)[number]) => Number(s.months.includes(month));
  const overBudget = (s: (typeof SEASONS)[number]) => Number(cost(s) > input.budget);
  return [...SEASONS]
    .sort((a, b) => inSeason(b) - inSeason(a) || overBudget(a) - overBudget(b) || cost(a) - cost(b))
    .slice(0, 4)
    .map((s) => ({
      countryCode: s.code,
      country: countryName(s.code),
      city: s.city,
      why: inSeason(s)
        ? `${monthName(month)} is one of the best months for ${s.city}.`
        : `Shoulder season in ${s.city}: fewer crowds and lower prices.`,
      weather: s.weather,
      happening: s.happening,
      visa: s.visa,
      estimatedBudget: round(cost(s)),
    }));
}

// --- Visa -------------------------------------------------------------------

const VISA: Record<string, VisaRequirement> = {
  JPN: {
    country: "Japan",
    visaRequired: true,
    visaType: "Temporary Visitor Visa",
    stayDuration: "Up to 15 days",
    processingTime: "5–7 working days",
    fee: "₱1,500 (via accredited agency)",
    requirements: [
      "Philippine passport valid for the whole stay",
      "Completed visa application form",
      "4.5 × 4.5 cm photo, white background",
      "Flight and hotel reservations",
      "Bank certificate and last 3 months of statements",
      "ITR or BIR Form 2316",
      "Certificate of employment with approved leave",
      "Day-by-day itinerary in Japan",
    ],
    notes: "First-time visitors should show strong financial documents. Applications go through accredited travel agencies, not the embassy directly.",
    embassyInfo: {
      name: "Embassy of Japan in the Philippines",
      address: "2627 Roxas Boulevard, Pasay City, Metro Manila",
      phone: "+63 2 8551 5710",
      email: "visa@ma.mofa.go.jp",
      website: "https://www.ph.emb-japan.go.jp/",
    },
  },
  KOR: {
    country: "South Korea",
    visaRequired: true,
    visaType: "Short-term Visitor (C-3-9)",
    stayDuration: "Up to 59 days",
    processingTime: "5–7 working days",
    fee: "₱2,000 (single entry)",
    requirements: [
      "Philippine passport valid for at least 6 months",
      "Completed application form",
      "35 × 45 mm photo, white background",
      "Round-trip ticket and hotel booking",
      "Certificate of employment with salary and approved leave",
      "Bank certificate and last 3 months of statements",
      "ITR or BIR Form 2316",
    ],
    notes: "Jeju Island is visa-free for direct flights. Travellers with recent OECD-country visas may qualify for simplified requirements.",
    embassyInfo: {
      name: "Embassy of the Republic of Korea",
      address: "122 Upper McKinley Road, Taguig City, Metro Manila",
      phone: "+63 2 8856 9210",
      email: "philippines@mofa.go.kr",
      website: "https://overseas.mofa.go.kr/ph-en/index.do",
    },
  },
  SGP: {
    country: "Singapore",
    visaRequired: false,
    visaType: "Visa-free",
    stayDuration: "Up to 30 days",
    processingTime: "Not applicable",
    fee: "None",
    requirements: [
      "Philippine passport valid for at least 6 months",
      "Confirmed return or onward ticket",
      "Proof of accommodation",
      "SG Arrival Card submitted within 3 days before arrival",
    ],
    notes: "No visa needed, but immigration may ask for proof of funds, accommodation and a return ticket.",
    embassyInfo: {
      name: "Embassy of the Republic of Singapore",
      address: "505 Rizal Drive, Bonifacio Global City, Taguig City",
      phone: "+63 2 8856 9922",
      email: "singemb_mnl@mfa.sg",
      website: "https://www.mfa.gov.sg/manila",
    },
  },
  USA: {
    country: "United States",
    visaRequired: true,
    visaType: "B-1/B-2 Visitor Visa",
    stayDuration: "Up to 6 months per entry",
    processingTime: "Interview wait varies; passport returned 1–2 weeks after approval",
    fee: "USD 185",
    requirements: [
      "Philippine passport valid for at least 6 months beyond stay",
      "DS-160 confirmation page",
      "Visa fee receipt and interview appointment",
      "5 × 5 cm photo",
      "Proof of strong ties to the Philippines (work, property, family)",
      "Bank statements and proof of income",
    ],
    notes: "The interview is decisive. Be ready to explain your purpose, who pays for the trip, and why you will return.",
    embassyInfo: {
      name: "U.S. Embassy in the Philippines",
      address: "1201 Roxas Boulevard, Manila",
      phone: "+63 2 5548 6100",
      email: "support-philippines@usvisascheduling.com",
      website: "https://ph.usembassy.gov/",
    },
  },
  AUS: {
    country: "Australia",
    visaRequired: true,
    visaType: "Visitor Visa (Subclass 600)",
    stayDuration: "Up to 3 months",
    processingTime: "20–30 working days",
    fee: "AUD 195",
    requirements: [
      "Philippine passport valid for the whole stay",
      "Online ImmiAccount application",
      "Proof of sufficient funds",
      "Travel itinerary",
      "Employer letter with approved leave",
      "Evidence of ties to the Philippines",
    ],
    notes: "Applications are online only. A medical check may be requested for longer stays.",
    embassyInfo: {
      name: "Australian Embassy in the Philippines",
      address: "Level 23, Tower 2, RCBC Plaza, Ayala Avenue, Makati City",
      phone: "+63 2 7757 8100",
      email: "manila.enquiries@dfat.gov.au",
      website: "https://philippines.embassy.gov.au/",
    },
  },
};

/** Visa-free stay for Philippine passports in ASEAN countries without a detailed entry above. */
const ASEAN_STAY: Record<string, string> = {
  THA: "Up to 30 days",
  VNM: "Up to 21 days",
  MYS: "Up to 30 days",
  IDN: "Up to 30 days",
};

export function mockVisa(input: VisaQueryInput): VisaRequirement {
  if (VISA[input.destination]) return VISA[input.destination];
  const country = countryName(input.destination);

  if (ASEAN_STAY[input.destination]) {
    return {
      country,
      visaRequired: false,
      visaType: "Visa-free (ASEAN)",
      stayDuration: ASEAN_STAY[input.destination],
      processingTime: "Not applicable",
      fee: "None",
      requirements: ["Passport valid for at least 6 months", "Return ticket", "Proof of accommodation"],
      notes: "ASEAN citizens enjoy visa-free short visits. Immigration may still ask for proof of funds.",
      embassyInfo: genericEmbassy(country),
    };
  }

  return {
    country,
    visaRequired: true,
    visaType: "Tourist / Visitor Visa",
    stayDuration: "Depends on visa granted",
    processingTime: "2–6 weeks (check embassy)",
    fee: "Varies — check the embassy website",
    requirements: [
      "Philippine passport valid for at least 6 months beyond stay",
      "Completed application form and photos",
      "Flight and hotel reservations",
      "Bank statements (last 3–6 months)",
      "Certificate of employment and ITR",
      "Travel insurance (required for Schengen countries)",
    ],
    notes: "This is a general checklist. Confirm the exact requirements with the embassy before applying.",
    embassyInfo: genericEmbassy(country),
  };
}

function genericEmbassy(country: string) {
  return {
    name: `Embassy of ${country} in Manila`,
    address: "Metro Manila",
    phone: "See embassy website",
    email: "See embassy website",
    website: `https://www.google.com/search?q=${encodeURIComponent(`${country} embassy Manila visa`)}`,
  };
}

// --- Local secrets ------------------------------------------------------------

const PLACES: Record<LocalSecretsQueryInput["category"], Omit<LocalPlace, "neighborhood">[]> = {
  food: [
    { name: "The Corner Noodle Bar", type: "Noodle shop", description: "Ten-seat counter famous for its slow-simmered broth.", priceLevel: 1, insiderTip: "Go before 11:30 to skip the office lunch rush." },
    { name: "Market Hall Stalls", type: "Food hall", description: "Dozens of family-run stalls under one roof.", priceLevel: 1, insiderTip: "Follow the longest local queue, not the English menu." },
    { name: "Grandmother's Table", type: "Home-style cooking", description: "Daily-changing set menu cooked like at home.", priceLevel: 2, insiderTip: "Ask for the off-menu dessert of the day." },
    { name: "Harbour Grill", type: "Seafood", description: "Pick your catch from the tank and choose how it's cooked.", priceLevel: 3, insiderTip: "Weekday evenings are half as busy." },
    { name: "Alley Skewers", type: "Street food", description: "Charcoal skewers in a lantern-lit alley.", priceLevel: 1, insiderTip: "Cash only — bring small bills." },
    { name: "Midnight Dumplings", type: "Late-night eats", description: "Hand-folded dumplings served until 3 a.m.", priceLevel: 1, insiderTip: "Order the pan-fried, not steamed." },
  ],
  cafe: [
    { name: "Slow Pour Coffee", type: "Specialty coffee", description: "Single-origin pour-overs in a converted townhouse.", priceLevel: 2, insiderTip: "The upstairs window seat is the best in town." },
    { name: "Paper & Bean", type: "Book café", description: "Quiet café inside a second-hand bookshop.", priceLevel: 2, insiderTip: "Good Wi-Fi and laptop-friendly before noon." },
    { name: "Morning Bakehouse", type: "Bakery café", description: "Pastries straight from the oven at 7 a.m.", priceLevel: 1, insiderTip: "The cardamom bun sells out by 10." },
    { name: "Garden Tea Room", type: "Tea house", description: "Traditional tea service in a hidden courtyard.", priceLevel: 2, insiderTip: "Book the tea ceremony a day ahead." },
  ],
  sights: [
    { name: "Old Quarter Back Lanes", type: "Walking route", description: "Narrow lanes with century-old shopfronts.", priceLevel: 1, insiderTip: "Best light for photos is just after sunrise." },
    { name: "Hilltop Shrine", type: "Shrine", description: "Small shrine with a view tourists rarely climb to.", priceLevel: 1, insiderTip: "Take the back stairs from the residential side." },
    { name: "City Archive Museum", type: "Museum", description: "Free museum with old maps and photographs.", priceLevel: 1, insiderTip: "Closed Mondays." },
    { name: "Riverside Murals", type: "Street art", description: "Kilometre-long open-air mural gallery.", priceLevel: 1, insiderTip: "Rent a bike to see it all in an hour." },
  ],
  shopping: [
    { name: "Weekend Makers' Market", type: "Craft market", description: "Local designers, ceramics and prints.", priceLevel: 2, insiderTip: "Prices drop in the last hour on Sunday." },
    { name: "Wholesale Snack Street", type: "Market street", description: "Pasalubong snacks at wholesale prices.", priceLevel: 1, insiderTip: "Buy in bulk and ask for a box." },
    { name: "Vintage Arcade", type: "Second-hand", description: "Covered arcade of vintage clothing stalls.", priceLevel: 2, insiderTip: "Haggling is expected." },
  ],
  nature: [
    { name: "Canal-side Garden", type: "Garden", description: "Quiet garden along an old canal.", priceLevel: 1, insiderTip: "Free entry before 9 a.m." },
    { name: "Ridge Trail", type: "Hiking trail", description: "Easy 2-hour trail with city views.", priceLevel: 1, insiderTip: "Start from the north trailhead for shade." },
    { name: "Sunset Pier", type: "Waterfront", description: "Locals' favourite spot for sunset.", priceLevel: 1, insiderTip: "Grab drinks from the kiosk before it closes." },
  ],
  nightlife: [
    { name: "The Listening Room", type: "Vinyl bar", description: "Tiny bar with a serious record collection.", priceLevel: 3, insiderTip: "No requests — just listen." },
    { name: "Rooftop 21", type: "Rooftop bar", description: "Unpretentious rooftop with skyline views.", priceLevel: 2, insiderTip: "Happy hour runs until 8 p.m." },
    { name: "Basement Jazz", type: "Live music", description: "Nightly live jazz sets from 9 p.m.", priceLevel: 2, insiderTip: "Cover charge is waived on Tuesdays." },
  ],
};

const NEIGHBORHOODS = ["Old Town", "Riverside", "Central", "Market District", "North Hill", "Harbourfront"];

export function mockLocalSecrets(input: LocalSecretsQueryInput): LocalPlace[] {
  return PLACES[input.category].map((p, i) => ({
    ...p,
    neighborhood: `${NEIGHBORHOODS[i % NEIGHBORHOODS.length]}, ${input.city}`,
  }));
}

// --- Chat ---------------------------------------------------------------------

export function mockChat(lastMessage: string): string {
  return [
    `Here's how I'd approach "${lastMessage.slice(0, 80)}":`,
    "",
    "• Check visa requirements first — open Visa Help for a checklist.",
    "• Book flights 6–8 weeks ahead; Tuesday and Wednesday departures are usually cheapest.",
    "• Use Plan a trip for a day-by-day itinerary with costs.",
    "",
    "(Sample answer — live AI replies turn on once a Gemini API key is added.)",
  ].join("\n");
}
