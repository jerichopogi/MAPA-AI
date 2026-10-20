// Minimal PayPal Orders v2 client: create an order, then capture it when the buyer returns.
// Docs: https://developer.paypal.com/docs/api/orders/v2/
import { config } from "../config";

const API = config.paypal.env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const res = await fetch(`${API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PayPal auth ${res.status}: ${json.error_description || res.statusText}`);
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.value;
}

async function request<T>(path: string, init: RequestInit & { requestId?: string } = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      // Idempotency: retrying with the same id never creates/captures twice.
      ...(init.requestId ? { "PayPal-Request-Id": init.requestId } : {}),
      ...init.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = json?.details?.map((d: { issue: string; description?: string }) => d.description || d.issue).join("; ");
    const error = new Error(`PayPal ${res.status}: ${detail || json.message || res.statusText}`) as Error & { issue?: string };
    error.issue = json?.details?.[0]?.issue;
    throw error;
  }
  return json as T;
}

interface Order {
  id: string;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
  links: { rel: string; href: string }[];
  purchase_units: {
    custom_id?: string;
    amount?: { currency_code: string; value: string };
    payments?: { captures?: { status: string; amount: { currency_code: string; value: string } }[] };
  }[];
}

const toValue = (centavos: number) => (centavos / 100).toFixed(2);

export async function createOrder(input: { paymentId: string; name: string; amount: number; returnUrl: string; cancelUrl: string }) {
  const order = await request<Order>("/v2/checkout/orders", {
    method: "POST",
    requestId: `create-${input.paymentId}`,
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.paymentId,
          custom_id: input.paymentId,
          description: `MAPA AI ${input.name}`,
          amount: { currency_code: "PHP", value: toValue(input.amount) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "MAPA AI",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            landing_page: "NO_PREFERENCE",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    }),
  });
  const approve = order.links.find((l) => l.rel === "payer-action" || l.rel === "approve");
  if (!approve) throw new Error("PayPal did not return an approval link");
  return { id: order.id, url: approve.href };
}

/**
 * Captures an approved order and returns "paid" only if PayPal confirms a
 * completed capture for exactly this payment and amount.
 */
export async function captureOrder(orderId: string, expected: { paymentId: string; amount: number }): Promise<"paid" | "pending" | "failed"> {
  let order = await request<Order>(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);

  if (order.status === "APPROVED") {
    try {
      order = await request<Order>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
        method: "POST",
        requestId: `capture-${expected.paymentId}`,
      });
    } catch (error) {
      // Declined card / insufficient funds etc.: the buyer must try again.
      if ((error as { issue?: string }).issue === "INSTRUMENT_DECLINED") return "failed";
      throw error;
    }
  }

  if (order.status === "VOIDED") return "failed";
  if (order.status !== "COMPLETED") return "pending";

  const unit = order.purchase_units[0];
  const capture = unit?.payments?.captures?.[0];
  const ok =
    capture?.status === "COMPLETED" &&
    capture.amount.currency_code === "PHP" &&
    capture.amount.value === toValue(expected.amount) &&
    (unit.custom_id === undefined || unit.custom_id === expected.paymentId);
  return ok ? "paid" : capture?.status === "PENDING" ? "pending" : "failed";
}
