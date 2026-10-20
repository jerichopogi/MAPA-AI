import { z } from "zod";

// ---------------------------------------------------------------------------
// AI request schemas (validated on both client and server)
// ---------------------------------------------------------------------------

export const generateTripSchema = z.object({
  originAirport: z.string().min(3, "Select an origin airport"),
  destinationCountry: z.string().min(2, "Select a destination country"),
  travelMonth: z.number().int().min(1).max(12),
  currency: z.string().min(3),
  duration: z.number().int().min(1, "At least 1 day").max(30, "30 days or less"),
  budget: z.number().int().min(1, "Budget must be greater than 0"),
  preferences: z.string().array().min(1, "Pick at least one interest"),
  selectedCities: z.string().array().optional(),
});
export type GenerateTripInput = z.infer<typeof generateTripSchema>;

export const visaQuerySchema = z.object({
  destination: z.string().min(2, "Select a destination country"),
  purpose: z.enum(["tourism", "business", "family", "education", "medical"]),
  duration: z.number().int().min(1).max(365),
  hasVisitedBefore: z.boolean().default(false),
});
export type VisaQueryInput = z.infer<typeof visaQuerySchema>;

export const localSecretsQuerySchema = z.object({
  city: z.string().min(2, "Enter a city"),
  category: z.enum(["food", "cafe", "sights", "shopping", "nature", "nightlife"]),
});
export type LocalSecretsQueryInput = z.infer<typeof localSecretsQuerySchema>;

export const destinationIdeasSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  days: z.number().int().min(1).max(30),
  budget: z.number().int().min(1000),
  interests: z.string().array().max(8).default([]),
});
export type DestinationIdeasInput = z.infer<typeof destinationIdeasSchema>;

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});
export type ChatInput = z.infer<typeof chatSchema>;

// ---------------------------------------------------------------------------
// AI response shapes
// ---------------------------------------------------------------------------

/** Interface/AI language: English or Taglish. */
export type Lang = "en" | "tl";

/** Where an AI answer came from — "mock" until GEMINI_API_KEY is configured. */
export type AiSource = "gemini" | "mock";

export interface TripActivity {
  time: string;
  description: string;
  cost: number;
}

export interface DailyPlan {
  day: number;
  title?: string;
  activities: TripActivity[];
  accommodation: { name: string; cost: number };
  meals: {
    breakfast: { description: string; cost: number };
    lunch: { description: string; cost: number };
    dinner: { description: string; cost: number };
  };
}

export interface Itinerary {
  summary: string;
  dailyPlans: DailyPlan[];
  totalCost: number;
}

/** What the AI suggests booking. The app turns these into partner (affiliate) links. */
export interface FlightSuggestion {
  airline: string;
  /** IATA airport codes, e.g. MNL → NRT. */
  from: string;
  to: string;
  estimatedFare: number;
  note: string;
}

export interface StaySuggestion {
  name: string;
  city: string;
  area: string;
  style: "budget" | "experience";
  pricePerNight: number;
  why: string;
}

export interface ActivitySuggestion {
  name: string;
  city: string;
  price: number;
  why: string;
}

export interface BookingSuggestions {
  flights: FlightSuggestion[];
  stays: StaySuggestion[];
  activities: ActivitySuggestion[];
}

export interface GeneratedTrip {
  tripName: string;
  budgetItinerary: Itinerary;
  experienceItinerary: Itinerary;
  bookings?: BookingSuggestions;
}

/** One ranked destination from "Where should I go?". */
export interface DestinationIdea {
  countryCode: string;
  country: string;
  city: string;
  why: string;
  weather: string;
  happening: string;
  visa: string;
  estimatedBudget: number;
}

export interface VisaRequirement {
  country: string;
  visaRequired: boolean;
  visaType: string;
  stayDuration: string;
  processingTime: string;
  fee: string;
  requirements: string[];
  notes: string;
  embassyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

export interface LocalPlace {
  name: string;
  type: string;
  neighborhood: string;
  description: string;
  priceLevel: 1 | 2 | 3 | 4;
  insiderTip: string;
}

export interface AiResult<T> {
  source: AiSource;
  data: T;
}

// ---------------------------------------------------------------------------
// Client-side form schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const packageRequestSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  contactMethod: z.enum(["email", "phone", "sms", "whatsapp"]),
  destination: z.string().min(1, "Choose a destination"),
  travelDates: z.string().optional(),
  adults: z.number().int().min(1),
  children: z.number().int().min(0),
  budgetRange: z.string().min(1, "Choose a budget range"),
  interests: z.string().array(),
  message: z.string().optional(),
});
export type PackageRequestInput = z.infer<typeof packageRequestSchema>;
