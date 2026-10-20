import { Link } from "wouter";
import { Receipt, Sparkles } from "lucide-react";
import { PRODUCTS, pesos } from "@shared/plans";
import { PricingCards } from "@/components/billing/pricing-cards";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBillingStatus, usePayments } from "@/hooks/use-billing";
import { Routes } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

function UsageRow({ label, used, limit, unlimited }: { label: string; used: number; limit: number; unlimited: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{unlimited ? `${used} used · unlimited` : `${used} / ${limit}`}</span>
      </div>
      {!unlimited && <Progress value={Math.min(100, (used / limit) * 100)} className="mt-2 h-1.5" />}
    </div>
  );
}

const STATUS_STYLES = {
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  pending: "bg-muted text-muted-foreground",
  failed: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export default function Billing() {
  const { data: status, isLoading } = useBillingStatus();
  const { data: payments = [] } = usePayments();
  const isPlus = status?.plan === "plus";

  return (
    <div className="space-y-10">
      <PageHeader title="Plan & billing" description="Your plan, this month's usage and receipts." />

      {isLoading || !status ? (
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <section className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
          <div className={cn("rounded-2xl p-6", isPlus ? "bg-brand text-brand-foreground" : "card-soft")}>
            <p className={cn("text-sm", isPlus ? "text-brand-foreground/70" : "text-muted-foreground")}>Current plan</p>
            <p className="display mt-1 flex items-center gap-2 text-4xl">
              {isPlus && <Sparkles className="h-6 w-6" />} {isPlus ? "Plus" : "Free"}
            </p>
            <p className={cn("mt-2 text-sm", isPlus ? "text-brand-foreground/70" : "text-muted-foreground")}>
              {isPlus ? `Active until ${formatDate(status.plusUntil!)}` : "Upgrade for unlimited AI trips and answers."}
            </p>
            {!isPlus && (
              <Button className="mt-5" asChild>
                <a href="#plans">See Plus plans</a>
              </Button>
            )}
          </div>
          <div className="card-soft space-y-5 p-6">
            <p className="text-sm font-medium">This month</p>
            <UsageRow label="AI itineraries" used={status.usage.trip} limit={status.limits.trip} unlimited={isPlus} />
            <UsageRow label="Visa, local secrets & assistant" used={status.usage.other} limit={status.limits.other} unlimited={isPlus} />
            <p className="text-xs text-muted-foreground">Free limits reset on the 1st of each month.</p>
          </div>
        </section>
      )}

      {status && !status.provider && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          Payments aren't configured on the server yet.
        </p>
      )}

      <section id="plans" className="scroll-mt-8">
        <h2 className="mb-4 text-lg font-medium">{isPlus ? "Extend your pass" : "Upgrade"}</h2>
        <PricingCards />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Payment history</h2>
        {payments.length ? (
          <div className="card-soft divide-y">
            {payments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                <div>
                  <p className="font-medium">{PRODUCTS[p.product]?.name ?? p.product}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.created_at)} · {p.provider === "mock" ? "Test checkout" : "PayMongo"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums">{pesos(p.amount)}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs capitalize", STATUS_STYLES[p.status])}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Receipt} title="No payments yet" description="Receipts for Plus passes will appear here." action={<Button variant="outline" asChild><Link href={Routes.PRICING}>View pricing</Link></Button>} />
        )}
      </section>
    </div>
  );
}
