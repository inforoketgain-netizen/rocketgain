import { useState } from "react";
import { Copy, CheckCircle, Users, DollarSign, TrendingUp, Share2, Inbox, Coins } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useReferrals } from "@/hooks/useReferrals";
import { useCommissions } from "@/hooks/useCommissions";

const Referral = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { referrals, totalReferrals, activeReferrals, loading: referralsLoading } = useReferrals();
  const { commissions, totalCommissions, loading: commissionsLoading } = useCommissions();

  // Use referral code from profile or generate from user id
  const referralCode = profile?.referral_code || user?.id?.slice(0, 8).toUpperCase() || "XXXXXX";
  const referralLink = `https://rocketgain.com/ref/${referralCode}`;
  
  const stats = {
    totalReferrals,
    activeReferrals,
    totalCommissions,
    pendingCommissions: 0,
    commissionRate: 5,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copié !",
      description: "Le lien de parrainage a été copié dans le presse-papiers.",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "RocketGain - Gagnez ensemble !",
        text: `Rejoignez RocketGain et commencez à gagner ! Utilisez mon code: ${referralCode}`,
        url: referralLink,
      });
    } else {
      handleCopy(referralLink);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Parrainage</h1>
          <p className="text-muted-foreground mt-1">Invitez vos amis et gagnez des commissions sur leurs dépôts.</p>
        </div>

        {/* Referral Link Card */}
        <Card className="gradient-card border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
          <CardHeader className="relative">
            <CardTitle className="font-display text-2xl">Votre lien de parrainage</CardTitle>
            <CardDescription>
              Partagez ce lien et gagnez {stats.commissionRate}% de commission sur chaque dépôt de vos filleuls.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                value={referralLink} 
                readOnly 
                className="font-mono text-sm flex-1"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleCopy(referralLink)}
                  className="gap-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  Copier
                </Button>
                <Button onClick={handleShare} className="gradient-primary gap-2">
                  <Share2 className="w-4 h-4" />
                  Partager
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Votre code:</span>
              <span className="font-mono font-bold text-primary text-lg">{referralCode}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total filleuls</p>
                  <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Filleuls actifs</p>
                  <p className="text-2xl font-bold text-primary">{stats.activeReferrals}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commissions totales</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalCommissions.toLocaleString()} FCFA</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nb. commissions</p>
                  <p className="text-2xl font-bold text-accent">{commissions.length}</p>
                </div>
                <Coins className="w-8 h-8 text-accent opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="font-display">Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="font-semibold mb-2">Partagez votre lien</h3>
                <p className="text-sm text-muted-foreground">
                  Envoyez votre lien de parrainage à vos amis et votre réseau.
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center text-xl font-bold text-accent-foreground">
                  2
                </div>
                <h3 className="font-semibold mb-2">Ils s'inscrivent</h3>
                <p className="text-sm text-muted-foreground">
                  Vos filleuls créent un compte et effectuent leur premier dépôt.
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xl font-bold text-primary">
                  3
                </div>
                <h3 className="font-semibold mb-2">Gagnez des commissions</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez {stats.commissionRate}% de commission sur chaque dépôt de vos filleuls.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission History */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="font-display">Historique des commissions</CardTitle>
            <CardDescription>
              Toutes les commissions reçues grâce à vos filleuls
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commissionsLoading ? (
              <p className="text-center py-12 text-muted-foreground">Chargement...</p>
            ) : commissions.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucune commission</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Partagez votre lien pour commencer à gagner des commissions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {commissions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Coins className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.description || "Commission de parrainage"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">+{Number(item.amount).toLocaleString()} FCFA</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                        Complété
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="font-display">Mes filleuls</CardTitle>
            <CardDescription>
              Liste des utilisateurs inscrits avec votre code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralsLoading ? (
              <p className="text-center py-12 text-muted-foreground">Chargement...</p>
            ) : referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucun filleul</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Partagez votre lien pour inviter de nouveaux membres.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Filleul #{item.referred_id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Inscrit le {new Date(item.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{Number(item.total_commission).toLocaleString()} FCFA</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "active" 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {item.status === "active" ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Referral;