import { useState } from "react";
import { 
  Users,
  Search,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminUsers } from "@/hooks/useAdminUsers";
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

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { users, isLoading } = useAdminUsers();

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const name = (user.full_name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedUsers,
    goToPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: filteredUsers, itemsPerPage: 10 });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gestion des comptes utilisateurs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : users.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Solde Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? "..." : `${users.reduce((acc, u) => acc + (u.balance || 0), 0).toLocaleString('fr-FR')}€`}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Solde Moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {isLoading || users.length === 0 ? "..." : `${(users.reduce((acc, u) => acc + (u.balance || 0), 0) / users.length).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}€`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users table */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Liste des utilisateurs
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Code Parrainage</TableHead>
                        <TableHead>Solde</TableHead>
                        <TableHead>Inscrit le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email || "-"}
                          </TableCell>
                          <TableCell>
                            <code className="px-2 py-1 bg-muted rounded text-xs">
                              {user.referral_code || "-"}
                            </code>
                          </TableCell>
                          <TableCell className="font-bold text-primary">
                            {(user.balance || 0).toLocaleString('fr-FR')}€
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : "-"}
                          </TableCell>
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

export default AdminUsers;
