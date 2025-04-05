// App constants
export const APP_NAME = "MAPA AI";
export const APP_TAGLINE = "Your AI-powered travel companion designed especially for Filipino travelers.";

// Navigation
export enum Routes {
  HOME = "/",
  LOGIN = "/login",
  REGISTER = "/register",
  DASHBOARD = "/dashboard",
  MY_TRIPS = "/my-trips",
  LOCAL_SECRETS = "/local-secrets",
  TRAVEL_INFO = "/travel-info",
  VISA_HELP = "/visa-help",
  TRAVEL_PACKAGE = "/travel-package",
  TRIP_DETAILS = "/trip",
  FORGOT_PASSWORD = "/forgot-password",
  RESET_PASSWORD = "/reset-password",
  VERIFY_EMAIL = "/verify-email"
}

// API Endpoints
export enum ApiEndpoints {
  LOGIN = "/api/login",
  REGISTER = "/api/register",
  LOGOUT = "/api/logout",
  USER = "/api/user",
  TRIPS = "/api/trips",
  GENERATE_TRIP = "/api/generate-trip",
  AIRPORTS = "/api/airports",
  COUNTRIES = "/api/countries",
  CURRENCIES = "/api/currencies",
  PREFERENCES = "/api/preferences",
  CONTACT = "/api/contact",
  FORGOT_PASSWORD = "/api/forgot-password",
  RESET_PASSWORD = "/api/reset-password",
  SEND_VERIFICATION_EMAIL = "/api/send-verification-email",
  VERIFY_EMAIL = "/api/verify-email",
  CITIES = "/api/cities" // Base endpoint; use with country code: /api/cities/JPN
}

// Note: Preferences are now fetched from the database via API
// Previously defined as:
// export const PREFERENCES = [...]

// Partner Companies
export const PARTNER_COMPANIES = [
  {
    name: "Philippine Airlines",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Philippine_Airlines_logo.svg/2560px-Philippine_Airlines_logo.svg.png",
    alt: "Philippine Airlines"
  },
  {
    name: "Cebu Pacific",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Cebu_Pacific_Air_logo.svg/2560px-Cebu_Pacific_Air_logo.svg.png",
    alt: "Cebu Pacific"
  },
  {
    name: "Emirates",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1200px-Emirates_logo.svg.png",
    alt: "Emirates"
  },
  {
    name: "AirAsia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/AirAsia_New_Logo.svg/2560px-AirAsia_New_Logo.svg.png",
    alt: "AirAsia"
  }
];

// Features
export const FEATURES = [
  {
    title: "AI Trip Generation",
    description: "Generate personalized itineraries based on your preferences, budget, and travel style - all powered by Google Gemini AI.",
    icon: "route"
  },
  {
    title: "Visa Assistance",
    description: "Get instant guidance on visa requirements and application procedures for your destination country.",
    icon: "id-card"
  },
  {
    title: "Local Secrets",
    description: "Discover hidden gems and authentic experiences with recommendations from locals and experienced travelers.",
    icon: "map-marker-alt"
  }
];

// How it works steps
export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Input your preferences",
    description: "Tell us where you want to go, your budget, and what you love to do."
  },
  {
    step: 2,
    title: "AI creates itineraries",
    description: "Our AI generates personalized plans - one budget-friendly and one experience-focused."
  },
  {
    step: 3,
    title: "Review & customize",
    description: "Fine-tune your itinerary until it's exactly what you want."
  },
  {
    step: 4,
    title: "Book & explore",
    description: "Save your trip, book through our partners, and enjoy your adventure!"
  }
];

// Popular destinations
export const DESTINATIONS = [
  {
    name: "Tokyo, Japan",
    country: "Japan",
    description: "Explore the perfect blend of tradition and technology in Japan's vibrant capital.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    visaStatus: "Visa Required",
    recommendedDays: "5-7"
  },
  {
    name: "Singapore",
    country: "Singapore",
    description: "Experience the ultimate city-state with stunning architecture, amazing food and diverse culture.",
    image: "https://images.unsplash.com/photo-1597181242547-77ef8a6be447?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    visaStatus: "No Visa (30 days)",
    recommendedDays: "3-5",
    visaType: "success"
  },
  {
    name: "Seoul, South Korea",
    country: "South Korea",
    description: "Discover Korean culture, fashion, and street food in this dynamic Asian metropolis.",
    image: "https://images.unsplash.com/photo-1543470373-e055b73a8f29?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    visaStatus: "Visa Required",
    recommendedDays: "5-7"
  },
  {
    name: "Taipei, Taiwan",
    country: "Taiwan",
    description: "Explore night markets, hiking trails, and beautiful temples in Taiwan's capital city.",
    image: "https://images.unsplash.com/photo-1609924211018-5526c55bad5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    visaStatus: "Visa Required",
    recommendedDays: "4-6"
  },
  {
    name: "Bali, Indonesia",
    country: "Indonesia",
    description: "Experience stunning beaches, lush rice terraces, and vibrant culture on this beautiful island.",
    image: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    visaStatus: "No Visa (30 days)",
    recommendedDays: "7-10",
    visaType: "success"
  }
];

// Testimonials
export const TESTIMONIALS = [
  {
    quote: "MAPA AI helped me plan a perfect solo trip to Japan. The visa assistance was incredibly helpful, and the local recommendations were spot on!",
    name: "Maria Santos",
    location: "Manila, Philippines",
    image: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    quote: "The budget-focused itinerary was perfect for our family vacation to Singapore. We saved money while still enjoying amazing experiences.",
    name: "Roberto Cruz",
    location: "Cebu, Philippines",
    image: "https://randomuser.me/api/portraits/men/62.jpg"
  },
  {
    quote: "As a first-time international traveler, the visa help feature was invaluable. MAPA AI made the whole process so much easier!",
    name: "Liza Reyes",
    location: "Davao, Philippines",
    image: "https://randomuser.me/api/portraits/women/45.jpg"
  }
];

// Note: Currencies are now fetched from the database via API
// Previously defined as:
// export const CURRENCIES = [...]

// Months
export const MONTHS = [
  { value: 1, name: "January" },
  { value: 2, name: "February" },
  { value: 3, name: "March" },
  { value: 4, name: "April" },
  { value: 5, name: "May" },
  { value: 6, name: "June" },
  { value: 7, name: "July" },
  { value: 8, name: "August" },
  { value: 9, name: "September" },
  { value: 10, name: "October" },
  { value: 11, name: "November" },
  { value: 12, name: "December" }
];
