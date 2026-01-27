import { useState } from "react";
import { 
  TrendingUp,
  Zap,
  Rocket,
  Crown,
  Edit,
  Save,
  X,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { useInvestmentPlans, useUpdateInvestmentPlan, type InvestmentPlan } from "@/hooks/useInvestmentPlans";

const iconMap: Record<string, React.ElementType> = {
  Zap,
  TrendingUp,
  Rocket,
  Crown,
};

const colorClasses: Record<string, { text: string; bg: string; border: string }> = {
  blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  green: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  yellow: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
};

const AdminPlans = () => {
  const { toast } = useToast();
  const { data: plans, isLoading, error } = useInvestmentPlans(true);
  const updatePlan = useUpdateInvestmentPlan();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InvestmentPlan>>({});

  const handleEdit = (plan: InvestmentPlan) => {
    setEditingPlan(plan.id);
    setEditForm({
      min_amount: plan.min_amount,
      max_amount: plan.max_amount,
      daily_rate: plan.daily_rate,
      duration_days: plan.duration_days,
      is_active: plan.is_active,
    });
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditForm({});
  };

  const handleSave = async (planId: string) => {
    try {
      await updatePlan.mutateAsync({
        id: planId,
        updates: editForm,
      });
      toast({
        title: "Plan mis à jour",
        description: "Les modifications ont été enregistrées.",
      });
      setEditingPlan(null);
      setEditForm({});
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le plan.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (plan: InvestmentPlan) => {
    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        updates: { is_active: !plan.is_active },
      });
      toast({
        title: plan.is_active ? "Plan désactivé" : "Plan activé",
        description: `Le plan ${plan.name} a été ${plan.is_active ? "désactivé" : "activé"}.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du plan.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center text-destructive py-8">
          Erreur lors du chargement des plans
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Plans ROI</h1>
          <p className="text-muted-foreground mt-1">Configuration des plans d'investissement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans?.map((plan) => {
            const IconComponent = iconMap[plan.icon] || Zap;
            const colors = colorClasses[plan.color] || colorClasses.blue;
            const isEditing = editingPlan === plan.id;

            return (
              <Card 
                key={plan.id} 
                className={`bg-card/50 border-border/50 ${colors.border} border-l-4 ${!plan.is_active ? 'opacity-60' : ''}`}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <span className={colors.text}>{plan.name}</span>
                      {!plan.is_active && (
                        <span className="ml-2 text-xs text-muted-foreground">(inactif)</span>
                      )}
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={() => handleToggleActive(plan)}
                    />
                    {isEditing ? (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleSave(plan.id)}
                          disabled={updatePlan.isPending}
                        >
                          {updatePlan.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 text-primary" />
                          )}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={handleCancel}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(plan)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Montant min. (€)</Label>
                        <Input
                          type="number"
                          value={editForm.min_amount || 0}
                          onChange={(e) => setEditForm({ ...editForm, min_amount: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Montant max. (€)</Label>
                        <Input
                          type="number"
                          value={editForm.max_amount || 0}
                          onChange={(e) => setEditForm({ ...editForm, max_amount: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Taux journalier (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editForm.daily_rate || 0}
                          onChange={(e) => setEditForm({ ...editForm, daily_rate: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Durée (jours)</Label>
                        <Input
                          type="number"
                          value={editForm.duration_days || 0}
                          onChange={(e) => setEditForm({ ...editForm, duration_days: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Montant min.</p>
                          <p className="text-lg font-bold">{plan.min_amount.toLocaleString('fr-FR')}€</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Montant max.</p>
                          <p className="text-lg font-bold">{plan.max_amount.toLocaleString('fr-FR')}€</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Taux journalier</p>
                          <p className={`text-lg font-bold ${colors.text}`}>{plan.daily_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Durée</p>
                          <p className="text-lg font-bold">{plan.duration_days} jours</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">Rendement total estimé</p>
                        <p className={`text-2xl font-bold ${colors.text}`}>
                          {(plan.daily_rate * plan.duration_days).toFixed(1)}%
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPlans;
