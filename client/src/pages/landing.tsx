import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MapPinned,
  MessageCircle,
  Search,
  Sparkles,
  Stamp,
  Users,
  Wallet,
} from "lucide-react";
import { COUNTRIES, MONTHS } from "@shared/reference-data";
import { PaymentMethodsNote, PricingCards } from "@/components/billing/pricing-cards";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { DESTINATIONS, HERO_IMAGE, LANDING_IMAGES, Routes, TESTIMONIALS, countryImage } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

const FEATURES = [
  { icon: Sparkles, title: "Trip planner", text: "A budget plan and an experience plan for the same trip, with day-by-day costs in pesos." },
  { icon: Stamp, title: "Visa help", text: "Visa type, fees, processing time and the documents to prepare for a Philippine passport." },
  { icon: MapPinned, title: "Local secrets", text: "Restaurants, cafés and spots that locals love — with insider tips for each." },
  { icon: MessageCircle, title: "Travel assistant", text: "Ask about packing, budgets or neighbourhoods any time and get a straight answer." },
];

const STATS = [
  { value: "16", label: "Countries covered" },
  { value: "4", label: "AI travel tools" },
  { value: "₱0", label: "To get started" },
];

/** Hero search bar: pre-fills the trip planner. */
function TripSearchBar() {
  const [, navigate] = useLocation();
  const [country, setCountry] = useState("JPN");
  const [month, setMonth] = useState(String(((new Date().getMonth() + 1) % 12) + 1));
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(50000);

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ country, month, days: String(days), budget: String(budget) });
    navigate(`${Routes.NEW_TRIP}?${params}`);
  }

  const field = "flex flex-col gap-1 px-4 py-3 sm:py-0";
  const label = "flex items-center gap-1.5 text-xs text-muted-foreground";
  const bare = "h-auto border-0 bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <form
      onSubmit={submit}
      className="card-soft grid grid-cols-2 items-center divide-border p-2 sm:grid-cols-[1.3fr_1fr_0.8fr_1fr_auto] sm:divide-x sm:py-4"
    >
      <label className={field}>
        <span className={label}><MapPin className="h-3.5 w-3.5" /> Destination</span>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className={bare} aria-label="Destination"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label className={field}>
        <span className={label}><CalendarDays className="h-3.5 w-3.5" /> When</span>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className={bare} aria-label="Travel month"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label className={field}>
        <span className={label}><Users className="h-3.5 w-3.5" /> Days</span>
        <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Math.min(30, Math.max(1, e.target.valueAsNumber || 1)))} className="w-full bg-transparent text-sm font-medium outline-none" />
      </label>
      <label className={field}>
        <span className={label}><Wallet className="h-3.5 w-3.5" /> Budget (₱)</span>
        <input type="number" min={1000} value={budget} onChange={(e) => setBudget(e.target.valueAsNumber || 0)} className="w-full bg-transparent text-sm font-medium outline-none" />
      </label>
      <div className="col-span-2 px-2 pb-1 sm:col-span-1 sm:pb-0">
        <Button type="submit" className="w-full sm:h-11 sm:w-11 sm:p-0" aria-label="Plan this trip">
          <Search /> <span className="sm:hidden">Plan this trip</span>
        </Button>
      </div>
    </form>
  );
}

function SectionIntro({ label, title, text }: { label: string; title: string; text?: string }) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className="eyebrow">{label}</p>
        <h2 className="display mt-2 max-w-md text-4xl sm:text-5xl">{title}</h2>
      </div>
      {text && <p className="max-w-xs text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const ctaHref = user ? Routes.NEW_TRIP : Routes.REGISTER;
  const [featured, ...others] = DESTINATIONS;

  return (
    <div id="top" className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-muted pb-16 dark:bg-muted/40">
        <SiteHeader />
        <section className="container-page pt-6 sm:pt-10">
          <div className="grid items-end gap-8 lg:grid-cols-[1.6fr_1fr]">
            <h1 className="display text-5xl leading-[1.02] sm:text-7xl animate-fade-up">
              Your Next
              <br />
              Adventure Awaits
            </h1>
            <div className="max-w-xs pb-2">
              <p className="text-sm text-muted-foreground">
                Day-by-day itineraries in your budget, visa checklists for your Philippine passport, and the places locals actually go.
              </p>
              <Button asChild className="mt-5">
                <Link href={ctaHref}>Start planning</Link>
              </Button>
            </div>
          </div>

          <div className="relative mt-10">
            <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-background sm:aspect-[21/8]">
              <img src={HERO_IMAGE} alt="Limestone cliffs and lagoon in Palawan" className="h-full w-full object-cover" />
            </div>
            <div className="relative -mt-10 px-3 sm:absolute sm:inset-x-8 sm:-bottom-10 sm:mt-0 sm:px-0 lg:inset-x-24">
              <TripSearchBar />
            </div>
          </div>
        </section>
      </div>

      {/* Destinations ("tour packages") */}
      <section id="destinations" className="container-page scroll-mt-8 pt-28">
        <SectionIntro
          label="Popular destinations"
          title="Explore Where Filipinos Fly Next"
          text="Pick a destination and get two complete itineraries — budget-friendly and experience-first — in under a minute."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.75fr]">
          {/* Featured card */}
          <article className="card-soft flex flex-col p-3 sm:col-span-2 lg:col-span-1">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
              <img src={countryImage(featured.country)} alt={featured.name} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs backdrop-blur">
                <MapPin className="h-3 w-3" /> {featured.region}
              </span>
            </div>
            <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl font-light">{featured.name}</h3>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {featured.days}</span>
              </div>
              <p className="mt-1 font-medium">est. from {formatCurrency(featured.from)}</p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {["Visa checklist included", "Budget & experience plans", "Local food picks"].map((t) => (
                    <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {t}</li>
                  ))}
                </ul>
                <Button size="sm" asChild>
                  <Link href={ctaHref}>Plan trip</Link>
                </Button>
              </div>
            </div>
          </article>

          {/* Tall cards */}
          {others.slice(0, 2).map((d) => (
            <Link key={d.name} href={ctaHref} className="card-soft group flex flex-col p-3">
              <div className="relative flex-1 overflow-hidden rounded-xl">
                <img src={countryImage(d.country)} alt={d.name} loading="lazy" className="aspect-[3/4] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] lg:aspect-auto" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs backdrop-blur">
                  <MapPin className="h-3 w-3" /> {d.region}
                </span>
              </div>
              <div className="px-2 pb-1 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{d.name}</h3>
                  <span className="text-xs text-muted-foreground">{d.days}</span>
                </div>
                <p className="text-sm text-muted-foreground">est. from {formatCurrency(d.from)}</p>
              </div>
            </Link>
          ))}

          {/* More destinations */}
          <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1 lg:grid-cols-1 lg:grid-rows-[auto_1fr]">
            {others.slice(2, 3).map((d) => (
              <Link key={d.name} href={ctaHref} className="group relative aspect-square overflow-hidden rounded-2xl lg:aspect-[4/3]">
                <img src={countryImage(d.country)} alt={d.name} loading="lazy" className="h-full w-full object-cover" />
                <span className="arrow-btn absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-foreground">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
            <div className="flex flex-col justify-end text-sm text-muted-foreground">
              <p>{DESTINATIONS.slice(3).map((d) => d.name).join(", ")} and 10 more countries.</p>
              <p className="mt-2 text-xs">Prices are rough 4–5 day estimates from Manila, excluding flights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features ("Effortless Travel") */}
      <section id="features" className="container-page scroll-mt-8 py-28">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl bg-muted p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-light">Every Step of the Way</h3>
                <Link href={ctaHref} className="arrow-btn shrink-0" aria-label="Get started">
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                From the first "where should we go?" to the boarding gate — itinerary, visa, budget and local tips in one place.
              </p>
            </div>
            <div className="grid grid-cols-[1.6fr_1fr] gap-4">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl">
                <img src={LANDING_IMAGES.road} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <img src={LANDING_IMAGES.wing} alt="" loading="lazy" className="h-full w-full object-cover" />
                <span className="arrow-btn absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-foreground">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Features</p>
            <h2 className="display mt-2 text-4xl sm:text-5xl">Effortless Planning</h2>
            <ul className="mt-10 space-y-2">
              {FEATURES.map(({ icon: Icon, title, text }, i) => {
                const active = i === activeFeature;
                return (
                  <li key={title}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveFeature(i)}
                      onFocus={() => setActiveFeature(i)}
                      onClick={() => setActiveFeature(i)}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-colors",
                        active ? "bg-brand text-brand-foreground" : "hover:bg-muted",
                      )}
                    >
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", active ? "bg-brand-foreground/15" : "bg-muted")}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-lg font-light">{title}</span>
                        <span className={cn("mt-0.5 block text-sm", active ? "text-brand-foreground/75" : "text-muted-foreground")}>{text}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* About + stats */}
      <section id="about" className="container-page scroll-mt-8">
        <div className="rounded-3xl bg-muted p-8 sm:p-12 dark:bg-muted/60">
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
            <h2 className="display text-4xl sm:text-5xl">Built for Filipino Travelers</h2>
            <div>
              <p className="text-muted-foreground">
                MAPA AI turns trip planning into something you look forward to. Prices in pesos, visa guidance for Philippine passports, and pasalubong stops on the last day.
              </p>
              <Button variant="outline" className="mt-5 bg-transparent" asChild>
                <Link href={ctaHref}>Get started</Link>
              </Button>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="display text-4xl sm:text-5xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assistant + testimonials ("guides") */}
      <section className="container-page py-28">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.7fr]">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="eyebrow">Travelers say</p>
              <h2 className="display mt-2 text-4xl">A Planner That Gets It</h2>
            </div>
            <div className="space-y-3">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="card-soft p-5">
                  <blockquote className="text-sm leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{t.name}</span> · {t.location}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img src={LANDING_IMAGES.traveler} alt="Traveler with a backpack walking down a narrow street" loading="lazy" className="h-full min-h-[22rem] w-full object-cover" />
          </div>
          <Link href={user ? Routes.ASSISTANT : Routes.REGISTER} className="flex flex-col justify-between rounded-2xl bg-brand p-6 text-brand-foreground">
            <MessageCircle className="h-6 w-6" />
            <div>
              <p className="text-2xl font-light uppercase leading-tight tracking-wide">Ask the<br />assistant</p>
              <p className="mt-2 text-sm text-brand-foreground/70">Packing lists, budgets, neighbourhoods — any time.</p>
              <span className="arrow-btn mt-6 bg-brand-foreground text-brand"><ArrowUpRight className="h-4 w-4" /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-page scroll-mt-8 pb-28">
        <SectionIntro label="Pricing" title="Start Free, Upgrade Anytime" text="Pay once with PayPal or card. No subscriptions, no surprise charges." />
        <div className="mt-12">
          <PricingCards />
          <PaymentMethodsNote />
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-6">
        <div className="relative overflow-hidden rounded-3xl">
          <img src={LANDING_IMAGES.beach} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="relative px-6 py-20 text-white sm:px-12 sm:py-28">
            <h2 className="display max-w-lg text-4xl sm:text-6xl">Let's Turn Your Plans Into Reality!</h2>
            <p className="mt-4 max-w-sm text-white/80">Create a free account and get your first itinerary in under a minute.</p>
            <Button size="lg" className="mt-8 bg-white text-brand hover:bg-white/90" asChild>
              <Link href={ctaHref}>Plan my trip</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
