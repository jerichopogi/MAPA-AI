import type { TripStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<TripStatus, string> = {
  upcoming: "bg-background/90 text-foreground",
  completed: "bg-emerald-600 text-white",
  cancelled: "bg-zinc-500 text-white",
};

const LABELS: Record<TripStatus, string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function TripStatusBadge({ status, className }: { status: TripStatus; className?: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur", STYLES[status], className)}>
      {LABELS[status]}
    </span>
  );
}
