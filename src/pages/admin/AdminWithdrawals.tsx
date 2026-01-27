import { 
  ArrowUpCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminTransactions } from "@/hooks/useAdminTransactions";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminWithdrawals = () => {
  const { 
    transactions,
    loading, 
    updateTransaction, 
    isUpdating 
  } = useAdminTransactions();

  const withdrawals = transactions.filter(t => t.type === "withdrawal");
  const pendingWithdrawals = withdrawals.filter(t => t.status === "pending");

  const handleApprove = (tx: any) => {
    updateTransaction(
      { 
        id: tx.id, 
        status: "completed", 
        userId: tx.user_id, 
        amount: tx.amount, 
        type: tx.type,
        email: tx.profiles?.email,
        fullName: tx.profiles?.full_name,
      },
      {
        onSuccess: () => {
          toast({
            title: "Retrait approuvé",
            description: `Le retrait de ${tx.amount}€ a été approuvé.`,
          });
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "Impossible d'approuver le retrait.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleReject = (tx: any) => {
    updateTransaction(
      { 
        id: tx.id, 
        status: "rejected", 
        userId: tx.user_id, 
        amount: tx.amount, 
        type: tx.type,
        email: tx.profiles?.email,
        fullName: tx.profiles?.full_name,
      },
      {
        onSuccess: () => {
          toast({
            title: "Retrait rejeté",
            description: `Le retrait de ${tx.amount}€ a été rejeté.`,
          });
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "Impossible de rejeter le retrait.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approuvé</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeté</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En attente</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Retraits</h1>
          <p className="text-muted-foreground mt-1">Validation des demandes de retrait</p>
        </div>

        {/* Pending Withdrawals */}
        <Card className="bg-card/50 border-border/50 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-orange-400" />
              Retraits en attente ({pendingWithdrawals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : pendingWithdrawals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun retrait en attente
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingWithdrawals.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.profiles?.full_name || "-"}</p>
                            <p className="text-xs text-muted-foreground">{tx.profiles?.email || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-orange-400">
                          -{tx.amount.toLocaleString('fr-FR')}€
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {tx.description || "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                              onClick={() => handleApprove(tx)}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                              onClick={() => handleReject(tx)}
                              disabled={isUpdating}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Withdrawals */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-primary" />
              Historique des retraits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun retrait
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.profiles?.full_name || "-"}</p>
                            <p className="text-xs text-muted-foreground">{tx.profiles?.email || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-orange-400">
                          -{tx.amount.toLocaleString('fr-FR')}€
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {tx.description || "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
