import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { User } from "./lib/types";
import { ApiEndpoints, Routes } from "./lib/constants";

// Pages
import LandingPage from "@/pages/landing-page";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import MyTrips from "@/pages/my-trips";
import LocalSecrets from "@/pages/local-secrets";
import TravelInfo from "@/pages/travel-info";
import VisaHelp from "@/pages/visa-help";
import TravelPackage from "@/pages/travel-package";
import TripDetails from "@/pages/trip-details";
import NotFound from "@/pages/not-found";

// Create user context
import { createContext } from "react";
export const UserContext = createContext<{
  user: User | null | undefined;
  isLoading: boolean;
  refetchUser: () => void;
}>({
  user: null,
  isLoading: false,
  refetchUser: () => {},
});

function Router() {
  const [location] = useLocation();
  const { data: user, isLoading, refetch: refetchUser } = useQuery<User | null | undefined>({
    queryKey: [ApiEndpoints.USER],
    queryFn: async () => {
      try {
        const res = await fetch(ApiEndpoints.USER, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    retry: false,
  });

  // Protected route component
  const ProtectedRoute = ({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) => {
    // Redirect to auth page if not authenticated and not loading
    if (!isLoading && !user) {
      window.location.href = Routes.AUTH;
      return null;
    }

    // Show loading while checking auth
    if (isLoading) {
      return (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    // User is authenticated, render the component
    return <Component {...rest} />;
  };

  // Check if current route is landing page
  const isLandingPage = location === Routes.HOME;

  return (
    <UserContext.Provider value={{ user, isLoading, refetchUser }}>
      <Switch>
        <Route path={Routes.HOME} component={LandingPage} />
        <Route path={Routes.LOGIN} component={Login} />
        <Route path={Routes.REGISTER} component={Register} />
        <Route path={Routes.AUTH} component={AuthPage} />
        <Route path={Routes.DASHBOARD}>
          {(params) => <ProtectedRoute component={Dashboard} />}
        </Route>
        <Route path={Routes.MY_TRIPS}>
          {(params) => <ProtectedRoute component={MyTrips} />}
        </Route>
        <Route path={Routes.LOCAL_SECRETS}>
          {(params) => <ProtectedRoute component={LocalSecrets} />}
        </Route>
        <Route path={Routes.TRAVEL_INFO}>
          {(params) => <ProtectedRoute component={TravelInfo} />}
        </Route>
        <Route path={Routes.VISA_HELP}>
          {(params) => <ProtectedRoute component={VisaHelp} />}
        </Route>
        <Route path={Routes.TRAVEL_PACKAGE}>
          {(params) => <ProtectedRoute component={TravelPackage} />}
        </Route>
        <Route path={`${Routes.TRIP_DETAILS}/:id`}>
          {(params) => <ProtectedRoute component={TripDetails} id={params.id} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </UserContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
