import { Wallet, TrendingUp, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useInvestments } from "@/hooks/useInvestments";
import { useTransactions } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Dashboard = () => {
  const { profile, loading: profileLoading } = useProfile();
  const { activeInvestments, activeCount, totalInvested, loading: investmentsLoading } = useInvestments();
  const { recentTransactions, totalGains, loading: transactionsLoading } = useTransactions();

  const loading = profileLoading || investmentsLoading || transactionsLoading;

  const stats = {
    balance: profile?.balance ?? 0,
    totalGains,
    activeInvestments: activeCount,
    totalInvested,
  };

  const firstName = profile?.full_name?.split(" ")[0] || "Utilisateur";

  const getProgress = (startedAt: string, endsAt: string) => {
    const start = new Date(startedAt).getTime();
    const end = new Date(endsAt).getTime();
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Tableau de bord</h1>
          {loading ? (
            <Skeleton className="h-5 w-64 mt-1" />
          ) : (
            <p className="text-muted-foreground mt-1">Bienvenue {firstName} ! Voici un aperçu de votre compte.</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solde actuel</CardTitle>
              <Wallet className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">${stats.balance.toFixed(2)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Disponible pour retrait</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gains totaux</CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-primary">${stats.totalGains.toFixed(2)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Cumul des gains</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investissements actifs</CardTitle>
              <PiggyBank className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.activeInvestments}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Plans en cours</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total investi</CardTitle>
              <TrendingUp className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">${stats.totalInvested.toFixed(2)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Capital en circulation</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button asChild className="gradient-primary">
            <Link to="/dashboard/deposit">Faire un dépôt</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard/invest">Investir maintenant</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard/withdraw">Retirer des fonds</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Investments */}
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="font-display">Investissements actifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : activeInvestments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun investissement actif</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/dashboard/invest">Commencer à investir</Link>
                  </Button>
                </div>
              ) : (
                activeInvestments.map((investment) => (
                  <div key={investment.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Plan {investment.plan_name}</span>
                      <span className="text-primary font-medium">{investment.daily_rate}% / jour</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>${Number(investment.amount).toFixed(2)} investis</span>
                      <span>Fin: {new Date(investment.ends_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(investment.started_at, investment.ends_at)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="font-display">Activité récente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune activité récente</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/dashboard/deposit">Faire un dépôt</Link>
                  </Button>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === "gain" ? "bg-primary/20" : 
                        transaction.type === "deposit" ? "bg-accent/20" : "bg-destructive/20"
                      }`}>
                        {transaction.type === "withdrawal" ? (
                          <ArrowDownRight className="w-5 h-5 text-destructive" />
                        ) : (
                          <ArrowUpRight className={`w-5 h-5 ${transaction.type === "gain" ? "text-primary" : "text-accent"}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || transaction.type}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === "withdrawal" ? "text-destructive" : "text-primary"
                    }`}>
                      {transaction.type === "withdrawal" ? "-" : "+"}${Math.abs(Number(transaction.amount)).toFixed(2)}
                    </span>
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

export default Dashboard;
