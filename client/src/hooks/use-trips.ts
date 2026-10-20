// Trip data access. Reads and writes go straight to Supabase; Row Level
// Security guarantees each user only ever sees their own rows.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requireSupabase } from "@/lib/supabase";
import type { NewTrip, Trip, TripStatus } from "@/lib/types";

interface TripRow {
  id: string;
  name: string;
  origin_airport: string;
  destination_country: string;
  selected_cities: string[];
  travel_month: number;
  duration: number;
  currency: string;
  budget: number;
  preferences: string[];
  status: TripStatus;
  budget_itinerary: Trip["budgetItinerary"];
  experience_itinerary: Trip["experienceItinerary"];
  booking_suggestions: Trip["bookingSuggestions"];
  notes: string;
  created_at: string;
}

const fromRow = (r: TripRow): Trip => ({
  id: r.id,
  name: r.name,
  originAirport: r.origin_airport,
  destinationCountry: r.destination_country,
  selectedCities: r.selected_cities,
  travelMonth: r.travel_month,
  duration: r.duration,
  currency: r.currency,
  budget: r.budget,
  preferences: r.preferences,
  status: r.status,
  budgetItinerary: r.budget_itinerary,
  experienceItinerary: r.experience_itinerary,
  bookingSuggestions: r.booking_suggestions,
  notes: r.notes,
  createdAt: r.created_at,
});

const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};

export function useTrips() {
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as TripRow[]).map(fromRow);
    },
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("trips").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? fromRow(data as TripRow) : null;
    },
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (trip: NewTrip) => {
      const { data, error } = await requireSupabase()
        .from("trips")
        .insert({
          name: trip.name,
          origin_airport: trip.originAirport,
          destination_country: trip.destinationCountry,
          selected_cities: trip.selectedCities,
          travel_month: trip.travelMonth,
          duration: trip.duration,
          currency: trip.currency,
          budget: trip.budget,
          preferences: trip.preferences,
          budget_itinerary: trip.budgetItinerary,
          experience_itinerary: trip.experienceItinerary,
          booking_suggestions: trip.bookingSuggestions,
        })
        .select()
        .single();
      if (error) throw error;
      return fromRow(data as TripRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useUpdateTrip(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<Trip, "name" | "status" | "notes">>) => {
      const { data, error } = await requireSupabase().from("trips").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return fromRow(data as TripRow);
    },
    onSuccess: (trip) => {
      qc.setQueryData(tripKeys.detail(id), trip);
      qc.invalidateQueries({ queryKey: tripKeys.all, exact: true });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireSupabase().from("trips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}
