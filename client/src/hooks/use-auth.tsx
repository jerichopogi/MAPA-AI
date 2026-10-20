import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { queryClient } from "@/lib/query-client";
import { requireSupabase, supabase } from "@/lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  /** True until the stored session has been read on first load. */
  isLoading: boolean;
  displayName: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; fullName: string }) => Promise<{ needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const redirectTo = (path: string) => `${window.location.origin}${path}`;

// Plain-language versions of Supabase Auth errors users commonly hit.
const AUTH_ERRORS: Record<string, string> = {
  over_email_send_rate_limit:
    "Too many emails were sent in the last hour. Please wait a bit and try again.",
  email_not_confirmed: "Please confirm your email first — check your inbox (and spam folder).",
  invalid_credentials: "Wrong email or password.",
  email_address_invalid: "That email address can't receive mail. Please use another one.",
};

function unwrap<T extends { error: { message: string; code?: string } | null }>(result: T): T {
  if (result.error) throw new Error(AUTH_ERRORS[result.error.code ?? ""] ?? result.error.message);
  return result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "SIGNED_OUT") queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    displayName,

    async signIn(email, password) {
      unwrap(await requireSupabase().auth.signInWithPassword({ email, password }));
    },

    async signUp({ email, password, fullName }) {
      const { data } = unwrap(
        await requireSupabase().auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName }, emailRedirectTo: redirectTo("/dashboard") },
        }),
      );
      // An already-registered email gets a fake user with no identities and no
      // email is sent (Supabase hides which emails exist). Point them to sign in.
      if (data.user && data.user.identities?.length === 0) {
        throw new Error("This email already has an account. Sign in instead, or reset your password.");
      }
      // With email confirmation on, Supabase returns a user but no session.
      return { needsConfirmation: !data.session };
    },

    async signInWithGoogle() {
      unwrap(
        await requireSupabase().auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirectTo("/dashboard") },
        }),
      );
    },

    async signOut() {
      unwrap(await requireSupabase().auth.signOut());
    },

    async sendPasswordReset(email) {
      unwrap(await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo: redirectTo("/reset-password") }));
    },

    async updatePassword(password) {
      unwrap(await requireSupabase().auth.updateUser({ password }));
    },

    async resendConfirmation(email) {
      unwrap(
        await requireSupabase().auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: redirectTo("/dashboard") },
        }),
      );
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
