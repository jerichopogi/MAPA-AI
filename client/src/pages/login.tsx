import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { LoginInput } from "@/lib/types";
import { Routes, APP_NAME } from "@/lib/constants";
import { loginSchema } from "@shared/schema";

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

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(data);
      setLocation(Routes.DASHBOARD);
    } catch (error) {
      // Error is already handled by the loginMutation onError
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
            src="https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Travel background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-primary-dark/70 flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold font-sans mb-4">Welcome Back!</h1>
              <p className="text-lg mb-8">
                Log in to access your personalized travel plans, trip history, and exclusive deals.
              </p>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="italic font-serif text-lg mb-4">
                  "MAPA AI transformed how I travel. Now I spend less time planning and more time enjoying my adventures."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Juan Dela Cruz" 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-medium">Juan Dela Cruz</h4>
                    <p className="text-sm opacity-75">Traveled to 12 countries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side with login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-sans text-primary flex items-center justify-center">
                <i className="fas fa-map-marked-alt mr-2"></i>
                {APP_NAME.split("AI")[0]}<span className="text-secondary">AI</span>
              </h2>
              <p className="text-neutral-600 mt-2">Log in to your travel account</p>
            </div>
            
            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <OAuthButton provider="facebook" className="py-2.5" />
              <OAuthButton provider="google" className="py-2.5" />
            </div>
            
            <OAuthDivider />
            
            {/* Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                      <div className="flex items-center justify-between mb-1">
                        <FormLabel>Password</FormLabel>
                        <Link href={Routes.FORGOT_PASSWORD}>
                          <a className="text-sm font-medium text-primary hover:text-primary-dark">
                            Forgot password?
                          </a>
                        </Link>
                      </div>
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
                
                <div className="flex items-center">
                  <Checkbox id="remember" className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary" />
                  <label htmlFor="remember" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>
                
                <Button
                  type="submit"
                  className="w-full py-3 px-4 h-auto text-white bg-primary hover:bg-primary-dark"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
            
            <p className="mt-6 text-center text-sm text-neutral-600">
              Don't have an account?{" "}
              <Link href={Routes.REGISTER}>
                <a className="font-medium text-primary hover:text-primary-dark">
                  Sign up
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
