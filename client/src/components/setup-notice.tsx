import { TriangleAlert } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/** Shown on auth pages until Supabase keys are in .env. */
export function SetupNotice({ className }: { className?: string }) {
  if (isSupabaseConfigured) return null;
  return (
    <div className={cn("flex gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200", className)}>
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        Sign-in isn't available yet: add <code className="font-mono text-xs">VITE_SUPABASE_URL</code> and{" "}
        <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> to <code className="font-mono text-xs">.env</code>, then restart. See README.
      </p>
    </div>
  );
}
