import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InvestmentPlan {
  id: string;
  name: string;
  icon: string;
  min_amount: number;
  max_amount: number;
  daily_rate: number;
  duration_days: number;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useInvestmentPlans = (includeInactive = false) => {
  return useQuery({
    queryKey: ["investment-plans", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("investment_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as InvestmentPlan[];
    },
  });
};

export const useUpdateInvestmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<InvestmentPlan>;
    }) => {
      const { data, error } = await supabase
        .from("investment_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment-plans"] });
    },
  });
};

export const useCreateInvestmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Omit<InvestmentPlan, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("investment_plans")
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment-plans"] });
    },
  });
};

export const useDeleteInvestmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("investment_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment-plans"] });
    },
  });
};
