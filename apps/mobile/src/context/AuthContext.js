import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [selectedBillingInterval, setSelectedBillingInterval] = useState("monthly");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      selectedPlan,
      setSelectedPlan,
      selectedBillingInterval,
      setSelectedBillingInterval,
      async signIn({ email, password }) {
        return supabase.auth.signInWithPassword({ email, password });
      },
      async signUp({ email, password, planId, billingInterval }) {
        const timestamp = new Date().toISOString();

        return supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              selected_plan: planId,
              billing_interval: billingInterval,
              account_created_at: timestamp,
              plan_status: planId === "free" ? "active" : "pending",
              free_plan: planId === "free",
              source: "mobile-app"
            }
          }
        });
      },
      async signOut() {
        return supabase.auth.signOut();
      }
    }),
    [loading, selectedBillingInterval, selectedPlan, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
