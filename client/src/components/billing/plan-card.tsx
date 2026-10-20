import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useBillingStatus } from "@/hooks/use-billing";
import { Routes } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

/** Sidebar card: Plus status, or Free usage with an upgrade link. */
export function PlanCard({ onNavigate }: { onNavigate?: () => void }) {
  const { data } = useBillingStatus();
  const { t } = useI18n();
  if (!data) return null;

  if (data.plan === "plus") {
    return (
      <Link href={Routes.BILLING} onClick={onNavigate} className="block rounded-2xl bg-brand p-4 text-brand-foreground">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="h-4 w-4" /> MAPA Plus
        </p>
        <p className="mt-1 text-xs text-brand-foreground/70">Active until {formatDate(data.plusUntil!)}</p>
      </Link>
    );
  }

  const left = Math.max(0, data.limits.trip - data.usage.trip);
  return (
    <div className="rounded-2xl bg-muted p-4">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{t("Free plan")}</span>
        <span className="text-muted-foreground">
          {left} of {data.limits.trip} trips left
        </span>
      </div>
      <Progress value={(data.usage.trip / data.limits.trip) * 100} className="mt-2 h-1.5" />
      <Link href={Routes.PRICING} onClick={onNavigate} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        <Sparkles className="h-3 w-3" /> {t("Upgrade to Plus")}
      </Link>
    </div>
  );
}
