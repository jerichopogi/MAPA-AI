import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { UserContext } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { RegisterInput } from "@/lib/types";
import { Routes, APP_NAME } from "@/lib/constants";
import { insertUserSchema } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/layout/header";
import { OAuthButton, OAuthDivider } from "@/components/oauth-buttons";

// Extend the insertUserSchema with additional validation
const registerSchema = insertUserSchema.extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  termsAndConditions: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormInput = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { refetchUser } = useContext(UserContext);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      termsAndConditions: false,
    },
  });

  const onSubmit = async (data: RegisterFormInput) => {
    setIsLoading(true);
    
    // Remove confirmPassword and termsAndConditions before sending to API
    const { confirmPassword, termsAndConditions, ...registerData } = data;
    
    try {
      const response = await apiRequest("POST", "/api/register", registerData);
      const result = await response.json();
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please verify your email to continue.",
      });
      
      refetchUser();
      
      // Check if there's a redirect URL in the response and use it, otherwise fallback to VERIFY_EMAIL
      if (result.redirect) {
        setLocation(result.redirect);
      } else {
        setLocation(Routes.VERIFY_EMAIL);
      }
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Left side with image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img 
            src="https://images.unsplash.com/photo-1522509585149-c9cd39d1ff08?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Travel background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-primary-dark/70 flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold font-sans mb-4">Join Our Community</h1>
              <p className="text-lg mb-8">
                Create an account to start planning your dream trips with AI-powered itineraries tailored just for you.
              </p>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="italic font-serif text-lg mb-4">
                  "Since joining MAPA AI, I've discovered hidden gems in countries I never would have found on my own. It's like having a local guide in your pocket."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://randomuser.me/api/portraits/women/28.jpg" 
                    alt="Maria Santos" 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-medium">Maria Santos</h4>
                    <p className="text-sm opacity-75">Member since 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side with register form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-sans text-primary flex items-center justify-center">
                <i className="fas fa-map-marked-alt mr-2"></i>
                {APP_NAME.split("AI")[0]}<span className="text-secondary">AI</span>
              </h2>
              <p className="text-neutral-600 mt-2">Create your travel account</p>
            </div>
            
            {/* Social Register Buttons */}
            <div className="space-y-3 mb-6">
              <OAuthButton provider="facebook" className="py-2.5" />
              <OAuthButton provider="google" className="py-2.5" />
            </div>
            
            <OAuthDivider />
            
            {/* Register Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => {
                    // Ensure field.value is a string
                    const safeValue = typeof field.value === 'string' ? field.value : '';
                    
                    return (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Juan Dela Cruz" 
                            className="w-full px-4 py-3 h-auto border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            value={safeValue}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="juandelacruz" 
                          className="w-full px-4 py-3 h-auto border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="you@example.com" 
                          className="w-full px-4 py-3 h-auto border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="••••••••" 
                          className="w-full px-4 py-3 h-auto border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="••••••••" 
                          className="w-full px-4 py-3 h-auto border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary"
                        />
                      </FormControl>
                      <div className="leading-none">
                        <FormLabel className="text-sm text-neutral-700">
                          I agree to the <a href="#terms" className="text-primary hover:underline">Terms of Service</a> and <a href="#privacy" className="text-primary hover:underline">Privacy Policy</a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full py-3 px-4 h-auto text-white bg-primary hover:bg-primary-dark mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
            
            <p className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link href={Routes.LOGIN}>
                <a className="font-medium text-primary hover:text-primary-dark">
                  Sign in
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
