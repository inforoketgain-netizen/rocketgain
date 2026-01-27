import { useState } from "react";
import { TrendingUp, Clock, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestmentPlans } from "@/hooks/useInvestmentPlans";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const colorMap: Record<string, string> = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  yellow: "from-amber-500 to-amber-600",
};

const Invest = () => {
  const { user } = useAuth();
  const { data: dbPlans, isLoading: plansLoading } = useInvestmentPlans();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile, loading, refetch } = useProfile();

  const availableBalance = profile?.balance || 0;

  const investmentPlans = dbPlans?.map((plan) => ({
    id: plan.id,
    name: plan.name,
    minAmount: plan.min_amount,
    maxAmount: plan.max_amount,
    dailyReturn: plan.daily_rate,
    duration: plan.duration_days,
    color: colorMap[plan.color] || colorMap.blue,
  })) || [];

  const selectedPlanData = investmentPlans.find(p => p.id === selectedPlan);
  
  const calculateReturns = () => {
    if (!selectedPlanData || !amount) return { daily: 0, total: 0 };
    const numAmount = Number(amount);
    const daily = (numAmount * selectedPlanData.dailyReturn) / 100;
    const total = daily * selectedPlanData.duration;
    return { daily, total };
  };

  const returns = calculateReturns();

  const handleInvest = () => {
    if (!selectedPlan || !amount) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un plan et entrer un montant.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = Number(amount);

    if (numAmount > availableBalance) {
      toast({
        title: "Solde insuffisant",
        description: "Vous n'avez pas assez de fonds. Veuillez faire un dépôt.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlanData && (numAmount < selectedPlanData.minAmount || numAmount > selectedPlanData.maxAmount)) {
      toast({
        title: "Montant invalide",
        description: `Le montant doit être entre $${selectedPlanData.minAmount} et $${selectedPlanData.maxAmount}.`,
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmInvestment = async () => {
    if (!user || !selectedPlanData) return;

    setIsLoading(true);
    try {
      const numAmount = Number(amount);
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + selectedPlanData.duration);

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
          description: result?.error_message || "Solde insuffisant pour cet investissement.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create investment
      const { error: investError } = await supabase.from("investments").insert({
        user_id: user.id,
        amount: numAmount,
        plan_name: selectedPlanData.name,
        daily_rate: selectedPlanData.dailyReturn,
        duration_days: selectedPlanData.duration,
        ends_at: endsAt.toISOString(),
        status: "active",
      });

      if (investError) throw investError;

      // Create transaction record
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "investment",
        amount: numAmount,
        status: "completed",
        description: `Investissement plan ${selectedPlanData.name}`,
      });

      if (txError) throw txError;

      setShowConfirmDialog(false);
      toast({
        title: "Investissement confirmé !",
        description: `Votre investissement de $${amount} dans le plan ${selectedPlanData.name} a été activé.`,
      });
      setAmount("");
      setSelectedPlan(null);
      refetch();
    } catch (error) {
      console.error("Error creating investment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'investissement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (plansLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Investir</h1>
          <p className="text-muted-foreground mt-1">Choisissez un plan et commencez à faire fructifier votre argent.</p>
        </div>

        {/* Balance Card */}
        <Card className="gradient-card border-border">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-sm text-muted-foreground">Solde disponible</p>
              <p className="text-3xl font-bold">
                {loading ? "..." : `$${availableBalance.toFixed(2)}`}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-primary opacity-50" />
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h2 className="text-xl font-semibold font-display mb-4">Plans d'investissement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {investmentPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-300",
                  selectedPlan === plan.id
                    ? "border-primary shadow-glow scale-[1.02]"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "absolute inset-0 opacity-10 bg-gradient-to-br",
                  plan.color
                )} />
                <div className="relative">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold text-primary">{plan.dailyReturn}%</span>
                      <span className="text-muted-foreground">/ jour</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{plan.duration} jours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>${plan.minAmount} - ${plan.maxAmount}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Investment Form */}
        {selectedPlan && (
          <Card className="gradient-card border-border animate-fade-up">
            <CardHeader>
              <CardTitle className="font-display">Montant de l'investissement</CardTitle>
              <CardDescription>
                Plan {selectedPlanData?.name} - Min: ${selectedPlanData?.minAmount} / Max: ${selectedPlanData?.maxAmount}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md">
                <Label htmlFor="invest-amount">Montant ($)</Label>
                <Input
                  id="invest-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2 text-lg"
                  min={selectedPlanData?.minAmount}
                  max={selectedPlanData?.maxAmount}
                />
              </div>

              {amount && Number(amount) > 0 && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-3">Estimation des gains</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Gain journalier</p>
                      <p className="text-xl font-bold text-primary">${returns.daily.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gain total ({selectedPlanData?.duration} jours)</p>
                      <p className="text-xl font-bold text-primary">${returns.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleInvest} className="gradient-primary">
                Investir maintenant
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Confirmer l'investissement</DialogTitle>
              <DialogDescription>
                Veuillez vérifier les détails de votre investissement avant de confirmer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold">{selectedPlanData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rendement journalier</span>
                <span className="font-semibold text-primary">{selectedPlanData?.dailyReturn}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durée</span>
                <span className="font-semibold">{selectedPlanData?.duration} jours</span>
              </div>
              <div className="flex justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">Gain total estimé</span>
                <span className="font-bold text-primary">${returns.total.toFixed(2)}</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  En confirmant, vous acceptez que votre capital soit bloqué pendant la durée de l'investissement.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Annuler
              </Button>
              <Button onClick={confirmInvestment} className="gradient-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Confirmer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Invest;
