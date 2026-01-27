import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalCommissions: number;
  totalInvestments: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  completedDeposits: number;
  completedWithdrawals: number;
}

export const useAdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      // Fetch all profiles count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch all transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*");

      // Fetch all investments
      const { data: investments } = await supabase
        .from("investments")
        .select("*");

      const deposits = transactions?.filter((t) => t.type === "deposit") || [];
      const withdrawals = transactions?.filter((t) => t.type === "withdrawal") || [];
      const commissions = transactions?.filter((t) => t.type === "commission") || [];

      const completedDeposits = deposits.filter((t) => t.status === "completed");
      const completedWithdrawals = withdrawals.filter((t) => t.status === "completed");
      const pendingDeposits = deposits.filter((t) => t.status === "pending");
      const pendingWithdrawals = withdrawals.filter((t) => t.status === "pending");

      const totalDeposits = completedDeposits.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalWithdrawals = completedWithdrawals.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalCommissions = commissions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalInvestments = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        totalDeposits,
        totalWithdrawals,
        totalCommissions,
        totalInvestments,
        pendingDeposits: pendingDeposits.length,
        pendingWithdrawals: pendingWithdrawals.length,
        completedDeposits: completedDeposits.length,
        completedWithdrawals: completedWithdrawals.length,
      };
    },
  });

  return {
    stats: stats || {
      totalUsers: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalCommissions: 0,
      totalInvestments: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      completedDeposits: 0,
      completedWithdrawals: 0,
    },
    isLoading,
  };
};
