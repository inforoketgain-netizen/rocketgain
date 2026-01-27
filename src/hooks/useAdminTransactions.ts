import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
  profiles?: {
    email: string | null;
    full_name: string | null;
  };
}

interface ProcessTransactionResult {
  success: boolean;
  error?: string;
  transaction_id?: string;
  new_balance?: number;
  amount?: number;
  refunded_amount?: number;
  type?: string;
}

const sendTransactionEmail = async (
  email: string,
  fullName: string | null,
  type: string,
  status: string,
  amount: number
) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-transaction-email", {
      body: {
        email,
        fullName: fullName || "Investisseur",
        type: type === "deposit" ? "deposit" : "withdrawal",
        status: status === "completed" ? "completed" : "rejected",
        amount,
      },
    });

    if (error) {
      console.error("Error sending email:", error);
      return false;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
};

export const useAdminTransactions = () => {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      // Fetch all profiles for mapping
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, email, full_name");

      // Map profiles to transactions
      const transactionsWithProfiles = txData.map((tx) => {
        const profile = profilesData?.find((p) => p.user_id === tx.user_id);
        return {
          ...tx,
          profiles: profile ? { email: profile.email, full_name: profile.full_name } : undefined,
        };
      });

      return transactionsWithProfiles as AdminTransaction[];
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, status, userId, amount, type, email, fullName }: { 
      id: string; 
      status: string; 
      userId: string;
      amount: number;
      type: string;
      email?: string | null;
      fullName?: string | null;
    }) => {
      // Use secure RPC function for atomic transaction processing
      const { data, error: rpcError } = await supabase.rpc("admin_process_transaction", {
        p_transaction_id: id,
        p_new_status: status,
      });

      if (rpcError) throw rpcError;

      const result = data as unknown as ProcessTransactionResult;
      
      if (!result.success) {
        throw new Error(result.error || "Transaction processing failed");
      }

      // Process referral commission for approved deposits
      if (status === "completed" && type === "deposit") {
        // Check if user was referred and process commission
        const { data: referralData } = await supabase
          .from("referrals")
          .select("id, referrer_id, commission_rate, total_commission")
          .eq("referred_id", userId)
          .eq("status", "active")
          .maybeSingle();

        if (referralData) {
          const commissionAmount = amount * (referralData.commission_rate / 100);

          // Use atomic RPC function to prevent race conditions
          const { data: creditResult, error: referrerBalanceError } = await supabase.rpc(
            "admin_credit_balance",
            {
              p_user_id: referralData.referrer_id,
              p_amount: commissionAmount,
            }
          );

          const result = creditResult as { success: boolean; error?: string; new_balance?: number } | null;

          if (referrerBalanceError || !result?.success) {
            console.error("Error updating referrer balance:", referrerBalanceError || result?.error);
          } else {
            console.log(`Commission of ${commissionAmount} credited to referrer ${referralData.referrer_id}`);
            
            // Create a commission transaction for the referrer
            await supabase.from("transactions").insert({
              user_id: referralData.referrer_id,
              type: "commission",
              amount: commissionAmount,
              status: "completed",
              description: `Commission de parrainage (${referralData.commission_rate}% sur dépôt de ${amount} FCFA)`,
            });

            toast.success(`Commission de ${commissionAmount} FCFA créditée au parrain`);
          }
        }
      }

      // Send email notification
      if (email) {
        const emailSent = await sendTransactionEmail(email, fullName || null, type, status, amount);
        if (emailSent) {
          toast.success("Email de notification envoyé");
        } else {
          toast.warning("Transaction mise à jour mais l'email n'a pas pu être envoyé");
        }
      }

      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du traitement de la transaction");
    },
  });

  const pendingTransactions = transactions?.filter((t) => t.status === "pending") || [];

  return {
    transactions: transactions || [],
    pendingTransactions,
    loading: isLoading,
    error,
    updateTransaction: updateTransactionMutation.mutate,
    isUpdating: updateTransactionMutation.isPending,
  };
};
