import { Link } from "wouter";
import { countryName, monthName } from "@shared/reference-data";
import { countryImage, tripPath } from "@/lib/constants";
import type { Trip } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { TripStatusBadge } from "./trip-status-badge";

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link href={tripPath(trip.id)} className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={countryImage(trip.destinationCountry)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <TripStatusBadge status={trip.status} className="absolute left-3 top-3" />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-medium">{trip.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {countryName(trip.destinationCountry)} · {trip.duration} days · {monthName(trip.travelMonth)}
        </p>
        <p className="mt-3 text-sm font-medium">{formatCurrency(trip.budget, trip.currency)} budget</p>
      </div>
    </Link>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
