import { Link } from "wouter";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <p className="mt-12 text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold">This page took a detour.</h1>
      <p className="mt-3 text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
      <Button className="mt-8" asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
