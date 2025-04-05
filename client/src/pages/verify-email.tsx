import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "../App";
import { ApiEndpoints, APP_NAME, Routes } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect, useContext } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export default function VerifyEmailPage() {
  const { toast } = useToast();
  const { user } = useContext(UserContext);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [location, navigate] = useLocation();
  
  // Get token from URL query parameter
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  
  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token,
    },
  });

  const sendVerificationEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", ApiEndpoints.SEND_VERIFICATION_EMAIL);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Verification email has been sent to your email address.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyEmailFormData) => {
      const res = await apiRequest("POST", ApiEndpoints.VERIFY_EMAIL, data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: [ApiEndpoints.USER] });
      setTimeout(() => {
        navigate(Routes.DASHBOARD);
      }, 5000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Invalid or expired token. Please request a new verification email.",
        variant: "destructive",
      });
    },
  });

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token) {
      setIsVerifying(true);
      verifyEmailMutation.mutate({ token });
    }
  }, [token]);

  function onSubmit(data: VerifyEmailFormData) {
    verifyEmailMutation.mutate(data);
  }

  function handleResendEmail() {
    sendVerificationEmailMutation.mutate();
  }

  // Render verification in progress
  if (isVerifying && !isSuccess && !verifyEmailMutation.isError) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mx-auto flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Verifying Your Email</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Render verification success
  if (isSuccess) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mx-auto rounded-full bg-green-100 p-3 text-green-600 mb-4">
              <CheckCircle2 size={24} />
            </div>
            <CardTitle className="text-2xl text-center">Email Verified</CardTitle>
            <CardDescription className="text-center">
              Your email has been verified successfully!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground mt-2">
            <p>
              You will be redirected to your dashboard in a few seconds. If you're not redirected automatically, please click the button below.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full mt-2">
              <Link href={Routes.DASHBOARD}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If no token or verification failed, show manual verification form
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto rounded-full bg-blue-100 p-3 text-blue-600 mb-4">
            <Mail size={24} />
          </div>
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            {token 
              ? "The verification link has expired or is invalid. Please enter a valid token or request a new one."
              : "Please verify your email address to access all features of your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifyEmailMutation.isError && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>
                {verifyEmailMutation.error?.message || "Invalid or expired verification token."}
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter verification token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={verifyEmailMutation.isPending}
              >
                {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Didn't receive a verification email?</p>
            <Button 
              variant="outline" 
              onClick={handleResendEmail}
              disabled={sendVerificationEmailMutation.isPending}
              className="w-full"
            >
              {sendVerificationEmailMutation.isPending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="link">
            <Link href={user ? Routes.DASHBOARD : Routes.LOGIN}>
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              {user ? "Back to Dashboard" : "Back to Login"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}