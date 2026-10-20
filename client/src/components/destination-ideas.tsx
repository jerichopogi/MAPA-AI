import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { CalendarDays, CloudSun, Compass, Loader2, PartyPopper, Stamp } from "lucide-react";
import { AiSourceBadge } from "@/components/ai-source-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { aiApi, isQuotaError } from "@/lib/api";
import { Routes, countryImage } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const isoDate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

/** "Where should I go?" — AI ranks the best countries for a chosen departure date. */
export function DestinationIdeas() {
  const { toast } = useToast();
  const [date, setDate] = useState(() => isoDate(new Date(Date.now() + 30 * 864e5)));
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(50000);

  const ideas = useMutation({
    mutationFn: aiApi.destinationIdeas,
    onError: (error) => !isQuotaError(error) && toast({ title: "Couldn't get ideas", description: error.message, variant: "destructive" }),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    ideas.mutate({ date, days, budget, interests: [] });
  }

  const month = Number(ideas.variables?.date.slice(5, 7) ?? 0);

  return (
    <section className="card-soft p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-medium">
            <Compass className="h-5 w-5 text-primary" /> Where should I go?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick a date — we'll rank the best countries for that time of year.</p>
        </div>
        {ideas.data && <AiSourceBadge source={ideas.data.source} />}
      </div>

      <form onSubmit={submit} className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-[1.2fr_0.7fr_1fr_auto] sm:items-end">
        <label className="col-span-2 space-y-1.5 text-sm sm:col-span-1">
          <span className="text-muted-foreground">Leaving on</span>
          <Input type="date" value={date} min={isoDate(new Date())} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Days</span>
          <Input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Math.min(30, Math.max(1, e.target.valueAsNumber || 1)))} />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Budget (₱, with flights)</span>
          <Input type="number" min={1000} value={budget} onChange={(e) => setBudget(e.target.valueAsNumber || 0)} />
        </label>
        <Button type="submit" className="col-span-2 sm:col-span-1" disabled={ideas.isPending || !date}>
          {ideas.isPending ? <Loader2 className="animate-spin" /> : <CalendarDays />} Find places
        </Button>
      </form>

      {ideas.isPending && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}

      {ideas.data && !ideas.isPending && (
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {ideas.data.data.map((idea, i) => (
            <li key={idea.countryCode + idea.city} className="flex flex-col overflow-hidden rounded-2xl border bg-background animate-fade-up">
              <div className="relative h-28 bg-muted">
                <img src={countryImage(idea.countryCode)} alt="" loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">#{i + 1}</span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-medium">
                    {idea.city === idea.country ? idea.city : `${idea.city}, ${idea.country}`}
                  </h3>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">~{formatCurrency(idea.estimatedBudget)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{idea.why}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex gap-2"><CloudSun className="h-3.5 w-3.5 shrink-0" /> {idea.weather}</li>
                  <li className="flex gap-2"><PartyPopper className="h-3.5 w-3.5 shrink-0" /> {idea.happening}</li>
                  <li className="flex gap-2"><Stamp className="h-3.5 w-3.5 shrink-0" /> {idea.visa}</li>
                </ul>
                <Button size="sm" variant="outline" className="mt-4 self-start" asChild>
                  <Link href={`${Routes.NEW_TRIP}?${new URLSearchParams({ country: idea.countryCode, month: String(month), days: String(ideas.variables!.days), budget: String(ideas.variables!.budget) })}`}>
                    Plan this trip
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
