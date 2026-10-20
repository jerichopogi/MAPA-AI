import type { ComponentType } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { Routes } from "@/lib/constants";

/** Renders `component` inside the app shell, or redirects to sign-in. */
export function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    return <Redirect to={`${Routes.LOGIN}?next=${next}`} />;
  }

  return (
    <AppShell>
      <Component />
    </AppShell>
  );
}
