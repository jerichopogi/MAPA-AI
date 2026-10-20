import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowDown, ArrowLeft, Loader2, Plane, Printer, Trash2 } from "lucide-react";
import { MAIN_AIRPORT } from "@shared/reference-data";
import { airportName, cityName, countryName, monthName, preferenceName } from "@shared/reference-data";
import { EmptyState } from "@/components/empty-state";
import { BookThisTrip } from "@/components/trips/booking-suggestions";
import { ShareTripDialog } from "@/components/trips/share-trip-dialog";
import { TripReminders } from "@/components/trips/trip-reminders";
import { ItineraryView } from "@/components/trips/itinerary-view";
import { TripStatusBadge } from "@/components/trips/trip-status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDeleteTrip, useTrip, useUpdateTrip } from "@/hooks/use-trips";
import { useI18n } from "@/lib/i18n";
import { Routes, countryImage } from "@/lib/constants";
import type { Trip, TripStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

/** Display name of where the trip goes: first selected city, else the country. */
const tripWhere = (trip: Trip) =>
  trip.selectedCities.length ? cityName(trip.destinationCountry, trip.selectedCities[0]) : countryName(trip.destinationCountry);

function Notes({ trip }: { trip: Trip }) {
  const [notes, setNotes] = useState(trip.notes);
  const update = useUpdateTrip(trip.id);
  const { toast } = useToast();
  useEffect(() => setNotes(trip.notes), [trip.notes]);
  const dirty = notes !== trip.notes;
  const { t } = useI18n();

  return (
    <div className="card-soft p-5">
      <h2 className="font-medium">{t("Notes")}</h2>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Packing list, booking references, reminders…"
        className="mt-3 min-h-[120px]"
      />
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          disabled={!dirty || update.isPending}
          onClick={() =>
            update.mutate(
              { notes },
              {
                onSuccess: () => toast({ title: "Notes saved" }),
                onError: (e) => toast({ title: "Couldn't save notes", description: e.message, variant: "destructive" }),
              },
            )
          }
        >
          {update.isPending && <Loader2 className="animate-spin" />} {t("Save notes")}
        </Button>
      </div>
    </div>
  );
}

export default function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useI18n();
  const { data: trip, isLoading, error } = useTrip(id);
  const update = useUpdateTrip(id);
  const remove = useDeleteTrip();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <EmptyState
        icon={Plane}
        title="Trip not found"
        description={error ? (error as Error).message : "It may have been deleted."}
        action={
          <Button variant="outline" asChild>
            <Link href={Routes.MY_TRIPS}>Back to my trips</Link>
          </Button>
        }
      />
    );
  }

  const facts = [
    { label: "From", value: airportName(trip.originAirport) },
    { label: "Destination", value: [countryName(trip.destinationCountry), ...trip.selectedCities.map((c) => cityName(trip.destinationCountry, c))].join(" · ") },
    { label: "When", value: `${monthName(trip.travelMonth)} · ${trip.duration} days` },
    { label: "Budget", value: formatCurrency(trip.budget, trip.currency) },
    { label: "Interests", value: trip.preferences.map(preferenceName).join(", ") },
    { label: "Saved", value: formatDate(trip.createdAt) },
  ];

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="-ml-3 no-print" asChild>
        <Link href={Routes.MY_TRIPS}>
          <ArrowLeft /> My trips
        </Link>
      </Button>

      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
        <img src={countryImage(trip.destinationCountry)} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8">
          <TripStatusBadge status={trip.status} />
          <h1 className="display mt-3 text-3xl sm:text-4xl">{trip.name}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 no-print">
        <Select
          value={trip.status}
          onValueChange={(status) =>
            update.mutate(
              { status: status as TripStatus },
              { onError: (e) => toast({ title: "Couldn't update status", description: e.message, variant: "destructive" }) },
            )
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild>
          <a href="#book">
            <ArrowDown /> {t("Book this trip")}
          </a>
        </Button>
        <ShareTripDialog trip={trip} />
        <Button variant="outline" onClick={() => window.print()}>
          <Printer /> {t("Print / PDF")}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 /> {t("Delete")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
              <AlertDialogDescription>“{trip.name}” and its notes will be permanently removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() =>
                  remove.mutate(trip.id, {
                    onSuccess: () => {
                      toast({ title: "Trip deleted" });
                      navigate(Routes.MY_TRIPS);
                    },
                    onError: (e) => toast({ title: "Couldn't delete trip", description: e.message, variant: "destructive" }),
                  })
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <dl className="grid gap-x-8 gap-y-4 rounded-xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-xs text-muted-foreground">{f.label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{f.value || "—"}</dd>
          </div>
        ))}
      </dl>

      {trip.budgetItinerary && trip.experienceItinerary ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("Itinerary")}</h2>
          <ItineraryView
            budgetItinerary={trip.budgetItinerary}
            experienceItinerary={trip.experienceItinerary}
            currency={trip.currency}
            budget={trip.budget}
          />
        </section>
      ) : null}

      <BookThisTrip
        bookings={trip.bookingSuggestions}
        currency={trip.currency}
        origin={trip.originAirport}
        destinationAirport={MAIN_AIRPORT[trip.destinationCountry] ?? ""}
        where={tripWhere(trip)}
      />

      <section className="grid gap-4 no-print lg:grid-cols-2">
        <TripReminders trip={trip} />
        <Notes trip={trip} />
      </section>
    </div>
  );
}
