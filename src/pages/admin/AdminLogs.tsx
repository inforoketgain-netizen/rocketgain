import { useState } from "react";
import { 
  FileText,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminTransactions } from "@/hooks/useAdminTransactions";
import { usePagination } from "@/hooks/usePagination";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminLogs = () => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { transactions, loading } = useAdminTransactions();

  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    return true;
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedTransactions,
    goToPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: filteredTransactions, itemsPerPage: 15 });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complété</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeté</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge variant="outline" className="border-green-500/50 text-green-400">Dépôt</Badge>;
      case "withdrawal":
        return <Badge variant="outline" className="border-orange-500/50 text-orange-400">Retrait</Badge>;
      case "commission":
        return <Badge variant="outline" className="border-purple-500/50 text-purple-400">Commission</Badge>;
      case "gain":
        return <Badge variant="outline" className="border-blue-500/50 text-blue-400">Gain</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Journaux</h1>
          <p className="text-muted-foreground mt-1">Historique de toutes les transactions</p>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="deposit">Dépôts</SelectItem>
                    <SelectItem value="withdrawal">Retraits</SelectItem>
                    <SelectItem value="commission">Commissions</SelectItem>
                    <SelectItem value="gain">Gains</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Statut</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="completed">Complété</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Toutes les transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune transaction trouvée
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{tx.profiles?.full_name || "-"}</p>
                              <p className="text-xs text-muted-foreground">{tx.profiles?.email || "-"}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(tx.type)}</TableCell>
                          <TableCell className="font-medium">
                            {tx.amount.toLocaleString('fr-FR')}€
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
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={totalItems}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
