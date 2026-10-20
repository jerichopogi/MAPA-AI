import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { PRODUCTS } from "@shared/plans";
import { config, paymentProvider } from "../config";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { supabaseAdmin } from "../supabase-admin";
import * as paymongo from "./paymongo";
import * as paypal from "./paypal";
import { getBillingStatus } from "./usage";

export const billing = Router();

const userOf = (req: Request) => (req as AuthedRequest).user;
const appOrigin = (req: Request) => config.appUrl || `${req.protocol}://${req.get("host")}`;

function requireBilling(_req: Request, res: Response, next: () => void) {
  if (!supabaseAdmin || !paymentProvider) {
    return res.status(503).json({ message: "Payments aren't set up yet. Add SUPABASE_SERVICE_ROLE_KEY (and PayPal credentials) to .env." });
  }
  next();
}

async function findPayment(id: string) {
  const { data, error } = await supabaseAdmin!.from("payments").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as { id: string; user_id: string; provider: string; product: string; amount: number; checkout_session_id: string | null; status: string } | null;
}

async function activate(paymentId: string) {
  const { error } = await supabaseAdmin!.rpc("activate_payment", { p_payment_id: paymentId });
  if (error) throw error;
}

billing.get("/status", requireAuth, async (req, res) => {
  try {
    res.json(await getBillingStatus(userOf(req).id));
  } catch (error) {
    console.error("[billing] status failed:", error);
    res.status(500).json({ message: "Couldn't load your plan." });
  }
});

/** Start a checkout for a Plus pass. Returns the URL to redirect the browser to. */
billing.post("/checkout", requireAuth, requireBilling, async (req, res) => {
  const parsed = z.object({ product: z.enum(["plus_30d", "plus_365d"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Unknown plan." });
  const product = PRODUCTS[parsed.data.product];
  const user = userOf(req);

  try {
    const { data: payment, error } = await supabaseAdmin!
      .from("payments")
      .insert({ user_id: user.id, product: product.id, amount: product.amount, provider: paymentProvider })
      .select("id")
      .single();
    if (error) throw error;

    const origin = appOrigin(req);
    if (paymentProvider === "mock") {
      await supabaseAdmin!.from("payments").update({ checkout_session_id: `mock_${payment.id}` }).eq("id", payment.id);
      return res.json({ url: `${origin}/checkout/test?payment=${payment.id}` });
    }

    if (paymentProvider === "paypal") {
      const order = await paypal.createOrder({
        paymentId: payment.id,
        name: product.name,
        amount: product.amount,
        returnUrl: `${origin}/billing/success?payment=${payment.id}`,
        cancelUrl: `${origin}/pricing?canceled=1`,
      });
      await supabaseAdmin!.from("payments").update({ checkout_session_id: order.id }).eq("id", payment.id);
      return res.json({ url: order.url });
    }

    const session = await paymongo.createCheckoutSession({
      paymentId: payment.id,
      name: product.name,
      amount: product.amount,
      email: user.email,
      successUrl: `${origin}/billing/success?payment=${payment.id}`,
      cancelUrl: `${origin}/pricing?canceled=1`,
    });
    await supabaseAdmin!.from("payments").update({ checkout_session_id: session.id }).eq("id", payment.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error("[billing] checkout failed:", error);
    res.status(502).json({ message: "Couldn't start checkout. Please try again." });
  }
});

/**
 * Called by the success page. Captures the PayPal order (or asks PayMongo whether
 * the session was paid) and activates the pass — works locally without webhooks.
 */
billing.post("/confirm", requireAuth, requireBilling, async (req, res) => {
  const paymentId = z.string().uuid().safeParse(req.body?.paymentId);
  if (!paymentId.success) return res.status(400).json({ message: "Missing payment." });

  try {
    const payment = await findPayment(paymentId.data);
    if (!payment || payment.user_id !== userOf(req).id) return res.status(404).json({ message: "Payment not found." });

    if (payment.status === "pending" && payment.checkout_session_id) {
      if (payment.provider === "paymongo" && (await paymongo.isCheckoutPaid(payment.checkout_session_id))) {
        await activate(payment.id);
      }
      if (payment.provider === "paypal") {
        // The buyer approved on PayPal; capturing here is what actually charges them.
        const result = await paypal.captureOrder(payment.checkout_session_id, { paymentId: payment.id, amount: payment.amount });
        if (result === "paid") await activate(payment.id);
        if (result === "failed") await supabaseAdmin!.from("payments").update({ status: "failed" }).eq("id", payment.id).eq("status", "pending");
      }
    }

    const updated = await findPayment(payment.id);
    res.json({ status: updated?.status ?? "pending", billing: await getBillingStatus(payment.user_id) });
  } catch (error) {
    console.error("[billing] confirm failed:", error);
    res.status(502).json({ message: "Couldn't confirm the payment yet. Refresh in a moment." });
  }
});

/** PayMongo webhook (event: checkout_session.payment.paid). */
billing.post("/webhook", async (req, res) => {
  const raw = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!supabaseAdmin || !raw || !paymongo.verifyWebhook(raw, req.get("Paymongo-Signature"))) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  const event = req.body?.data?.attributes;
  if (event?.type !== "checkout_session.payment.paid") return res.json({ received: true });

  try {
    const sessionId: string | undefined = event.data?.id;
    const { data: payment } = await supabaseAdmin.from("payments").select("id").eq("checkout_session_id", sessionId).maybeSingle();
    if (payment) await activate(payment.id);
    res.json({ received: true });
  } catch (error) {
    console.error("[billing] webhook failed:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

/** Local test checkout only (no PayMongo key, never in production). */
billing.post("/test-checkout/pay", requireAuth, requireBilling, async (req, res) => {
  if (paymentProvider !== "mock") return res.status(404).json({ message: "Not found" });
  const parsed = z.object({ paymentId: z.string().uuid(), outcome: z.enum(["paid", "failed"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request." });

  const payment = await findPayment(parsed.data.paymentId);
  if (!payment || payment.user_id !== userOf(req).id || payment.provider !== "mock") {
    return res.status(404).json({ message: "Payment not found." });
  }
  if (parsed.data.outcome === "paid") await activate(payment.id);
  else await supabaseAdmin!.from("payments").update({ status: "failed" }).eq("id", payment.id).eq("status", "pending");
  res.json({ ok: true });
});
