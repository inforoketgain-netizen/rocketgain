import { useState } from "react";
import { Bitcoin, CreditCard, Building2, AlertCircle, CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Bitcoin": return Bitcoin;
    case "Building2": return Building2;
    default: return CreditCard;
  }
};

const Withdraw = () => {
  const { user } = useAuth();
  const { paymentMethods, isLoading: methodsLoading } = usePaymentMethods();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { transactions, loading: transactionsLoading, refetch: refetchTransactions } = useTransactions();

  const availableBalance = profile?.balance || 0;
  const minWithdrawal = 50;

  // Filter withdrawal transactions
  const withdrawalHistory = transactions.filter(t => t.type === "withdrawal");

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  const calculateFee = () => {
    if (!selectedMethodData || !amount) return 0;
    return (Number(amount) * selectedMethodData.fee_percent) / 100;
  };

  const fee = calculateFee();
  const netAmount = Number(amount) - fee;

  const handleWithdraw = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer un retrait.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMethod || !amount || !address) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = Number(amount);

    if (numAmount < minWithdrawal) {
      toast({
        title: "Montant insuffisant",
        description: `Le retrait minimum est de $${minWithdrawal}.`,
        variant: "destructive",
      });
      return;
    }

    if (numAmount > availableBalance) {
      toast({
        title: "Solde insuffisant",
        description: "Vous n'avez pas assez de fonds disponibles.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Atomic balance deduction using RPC to prevent race conditions
      const { data: balanceResult, error: balanceError } = await supabase.rpc(
        "deduct_balance",
        {
          p_user_id: user.id,
          p_amount: numAmount,
        }
      );

      if (balanceError) throw balanceError;

      const result = balanceResult?.[0];
      if (!result?.success) {
        toast({
          title: "Erreur",
          description: result?.error_message || "Solde insuffisant pour ce retrait.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create withdrawal transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "withdrawal",
        amount: numAmount,
        status: "pending",
        description: `Retrait via ${selectedMethodData?.name} - ${address}`,
      });

      if (txError) throw txError;

      // Notify admin about new withdrawal request
      try {
        await supabase.functions.invoke("notify-admin", {
          body: {
            type: "withdrawal",
            amount: numAmount,
            userEmail: user.email || "",
            userName: user.user_metadata?.full_name || "",
            method: selectedMethodData?.name || "",
          },
        });
      } catch (notifyError) {
        console.error("Failed to notify admin:", notifyError);
      }

      toast({
        title: "Demande de retrait envoyée",
        description: `Votre retrait de $${netAmount.toFixed(2)} sera traité prochainement.`,
      });
      
      setAmount("");
      setAddress("");
      setSelectedMethod(null);
      refetchProfile();
      refetchTransactions();
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la demande de retrait.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressLabel = () => {
    if (!selectedMethodData) return "Adresse";
    switch (selectedMethodData.type) {
      case "bitcoin": return "Adresse Bitcoin";
      case "paypal": return "Email PayPal";
      case "bank": return "Numéro de compte";
      default: return "Adresse";
    }
  };

  const getAddressPlaceholder = () => {
    if (!selectedMethodData) return "";
    switch (selectedMethodData.type) {
      case "bitcoin": return "bc1q...";
      case "paypal": return "votre@email.com";
      case "bank": return "Votre numéro de compte bancaire";
      default: return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Retrait</h1>
          <p className="text-muted-foreground mt-1">Retirez vos gains vers votre compte externe.</p>
        </div>

        {/* Balance */}
        <Card className="gradient-card border-border">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde disponible pour retrait</p>
                <p className="text-3xl font-bold text-primary">
                  {profileLoading ? "..." : `$${availableBalance.toFixed(2)}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Retrait minimum</p>
                <p className="text-lg font-semibold">${minWithdrawal}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="space-y-6">
            {/* Method Selection */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="font-display">Méthode de retrait</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez recevoir vos fonds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {methodsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  paymentMethods.map((method) => {
                    const IconComponent = getIconComponent(method.icon);
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200",
                          selectedMethod === method.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className={cn(
                            "w-6 h-6",
                            selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            Frais: {method.fee_percent > 0 ? `${method.fee_percent}%` : "0%"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Amount and Address */}
            {selectedMethod && (
              <Card className="gradient-card border-border animate-fade-up">
                <CardHeader>
                  <CardTitle className="font-display">Détails du retrait</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount">Montant ($)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-2"
                      min={minWithdrawal}
                      max={availableBalance}
                    />
                  </div>

                  <div>
                    <Label htmlFor="withdraw-address">{getAddressLabel()}</Label>
                    <Input
                      id="withdraw-address"
                      type="text"
                      placeholder={getAddressPlaceholder()}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {amount && Number(amount) > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Montant demandé</span>
                        <span>${Number(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Frais ({selectedMethodData?.fee_percent || 0}%)
                        </span>
                        <span>-${fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-border pt-2">
                        <span>Vous recevrez</span>
                        <span className="text-primary">${netAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Vérifiez bien votre adresse de retrait. Les transactions sont irréversibles.
                    </p>
                  </div>

                  <Button 
                    onClick={handleWithdraw} 
                    className="w-full gradient-primary"
                    disabled={!amount || !address || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      "Demander le retrait"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Withdrawal History */}
          <Card className="gradient-card border-border h-fit">
            <CardHeader>
              <CardTitle className="font-display">Historique des retraits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactionsLoading ? (
                <p className="text-center text-muted-foreground py-8">Chargement...</p>
              ) : withdrawalHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Inbox className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">Aucun retrait effectué</p>
                  <p className="text-sm text-muted-foreground mt-1">Vos retraits apparaîtront ici</p>
                </div>
              ) : (
                withdrawalHistory.map((withdrawal) => (
                  <div 
                    key={withdrawal.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{withdrawal.description || "Retrait"}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(withdrawal.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${withdrawal.amount}</p>
                      <div className={cn(
                        "flex items-center gap-1 text-sm",
                        withdrawal.status === "completed" ? "text-primary" : "text-accent"
                      )}>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{withdrawal.status === "completed" ? "Complété" : "En cours"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Withdraw;
