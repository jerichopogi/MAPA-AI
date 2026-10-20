import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import { PLUS_FEATURES, PRODUCTS, pesos } from "@shared/plans";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCheckout } from "@/hooks/use-billing";
import { QUOTA_EVENT } from "@/lib/api";
import { Routes } from "@/lib/constants";

/** Opens automatically when the API reports a Free-plan limit. */
export function UpgradeDialog() {
  const [message, setMessage] = useState<string | null>(null);
  const checkout = useCheckout();

  useEffect(() => {
    const onQuota = (e: Event) => setMessage((e as CustomEvent<string>).detail);
    window.addEventListener(QUOTA_EVENT, onQuota);
    return () => window.removeEventListener(QUOTA_EVENT, onQuota);
  }, []);

  return (
    <Dialog open={message !== null} onOpenChange={(open) => !open && setMessage(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="display text-2xl">You've reached your free limit</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {PLUS_FEATURES.slice(0, 3).map((f) => (
            <li key={f}>✓ {f}</li>
          ))}
        </ul>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => checkout.mutate("plus_30d")} disabled={checkout.isPending}>
            Get Plus · {pesos(PRODUCTS.plus_30d.amount)}
          </Button>
          <Button variant="outline" className="flex-1" asChild onClick={() => setMessage(null)}>
            <Link href={Routes.PRICING}>Compare plans</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
