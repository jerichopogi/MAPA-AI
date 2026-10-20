import { Link } from "wouter";
import { ArrowRight, Luggage, MapPinned, MessageCircle, Sparkles, Stamp } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { TripCard, TripCardSkeleton } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTrips } from "@/hooks/use-trips";
import { DESTINATIONS, Routes, countryImage } from "@/lib/constants";

const ACTIONS = [
  { href: Routes.NEW_TRIP, icon: Sparkles, title: "Plan a trip", text: "Two AI itineraries in under a minute." },
  { href: Routes.VISA_HELP, icon: Stamp, title: "Check visa rules", text: "Requirements for Philippine passports." },
  { href: Routes.LOCAL_SECRETS, icon: MapPinned, title: "Local secrets", text: "Places locals love, by city." },
  { href: Routes.ASSISTANT, icon: MessageCircle, title: "Ask the assistant", text: "Any travel question, answered." },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Dashboard() {
  const { displayName } = useAuth();
  const { data: trips, isLoading } = useTrips();
  const recent = trips?.slice(0, 3) ?? [];

  return (
    <div className="space-y-12">
      <section>
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="display mt-1 text-4xl">{displayName.split(" ")[0]} — where to next?</h1>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <h2 className="mt-4 font-medium">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent trips</h2>
          {recent.length > 0 && (
            <Link href={Routes.MY_TRIPS} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : recent.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Luggage}
            title="No trips yet"
            description="Generate your first itinerary — it takes less than a minute."
            action={
              <Button asChild>
                <Link href={Routes.NEW_TRIP}>
                  <Sparkles /> Plan a trip
                </Link>
              </Button>
            }
          />
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Inspiration</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {DESTINATIONS.map((d) => (
            <Link key={d.name} href={Routes.NEW_TRIP} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
              <img src={countryImage(d.country)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-white/80">{d.visa}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
