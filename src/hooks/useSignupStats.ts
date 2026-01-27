import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export const useSignupStats = () => {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-signup-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const chartData = useMemo(() => {
    if (!profiles.length) return [];

    const countsByDate: Record<string, number> = {};

    profiles.forEach((profile) => {
      if (profile.created_at) {
        const date = new Date(profile.created_at).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        });
        countsByDate[date] = (countsByDate[date] || 0) + 1;
      }
    });

    // Compute cumulative total
    let cumulative = 0;
    return Object.entries(countsByDate).map(([date, count]) => {
      cumulative += count;
      return {
        date,
        inscriptions: count,
        total: cumulative,
      };
    });
  }, [profiles]);

  return { chartData, isLoading };
};
