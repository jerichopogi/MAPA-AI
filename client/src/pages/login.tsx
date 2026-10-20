import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Redirect, useLocation, useSearch } from "wouter";
import { Loader2 } from "lucide-react";
import type { z } from "zod";
import { loginSchema } from "@shared/schema";
import { GoogleButton, OrDivider } from "@/components/google-button";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Routes } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase";

type Values = z.infer<typeof loginSchema>;

/** Only allow same-site relative paths as post-login redirects. */
function safeNext(search: string) {
  const next = new URLSearchParams(search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : Routes.DASHBOARD;
}

export default function Login() {
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const next = safeNext(useSearch());
  const form = useForm<Values>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  if (user) return <Redirect to={next} />;

  async function onSubmit(values: Values) {
    try {
      await signIn(values.email, values.password);
      navigate(next);
    } catch (e) {
      const message = (e as Error).message;
      if (/confirm/i.test(message)) {
        navigate(`${Routes.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}`);
        return;
      }
      toast({ title: "Couldn't sign in", description: message, variant: "destructive" });
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to see your trips and plan new ones.">
      <GoogleButton />
      <OrDivider />
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link href={Routes.FORGOT_PASSWORD} className="text-xs text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <FormControl><Input type="password" autoComplete="current-password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="w-full" disabled={!isSupabaseConfigured || form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />} Sign in
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to MAPA AI?{" "}
        <Link href={Routes.REGISTER} className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
