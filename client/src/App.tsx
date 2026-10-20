import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { ProtectedRoute } from "@/components/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { I18nProvider } from "@/lib/i18n";
import { Routes } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import VerifyEmail from "@/pages/verify-email";
import Dashboard from "@/pages/dashboard";
import PlanTrip from "@/pages/plan-trip";
import MyTrips from "@/pages/my-trips";
import TripDetails from "@/pages/trip-details";
import Assistant from "@/pages/assistant";
import VisaHelp from "@/pages/visa-help";
import LocalSecrets from "@/pages/local-secrets";
import TravelInfo from "@/pages/travel-info";
import TravelPackage from "@/pages/travel-package";
import Pricing from "@/pages/pricing";
import Billing from "@/pages/billing";
import BillingSuccess from "@/pages/billing-success";
import TestCheckout from "@/pages/test-checkout";
import SharedTripPage from "@/pages/shared-trip";
import NotFound from "@/pages/not-found";

const PROTECTED = [
  [Routes.DASHBOARD, Dashboard],
  [Routes.NEW_TRIP, PlanTrip],
  [Routes.MY_TRIPS, MyTrips],
  [Routes.TRIP_DETAILS, TripDetails],
  [Routes.ASSISTANT, Assistant],
  [Routes.VISA_HELP, VisaHelp],
  [Routes.LOCAL_SECRETS, LocalSecrets],
  [Routes.TRAVEL_INFO, TravelInfo],
  [Routes.TRAVEL_PACKAGE, TravelPackage],
  [Routes.BILLING_SUCCESS, BillingSuccess],
  [Routes.BILLING, Billing],
  [Routes.TEST_CHECKOUT, TestCheckout],
] as const;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <I18nProvider>
        <AuthProvider>
          <Switch>
            <Route path={Routes.HOME} component={Landing} />
            <Route path={Routes.LOGIN} component={Login} />
            <Route path={Routes.REGISTER} component={Register} />
            <Route path={Routes.FORGOT_PASSWORD} component={ForgotPassword} />
            <Route path={Routes.RESET_PASSWORD} component={ResetPassword} />
            <Route path={Routes.VERIFY_EMAIL} component={VerifyEmail} />
            <Route path={Routes.PRICING} component={Pricing} />
            <Route path="/s/:shareId" component={SharedTripPage} />
            {PROTECTED.map(([path, Page]) => (
              <Route key={path} path={path}>
                <ProtectedRoute component={Page} />
              </Route>
            ))}
            <Route component={NotFound} />
          </Switch>
          <UpgradeDialog />
          <Toaster />
        </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
