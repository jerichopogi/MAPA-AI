import { useMutation, useQuery } from "@tanstack/react-query";
import type { ProductId } from "@shared/plans";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { billingApi } from "@/lib/api";
import { requireSupabase } from "@/lib/supabase";

export const billingKeys = {
  status: ["billing", "status"] as const,
  payments: ["billing", "payments"] as const,
};

/** Current plan, Plus end date and this month's usage. */
export function useBillingStatus() {
  const { user } = useAuth();
  return useQuery({ queryKey: billingKeys.status, queryFn: billingApi.status, enabled: Boolean(user) });
}

export interface PaymentRow {
  id: string;
  product: ProductId;
  amount: number;
  provider: "paypal" | "paymongo" | "mock";
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  created_at: string;
}

/** The signed-in user's payment history (read directly; RLS limits it to their rows). */
export function usePayments() {
  return useQuery({
    queryKey: billingKeys.payments,
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("payments").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data as PaymentRow[];
    },
  });
}

/** Starts checkout and redirects the browser to the payment page. */
export function useCheckout() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (product: ProductId) => billingApi.checkout(product),
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (error) => toast({ title: "Couldn't start checkout", description: error.message, variant: "destructive" }),
  });
}
