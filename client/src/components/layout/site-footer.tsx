import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { Routes } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Plan",
    links: [
      { label: "Trip planner", href: Routes.NEW_TRIP },
      { label: "Visa help", href: Routes.VISA_HELP },
      { label: "Local secrets", href: Routes.LOCAL_SECRETS },
      { label: "AI assistant", href: Routes.ASSISTANT },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Travel info", href: Routes.TRAVEL_INFO },
      { label: "Package quotes", href: Routes.TRAVEL_PACKAGE },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: Routes.LOGIN },
      { label: "Create account", href: Routes.REGISTER },
    ],
  },
];

/** Deep-teal rounded footer panel, as in the reference design. */
export function SiteFooter() {
  return (
    <footer className="container-page pb-6">
      <div className="rounded-3xl bg-brand px-6 py-12 text-brand-foreground sm:px-12">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-medium">
              <MapPin className="h-5 w-5" /> MAPA AI
            </Link>
            <p className="mt-4 max-w-xs text-sm text-brand-foreground/70">
              AI travel planning built for Filipino travelers — from visa checklists to day-by-day itineraries.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-brand-foreground/70 transition-colors hover:text-brand-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-brand-foreground/15 pt-6 text-xs text-brand-foreground/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} MAPA AI. Made in the Philippines.</p>
          <p>AI suggestions can be wrong — always confirm visa rules with the embassy.</p>
        </div>
      </div>
    </footer>
  );
}
