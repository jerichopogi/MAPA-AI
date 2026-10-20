import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import type { z } from "zod";
import { forgotPasswordSchema } from "@shared/schema";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Routes } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase";

type Values = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  async function onSubmit({ email }: Values) {
    try {
      await sendPasswordReset(email);
      setSentTo(email);
    } catch (e) {
      toast({ title: "Couldn't send reset link", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <AuthLayout title="Reset your password" description="We'll email you a link to choose a new one.">
      {sentTo ? (
        <div className="rounded-xl border bg-card p-5 text-sm">
          <MailCheck className="h-5 w-5 text-primary" />
          <p className="mt-3">
            If an account exists for <span className="font-medium">{sentTo}</span>, a reset link is on its way.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={!isSupabaseConfigured || form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="animate-spin" />} Send reset link
            </Button>
          </form>
        </Form>
      )}
      <Button variant="ghost" size="sm" className="mt-6 -ml-3" asChild>
        <Link href={Routes.LOGIN}>
          <ArrowLeft /> Back to sign in
        </Link>
      </Button>
    </AuthLayout>
  );
}
