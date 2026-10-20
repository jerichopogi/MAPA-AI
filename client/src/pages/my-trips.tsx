import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Luggage, Plus, Search } from "lucide-react";
import { countryName } from "@shared/reference-data";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/app-shell";
import { TripCard, TripCardSkeleton } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrips } from "@/hooks/use-trips";
import { useI18n } from "@/lib/i18n";
import { Routes } from "@/lib/constants";
import type { TripStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { value: TripStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyTrips() {
  const { data: trips = [], isLoading, error } = useTrips();
  const { t } = useI18n();
  const [filter, setFilter] = useState<TripStatus | "all">("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: trips.length };
    for (const t of trips) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [trips]);

  const q = query.trim().toLowerCase();
  const visible = trips.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      (!q || t.name.toLowerCase().includes(q) || countryName(t.destinationCountry).toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader
        title={t("My trips")}
        description={t("Every itinerary you've saved.")}
        actions={
          <Button asChild>
            <Link href={Routes.NEW_TRIP}>
              <Plus /> New trip
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                filter === f.value ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label} <span className="text-muted-foreground">{counts[f.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trips" className="pl-9" type="search" />
        </div>
      </div>

      {error ? (
        <EmptyState icon={Luggage} title="Couldn't load trips" description={(error as Error).message} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Luggage}
          title={trips.length ? "No matching trips" : "No trips yet"}
          description={trips.length ? "Try another filter or search term." : "Plan a trip and save it to see it here."}
          action={
            !trips.length && (
              <Button asChild>
                <Link href={Routes.NEW_TRIP}>
                  <Plus /> Plan a trip
                </Link>
              </Button>
            )
          }
        />
      )}
    </>
  );
}
