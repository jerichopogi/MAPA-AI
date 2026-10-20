import { useEffect, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { billingKeys } from "@/hooks/use-billing";
import { billingApi } from "@/lib/api";
import { Routes } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type State = { kind: "checking" } | { kind: "paid"; until: string | null } | { kind: "pending" } | { kind: "failed"; message?: string };

/** Return page after checkout. Confirms the payment with the server (retrying briefly). */
export default function BillingSuccess() {
  const paymentId = new URLSearchParams(useSearch()).get("payment") ?? "";
  const qc = useQueryClient();
  const [state, setState] = useState<State>({ kind: "checking" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      // Payment providers can take a few seconds to settle.
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          const res = await billingApi.confirm(paymentId);
          if (res.status === "paid") {
            qc.invalidateQueries({ queryKey: ["billing"] });
            return setState({ kind: "paid", until: res.billing.plusUntil });
          }
          if (res.status === "failed") return setState({ kind: "failed" });
        } catch (e) {
          return setState({ kind: "failed", message: (e as Error).message });
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      setState({ kind: "pending" });
    })();
  }, [paymentId, qc]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      {state.kind === "checking" && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
          <h1 className="display mt-6 text-3xl">Confirming your payment…</h1>
        </>
      )}
      {state.kind === "paid" && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="display mt-6 text-4xl">Welcome to Plus!</h1>
          <p className="mt-3 text-muted-foreground">
            Unlimited AI trips and answers are now on{state.until ? `, until ${formatDate(state.until)}` : ""}.
          </p>
          <Button className="mt-8" asChild>
            <Link href={Routes.NEW_TRIP}>Plan a trip</Link>
          </Button>
        </>
      )}
      {state.kind === "pending" && (
        <>
          <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="display mt-6 text-3xl">Payment still processing</h1>
          <p className="mt-3 text-muted-foreground">This can take a minute. Your plan updates automatically once it's confirmed.</p>
          <Button variant="outline" className="mt-8" asChild>
            <Link href={Routes.BILLING}>Go to billing</Link>
          </Button>
        </>
      )}
      {state.kind === "failed" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="display mt-6 text-3xl">Payment didn't go through</h1>
          <p className="mt-3 text-muted-foreground">{state.message ?? "You weren't charged. You can try again with another method."}</p>
          <Button className="mt-8" asChild>
            <Link href={Routes.PRICING}>Try again</Link>
          </Button>
        </>
      )}
    </div>
  );
}
