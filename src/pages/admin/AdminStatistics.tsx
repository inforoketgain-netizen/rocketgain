import { 
  Users,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Coins,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useSignupStats } from "@/hooks/useSignupStats";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const AdminStatistics = () => {
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { chartData: signupChartData, isLoading: signupLoading } = useSignupStats();

  const systemProfit = stats.totalDeposits - stats.totalWithdrawals - stats.totalCommissions;

  const financialData = [
    { name: "Dépôts", value: stats.totalDeposits, color: "hsl(142, 71%, 45%)" },
    { name: "Retraits", value: stats.totalWithdrawals, color: "hsl(25, 95%, 53%)" },
    { name: "Commissions", value: stats.totalCommissions, color: "hsl(280, 65%, 60%)" },
    { name: "Investissements", value: stats.totalInvestments, color: "hsl(var(--primary))" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Statistiques</h1>
          <p className="text-muted-foreground mt-1">Analyse détaillée de la plateforme</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? "..." : stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-green-400" />
                Total Dépôts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {statsLoading ? "..." : `${stats.totalDeposits.toLocaleString('fr-FR')}€`}
              </div>
              <p className="text-xs text-muted-foreground">{stats.completedDeposits} transactions</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-orange-400" />
                Total Retraits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {statsLoading ? "..." : `${stats.totalWithdrawals.toLocaleString('fr-FR')}€`}
              </div>
              <p className="text-xs text-muted-foreground">{stats.completedWithdrawals} transactions</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Investissements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {statsLoading ? "..." : `${stats.totalInvestments.toLocaleString('fr-FR')}€`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-400" />
                Total Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {statsLoading ? "..." : `${stats.totalCommissions.toLocaleString('fr-FR')}€`}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En attente (Dépôts / Retraits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {stats.pendingDeposits} / {stats.pendingWithdrawals}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Profit Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${systemProfit >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                {statsLoading ? "..." : `${systemProfit.toLocaleString('fr-FR')}€`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signup Chart */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Évolution des inscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {signupLoading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : signupChartData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Aucune donnée</div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={signupChartData}>
                      <defs>
                        <linearGradient id="colorSignup" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Utilisateurs"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorSignup)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Chart */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Répartition financière
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value.toLocaleString('fr-FR')}€`, 'Montant']}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStatistics;
