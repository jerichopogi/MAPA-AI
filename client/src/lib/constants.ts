export const APP_NAME = "MAPA AI";

export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  DASHBOARD: "/dashboard",
  NEW_TRIP: "/plan",
  MY_TRIPS: "/trips",
  TRIP_DETAILS: "/trips/:id",
  ASSISTANT: "/assistant",
  LOCAL_SECRETS: "/local-secrets",
  VISA_HELP: "/visa-help",
  TRAVEL_INFO: "/travel-info",
  TRAVEL_PACKAGE: "/travel-package",
} as const;

export const tripPath = (id: string) => `/trips/${id}`;

const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

/** Hero/cover images per destination country (falls back to a generic travel shot). */
export const COUNTRY_IMAGES: Record<string, string> = {
  JPN: unsplash("photo-1493976040374-85c8e12f0c0e"),
  KOR: unsplash("photo-1538485399081-7191377e8241"),
  SGP: unsplash("photo-1525625293386-3f8f99389edd"),
  THA: unsplash("photo-1508009603885-50cf7c579365"),
  VNM: unsplash("photo-1528127269322-539801943592"),
  MYS: unsplash("photo-1596422846543-75c6fc197f07"),
  IDN: unsplash("photo-1537996194471-e657df975ab4"),
  HKG: unsplash("photo-1536599018102-9f803c140fc1"),
  TWN: unsplash("photo-1470004914212-05527e49370b"),
  AUS: unsplash("photo-1506973035872-a4ec16b8e8d9"),
  USA: unsplash("photo-1485871981521-5b1fd3805eee"),
  CAN: unsplash("photo-1503614472-8c93d56e92ce"),
  GBR: unsplash("photo-1513635269975-59663e0ac1ad"),
  FRA: unsplash("photo-1502602898657-3e91760cbb34"),
  ITA: unsplash("photo-1515542622106-78bda8ba0e5b"),
  ESP: unsplash("photo-1539037116277-4db20889f2d4"),
};
export const DEFAULT_TRIP_IMAGE = unsplash("photo-1488646953014-85cb44e25828");
export const countryImage = (code: string) => COUNTRY_IMAGES[code] ?? DEFAULT_TRIP_IMAGE;

export const HERO_IMAGE = unsplash("photo-1518509562904-e7ef99cdcc86", 1800);
export const LANDING_IMAGES = {
  road: unsplash("photo-1469854523086-cc02fe5d8800"),
  wing: unsplash("photo-1436491865332-7a61a109cc05", 500),
  traveler: unsplash("photo-1527631746610-bca00a040d60", 600),
  beach: unsplash("photo-1506929562872-bb421503ef21", 1600),
};

export const DESTINATIONS = [
  { country: "JPN", name: "Tokyo", region: "Japan", visa: "Visa required", days: "5–7 days", from: 45000 },
  { country: "SGP", name: "Singapore", region: "Singapore", visa: "Visa-free · 30 days", days: "3–4 days", from: 28000 },
  { country: "KOR", name: "Seoul", region: "South Korea", visa: "Visa required", days: "5–6 days", from: 38000 },
  { country: "VNM", name: "Hanoi", region: "Vietnam", visa: "Visa-free · 21 days", days: "4–5 days", from: 22000 },
  { country: "THA", name: "Bangkok", region: "Thailand", visa: "Visa-free · 30 days", days: "4–6 days", from: 20000 },
  { country: "TWN", name: "Taipei", region: "Taiwan", visa: "Check eligibility", days: "4–5 days", from: 30000 },
];

export const TESTIMONIALS = [
  {
    quote: "Planned my first solo trip to Japan in an evening. The visa checklist alone saved me a week of research.",
    name: "Maria S.",
    location: "Quezon City",
  },
  {
    quote: "The budget plan kept our Singapore family trip under ₱60k without feeling cheap.",
    name: "Roberto C.",
    location: "Cebu",
  },
  {
    quote: "Local Secrets found a noodle place in Taipei we still talk about.",
    name: "Liza R.",
    location: "Davao",
  },
];
