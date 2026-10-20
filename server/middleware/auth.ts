import type { NextFunction, Request, Response } from "express";
import { createClient, type User } from "@supabase/supabase-js";
import { config, isSupabaseConfigured } from "../config";

const supabase = isSupabaseConfigured
  ? createClient(config.supabase.url, config.supabase.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export interface AuthedRequest extends Request {
  user: User;
}

/**
 * Requires a valid Supabase access token in the Authorization header.
 * The token is verified by Supabase Auth, so the server needs no secret.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!supabase) {
    return res.status(503).json({ message: "Supabase is not configured on the server." });
  }

  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }

  (req as AuthedRequest).user = data.user;
  next();
}
