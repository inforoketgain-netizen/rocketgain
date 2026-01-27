import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  commission_rate: number;
  total_commission: number;
  status: string;
  created_at: string;
}

export const useReferrals = () => {
  const { user } = useAuth();

  const { data: referrals, isLoading, error, refetch } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!user,
  });

  const totalReferrals = referrals?.length || 0;
  const activeReferrals = referrals?.filter(r => r.status === "active").length || 0;
  const totalCommissions = referrals?.reduce((sum, r) => sum + Number(r.total_commission), 0) || 0;

  return {
    referrals: referrals || [],
    totalReferrals,
    activeReferrals,
    totalCommissions,
    loading: isLoading,
    error,
    refetch,
  };
};
