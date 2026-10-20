import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config, isBillingConfigured } from "./config";

/**
 * Service-role client: bypasses Row Level Security. Server-only — used for
 * billing writes and usage metering. Never expose this key to the browser.
 */
export const supabaseAdmin: SupabaseClient | null = isBillingConfigured
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
