import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Investment {
  id: string;
  user_id: string;
  plan_name: string;
  amount: number;
  daily_rate: number;
  duration_days: number;
  status: string;
  started_at: string;
  ends_at: string;
  created_at: string;
}

export const useInvestments = () => {
  const { user } = useAuth();

  const { data: investments, isLoading, error, refetch } = useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Investment[];
    },
    enabled: !!user,
  });

  const activeInvestments = investments?.filter((i) => i.status === "active") || [];
  const totalInvested = activeInvestments.reduce((sum, i) => sum + Number(i.amount), 0);

  return {
    investments: investments || [],
    activeInvestments,
    totalInvested,
    activeCount: activeInvestments.length,
    loading: isLoading,
    error,
    refetch,
  };
};
