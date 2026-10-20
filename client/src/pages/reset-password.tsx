import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import type { z } from "zod";
import { resetPasswordSchema } from "@shared/schema";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Routes } from "@/lib/constants";

type Values = z.infer<typeof resetPasswordSchema>;

/** Landing page for the email reset link. Supabase signs the user in from the link. */
export default function ResetPassword() {
  const { user, isLoading, updatePassword } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const form = useForm<Values>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "", confirmPassword: "" } });

  async function onSubmit({ password }: Values) {
    try {
      await updatePassword(password);
      toast({ title: "Password updated" });
      navigate(Routes.DASHBOARD);
    } catch (e) {
      toast({ title: "Couldn't update password", description: (e as Error).message, variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <AuthLayout title="Choose a new password" description="Checking your reset link…">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </AuthLayout>
    );
  }

  if (!user) {
    return (
      <AuthLayout title="Link expired" description="This reset link is invalid or has already been used.">
        <Button asChild className="w-full">
          <Link href={Routes.FORGOT_PASSWORD}>Request a new link</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" description={`For ${user.email}`}>
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />} Update password
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
