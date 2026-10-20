import { Link } from "wouter";
import { Logo } from "@/components/brand/logo";
import { Routes } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Product",
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

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container-page grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            AI travel planning built for Filipino travelers — from visa checklists to day-by-day itineraries.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-medium">{col.title}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} MAPA AI. Made in the Philippines.</p>
          <p>AI suggestions can be wrong — always confirm visa rules with the embassy.</p>
        </div>
      </div>
    </footer>
  );
}
