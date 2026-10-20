// Pre-trip reminder email (30 and 7 days before departure).
import { buildPartnerLink, createPartners } from "@shared/affiliates";
import { countryImage } from "@shared/images";
import { MAIN_AIRPORT, PLUG_TYPES, VISA_BASICS, cityName, countryName } from "@shared/reference-data";
import type { BookingSuggestions } from "@shared/schema";
import type { Email } from "../email";

export interface ReminderTrip {
  id: string;
  name: string;
  origin_airport: string;
  destination_country: string;
  selected_cities: string[];
  start_date: string; // YYYY-MM-DD
  booking_suggestions: BookingSuggestions | null;
}

export type ReminderKind = "30d" | "7d";

const partners = createPartners(process.env);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function packingList(country: string, kind: ReminderKind) {
  const items = [
    "Passport (valid 6+ months after your return date)",
    "Printed or offline copies of your return ticket and hotel bookings",
    "Travel insurance details and emergency contacts",
    `Power adapter — plug type ${PLUG_TYPES[country] ?? "varies"}`,
    "Some local cash plus a card that works abroad (tell your bank you're traveling)",
    "Medicines in original packaging, with a doctor's note for prescriptions",
  ];
  if (kind === "7d") items.push("eSIM or roaming plan, and offline maps of your destination");
  return items;
}

function visaAdvice(country: string, kind: ReminderKind) {
  const basics = VISA_BASICS[country];
  if (!basics) return "Check the visa rules for your destination with the embassy.";
  if (!basics.required) return `No visa needed for a short tourist trip. ${basics.note}`;
  return kind === "30d"
    ? `A visa is required. If you haven't applied yet, do it this week — ${basics.note}`
    : `A visa is required. If it isn't approved yet, contact your agency or the embassy today. ${basics.note}`;
}

export function buildReminderEmail(trip: ReminderTrip, kind: ReminderKind, firstName: string, appUrl: string): Email {
  const country = countryName(trip.destination_country);
  const where = trip.selected_cities.length ? cityName(trip.destination_country, trip.selected_cities[0]) : country;
  const days = kind === "30d" ? 30 : 7;
  const tripUrl = `${appUrl}/trips/${trip.id}`;
  const departure = new Date(`${trip.start_date}T00:00:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" });

  const stay = trip.booking_suggestions?.stays?.[0];
  const activity = trip.booking_suggestions?.activities?.[0];
  const to = MAIN_AIRPORT[trip.destination_country] ?? "";
  const links = [
    { label: "Compare flights", href: buildPartnerLink(partners, "googleflights", { from: trip.origin_airport, to }) },
    { label: stay ? `Book ${stay.name}` : `Find a place to stay in ${where}`, href: buildPartnerLink(partners, "agoda", { query: stay ? `${stay.name} ${stay.city}` : where }) },
    { label: activity ? `Get tickets: ${activity.name}` : `Tours & passes in ${where}`, href: buildPartnerLink(partners, "klook", { query: activity ? `${activity.name} ${activity.city}` : where }) },
  ];

  const subject = kind === "30d" ? `30 days to ${where}! Your pre-trip checklist` : `1 week to ${where} — final checks before you fly`;
  const visa = visaAdvice(trip.destination_country, kind);
  const packing = packingList(trip.destination_country, kind);

  const text = [
    `Hi ${firstName || "there"},`,
    ``,
    `${trip.name} starts ${departure} — that's ${days} days away.`,
    ``,
    `VISA: ${visa}`,
    ``,
    `PACKING LIST:`,
    ...packing.map((p) => `- ${p}`),
    ``,
    `BOOK IT:`,
    ...links.map((l) => `- ${l.label}: ${l.href}`),
    ``,
    `Your itinerary: ${tripUrl}`,
    ``,
    `You're getting this because reminders are on for this trip. Turn them off on the trip page: ${tripUrl}`,
    `MAPA AI may earn a commission from booking links, at no extra cost to you.`,
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;color:#141a1c">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td><img src="${esc(countryImage(trip.destination_country, 1120))}" width="560" alt="" style="display:block;width:100%;height:auto;max-height:220px;object-fit:cover"></td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0;font-size:13px;color:#5f6b6e">Mapa.ai · ${days} days to go</p>
          <h1 style="margin:8px 0 0;font-size:26px;font-weight:300;line-height:1.2">${esc(subject)}</h1>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.6">Hi ${esc(firstName || "there")}, <strong>${esc(trip.name)}</strong> starts <strong>${esc(departure)}</strong>.</p>

          <h2 style="margin:24px 0 8px;font-size:16px">🛂 Visa</h2>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#3b4547">${esc(visa)}</p>

          <h2 style="margin:24px 0 8px;font-size:16px">🧳 Packing list</h2>
          <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#3b4547">${packing.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>

          <h2 style="margin:24px 0 8px;font-size:16px">✈️ Book it</h2>
          ${links
            .map(
              (l) =>
                `<p style="margin:0 0 8px"><a href="${esc(l.href)}" style="display:inline-block;padding:10px 16px;border-radius:999px;background:#eef3f4;color:#1b4552;text-decoration:none;font-size:14px">${esc(l.label)} →</a></p>`,
            )
            .join("")}

          <p style="margin:28px 0 0"><a href="${esc(tripUrl)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#1b4552;color:#ffffff;text-decoration:none;font-size:15px">Open my itinerary</a></p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#1b4552;color:#c9d6d9;font-size:12px;line-height:1.6">
          You're getting this because reminders are on for this trip. <a href="${esc(tripUrl)}" style="color:#ffffff">Turn them off</a> on the trip page.<br>
          MAPA AI may earn a commission from booking links, at no extra cost to you.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { to: "", subject, html, text };
}
