import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  Compass,
  LogOut,
  MapPinned,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Stamp,
  Luggage,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Routes } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";

const NAV = [
  { href: Routes.DASHBOARD, label: "Home", icon: Compass },
  { href: Routes.MY_TRIPS, label: "My trips", icon: Luggage },
  { href: Routes.ASSISTANT, label: "Assistant", icon: MessageCircle },
  { href: Routes.VISA_HELP, label: "Visa help", icon: Stamp },
  { href: Routes.LOCAL_SECRETS, label: "Local secrets", icon: MapPinned },
  { href: Routes.TRAVEL_INFO, label: "Travel info", icon: BookOpen },
  { href: Routes.TRAVEL_PACKAGE, label: "Package quote", icon: Package },
];

/** The four destinations shown in the mobile bottom bar. */
const MOBILE_TABS = [NAV[0], NAV[1], NAV[2], NAV[3]];

function isActive(location: string, href: string) {
  return location === href || (href !== Routes.DASHBOARD && location.startsWith(href + "/"));
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            isActive(location, href)
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function UserMenu() {
  const { displayName, user, signOut } = useAuth();
  const [, navigate] = useLocation();
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-accent text-xs font-medium text-accent-foreground">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sign out"
        onClick={async () => {
          await signOut();
          navigate(Routes.HOME);
        }}
      >
        <LogOut />
      </Button>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between px-1">
        <Logo href={Routes.DASHBOARD} />
        <ThemeToggle />
      </div>
      <Button asChild className="w-full">
        <Link href={Routes.NEW_TRIP} onClick={onNavigate}>
          <Plus /> Plan a trip
        </Link>
      </Button>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto border-t pt-4">
        <UserMenu />
      </div>
    </div>
  );
}

/** Layout for signed-in pages: sidebar on desktop, top bar + bottom tabs on mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:hidden no-print">
        <Logo href={Routes.DASHBOARD} />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      <main className="pb-24 lg:pb-0 lg:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-background/95 backdrop-blur lg:hidden no-print">
        {MOBILE_TABS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px]",
              isActive(location, href) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
