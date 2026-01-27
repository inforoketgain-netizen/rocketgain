import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface PaymentMethodDetails {
  address?: string;
  network?: string;
  email?: string;
  note?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  country?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  is_active: boolean;
  details: PaymentMethodDetails;
  fee_percent: number;
  fee_fixed: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const usePaymentMethods = (includeInactive = false) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentMethods = [], isLoading, refetch } = useQuery({
    queryKey: ["payment-methods", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("payment_methods")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        ...item,
        details: (item.details || {}) as PaymentMethodDetails
      })) as PaymentMethod[];
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaymentMethod> & { id: string }) => {
      // Convert details to Json type if present
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.details) {
        updateData.details = updates.details as unknown as Json;
      }
      
      const { error } = await supabase
        .from("payment_methods")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Succès",
        description: "Moyen de paiement mis à jour.",
      });
    },
    onError: (error) => {
      console.error("Error updating payment method:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le moyen de paiement.",
        variant: "destructive",
      });
    },
  });

  const createPaymentMethod = useMutation({
    mutationFn: async (newMethod: Omit<PaymentMethod, "id" | "created_at" | "updated_at">) => {
      // Convert to database format
      const insertData = {
        name: newMethod.name,
        type: newMethod.type,
        icon: newMethod.icon,
        color: newMethod.color,
        is_active: newMethod.is_active,
        details: newMethod.details as unknown as Json,
        fee_percent: newMethod.fee_percent,
        fee_fixed: newMethod.fee_fixed,
        sort_order: newMethod.sort_order,
      };
      
      const { error } = await supabase
        .from("payment_methods")
        .insert(insertData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Succès",
        description: "Moyen de paiement créé.",
      });
    },
    onError: (error) => {
      console.error("Error creating payment method:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le moyen de paiement.",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Succès",
        description: "Moyen de paiement supprimé.",
      });
    },
    onError: (error) => {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le moyen de paiement.",
        variant: "destructive",
      });
    },
  });

  return {
    paymentMethods,
    isLoading,
    refetch,
    updatePaymentMethod,
    createPaymentMethod,
    deletePaymentMethod,
  };
};
