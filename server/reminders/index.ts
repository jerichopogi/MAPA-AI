// Sends pre-trip reminder emails 30 and 7 days before each trip's departure date.
// Runs inside the server process every hour. Each (trip, kind) is claimed in
// trip_reminders before sending, so it is emailed at most once even across restarts.
import { config } from "../config";
import { sendEmail } from "../email";
import { log } from "../log";
import { manilaDayStart } from "../middleware/rate-limit";
import { supabaseAdmin } from "../supabase-admin";
import { buildReminderEmail, type ReminderKind, type ReminderTrip } from "./template";

const KINDS: { kind: ReminderKind; daysBefore: number }[] = [
  { kind: "30d", daysBefore: 30 },
  { kind: "7d", daysBefore: 7 },
];

/** YYYY-MM-DD for Manila "today + n days". */
function manilaDatePlus(days: number, now = new Date()) {
  const start = manilaDayStart(now);
  const target = new Date(start.getTime() + 8 * 3600_000 + days * 86_400_000);
  return target.toISOString().slice(0, 10);
}

export async function runReminders(now = new Date()) {
  if (!supabaseAdmin) return { sent: 0, skipped: 0, failed: 0 };
  const appUrl = config.appUrl || `http://localhost:${config.port}`;
  const stats = { sent: 0, skipped: 0, failed: 0 };

  for (const { kind, daysBefore } of KINDS) {
    const date = manilaDatePlus(daysBefore, now);
    const { data: trips, error } = await supabaseAdmin
      .from("trips")
      .select("id, user_id, name, origin_airport, destination_country, selected_cities, start_date, booking_suggestions")
      .eq("start_date", date)
      .eq("reminders_enabled", true);
    if (error) throw error;

    for (const trip of (trips ?? []) as (ReminderTrip & { user_id: string })[]) {
      // Claim first: a duplicate key means this reminder was already sent.
      const claim = await supabaseAdmin.from("trip_reminders").insert({ trip_id: trip.id, kind });
      if (claim.error) {
        if (claim.error.code === "23505") stats.skipped++;
        else log(`claim failed for trip ${trip.id}: ${claim.error.message}`, "reminders");
        continue;
      }

      try {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(trip.user_id);
        if (userError || !userData.user?.email) throw userError ?? new Error("user has no email");
        const user = userData.user;
        const firstName = String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "").split(" ")[0];
        const email = buildReminderEmail(trip, kind, firstName, appUrl);
        await sendEmail({ ...email, to: user.email! });
        stats.sent++;
      } catch (e) {
        // Release the claim so the next run retries.
        await supabaseAdmin.from("trip_reminders").delete().eq("trip_id", trip.id).eq("kind", kind);
        log(`failed to send ${kind} reminder for trip ${trip.id}: ${(e as Error).message}`, "reminders");
        stats.failed++;
      }
    }
  }
  return stats;
}

export function startReminderScheduler() {
  if (!supabaseAdmin) {
    log("Reminders: off (set SUPABASE_SERVICE_ROLE_KEY)", "setup");
    return;
  }
  log(config.email.resendApiKey ? "Reminders: on (Resend)" : "Reminders: dry run (set RESEND_API_KEY to send emails)", "setup");

  const tick = () =>
    runReminders()
      .then((s) => (s.sent || s.failed) && log(`sent ${s.sent}, failed ${s.failed}, already sent ${s.skipped}`, "reminders"))
      .catch((e) => log(`run failed: ${(e as Error).message}`, "reminders"));

  setTimeout(tick, 60_000).unref();
  setInterval(tick, 60 * 60_000).unref();
}
