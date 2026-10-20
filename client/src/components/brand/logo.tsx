import { Link } from "wouter";
import { cn } from "@/lib/utils";

/** Wordmark in the style of the reference ("Way.Farer" → "Mapa.ai"). */
export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("text-xl font-medium tracking-tight", className)} aria-label="MAPA AI home">
      Mapa<span className="text-primary">.</span>ai
    </Link>
  );
}
