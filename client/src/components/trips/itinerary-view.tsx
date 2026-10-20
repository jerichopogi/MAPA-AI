import { BedDouble, UtensilsCrossed } from "lucide-react";
import type { DailyPlan, Itinerary } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

function DayCard({ day, currency }: { day: DailyPlan; currency: string }) {
  const meals = day.meals.breakfast.cost + day.meals.lunch.cost + day.meals.dinner.cost;
  return (
    <li className="rounded-xl border bg-card p-5">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Day {day.day}</span>
        {day.title && <h4 className="font-medium">{day.title}</h4>}
      </div>

      <ol className="mt-4 space-y-3">
        {day.activities.map((a, i) => (
          <li key={i} className="grid grid-cols-[5.5rem_1fr_auto] gap-3 text-sm">
            <span className="text-muted-foreground">{a.time}</span>
            <span>{a.description}</span>
            <span className="tabular-nums text-muted-foreground">{a.cost ? formatCurrency(a.cost, currency) : "Free"}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-2 border-t pt-4 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2 text-muted-foreground">
          <BedDouble className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {day.accommodation.name} · <span className="tabular-nums">{formatCurrency(day.accommodation.cost, currency)}</span>
          </span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground" title={`${day.meals.breakfast.description} · ${day.meals.lunch.description} · ${day.meals.dinner.description}`}>
          <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Meals · <span className="tabular-nums">{formatCurrency(meals, currency)}</span>
          </span>
        </div>
      </div>
    </li>
  );
}

function ItineraryPanel({ itinerary, currency, budget }: { itinerary: Itinerary; currency: string; budget?: number }) {
  const overBudget = budget !== undefined && itinerary.totalCost > budget;
  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 rounded-xl bg-muted/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">{itinerary.summary}</p>
        <div className="shrink-0 sm:text-right">
          <p className="text-xs text-muted-foreground">Estimated total</p>
          <p className="text-xl font-semibold tabular-nums">{formatCurrency(itinerary.totalCost, currency)}</p>
          {budget !== undefined && (
            <p className={overBudget ? "text-xs text-amber-600 dark:text-amber-400" : "text-xs text-emerald-600 dark:text-emerald-400"}>
              {overBudget ? `${formatCurrency(itinerary.totalCost - budget, currency)} over budget` : "Within budget"}
            </p>
          )}
        </div>
      </div>
      <ol className="space-y-3">
        {itinerary.dailyPlans.map((day) => (
          <DayCard key={day.day} day={day} currency={currency} />
        ))}
      </ol>
    </div>
  );
}

/** Side-by-side budget vs. experience plans. */
export function ItineraryView({
  budgetItinerary,
  experienceItinerary,
  currency,
  budget,
}: {
  budgetItinerary: Itinerary;
  experienceItinerary: Itinerary;
  currency: string;
  budget?: number;
}) {
  return (
    <Tabs defaultValue="budget">
      <TabsList className="mb-5 grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
        <TabsTrigger value="budget">Budget plan</TabsTrigger>
        <TabsTrigger value="experience">Experience plan</TabsTrigger>
      </TabsList>
      <TabsContent value="budget">
        <ItineraryPanel itinerary={budgetItinerary} currency={currency} budget={budget} />
      </TabsContent>
      <TabsContent value="experience">
        <ItineraryPanel itinerary={experienceItinerary} currency={currency} budget={budget} />
      </TabsContent>
    </Tabs>
  );
}
