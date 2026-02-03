import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
  email: string,
  password: string,
  fullName: string,
  // referrerId?: string | null
) => Promise<{ error: Error | null }>;

  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
  if (!user || !session) return;

  const createProfile = async () => {
    const referralCode = localStorage.getItem("referrer_id");
    let referrerId = null;

    if (referralCode) {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id")
        .or(`own_referral_code.eq.${referralCode},referral_code.eq.${referralCode}`)
        .maybeSingle();
        
      if (error) {
        console.error("REFERRAL SEARCH ERROR:", error.message);
      }

      if (data) {
        referrerId = data.user_id;
        console.log("PARRAIN TROUVÉ:", referrerId);
      } else {
        console.log("AUCUN PARRAIN TROUVÉ POUR LE CODE:", referralCode);
      }
    }

    const profileData: any = {
      user_id: user.id,
      email: user.email,
      full_name: user.user_metadata.full_name,
    };

    if (referrerId) {
      profileData.referred_by = referrerId;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData);

    if (profileError) {
      console.error("PROFILE CREATION ERROR:", profileError.message);
    } else {
      console.log("PROFILE CREATED:", profileData);
      localStorage.removeItem("referrer_id"); // nettoyage
    }
  };

  createProfile();
}, [user, session]);

  const signUp = async (
  email: string,
  password: string,
  fullName: string
) => {

  const referralCode = localStorage.getItem("referrer_id");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: fullName, // ✅ seulement ça

        referral_code: referralCode || null,

      },
    },
  });

  return { error: error as Error | null };
};

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
