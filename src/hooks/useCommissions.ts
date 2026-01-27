import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Commission {
  id: string;
  user_id: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
}

export const useCommissions = () => {
  const { user } = useAuth();

  const { data: commissions, isLoading, error, refetch } = useQuery({
    queryKey: ["commissions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "commission")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Commission[];
    },
    enabled: !!user,
  });

  const totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  return {
    commissions: commissions || [],
    totalCommissions,
    loading: isLoading,
    error,
    refetch,
  };
};
