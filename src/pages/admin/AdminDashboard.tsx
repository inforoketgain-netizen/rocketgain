import { 
  Users,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Percent
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
} from "recharts";

const AdminDashboard = () => {
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { chartData: signupChartData, isLoading: signupLoading } = useSignupStats();

  // Calculate system profit (deposits - withdrawals - commissions)
  const systemProfit = stats.totalDeposits - stats.totalWithdrawals - stats.totalCommissions;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {statsLoading ? "..." : stats.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Total investi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {statsLoading ? "..." : `${stats.totalInvestments.toLocaleString('fr-FR')}€`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Total payé (retraits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {statsLoading ? "..." : `${stats.totalWithdrawals.toLocaleString('fr-FR')}€`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-yellow-400" />
                Dépôts en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                {statsLoading ? "..." : stats.pendingDeposits}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-orange-400" />
                Retraits en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">
                {statsLoading ? "..." : stats.pendingWithdrawals}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" />
                Profit système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${systemProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {statsLoading ? "..." : `${systemProfit.toLocaleString('fr-FR')}€`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dépôts - Retraits - Commissions
              </p>
            </CardContent>
          </Card>
        </div>

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
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : signupChartData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={signupChartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total utilisateurs"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
