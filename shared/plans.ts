// Plans, prices and Free-plan limits — shared by the pricing page and the server.

export type AiFeature = "trip" | "visa" | "local" | "chat";
export type ProductId = "plus_30d" | "plus_365d";

export interface Product {
  id: ProductId;
  name: string;
  /** Price in centavos (PHP × 100), as payment providers expect. */
  amount: number;
  days: number;
  note: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  plus_30d: { id: "plus_30d", name: "Plus · 30 days", amount: 149_00, days: 30, note: "One-time payment. No auto-renew." },
  plus_365d: { id: "plus_365d", name: "Plus · 1 year", amount: 1_290_00, days: 365, note: "Save 28% vs. monthly." },
};

/** Free plan monthly limits. Trips are counted separately from the other AI tools. */
export const FREE_LIMITS = {
  trip: 3,
  other: 20,
};

export const FREE_FEATURES = [
  `${FREE_LIMITS.trip} AI itineraries a month`,
  `${FREE_LIMITS.other} visa, local-secrets & assistant answers a month`,
  "Save trips, notes and status",
];

export const PLUS_FEATURES = [
  "Unlimited AI itineraries",
  "Unlimited visa help, local secrets & assistant",
  "Pay with GCash, Maya or card",
  "Supports an independent Filipino project",
];

export interface UsageSummary {
  trip: number;
  other: number;
}

export interface BillingStatus {
  plan: "free" | "plus";
  /** ISO date the Plus pass ends (null on Free). */
  plusUntil: string | null;
  /** Usage since the start of the current calendar month. */
  usage: UsageSummary;
  limits: typeof FREE_LIMITS;
  /** Which checkout the server will use: real PayMongo, the local test checkout, or none. */
  provider: "paymongo" | "mock" | null;
}

export const pesos = (centavos: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(centavos / 100);
