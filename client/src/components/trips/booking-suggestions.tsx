import { ArrowUpRight, BedDouble, Plane, Ticket } from "lucide-react";
import type { BookingSuggestions as Suggestions } from "@shared/schema";
import { PARTNERS, flightPartners, partnerLink, type Partner } from "@/lib/affiliates";
import { cn, formatCurrency } from "@/lib/utils";

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
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
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
        <p className="shrink-0 text-sm font-medium tabular-nums">{price}</p>
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
