// Minimal PayMongo client: Checkout Sessions + webhook signature check.
// Docs: https://developers.paymongo.com/reference/checkout-session-resource
import crypto from "node:crypto";
import { config } from "../config";

const API = "https://api.paymongo.com/v1";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.paymongo.secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = json?.errors?.map((e: { detail: string }) => e.detail).join("; ");
    throw new Error(`PayMongo ${res.status}: ${detail || res.statusText}`);
  }
  return json as T;
}

interface CheckoutSession {
  data: {
    id: string;
    attributes: {
      checkout_url: string;
      reference_number: string | null;
      payments: { attributes: { status: string } }[];
      payment_intent: { attributes: { status: string } } | null;
    };
  };
}

export async function createCheckoutSession(input: {
  paymentId: string;
  name: string;
  amount: number;
  email?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await request<CheckoutSession>("/checkout_sessions", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: [{ currency: "PHP", amount: input.amount, name: input.name, quantity: 1 }],
          payment_method_types: config.paymongo.methods,
          description: `MAPA AI ${input.name}`,
          reference_number: input.paymentId,
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          ...(input.email ? { billing: { email: input.email } } : {}),
          metadata: { payment_id: input.paymentId },
        },
      },
    }),
  });
  return { id: session.data.id, url: session.data.attributes.checkout_url };
}

/** True when the checkout session has a successful payment. */
export async function isCheckoutPaid(sessionId: string) {
  const { data } = await request<CheckoutSession>(`/checkout_sessions/${encodeURIComponent(sessionId)}`);
  return (
    data.attributes.payments?.some((p) => p.attributes.status === "paid") ||
    data.attributes.payment_intent?.attributes.status === "succeeded"
  );
}

/**
 * Verify the Paymongo-Signature header ("t=…,te=…,li=…"): HMAC-SHA256 of
 * `${t}.${rawBody}` with the webhook secret, compared to te (test) or li (live).
 */
export function verifyWebhook(rawBody: Buffer, header: string | undefined) {
  if (!header || !config.paymongo.webhookSecret) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const expected = config.paymongo.secretKey.startsWith("sk_live") ? parts.li : parts.te;
  if (!parts.t || !expected) return false;
  const digest = crypto.createHmac("sha256", config.paymongo.webhookSecret).update(`${parts.t}.${rawBody}`).digest("hex");
  return digest.length === expected.length && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(expected));
}
