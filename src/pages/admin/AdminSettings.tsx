import { 
  Settings,
  Shield,
  Bell,
  Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Paramètres</h1>
          <p className="text-muted-foreground mt-1">Configuration de la plateforme</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Sécurité
              </CardTitle>
              <CardDescription>Paramètres de sécurité de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vérification email obligatoire</Label>
                  <p className="text-sm text-muted-foreground">
                    Les utilisateurs doivent confirmer leur email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Double authentification</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer la 2FA pour les utilisateurs
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Gérer les notifications administrateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouvelles inscriptions</Label>
                  <p className="text-sm text-muted-foreground">
                    Notification à chaque nouvelle inscription
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Demandes de dépôt</Label>
                  <p className="text-sm text-muted-foreground">
                    Notification pour les nouveaux dépôts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Demandes de retrait</Label>
                  <p className="text-sm text-muted-foreground">
                    Notification pour les nouveaux retraits
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Emails
              </CardTitle>
              <CardDescription>Configuration des emails automatiques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email de bienvenue</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer un email aux nouveaux utilisateurs
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmation de transaction</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer un email après validation des transactions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Général
              </CardTitle>
              <CardDescription>Paramètres généraux</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les paramètres avancés seront disponibles dans une prochaine mise à jour.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
