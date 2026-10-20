import type { NextFunction, Request, Response } from "express";
import { AI_RATE_LIMITS } from "@shared/plans";
import { supabaseAdmin } from "../supabase-admin";
import type { AuthedRequest } from "./auth";

/**
 * Abuse protection for AI endpoints, on every plan:
 *  - per minute: in-memory sliding window per user (stops scripts / double-clicks)
 *  - per day: successful AI calls since midnight Manila time, from ai_usage
 *    (falls back to an in-memory count when the service-role key isn't set)
 *
 * In-memory windows are per server process — fine for a single instance. With
 * several instances, move them to a shared store (e.g. Redis or Postgres).
 */
const recentCalls = new Map<string, number[]>();
const memoryDaily = new Map<string, { day: string; count: number }>();

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Start of "today" in Manila (UTC+8, no DST), as a Date. */
export function manilaDayStart(now = new Date()) {
  const manila = new Date(now.getTime() + MANILA_OFFSET_MS);
  return new Date(Date.UTC(manila.getUTCFullYear(), manila.getUTCMonth(), manila.getUTCDate()) - MANILA_OFFSET_MS);
}

async function countToday(userId: string): Promise<number> {
  const since = manilaDayStart();
  if (!supabaseAdmin) {
    const key = since.toISOString();
    const entry = memoryDaily.get(userId);
    if (!entry || entry.day !== key) memoryDaily.set(userId, { day: key, count: 0 });
    return memoryDaily.get(userId)!.count++;
  }
  const { count, error } = await supabaseAdmin
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());
  if (error) throw error;
  return count ?? 0;
}

export async function aiRateLimit(req: Request, res: Response, next: NextFunction) {
  const userId = (req as AuthedRequest).user.id;
  const now = Date.now();

  const recent = (recentCalls.get(userId) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= AI_RATE_LIMITS.perMinute) {
    const retryAfter = Math.ceil((recent[0] + 60_000 - now) / 1000);
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({
      code: "rate_limited",
      message: `Easy lang! That's a lot of requests — please wait ${retryAfter}s and try again.`,
    });
  }
  recent.push(now);
  recentCalls.set(userId, recent);

  try {
    if ((await countToday(userId)) >= AI_RATE_LIMITS.perDay) {
      return res.status(429).json({
        code: "daily_limit",
        message: `You've reached today's limit of ${AI_RATE_LIMITS.perDay} AI requests. It resets at midnight (Philippine time).`,
      });
    }
  } catch (error) {
    console.error("[rate-limit] daily count failed:", error);
    return res.status(503).json({ message: "Couldn't check your usage. Please try again." });
  }

  next();
}

// Drop idle users' windows so the map can't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [user, calls] of recentCalls) if (calls.every((t) => now - t >= 60_000)) recentCalls.delete(user);
}, 5 * 60_000).unref();
