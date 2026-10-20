import { useState } from "react";
import { Link, Redirect, useSearch } from "wouter";
import { Loader2, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Routes } from "@/lib/constants";

/** "Check your inbox" screen after sign-up. Supabase handles the confirmation link itself. */
export default function VerifyEmail() {
  const { user, resendConfirmation } = useAuth();
  const { toast } = useToast();
  const email = new URLSearchParams(useSearch()).get("email") ?? "";
  const [sending, setSending] = useState(false);

  if (user) return <Redirect to={Routes.DASHBOARD} />;

  async function resend() {
    setSending(true);
    try {
      await resendConfirmation(email);
      toast({ title: "Email sent", description: "Check your inbox (and spam folder)." });
    } catch (e) {
      toast({ title: "Couldn't resend", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthLayout title="Check your email" description="One more step to finish creating your account.">
      <div className="rounded-xl border bg-card p-5 text-sm">
        <MailCheck className="h-5 w-5 text-primary" />
        <p className="mt-3">
          We sent a confirmation link to {email ? <span className="font-medium">{email}</span> : "your email"}. Open it to activate your account.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {email && (
          <Button variant="outline" onClick={resend} disabled={sending}>
            {sending && <Loader2 className="animate-spin" />} Resend email
          </Button>
        )}
        <Button variant="ghost" asChild>
          <Link href={Routes.LOGIN}>Back to sign in</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
