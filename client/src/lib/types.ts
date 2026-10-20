import type { BookingSuggestions, Itinerary } from "@shared/schema";

export type TripStatus = "upcoming" | "completed" | "cancelled";

/** A saved trip, as used in the UI (camelCase view of the `trips` table). */
export interface Trip {
  id: string;
  name: string;
  originAirport: string;
  destinationCountry: string;
  selectedCities: string[];
  travelMonth: number;
  duration: number;
  currency: string;
  budget: number;
  preferences: string[];
  status: TripStatus;
  budgetItinerary: Itinerary | null;
  experienceItinerary: Itinerary | null;
  bookingSuggestions: BookingSuggestions | null;
  notes: string;
  /** Token for the public share link (/s/:shareId); null when not shared. */
  shareId: string | null;
  /** Departure date (YYYY-MM-DD), used for email reminders. */
  startDate: string | null;
  remindersEnabled: boolean;
  createdAt: string;
}

export type NewTrip = Omit<Trip, "id" | "createdAt" | "status" | "notes" | "shareId" | "startDate" | "remindersEnabled">;
