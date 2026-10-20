import { useEffect, useState } from "react";
import { BellRing, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUpdateTrip } from "@/hooks/use-trips";
import { useI18n } from "@/lib/i18n";
import type { Trip } from "@/lib/types";

const todayIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const daysUntil = (date: string) => Math.round((new Date(`${date}T00:00:00`).getTime() - new Date(`${todayIso()}T00:00:00`).getTime()) / 86_400_000);

/** Departure date + email reminders 30 and 7 days before. */
export function TripReminders({ trip }: { trip: Trip }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const update = useUpdateTrip(trip.id);
  const [date, setDate] = useState(trip.startDate ?? "");
  useEffect(() => setDate(trip.startDate ?? ""), [trip.startDate]);

  const save = () =>
    update.mutate(
      { startDate: date || null },
      {
        onSuccess: () => toast({ title: date ? "Departure date saved" : "Departure date cleared" }),
        onError: (e) => toast({ title: "Couldn't save date", description: e.message, variant: "destructive" }),
      },
    );

  const left = trip.startDate ? daysUntil(trip.startDate) : null;
  const status =
    left === null
      ? "Set your departure date to get reminders."
      : left < 0
        ? "This trip's date has passed."
        : !trip.remindersEnabled
          ? "Reminders are off."
          : left > 30
            ? `First reminder in ${left - 30} days (30 days before you fly).`
            : left > 7
              ? `Next reminder in ${left - 7} days (1 week before you fly).`
              : left === 0
                ? "Have a great trip — ingat!"
                : `You fly in ${left} day${left === 1 ? "" : "s"}.`;

  return (
    <div className="card-soft p-5">
      <h2 className="flex items-center gap-2 font-medium">
        <BellRing className="h-4 w-4 text-primary" /> {t("Trip reminders")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        We'll email you 30 days and 7 days before you fly: visa deadline, packing list and booking links.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="flex-1 space-y-1.5 text-sm">
          <span className="text-muted-foreground">{t("Departure date")}</span>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              min={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className="relative cursor-pointer pl-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
          </div>
        </label>
        <Button onClick={save} disabled={update.isPending || date === (trip.startDate ?? "")}>
          {update.isPending && <Loader2 className="animate-spin" />} Save
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
        <p className="text-sm text-muted-foreground">{status}</p>
        <label className="flex shrink-0 items-center gap-2 text-sm">
          Email reminders
          <Switch
            checked={trip.remindersEnabled}
            onCheckedChange={(on) => update.mutate({ remindersEnabled: on })}
            aria-label="Email reminders"
          />
        </label>
      </div>
    </div>
  );
}
