import { useState } from "react";
import { 
  CreditCard, 
  Edit, 
  Save, 
  X, 
  Plus,
  Trash2,
  Bitcoin,
  Building2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { usePaymentMethods, PaymentMethod, PaymentMethodDetails } from "@/hooks/usePaymentMethods";
import { cn } from "@/lib/utils";

const iconOptions = [
  { value: "Bitcoin", label: "Bitcoin", icon: Bitcoin },
  { value: "CreditCard", label: "Carte/PayPal", icon: CreditCard },
  { value: "Building2", label: "Banque", icon: Building2 },
];

const typeOptions = [
  { value: "bitcoin", label: "Bitcoin" },
  { value: "paypal", label: "PayPal" },
  { value: "bank", label: "Virement bancaire" },
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Bitcoin": return Bitcoin;
    case "Building2": return Building2;
    default: return CreditCard;
  }
};

const AdminPaymentMethods = () => {
  const { paymentMethods, isLoading, updatePaymentMethod, createPaymentMethod, deletePaymentMethod } = usePaymentMethods(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PaymentMethod>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: "",
    type: "bitcoin",
    icon: "Bitcoin",
    color: "bg-primary",
    is_active: true,
    details: {} as PaymentMethodDetails,
    fee_percent: 0,
    fee_fixed: 0,
    sort_order: 0,
  });

  const handleEdit = (method: PaymentMethod) => {
    setEditingId(method.id);
    setEditForm(method);
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;
    await updatePaymentMethod.mutateAsync({ id: editingId, ...editForm });
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    await updatePaymentMethod.mutateAsync({ id: method.id, is_active: !method.is_active });
  };

  const handleCreate = async () => {
    await createPaymentMethod.mutateAsync(newMethod);
    setIsCreateOpen(false);
    setNewMethod({
      name: "",
      type: "bitcoin",
      icon: "Bitcoin",
      color: "bg-primary",
      is_active: true,
      details: {},
      fee_percent: 0,
      fee_fixed: 0,
      sort_order: paymentMethods.length,
    });
  };

  const handleDelete = async (id: string) => {
    await deletePaymentMethod.mutateAsync(id);
  };

  const updateEditDetails = (key: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      details: { ...prev.details, [key]: value }
    }));
  };

  const updateNewDetails = (key: string, value: string) => {
    setNewMethod(prev => ({
      ...prev,
      details: { ...prev.details, [key]: value }
    }));
  };

  const renderDetailsFields = (
    type: string, 
    details: PaymentMethodDetails, 
    updateFn: (key: string, value: string) => void
  ) => {
    switch (type) {
      case "bitcoin":
        return (
          <div className="space-y-3">
            <div>
              <Label>Adresse Bitcoin</Label>
              <Input
                value={details.address || ""}
                onChange={(e) => updateFn("address", e.target.value)}
                placeholder="bc1q..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Réseau</Label>
              <Input
                value={details.network || ""}
                onChange={(e) => updateFn("network", e.target.value)}
                placeholder="Bitcoin (BTC)"
                className="mt-1"
              />
            </div>
          </div>
        );
      case "paypal":
        return (
          <div className="space-y-3">
            <div>
              <Label>Email PayPal</Label>
              <Input
                value={details.email || ""}
                onChange={(e) => updateFn("email", e.target.value)}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Note / Instructions</Label>
              <Textarea
                value={details.note || ""}
                onChange={(e) => updateFn("note", e.target.value)}
                placeholder="Instructions pour le paiement..."
                className="mt-1"
              />
            </div>
          </div>
        );
      case "bank":
        return (
          <div className="space-y-3">
            <div>
              <Label>Nom de la banque</Label>
              <Input
                value={details.bankName || ""}
                onChange={(e) => updateFn("bankName", e.target.value)}
                placeholder="Nom de la banque"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Titulaire du compte</Label>
              <Input
                value={details.accountHolder || ""}
                onChange={(e) => updateFn("accountHolder", e.target.value)}
                placeholder="Nom du titulaire"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Numéro de compte</Label>
              <Input
                value={details.accountNumber || ""}
                onChange={(e) => updateFn("accountNumber", e.target.value)}
                placeholder="Numéro de compte"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Pays</Label>
              <Input
                value={details.country || ""}
                onChange={(e) => updateFn("country", e.target.value)}
                placeholder="Pays"
                className="mt-1"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Moyens de paiement</h1>
            <p className="text-muted-foreground mt-1">Gérez les informations des moyens de paiement</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouveau moyen de paiement</DialogTitle>
                <DialogDescription>Ajoutez un nouveau moyen de paiement pour les dépôts et retraits.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={newMethod.name}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bitcoin, PayPal, etc."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newMethod.type}
                    onValueChange={(value) => setNewMethod(prev => ({ ...prev, type: value, details: {} }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Icône</Label>
                  <Select
                    value={newMethod.icon}
                    onValueChange={(value) => setNewMethod(prev => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Frais (%)</Label>
                  <Input
                    type="number"
                    value={newMethod.fee_percent}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, fee_percent: Number(e.target.value) }))}
                    className="mt-1"
                    min={0}
                    step={0.1}
                  />
                </div>
                
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">Détails du paiement</Label>
                  <div className="mt-3">
                    {renderDetailsFields(newMethod.type, newMethod.details, updateNewDetails)}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={!newMethod.name}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {paymentMethods.map((method) => {
            const IconComponent = getIconComponent(method.icon);
            const isEditing = editingId === method.id;
            
            return (
              <Card 
                key={method.id} 
                className={cn(
                  "bg-card/50 border-border/50 transition-opacity",
                  !method.is_active && "opacity-60"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", method.color)}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{method.name}</CardTitle>
                        <CardDescription>
                          Type: {method.type} • Frais: {method.fee_percent}%
                          {!method.is_active && " • Désactivé"}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(method)}
                        title={method.is_active ? "Désactiver" : "Activer"}
                      >
                        {method.is_active ? (
                          <ToggleRight className="w-5 h-5 text-primary" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                      
                      {!isEditing ? (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={handleSave}>
                            <Save className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleCancel}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce moyen de paiement ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le moyen de paiement "{method.name}" sera définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(method.id)}>Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nom</Label>
                          <Input
                            value={editForm.name || ""}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Frais (%)</Label>
                          <Input
                            type="number"
                            value={editForm.fee_percent || 0}
                            onChange={(e) => setEditForm(prev => ({ ...prev, fee_percent: Number(e.target.value) }))}
                            className="mt-1"
                            min={0}
                            step={0.1}
                          />
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <Label className="text-base font-semibold">Détails du paiement</Label>
                        <div className="mt-3">
                          {renderDetailsFields(
                            editForm.type || method.type, 
                            editForm.details || {}, 
                            updateEditDetails
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {method.type === "bitcoin" && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Adresse:</span>
                            <p className="font-mono text-xs break-all">{method.details.address || "-"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Réseau:</span>
                            <p>{method.details.network || "-"}</p>
                          </div>
                        </>
                      )}
                      {method.type === "paypal" && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p>{method.details.email || "-"}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Note:</span>
                            <p>{method.details.note || "-"}</p>
                          </div>
                        </>
                      )}
                      {method.type === "bank" && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Banque:</span>
                            <p>{method.details.bankName || "-"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Titulaire:</span>
                            <p>{method.details.accountHolder || "-"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">N° compte:</span>
                            <p className="font-mono text-xs">{method.details.accountNumber || "-"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pays:</span>
                            <p>{method.details.country || "-"}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {paymentMethods.length === 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun moyen de paiement configuré</p>
                <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un moyen de paiement
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentMethods;
