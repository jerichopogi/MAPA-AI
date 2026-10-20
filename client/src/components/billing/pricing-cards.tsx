import { Link } from "wouter";
import { Check, Loader2 } from "lucide-react";
import { FREE_FEATURES, PLUS_FEATURES, PRODUCTS, pesos, type ProductId } from "@shared/plans";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useBillingStatus, useCheckout } from "@/hooks/use-billing";
import { Routes } from "@/lib/constants";
import { cn } from "@/lib/utils";

function FeatureList({ items, inverted }: { items: string[]; inverted?: boolean }) {
  return (
    <ul className="mt-6 space-y-2.5 text-sm">
      {items.map((f) => (
        <li key={f} className="flex gap-2.5">
          <Check className={cn("mt-0.5 h-4 w-4 shrink-0", inverted ? "text-brand-foreground" : "text-primary")} />
          <span className={inverted ? "text-brand-foreground/85" : "text-muted-foreground"}>{f}</span>
        </li>
      ))}
    </ul>
  );
}

/** Free vs Plus (30-day and annual). Signed-out visitors are sent to sign-up first. */
export function PricingCards() {
  const { user } = useAuth();
  const { data: status } = useBillingStatus();
  const checkout = useCheckout();
  const isPlus = status?.plan === "plus";

  const buy = (product: ProductId) => checkout.mutate(product);
  const buyButton = (product: ProductId, label: string, variant: "default" | "light" = "default") =>
    user ? (
      <Button
        className={cn("mt-8 w-full", variant === "light" && "bg-brand-foreground text-brand hover:bg-brand-foreground/90")}
        onClick={() => buy(product)}
        disabled={checkout.isPending}
      >
        {checkout.isPending && checkout.variables === product && <Loader2 className="animate-spin" />}
        {isPlus ? "Extend Plus" : label}
      </Button>
    ) : (
      <Button asChild className={cn("mt-8 w-full", variant === "light" && "bg-brand-foreground text-brand hover:bg-brand-foreground/90")}>
        <Link href={`${Routes.REGISTER}`}>{label}</Link>
      </Button>
    );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card-soft flex flex-col p-7">
        <p className="text-sm text-muted-foreground">Free</p>
        <p className="display mt-2 text-5xl">₱0</p>
        <p className="mt-1 text-sm text-muted-foreground">Forever</p>
        <FeatureList items={FREE_FEATURES} />
        <div className="mt-auto">
          <Button variant="outline" className="mt-8 w-full" asChild>
            <Link href={user ? Routes.DASHBOARD : Routes.REGISTER}>{user ? (isPlus ? "Included" : "Current plan") : "Start free"}</Link>
          </Button>
        </div>
      </div>

      <div className="card-soft flex flex-col p-7">
        <p className="text-sm text-muted-foreground">Plus · 30 days</p>
        <p className="display mt-2 text-5xl">{pesos(PRODUCTS.plus_30d.amount)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{PRODUCTS.plus_30d.note}</p>
        <FeatureList items={PLUS_FEATURES} />
        <div className="mt-auto">{buyButton("plus_30d", "Get 30 days")}</div>
      </div>

      <div className="relative flex flex-col rounded-2xl bg-brand p-7 text-brand-foreground">
        <span className="absolute right-5 top-5 rounded-full bg-brand-foreground/15 px-2.5 py-1 text-xs">Best value</span>
        <p className="text-sm text-brand-foreground/75">Plus · 1 year</p>
        <p className="display mt-2 text-5xl">{pesos(PRODUCTS.plus_365d.amount)}</p>
        <p className="mt-1 text-sm text-brand-foreground/75">≈ {pesos(Math.round(PRODUCTS.plus_365d.amount / 12))}/month · {PRODUCTS.plus_365d.note}</p>
        <FeatureList items={PLUS_FEATURES} inverted />
        <div className="mt-auto">{buyButton("plus_365d", "Get 1 year", "light")}</div>
      </div>
    </div>
  );
}

export function PaymentMethodsNote() {
  return (
    <p className="mt-6 text-center text-xs text-muted-foreground">
      Secure checkout by PayPal · PayPal balance or Visa / Mastercard · One-time payment, no auto-renew
    </p>
  );
}
