import { useState } from "react";
import { Bitcoin, CreditCard, Building2, Copy, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentMethods, PaymentMethod } from "@/hooks/usePaymentMethods";

const plans = [
  { id: "starter", name: "Starter", minDeposit: 100, returnRate: "2%" },
  { id: "silver", name: "Silver", minDeposit: 500, returnRate: "3%" },
  { id: "gold", name: "Gold", minDeposit: 1000, returnRate: "5%" },
  { id: "platinum", name: "Platinum", minDeposit: 5000, returnRate: "8%" },
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Bitcoin": return Bitcoin;
    case "Building2": return Building2;
    default: return CreditCard;
  }
};

const Deposit = () => {
  const { user } = useAuth();
  const { paymentMethods, isLoading: methodsLoading } = usePaymentMethods();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copié !",
      description: "L'adresse a été copiée dans le presse-papiers.",
    });
  };

  const handleDeposit = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer un dépôt.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPlan || !selectedMethod || !amount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    const depositAmount = Number(amount);
    if (depositAmount < (selectedPlanData?.minDeposit || 0)) {
      toast({
        title: "Montant insuffisant",
        description: `Le dépôt minimum pour le plan ${selectedPlanData?.name} est de $${selectedPlanData?.minDeposit}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "deposit",
        amount: depositAmount,
        status: "pending",
        description: `Dépôt ${selectedPlanData?.name} via ${selectedMethodData?.name}`,
      });

      if (error) throw error;

      // Notify admin about new deposit request
      try {
        await supabase.functions.invoke("notify-admin", {
          body: {
            type: "deposit",
            amount: depositAmount,
            userEmail: user.email || "",
            userName: user.user_metadata?.full_name || "",
            method: selectedMethodData?.name || "",
          },
        });
      } catch (notifyError) {
        console.error("Failed to notify admin:", notifyError);
      }

      toast({
        title: "Dépôt initié",
        description: "Votre dépôt est en cours de traitement. Vous recevrez une confirmation par email.",
      });

      setSelectedPlan(null);
      setSelectedMethod(null);
      setAmount("");
    } catch (error) {
      console.error("Error creating deposit:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du dépôt.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentDetails = (method: PaymentMethod) => {
    const details = method.details;
    
    if (method.type === "bitcoin") {
      return (
        <div className="space-y-2">
          <Label>Adresse Bitcoin</Label>
          <div className="flex items-center gap-2">
            <Input value={details.address || ""} readOnly className="font-mono text-sm" />
            <Button size="icon" variant="outline" onClick={() => handleCopy(details.address || "")}>
              {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {details.network && (
            <p className="text-sm text-muted-foreground">Réseau: {details.network}</p>
          )}
        </div>
      );
    }
    
    if (method.type === "paypal") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email PayPal</Label>
            <div className="flex items-center gap-2">
              <Input value={details.email || ""} readOnly />
              <Button size="icon" variant="outline" onClick={() => handleCopy(details.email || "")}>
                {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          {details.note && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary">{details.note}</p>
            </div>
          )}
        </div>
      );
    }
    
    if (method.type === "bank") {
      return (
        <div className="space-y-3">
          {details.bankName && (
            <div>
              <Label>Nom de la banque</Label>
              <p className="text-sm mt-1">{details.bankName}</p>
            </div>
          )}
          {details.accountHolder && (
            <div>
              <Label>Titulaire du compte</Label>
              <p className="text-sm mt-1">{details.accountHolder}</p>
            </div>
          )}
          {details.accountNumber && (
            <div className="space-y-2">
              <Label>Numéro de compte</Label>
              <div className="flex items-center gap-2">
                <Input value={details.accountNumber} readOnly className="font-mono" />
                <Button size="icon" variant="outline" onClick={() => handleCopy(details.accountNumber || "")}>
                  {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
          {details.country && (
            <div>
              <Label>Pays</Label>
              <p className="text-sm mt-1">{details.country}</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Dépôt</h1>
          <p className="text-muted-foreground mt-1">Ajoutez des fonds à votre compte pour commencer à investir.</p>
        </div>

        {/* Step 1: Choose Plan */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="font-display">1. Choisissez votre plan</CardTitle>
            <CardDescription>Sélectionnez le plan d'investissement qui vous convient.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-muted/30"
                  )}
                >
                  <div className="font-semibold text-lg">{plan.name}</div>
                  <div className="text-primary font-bold text-xl mt-1">{plan.returnRate} / jour</div>
                  <div className="text-sm text-muted-foreground mt-2">Min: ${plan.minDeposit}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Enter Amount */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="font-display">2. Montant du dépôt</CardTitle>
            <CardDescription>
              {selectedPlanData 
                ? `Minimum: $${selectedPlanData.minDeposit} pour le plan ${selectedPlanData.name}`
                : "Sélectionnez d'abord un plan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="amount">Montant ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2 text-lg"
                min={selectedPlanData?.minDeposit || 0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Payment Method */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="font-display">3. Moyen de paiement</CardTitle>
            <CardDescription>Choisissez comment vous souhaitez effectuer votre dépôt.</CardDescription>
          </CardHeader>
          <CardContent>
            {methodsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => {
                    const IconComponent = getIconComponent(method.icon);
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                          selectedMethod === method.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-muted/30"
                        )}
                      >
                        <IconComponent className={cn(
                          "w-8 h-8 mb-2",
                          selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="font-semibold">{method.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {method.fee_percent > 0 ? `Frais: ${method.fee_percent}%` : "Pas de frais"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Payment Details */}
                {selectedMethodData && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-semibold mb-3">Détails de paiement</h4>
                    {renderPaymentDetails(selectedMethodData)}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <Button 
          onClick={handleDeposit} 
          className="gradient-primary w-full md:w-auto px-8"
          disabled={!selectedPlan || !selectedMethod || !amount || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            "Confirmer le dépôt"
          )}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Deposit;
