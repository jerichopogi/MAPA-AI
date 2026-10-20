import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MapPin className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span className="text-lg">
        MAPA<span className="text-primary"> AI</span>
      </span>
    </Link>
  );
}
