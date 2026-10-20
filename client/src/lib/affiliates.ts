// Partner (affiliate) links. The AI only suggests WHAT to book; links are built
// here so they always point at the real partner site and carry your partner ID.
//
// Configure in .env once each program approves you. A *_LINK value replaces the
// default link format; it can use {query}, {from}, {to}, {id} and {url} (the
// default link, URL-encoded — useful for network deep-link wrappers such as
// Involve Asia). Empty parameters are dropped automatically.

export type Partner = "booking" | "agoda" | "klook" | "cebupacific" | "airasia" | "googleflights";

interface PartnerConfig {
  name: string;
  /** Default link format. */
  link: string;
  /** Override from .env (paste the format from the partner's deep-link tool). */
  override?: string;
  /** Your partner/affiliate ID. */
  id?: string;
}

const env = import.meta.env;

export const PARTNERS: Record<Partner, PartnerConfig> = {
  booking: {
    name: "Booking.com",
    link: "https://www.booking.com/searchresults.html?ss={query}&aid={id}",
    override: env.VITE_BOOKING_LINK,
    id: env.VITE_BOOKING_AID,
  },
  agoda: {
    name: "Agoda",
    link: "https://www.agoda.com/search?textToSearch={query}&cid={id}",
    override: env.VITE_AGODA_LINK,
    id: env.VITE_AGODA_CID,
  },
  klook: {
    name: "Klook",
    link: "https://www.klook.com/en-PH/search/result/?query={query}&aid={id}",
    override: env.VITE_KLOOK_LINK,
    id: env.VITE_KLOOK_AID,
  },
  cebupacific: {
    name: "Cebu Pacific",
    link: "https://www.cebupacificair.com/en-PH/",
    override: env.VITE_CEBUPACIFIC_LINK,
  },
  airasia: {
    name: "AirAsia",
    link: "https://www.airasia.com/flights/search/?origin={from}&destination={to}&tripType=R&adult=1&locale=en-gb&currency=PHP",
    override: env.VITE_AIRASIA_LINK,
  },
  googleflights: {
    name: "Google Flights",
    link: "https://www.google.com/travel/flights?q=Flights%20from%20{from}%20to%20{to}",
  },
};

function fill(template: string, vars: Record<string, string | undefined>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(vars[key] ?? ""));
}

function dropEmptyParams(href: string) {
  try {
    const url = new URL(href);
    for (const [key, value] of [...url.searchParams]) if (!value) url.searchParams.delete(key);
    return url.toString();
  } catch {
    return href;
  }
}

export function partnerLink(partner: Partner, vars: { query?: string; from?: string; to?: string } = {}) {
  const p = PARTNERS[partner];
  const base = dropEmptyParams(fill(p.link, { ...vars, id: p.id }));
  return p.override ? dropEmptyParams(fill(p.override, { ...vars, id: p.id, url: base })) : base;
}

/** Which booking sites to offer for a suggested airline. */
export function flightPartners(airline: string): Partner[] {
  const a = airline.toLowerCase();
  if (a.includes("cebu")) return ["cebupacific", "googleflights"];
  if (a.includes("airasia")) return ["airasia", "googleflights"];
  return ["googleflights"];
}
