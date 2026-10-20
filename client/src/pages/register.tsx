import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import type { z } from "zod";
import { registerSchema } from "@shared/schema";
import { GoogleButton, OrDivider } from "@/components/google-button";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Routes } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase";

type Values = z.infer<typeof registerSchema>;

export default function Register() {
  const { user, signUp } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const form = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  if (user) return <Redirect to={Routes.DASHBOARD} />;

  async function onSubmit(values: Values) {
    try {
      const { needsConfirmation } = await signUp(values);
      navigate(needsConfirmation ? `${Routes.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}` : Routes.DASHBOARD);
    } catch (e) {
      toast({ title: "Couldn't create account", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <AuthLayout title="Create your account" description="Free to use. Save trips and pick up where you left off.">
      <GoogleButton />
      <OrDivider />
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl><Input autoComplete="name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm</FormLabel>
                <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full" disabled={!isSupabaseConfigured || form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />} Create account
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={Routes.LOGIN} className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
