import { useState } from "react";
import { Link } from "wouter";
import { Menu, UserRound, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Routes } from "@/lib/constants";

const NAV = [
  { href: "#top", label: "Home" },
  { href: "#destinations", label: "Destinations" },
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
];

/** Marketing header: logo, centered pill nav, round icon buttons. Sits on the gray hero. */
export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const accountHref = user ? Routes.DASHBOARD : Routes.LOGIN;

  return (
    <header className="relative z-40">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 rounded-full bg-background px-2 py-1.5 shadow-sm md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="rounded-full px-4 py-1.5 text-sm transition-colors hover:bg-muted">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <div className="rounded-full bg-background shadow-sm">
            <ThemeToggle />
          </div>
          <Link
            href={accountHref}
            aria-label={user ? "Open app" : "Sign in"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm transition-colors hover:bg-accent"
          >
            <UserRound className="h-4 w-4" />
          </Link>
          {!user && (
            <Button asChild>
              <Link href={Routes.REGISTER}>Get started</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <div className="rounded-full bg-background shadow-sm">
            <ThemeToggle />
          </div>
          <Button variant="outline" size="icon" className="border-0 shadow-sm" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="container-page md:hidden">
          <div className="card-soft flex flex-col gap-1 p-3">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm hover:bg-muted">
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {user ? (
                <Button asChild className="col-span-2">
                  <Link href={Routes.DASHBOARD}>Open app</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href={Routes.LOGIN}>Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href={Routes.REGISTER}>Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
