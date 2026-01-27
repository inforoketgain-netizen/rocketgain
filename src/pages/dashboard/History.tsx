import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Filter, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvestments } from "@/hooks/useInvestments";

const History = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { investments, totalInvested, loading: investmentsLoading } = useInvestments();

  const loading = transactionsLoading || investmentsLoading;

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === "all") return true;
    if (activeTab === "deposits") return t.type === "deposit";
    if (activeTab === "investments") return t.type === "investment";
    if (activeTab === "gains") return t.type === "gain";
    if (activeTab === "withdrawals") return t.type === "withdrawal";
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="w-5 h-5 text-primary" />;
      case "investment":
        return <TrendingUp className="w-5 h-5 text-accent" />;
      case "gain":
        return <ArrowUpRight className="w-5 h-5 text-primary" />;
      case "withdrawal":
        return <ArrowDownRight className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-primary/20";
      case "investment":
        return "bg-accent/20";
      case "gain":
        return "bg-primary/20";
      case "withdrawal":
        return "bg-destructive/20";
      default:
        return "bg-muted";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">Complété</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">En cours</span>;
      case "active":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Actif</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate totals from real data
  const totals = {
    deposits: transactions.filter(t => t.type === "deposit" && t.status === "completed").reduce((sum, t) => sum + Number(t.amount), 0),
    investments: totalInvested,
    gains: transactions.filter(t => t.type === "gain" && t.status === "completed").reduce((sum, t) => sum + Number(t.amount), 0),
    withdrawals: transactions.filter(t => t.type === "withdrawal" && t.status === "completed").reduce((sum, t) => sum + Number(t.amount), 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Historique</h1>
          <p className="text-muted-foreground mt-1">Consultez l'historique de toutes vos transactions.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total déposé</p>
              <p className="text-2xl font-bold text-primary">
                {loading ? "..." : `$${totals.deposits.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total investi</p>
              <p className="text-2xl font-bold text-accent">
                {loading ? "..." : `$${totals.investments.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total des gains</p>
              <p className="text-2xl font-bold text-primary">
                {loading ? "..." : `$${totals.gains.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total retiré</p>
              <p className="text-2xl font-bold">
                {loading ? "..." : `$${totals.withdrawals.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Transactions</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="all">Tout</TabsTrigger>
                <TabsTrigger value="deposits">Dépôts</TabsTrigger>
                <TabsTrigger value="investments">Invest.</TabsTrigger>
                <TabsTrigger value="gains">Gains</TabsTrigger>
                <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-3">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Chargement...</p>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Aucune transaction</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeTab === "all" 
                        ? "Vos transactions apparaîtront ici une fois que vous aurez effectué des opérations."
                        : "Aucune transaction de ce type trouvée."}
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getIconBg(transaction.type))}>
                          {getIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description || transaction.type}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(transaction.status)}
                        <span className={cn(
                          "font-semibold min-w-[100px] text-right",
                          transaction.type === "gain" || transaction.type === "deposit" ? "text-primary" : "text-foreground"
                        )}>
                          {transaction.type === "gain" || transaction.type === "deposit" ? "+" : "-"}{Number(transaction.amount).toLocaleString()} $
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default History;