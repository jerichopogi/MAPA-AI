import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Coffee, Landmark, Leaf, Lightbulb, Loader2, MapPin, MapPinned, Moon, Search, ShoppingBag, UtensilsCrossed } from "lucide-react";
import type { LocalSecretsQueryInput } from "@shared/schema";
import { AiSourceBadge } from "@/components/ai-source-badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { aiApi, isQuotaError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Category = LocalSecretsQueryInput["category"];

const CATEGORIES: { value: Category; label: string; icon: typeof Coffee }[] = [
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "cafe", label: "Cafés", icon: Coffee },
  { value: "sights", label: "Sights", icon: Landmark },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "nature", label: "Nature", icon: Leaf },
  { value: "nightlife", label: "Nightlife", icon: Moon },
];

const QUICK_CITIES = ["Tokyo", "Seoul", "Taipei", "Bangkok", "Singapore", "Hanoi"];

export default function LocalSecrets() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<Category>("food");

  const search = useMutation({
    mutationFn: aiApi.localSecrets,
    onError: (error) => !isQuotaError(error) && toast({ title: "Couldn't find places", description: error.message, variant: "destructive" }),
  });

  function run(nextCity = city, nextCategory = category) {
    if (nextCity.trim().length < 2) return;
    search.mutate({ city: nextCity.trim(), category: nextCategory });
  }

  return (
    <>
      <PageHeader title={t("Local secrets")} description={t("The places locals love and tourists usually miss.")} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Which city?" className="pl-9" />
        </div>
        <Button type="submit" disabled={search.isPending || city.trim().length < 2}>
          {search.isPending ? <Loader2 className="animate-spin" /> : <Search />}
          <span className="hidden sm:inline">Find places</span>
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK_CITIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCity(c);
              run(c);
            }}
            className="rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => {
              setCategory(value);
              run(city, value);
            }}
            aria-pressed={category === value}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors",
              category === value ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {search.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : search.data ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {search.data.data.length} picks in <span className="font-medium text-foreground">{search.variables?.city}</span>
              </p>
              <AiSourceBadge source={search.data.source} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {search.data.data.map((place) => (
                <article key={place.name} className="flex flex-col rounded-xl border bg-card p-5 animate-fade-up">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{place.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {place.type} · {place.neighborhood}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground" aria-label={`Price level ${place.priceLevel} of 4`}>
                      {"₱".repeat(place.priceLevel)}
                      <span className="opacity-30">{"₱".repeat(4 - place.priceLevel)}</span>
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{place.description}</p>
                  <p className="mt-auto flex gap-2 pt-4 text-sm text-muted-foreground">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {place.insiderTip}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(`${place.name} ${place.neighborhood}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    Open in Maps →
                  </a>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState icon={MapPinned} title="Search a city" description="Pick a city and a category to see insider recommendations." />
        )}
      </div>
    </>
  );
}
