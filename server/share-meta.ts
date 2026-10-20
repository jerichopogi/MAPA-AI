// Link previews for shared trips (/s/:shareId). Chat apps (Messenger, Viber,
// WhatsApp) don't run JavaScript, so the title, description and photo must be
// in the HTML the server sends.
import { countryImage } from "@shared/images";
import { countryName, monthName } from "@shared/reference-data";
import { config, isSupabaseConfigured } from "./config";

const SHARE_PATH = /^\/s\/([A-Za-z0-9_-]{16,64})\/?(?:\?.*)?$/;

interface SharedTripSummary {
  name: string;
  destination_country: string;
  duration: number;
  travel_month: number;
  owner_first_name: string | null;
}

async function fetchSharedTrip(shareId: string): Promise<SharedTripSummary | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const res = await fetch(`${config.supabase.url}/rest/v1/rpc/get_shared_trip`, {
      method: "POST",
      headers: {
        apikey: config.supabase.anonKey,
        Authorization: `Bearer ${config.supabase.anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_share_id: shareId }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as SharedTripSummary[];
    return rows[0] ?? null;
  } catch {
    return null; // Previews are best-effort; the page itself still loads.
  }
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Returns the page HTML with Open Graph tags for shared-trip URLs; other URLs pass through. */
export async function withShareMeta(url: string, html: string, origin: string): Promise<string> {
  const match = url.match(SHARE_PATH);
  if (!match) return html;
  const trip = await fetchSharedTrip(match[1]);
  if (!trip) return html;

  const title = `${trip.name} · MAPA AI`;
  const by = trip.owner_first_name ? `${trip.owner_first_name}'s` : "A";
  const description = `${by} ${trip.duration}-day ${countryName(trip.destination_country)} trip for ${monthName(trip.travel_month)} — day-by-day plan, costs in pesos and where to stay. Plan yours free with MAPA AI.`;
  const image = countryImage(trip.destination_country, 1200);
  const tags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="MAPA AI" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:image" content="${escape(image)}" />`,
    `<meta property="og:url" content="${escape(origin + url.split("?")[0])}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escape(description)}" />`)
    .replace("</head>", `    ${tags}\n  </head>`);
}
