import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

export const useTransactions = () => {
  const { user } = useAuth();

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const totalGains = transactions
    ?.filter((t) => t.type === "gain" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  return {
    transactions: transactions || [],
    recentTransactions: transactions?.slice(0, 5) || [],
    totalGains,
    loading: isLoading,
    error,
    refetch,
  };
};
