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
  PRICING: "/pricing",
  BILLING: "/billing",
  BILLING_SUCCESS: "/billing/success",
  TEST_CHECKOUT: "/checkout/test",
} as const;

export const tripPath = (id: string) => `/trips/${id}`;

import { COUNTRY_IMAGES, DEFAULT_TRIP_IMAGE, countryImage, unsplash } from "@shared/images";

export { COUNTRY_IMAGES, DEFAULT_TRIP_IMAGE, countryImage };

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
