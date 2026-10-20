import type {
  AiResult,
  ChatInput,
  GenerateTripInput,
  GeneratedTrip,
  LocalPlace,
  LocalSecretsQueryInput,
  VisaQueryInput,
  VisaRequirement,
} from "@shared/schema";
import type { BillingStatus, ProductId } from "@shared/plans";
import { queryClient } from "./query-client";
import { supabase } from "./supabase";

/** Fired on window when a Free-plan limit is hit; the upgrade dialog listens for it. */
export const QUOTA_EVENT = "mapa:quota-exceeded";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

/** True for Free-plan limit errors, which the upgrade dialog already explains. */
export const isQuotaError = (error: unknown) => error instanceof ApiError && error.code === "quota_exceeded";

/** Call the Express API with the current Supabase access token attached. */
async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  const token = data.session?.access_token;

  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new ApiError(json.message || `Request failed (${res.status})`, res.status, json.code);
    if (error.code === "quota_exceeded") {
      window.dispatchEvent(new CustomEvent(QUOTA_EVENT, { detail: error.message }));
    }
    throw error;
  }
  return json as T;
}

/** AI calls count toward Free-plan usage, so refresh the usage meter afterwards. */
async function aiRequest<T>(path: string, body: unknown) {
  try {
    return await request<T>("POST", path, body);
  } finally {
    queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
  }
}

export const aiApi = {
  generateTrip: (input: GenerateTripInput) => aiRequest<AiResult<GeneratedTrip>>("/ai/generate-trip", input),
  visa: (input: VisaQueryInput) => aiRequest<AiResult<VisaRequirement>>("/ai/visa", input),
  localSecrets: (input: LocalSecretsQueryInput) => aiRequest<AiResult<LocalPlace[]>>("/ai/local-secrets", input),
  chat: (input: ChatInput) => aiRequest<AiResult<string>>("/ai/chat", input),
};

export const billingApi = {
  status: () => request<BillingStatus>("GET", "/billing/status"),
  checkout: (product: ProductId) => request<{ url: string }>("POST", "/billing/checkout", { product }),
  confirm: (paymentId: string) => request<{ status: "pending" | "paid" | "failed"; billing: BillingStatus }>("POST", "/billing/confirm", { paymentId }),
  testCheckoutPay: (paymentId: string, outcome: "paid" | "failed") =>
    request<{ ok: true }>("POST", "/billing/test-checkout/pay", { paymentId, outcome }),
};
