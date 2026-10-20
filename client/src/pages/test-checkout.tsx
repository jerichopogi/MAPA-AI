import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { CreditCard, FlaskConical, Loader2, Smartphone, Wallet } from "lucide-react";
import { PRODUCTS, pesos, type ProductId } from "@shared/plans";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { billingApi } from "@/lib/api";
import { Routes } from "@/lib/constants";
import { requireSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const METHODS = [
  { id: "gcash", label: "GCash", icon: Smartphone },
  { id: "maya", label: "Maya", icon: Wallet },
  { id: "card", label: "Card", icon: CreditCard },
];

/**
 * Local stand-in for PayMongo's hosted checkout, used in development when no
 * PAYMONGO_SECRET_KEY is set. The server refuses these payments in production.
 */
export default function TestCheckout() {
  const paymentId = new URLSearchParams(useSearch()).get("payment") ?? "";
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [method, setMethod] = useState("gcash");
  const [busy, setBusy] = useState<"paid" | "failed" | null>(null);

  const { data: payment, isLoading } = useQuery({
    queryKey: ["billing", "payment", paymentId],
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("payments").select("id, product, amount, status").eq("id", paymentId).maybeSingle();
      if (error) throw error;
      return data as { id: string; product: ProductId; amount: number; status: string } | null;
    },
  });

  async function finish(outcome: "paid" | "failed") {
    setBusy(outcome);
    try {
      await billingApi.testCheckoutPay(paymentId, outcome);
      navigate(`${Routes.BILLING_SUCCESS}?payment=${paymentId}`);
    } catch (e) {
      toast({ title: "Test payment failed", description: (e as Error).message, variant: "destructive" });
      setBusy(null);
    }
  }

  if (isLoading) return <Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-muted-foreground" />;
  if (!payment) return <p className="py-24 text-center text-muted-foreground">Checkout not found.</p>;

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="mb-6 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
        <FlaskConical className="h-4 w-4 shrink-0" /> Test checkout — no real money moves. Add a PayMongo key to use real checkout.
      </div>
      <div className="card-soft p-6">
        <p className="text-sm text-muted-foreground">MAPA AI</p>
        <div className="mt-1 flex items-baseline justify-between">
          <h1 className="text-xl font-medium">{PRODUCTS[payment.product].name}</h1>
          <p className="display text-3xl">{pesos(payment.amount)}</p>
        </div>

        <p className="mt-6 text-sm font-medium">Payment method</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMethod(id)}
              aria-pressed={method === id}
              className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-colors", method === id ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted")}
            >
              <Icon className="h-5 w-5" /> {label}
            </button>
          ))}
        </div>

        {payment.status !== "pending" ? (
          <p className="mt-6 text-sm text-muted-foreground">This checkout is already {payment.status}.</p>
        ) : (
          <div className="mt-6 grid gap-2">
            <Button size="lg" onClick={() => finish("paid")} disabled={busy !== null}>
              {busy === "paid" && <Loader2 className="animate-spin" />} Pay {pesos(payment.amount)} (test)
            </Button>
            <Button variant="ghost" onClick={() => finish("failed")} disabled={busy !== null}>
              {busy === "failed" && <Loader2 className="animate-spin" />} Simulate a failed payment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
