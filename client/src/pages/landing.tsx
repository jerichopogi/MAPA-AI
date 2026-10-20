import { Link } from "wouter";
import { ArrowRight, Check, MapPinned, MessageCircle, Sparkles, Stamp, Wallet } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { DESTINATIONS, HERO_IMAGE, Routes, TESTIMONIALS, countryImage } from "@/lib/constants";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Two itineraries, one click",
    text: "A budget plan and an experience plan for the same trip, with day-by-day costs in pesos.",
  },
  {
    icon: Stamp,
    title: "Visa help for PH passports",
    text: "Visa type, fees, processing time and the exact documents to prepare.",
  },
  {
    icon: MapPinned,
    title: "Local secrets",
    text: "Restaurants, cafés and spots that locals love — with insider tips.",
  },
  {
    icon: MessageCircle,
    title: "Ask anything",
    text: "A travel assistant for packing lists, budgets and neighbourhood picks.",
  },
];

const STEPS = [
  { title: "Tell us the basics", text: "Destination, month, days, budget and what you enjoy." },
  { title: "Compare two plans", text: "Budget-first or experience-first, side by side." },
  { title: "Save and go", text: "Keep notes, track status and jump to booking sites." },
];

const SAMPLE_DAY = [
  { time: "Morning", text: "Tsukiji Outer Market breakfast crawl", cost: "₱900" },
  { time: "Afternoon", text: "teamLab Planets, Toyosu", cost: "₱1,700" },
  { time: "Evening", text: "Shibuya Sky at sunset", cost: "₱1,100" },
];

export default function Landing() {
  const { user } = useAuth();
  const ctaHref = user ? Routes.NEW_TRIP : Routes.REGISTER;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="container-page grid items-center gap-12 pb-20 pt-12 lg:grid-cols-2 lg:pt-20">
        <div className="animate-fade-up">
          <p className="eyebrow">Built for Filipino travelers</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            Plan your next trip abroad in minutes.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            MAPA AI drafts day-by-day itineraries in your budget, checks visa rules for your passport, and finds the places locals actually go.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={ctaHref}>
                Start planning — it's free <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["No credit card", "Prices in pesos", "Saves your trips"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-muted sm:aspect-[5/4] lg:aspect-[4/5]">
            <img src={HERO_IMAGE} alt="Island lagoon in El Nido, Palawan" className="h-full w-full object-cover" />
          </div>
          {/* Sample itinerary card */}
          <div className="absolute -bottom-8 left-4 right-4 rounded-2xl border bg-background/95 p-5 shadow-xl backdrop-blur sm:left-auto sm:right-6 sm:w-80">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Day 2 · Tokyo</p>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Wallet className="h-3 w-3" /> ₱3,700
              </span>
            </div>
            <ul className="mt-3 space-y-2.5">
              {SAMPLE_DAY.map((a) => (
                <li key={a.time} className="grid grid-cols-[4.5rem_1fr_auto] gap-2 text-sm">
                  <span className="text-muted-foreground">{a.time}</span>
                  <span>{a.text}</span>
                  <span className="tabular-nums text-muted-foreground">{a.cost}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t bg-muted/40 py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Features</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Everything before the airport, in one place.</h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-background p-8">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-5 font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container-page scroll-mt-20 py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">From idea to itinerary in three steps.</h2>
        </div>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t pt-6">
              <span className="text-sm font-medium text-primary">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Destinations */}
      <section id="destinations" className="scroll-mt-20 border-t py-24">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Popular right now</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Where Filipinos are flying.</h2>
            </div>
            <Link href={ctaHref} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Plan one of these <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {DESTINATIONS.map((d) => (
              <Link key={d.name} href={ctaHref} className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <img src={countryImage(d.country)} alt={d.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className="mt-3 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                  <p className="font-medium">
                    {d.name}
                    <span className="text-muted-foreground">, {d.region}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{d.days}</p>
                </div>
                <p className="text-sm text-muted-foreground">{d.visa}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-muted/40 py-24">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl border bg-background p-6">
              <blockquote className="leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t.name}</span> · {t.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-24">
        <div className="rounded-3xl bg-foreground px-6 py-16 text-center text-background sm:px-16">
          <h2 className="text-3xl font-semibold sm:text-4xl">Your next trip starts here.</h2>
          <p className="mx-auto mt-4 max-w-md text-background/70">Create a free account and get your first itinerary in under a minute.</p>
          <Button size="lg" className="mt-8" asChild>
            <Link href={ctaHref}>
              Plan my trip <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
