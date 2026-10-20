import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { SetupNotice } from "@/components/setup-notice";
import { HERO_IMAGE } from "@/lib/constants";

/** Split layout for sign-in, sign-up and password pages. */
export function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <SetupNotice className="mt-6" />
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <blockquote className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xl font-medium leading-snug">“Planned my first solo trip to Japan in one evening.”</p>
          <footer className="mt-3 text-sm text-white/75">Maria S., Quezon City</footer>
        </blockquote>
      </div>
    </div>
  );
}
