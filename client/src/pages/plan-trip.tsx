import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowDown, ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { generateTripSchema, type AiResult, type GenerateTripInput, type GeneratedTrip } from "@shared/schema";
import { AIRPORTS, CITIES_BY_COUNTRY, COUNTRIES, CURRENCIES, MAIN_AIRPORT, MONTHS, PREFERENCES, cityName, countryName } from "@shared/reference-data";
import { AiSourceBadge } from "@/components/ai-source-badge";
import { PageHeader } from "@/components/layout/app-shell";
import { PreferenceIcon } from "@/components/preference-icon";
import { BookThisTrip } from "@/components/trips/booking-suggestions";
import { ItineraryView } from "@/components/trips/itinerary-view";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useBillingStatus } from "@/hooks/use-billing";
import { useCreateTrip } from "@/hooks/use-trips";
import { aiApi, isQuotaError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Routes, tripPath } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Read ?country=&month=&days=&budget= sent by the landing-page search bar. */
function prefillFromQuery(search: string): Partial<GenerateTripInput> {
  const q = new URLSearchParams(search);
  const num = (key: string, min: number, max: number) => {
    const n = Number(q.get(key));
    return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
  };
  const country = q.get("country") ?? "";
  return {
    destinationCountry: COUNTRIES.some((c) => c.code === country) ? country : undefined,
    travelMonth: num("month", 1, 12),
    duration: num("days", 1, 30),
    budget: num("budget", 1, 100_000_000),
  };
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors",
        selected ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function PlanTrip() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useI18n();
  const [result, setResult] = useState<{ input: GenerateTripInput; response: AiResult<GeneratedTrip> } | null>(null);
  const createTrip = useCreateTrip();
  const { data: billing } = useBillingStatus();
  const tripsLeft = billing?.plan === "free" ? Math.max(0, billing.limits.trip - billing.usage.trip) : null;
  const prefill = prefillFromQuery(useSearch());

  const form = useForm<GenerateTripInput>({
    resolver: zodResolver(generateTripSchema),
    defaultValues: {
      originAirport: "MNL",
      destinationCountry: prefill.destinationCountry ?? "",
      travelMonth: prefill.travelMonth ?? ((new Date().getMonth() + 1) % 12) + 1,
      currency: "PHP",
      duration: prefill.duration ?? 5,
      budget: prefill.budget ?? 50000,
      preferences: [],
      selectedCities: [],
    },
  });

  const country = form.watch("destinationCountry");
  const cities = CITIES_BY_COUNTRY[country] ?? [];

  const generate = useMutation({
    mutationFn: aiApi.generateTrip,
    onSuccess: (response, input) => {
      setResult({ input, response });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error) => !isQuotaError(error) && toast({ title: "Couldn't generate a trip", description: error.message, variant: "destructive" }),
  });

  async function save() {
    if (!result) return;
    const { input, response } = result;
    try {
      const trip = await createTrip.mutateAsync({
        name: response.data.tripName,
        originAirport: input.originAirport,
        destinationCountry: input.destinationCountry,
        selectedCities: input.selectedCities ?? [],
        travelMonth: input.travelMonth,
        duration: input.duration,
        currency: input.currency,
        budget: input.budget,
        preferences: input.preferences,
        budgetItinerary: response.data.budgetItinerary,
        experienceItinerary: response.data.experienceItinerary,
        bookingSuggestions: response.data.bookings ?? null,
      });
      toast({ title: "Trip saved", description: "Find it any time under My trips." });
      navigate(tripPath(trip.id));
    } catch (error) {
      toast({ title: "Couldn't save trip", description: (error as Error).message, variant: "destructive" });
    }
  }

  if (result) {
    const { input, response } = result;
    return (
      <>
        <Button variant="ghost" size="sm" className="-ml-3 mb-4" onClick={() => setResult(null)}>
          <ArrowLeft /> {t("Edit details")}
        </Button>
        <PageHeader
          title={response.data.tripName}
          description={t("Two plans for the same trip — compare them and save the one you like.")}
          actions={
            <>
              <Button variant="outline" asChild>
                <a href="#book">
                  <ArrowDown /> {t("Book this trip")}
                </a>
              </Button>
              <Button variant="outline" onClick={() => generate.mutate(input)} disabled={generate.isPending}>
                {generate.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />} {t("Regenerate")}
              </Button>
              <Button onClick={save} disabled={createTrip.isPending}>
                {createTrip.isPending ? <Loader2 className="animate-spin" /> : <Save />} {t("Save trip")}
              </Button>
            </>
          }
        />
        <AiSourceBadge source={response.source} className="mb-5" />
        <ItineraryView
          budgetItinerary={response.data.budgetItinerary}
          experienceItinerary={response.data.experienceItinerary}
          currency={input.currency}
          budget={input.budget}
        />
        <BookThisTrip
          className="mt-12"
          bookings={response.data.bookings}
          currency={input.currency}
          origin={input.originAirport}
          destinationAirport={MAIN_AIRPORT[input.destinationCountry] ?? ""}
          where={input.selectedCities?.length ? cityName(input.destinationCountry, input.selectedCities[0]) : countryName(input.destinationCountry)}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t("Plan a trip")} description={t("Tell us the basics. We'll draft a budget plan and an experience plan.")} />

      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit((values) => generate.mutate(values))} className="space-y-10">
          <section className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="destinationCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Where to?")}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("selectedCities", []);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Choose a country")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originAirport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Flying from")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an airport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AIRPORTS.map((a) => (
                        <SelectItem key={a.code} value={a.code}>
                          {a.name} ({a.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="travelMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("When")}</FormLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MONTHS.map((m, i) => (
                        <SelectItem key={m} value={String(i + 1)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("How many days")}</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={30} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-[7rem_1fr] gap-3 sm:col-span-2">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Currency")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Total budget")}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {cities.length > 1 && (
            <FormField
              control={form.control}
              name="selectedCities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Cities to include")}</FormLabel>
                  <p className="text-sm text-muted-foreground">{t("Optional — leave empty and we'll pick the highlights.")}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {cities.map((c) => (
                      <Chip key={c.code} selected={field.value?.includes(c.code) ?? false} onClick={() => field.onChange(toggle(field.value ?? [], c.code))}>
                        {c.name}
                      </Chip>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("What do you enjoy?")}</FormLabel>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PREFERENCES.map((p) => (
                    <Chip key={p.code} selected={field.value.includes(p.code)} onClick={() => field.onChange(toggle(field.value, p.code))}>
                      <PreferenceIcon name={p.icon} className="h-4 w-4" />
                      {p.name}
                    </Chip>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col-reverse items-center gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            {tripsLeft !== null && (
              <p className="text-sm text-muted-foreground">
                {tripsLeft} of {billing!.limits.trip} free itineraries left this month ·{" "}
                <Link href={Routes.PRICING} className="font-medium text-primary hover:underline">Go unlimited</Link>
              </p>
            )}
            <Button type="submit" size="lg" disabled={generate.isPending} className="w-full sm:w-auto">
              {generate.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> {t("Planning your trip…")}
                </>
              ) : (
                <>
                  <Sparkles /> {t("Generate itineraries")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
