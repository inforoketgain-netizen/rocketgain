import { useState, useEffect, useMemo } from "react";
import { User, Mail, Phone, Shield, Eye, EyeOff, Save, Loader2, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { validatePassword, isPasswordValid, getPasswordErrorMessage } from "@/lib/password-validation";

// Password requirement indicator component
const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <Check className="w-3.5 h-3.5 text-green-500" />
    ) : (
      <X className="w-3.5 h-3.5 text-muted-foreground" />
    )}
    <span className={met ? "text-green-600" : "text-muted-foreground"}>{text}</span>
  </div>
);

const Profile = () => {
  const { toast } = useToast();
  const { profile, loading, updateProfile } = useProfile();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    if (profile) {
      setUserData({
        fullName: profile.full_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Password validation for new password
  const passwordValidation = useMemo(() => validatePassword(passwords.new), [passwords.new]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: userData.fullName });
    setSaving(false);
    
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    // Validate password complexity using shared utility
    if (!isPasswordValid(passwords.new)) {
      toast({
        title: "Erreur",
        description: getPasswordErrorMessage(),
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été changé avec succès.",
      });
      setPasswords({ current: "", new: "", confirm: "" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Profil</h1>
          <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et votre sécurité.</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="gap-2">
              <User className="w-4 h-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="font-display">Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de profil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{userData.fullName || "Utilisateur"}</p>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={userData.fullName}
                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      className="pl-10"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                </div>

                <Button onClick={handleSaveProfile} className="gradient-primary gap-2" disabled={saving || loading}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sauvegarder les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="font-display">Changer le mot de passe</CardTitle>
                <CardDescription>Assurez-vous d'utiliser un mot de passe fort et unique.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwords.new && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Critères du mot de passe :</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        <PasswordRequirement met={passwordValidation.minLength} text="Minimum 8 caractères" />
                        <PasswordRequirement met={passwordValidation.hasUppercase} text="Une lettre majuscule" />
                        <PasswordRequirement met={passwordValidation.hasLowercase} text="Une lettre minuscule" />
                        <PasswordRequirement met={passwordValidation.hasNumber} text="Un chiffre" />
                        <PasswordRequirement met={passwordValidation.hasSpecial} text="Un caractère spécial (!@#$%...)" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  className="gradient-primary gap-2"
                  disabled={!passwords.current || !passwords.new || !passwords.confirm}
                >
                  <Shield className="w-4 h-4" />
                  Changer le mot de passe
                </Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="gradient-card border-border mt-6">
              <CardHeader>
                <CardTitle className="font-display">Authentification à deux facteurs</CardTitle>
                <CardDescription>Ajoutez une couche de sécurité supplémentaire à votre compte.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">2FA non activé</p>
                    <p className="text-sm text-muted-foreground">Protégez votre compte avec l'authentification à deux facteurs.</p>
                  </div>
                  <Button variant="outline">Activer</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
