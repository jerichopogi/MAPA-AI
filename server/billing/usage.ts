import type { NextFunction, Request, Response } from "express";
import { FREE_LIMITS, type AiFeature, type BillingStatus, type UsageSummary } from "@shared/plans";
import { paymentProvider } from "../config";
import type { AuthedRequest } from "../middleware/auth";
import { supabaseAdmin } from "../supabase-admin";

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};

export async function getPlusUntil(userId: string): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data && new Date(data.current_period_end) > new Date() ? data.current_period_end : null;
}

export async function getUsage(userId: string): Promise<UsageSummary> {
  if (!supabaseAdmin) return { trip: 0, other: 0 };
  const { data, error } = await supabaseAdmin
    .from("ai_usage")
    .select("feature")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth());
  if (error) throw error;
  const trip = data.filter((r) => r.feature === "trip").length;
  return { trip, other: data.length - trip };
}

export async function getBillingStatus(userId: string): Promise<BillingStatus> {
  const [plusUntil, usage] = await Promise.all([getPlusUntil(userId), getUsage(userId)]);
  return { plan: plusUntil ? "plus" : "free", plusUntil, usage, limits: FREE_LIMITS, provider: paymentProvider };
}

/**
 * Free-plan quota for one AI feature. Rejects with 402 when the monthly limit
 * is used up, and records one usage row when the AI call succeeds.
 * Skipped entirely when billing isn't configured (no service-role key).
 */
export function quota(feature: AiFeature) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!supabaseAdmin) return next();
    const userId = (req as AuthedRequest).user.id;

    try {
      const status = await getBillingStatus(userId);
      if (status.plan === "free") {
        const used = feature === "trip" ? status.usage.trip : status.usage.other;
        const limit = feature === "trip" ? FREE_LIMITS.trip : FREE_LIMITS.other;
        if (used >= limit) {
          return res.status(402).json({
            code: "quota_exceeded",
            message:
              feature === "trip"
                ? `You've used your ${limit} free itineraries this month. Upgrade to Plus for unlimited trips.`
                : `You've used your ${limit} free AI answers this month. Upgrade to Plus for unlimited answers.`,
          });
        }
      }
    } catch (error) {
      console.error("[billing] quota check failed:", error);
      return res.status(503).json({ message: "Couldn't check your plan. Please try again." });
    }

    res.on("finish", () => {
      if (res.statusCode !== 200) return;
      supabaseAdmin!
        .from("ai_usage")
        .insert({ user_id: userId, feature })
        .then(({ error }) => error && console.error("[billing] failed to record usage:", error.message));
    });
    next();
  };
}
