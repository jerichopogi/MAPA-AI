export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
}

export interface Airport {
  code: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface Currency {
  code: string;
  name: string;
}

export interface Preference {
  id: number;
  code: string;
  name: string;
  icon: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DestinationCard {
  name: string;
  country: string;
  description: string;
  image: string;
  visaStatus: string;
  visaType?: string;
  recommendedDays: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  location: string;
  image: string;
}

export interface PartnerCompany {
  name: string;
  logo: string;
  alt: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface TripGenerateInput {
  originAirport: string;
  destinationCountry: string;
  travelMonth: number;
  currency: string;
  duration: number;
  budget: number;
  preferences: string[];
  selectedCities?: string[];
}

export interface City {
  code: string;
  name: string;
}

export interface Activity {
  time: string;
  description: string;
  cost: number;
}

export interface Accommodation {
  name: string;
  cost: number;
}

export interface Meal {
  description: string;
  cost: number;
}

export interface DailyPlan {
  day: number;
  activities: Activity[];
  accommodation: Accommodation;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
}

export interface Itinerary {
  summary: string;
  dailyPlans: DailyPlan[];
  totalCost: number;
}

export interface GeneratedTripResponse {
  tripName: string;
  budgetItinerary: Itinerary;
  experienceItinerary: Itinerary;
}

export interface Trip {
  id: number;
  userId: number;
  name: string;
  originAirport: string;
  destinationCountry: string;
  travelMonth: number;
  currency: string;
  duration: number;
  budget: number;
  preferences: string[];
  status: "upcoming" | "completed" | "cancelled";
  budgetItinerary?: Itinerary;
  experienceItinerary?: Itinerary;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}
