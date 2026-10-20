import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { MAIN_AIRPORT, airportName, cityName, countryName, monthName, preferenceName } from "@shared/reference-data";
import type { BookingSuggestions, Itinerary } from "@shared/schema";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookThisTrip } from "@/components/trips/booking-suggestions";
import { ItineraryView } from "@/components/trips/itinerary-view";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Routes, countryImage } from "@/lib/constants";
import { requireSupabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

interface SharedTrip {
  name: string;
  origin_airport: string;
  destination_country: string;
  selected_cities: string[];
  travel_month: number;
  duration: number;
  currency: string;
  budget: number;
  preferences: string[];
  budget_itinerary: Itinerary | null;
  experience_itinerary: Itinerary | null;
  booking_suggestions: BookingSuggestions | null;
  owner_first_name: string | null;
}

/** Public, read-only view of a shared trip. Every visit is also a MAPA AI ad. */
export default function SharedTripPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const { user } = useAuth();
  const cta = user ? Routes.NEW_TRIP : Routes.REGISTER;

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ["shared-trip", shareId],
    queryFn: async () => {
      const { data, error } = await requireSupabase().rpc("get_shared_trip", { p_share_id: shareId });
      if (error) throw error;
      return ((data as SharedTrip[])[0] ?? null) as SharedTrip | null;
    },
    retry: false,
  });

  const where = trip
    ? trip.selected_cities.length
      ? cityName(trip.destination_country, trip.selected_cities[0])
      : countryName(trip.destination_country)
    : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href={cta}>Plan your own trip</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !trip ? (
          <div className="mx-auto max-w-md py-24 text-center">
            <h1 className="display text-3xl">This trip isn't shared anymore</h1>
            <p className="mt-3 text-muted-foreground">The owner may have turned off the link. You can plan your own trip in under a minute.</p>
            <Button className="mt-8" asChild>
              <Link href={cta}>Plan a trip — free</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-muted sm:aspect-[21/8]">
              <img src={countryImage(trip.destination_country, 1600)} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8">
                <p className="text-sm text-white/80">
                  {trip.owner_first_name ? `${trip.owner_first_name}'s trip` : "Shared trip"} · planned with MAPA AI
                </p>
                <h1 className="display mt-2 text-3xl sm:text-5xl">{trip.name}</h1>
              </div>
            </div>

            <dl className="card-soft grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "From", value: airportName(trip.origin_airport) },
                { label: "Destination", value: [countryName(trip.destination_country), ...trip.selected_cities.map((c) => cityName(trip.destination_country, c))].join(" · ") },
                { label: "When", value: `${monthName(trip.travel_month)} · ${trip.duration} days` },
                { label: "Budget", value: `${formatCurrency(trip.budget, trip.currency)} · ${trip.preferences.map(preferenceName).join(", ")}` },
              ].map((f) => (
                <div key={f.label}>
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>

            {trip.budget_itinerary && trip.experience_itinerary && (
              <section>
                <h2 className="mb-4 text-lg font-medium">Itinerary</h2>
                <ItineraryView budgetItinerary={trip.budget_itinerary} experienceItinerary={trip.experience_itinerary} currency={trip.currency} budget={trip.budget} />
              </section>
            )}

            <BookThisTrip
              bookings={trip.booking_suggestions}
              currency={trip.currency}
              origin={trip.origin_airport}
              destinationAirport={MAIN_AIRPORT[trip.destination_country] ?? ""}
              where={where}
            />

            <section className="flex flex-col items-start gap-6 rounded-3xl bg-brand p-8 text-brand-foreground sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div>
                <p className="flex items-center gap-2 text-sm text-brand-foreground/75">
                  <Sparkles className="h-4 w-4" /> Made with MAPA AI
                </p>
                <h2 className="display mt-2 text-3xl sm:text-4xl">Plan your own trip in under a minute</h2>
                <p className="mt-2 max-w-md text-brand-foreground/75">Two AI itineraries, visa checklist for Philippine passports, and prices in pesos. Free to start.</p>
              </div>
              <Button size="lg" className="shrink-0 bg-brand-foreground text-brand hover:bg-brand-foreground/90" asChild>
                <Link href={cta}>
                  Start planning <ArrowRight />
                </Link>
              </Button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
