import { useSearch } from "wouter";
import { PaymentMethodsNote, PricingCards } from "@/components/billing/pricing-cards";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const FAQ = [
  { q: "Is this a subscription?", a: "No. Plus is a one-time pass for 30 days or 1 year. Nothing renews automatically, so you're never charged by surprise." },
  { q: "How do I pay?", a: "Through PayPal's secure checkout, with your PayPal balance or any Visa/Mastercard (no PayPal account needed for cards). We never see your card details." },
  { q: "What happens when my pass ends?", a: "You go back to the Free plan. Your saved trips and notes stay exactly where they are." },
  { q: "Can I extend early?", a: "Yes — buying again adds the new days on top of the time you have left." },
];

export default function Pricing() {
  const canceled = new URLSearchParams(useSearch()).has("canceled");
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted pb-16 dark:bg-muted/40">
        <SiteHeader />
        <section className="container-page pt-8 text-center">
          <p className="eyebrow">Pricing</p>
          <h1 className="display mx-auto mt-2 max-w-2xl text-5xl sm:text-6xl">Simple Plans for Every Traveler</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">Start free. Upgrade to Plus when you're planning more trips — pay once with PayPal or card.</p>
          {canceled && (
            <p className="mx-auto mt-6 max-w-md rounded-xl bg-background px-4 py-3 text-sm text-muted-foreground">Checkout was canceled — you weren't charged.</p>
          )}
        </section>
      </div>

      <section className="container-page -mt-8">
        <PricingCards />
        <PaymentMethodsNote />
      </section>

      <section className="container-page grid gap-x-12 gap-y-8 py-24 md:grid-cols-2">
        {FAQ.map((f) => (
          <div key={f.q}>
            <h2 className="text-lg font-medium">{f.q}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </section>

      <SiteFooter />
    </div>
  );
}
