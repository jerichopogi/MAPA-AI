import { ArrowUpRight, BedDouble, Plane, Ticket } from "lucide-react";
import type { BookingSuggestions as Suggestions } from "@shared/schema";
import { PARTNERS, flightPartners, partnerLink, type Partner } from "@/lib/affiliates";
import { cn, formatCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

function PartnerButton({ partner, vars, primary }: { partner: Partner; vars: Parameters<typeof partnerLink>[1]; primary?: boolean }) {
  return (
    <a
      href={partnerLink(partner, vars)}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border hover:bg-muted",
      )}
    >
      {PARTNERS[partner].name} <ArrowUpRight className="h-3 w-3" />
    </a>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Plane; title: string; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {t(title)}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Item({ title, meta, price, why, children }: { title: string; meta: string; price: string; why: string; children: React.ReactNode }) {
  return (
    <div className="card-soft flex flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium leading-snug">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
        </div>
        {price && <p className="shrink-0 text-sm font-medium tabular-nums">{price}</p>}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{why}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">{children}</div>
    </div>
  );
}

/** AI-suggested flights, stays and activities, each linking to partner booking sites. */
export function BookingSuggestions({ bookings, currency }: { bookings: Suggestions; currency: string }) {
  return (
    <div className="space-y-8">
      {bookings.flights.length > 0 && (
        <Section icon={Plane} title="Flights">
          {bookings.flights.map((f, i) => (
            <Item key={i} title={f.airline} meta={`${f.from} → ${f.to} · round trip`} price={`~${formatCurrency(f.estimatedFare, currency)}`} why={f.note}>
              {flightPartners(f.airline).map((p, j) => (
                <PartnerButton key={p} partner={p} vars={{ from: f.from, to: f.to }} primary={j === 0} />
              ))}
            </Item>
          ))}
        </Section>
      )}

      {bookings.stays.length > 0 && (
        <Section icon={BedDouble} title="Where to stay">
          {bookings.stays.map((s, i) => (
            <Item
              key={i}
              title={s.name}
              meta={`${s.area}, ${s.city} · ${s.style === "budget" ? "Budget pick" : "Experience pick"}`}
              price={`~${formatCurrency(s.pricePerNight, currency)}/night`}
              why={s.why}
            >
              <PartnerButton partner="agoda" vars={{ query: `${s.name} ${s.city}` }} primary />
              <PartnerButton partner="booking" vars={{ query: `${s.name} ${s.city}` }} />
            </Item>
          ))}
        </Section>
      )}

      {bookings.activities.length > 0 && (
        <Section icon={Ticket} title="Tours & activities">
          {bookings.activities.map((a, i) => (
            <Item key={i} title={a.name} meta={a.city} price={`~${formatCurrency(a.price, currency)}`} why={a.why}>
              <PartnerButton partner="klook" vars={{ query: `${a.name} ${a.city}` }} primary />
            </Item>
          ))}
        </Section>
      )}

      <p className="text-xs text-muted-foreground">
        Prices are AI estimates — check the final price on the booking site. MAPA AI may earn a commission when you book through these
        links, at no extra cost to you.
      </p>
    </div>
  );
}

/** Destination-wide partner links, for trips saved without AI suggestions. */
function QuickBookingLinks({ origin, destinationAirport, where }: { origin: string; destinationAirport: string; where: string }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Item title="Flights" meta={`${origin} → ${destinationAirport || where}`} price="" why="Compare fares, then book direct with the airline.">
          <PartnerButton partner="cebupacific" vars={{ from: origin, to: destinationAirport }} primary />
          <PartnerButton partner="airasia" vars={{ from: origin, to: destinationAirport }} />
          <PartnerButton partner="googleflights" vars={{ from: origin, to: destinationAirport }} />
        </Item>
        <Item title="Where to stay" meta={where} price="" why="Hotels, hostels and apartments with free cancellation options.">
          <PartnerButton partner="agoda" vars={{ query: where }} primary />
          <PartnerButton partner="booking" vars={{ query: where }} />
        </Item>
        <Item title="Tours & activities" meta={where} price="" why="Attraction tickets, day tours, rail passes and airport transfers.">
          <PartnerButton partner="klook" vars={{ query: where }} primary />
        </Item>
      </div>
      <p className="text-xs text-muted-foreground">
        MAPA AI may earn a commission when you book through these links, at no extra cost to you.
      </p>
    </div>
  );
}

/** The "Book this trip" section: AI suggestions when available, otherwise destination-wide links. */
export function BookThisTrip({
  bookings,
  currency,
  origin,
  destinationAirport,
  where,
  className,
}: {
  bookings: Suggestions | null | undefined;
  currency: string;
  origin: string;
  destinationAirport: string;
  where: string;
  className?: string;
}) {
  const { t } = useI18n();
  const hasSuggestions = bookings && (bookings.flights.length || bookings.stays.length || bookings.activities.length);
  return (
    <section id="book" className={cn("scroll-mt-8 no-print", className)}>
      <h2 className="text-lg font-medium">{t("Book this trip")}</h2>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">
        {hasSuggestions ? t("Hand-picked by the AI for this itinerary.") : `Find flights, stays and tours for ${where}.`}
      </p>
      {hasSuggestions ? (
        <BookingSuggestions bookings={bookings} currency={currency} />
      ) : (
        <QuickBookingLinks origin={origin} destinationAirport={destinationAirport} where={where} />
      )}
    </section>
  );
}
