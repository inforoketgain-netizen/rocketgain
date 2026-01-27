import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rocket, Mail, Lock, User, ArrowRight, Check, X, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { validatePassword, isPasswordValid } from "@/lib/password-validation";

type AuthMode = "login" | "signup" | "forgot-password";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [resetEmail, setResetEmail] = useState("");

  const passwordValidation = useMemo(() => validatePassword(formData.password), [formData.password]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation du nom (signup uniquement)
if (mode === "signup") {
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;

  if (!nameRegex.test(formData.name.trim())) {
    toast({
      title: "Erreur",
      description: "Entre ton vrai nom et prénom (ex: Jean Dupont).",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }

  const forbiddenNames = ["admin", "test", "user", "demo", "fake"];

  if (forbiddenNames.includes(formData.name.toLowerCase())) {
    toast({
      title: "Erreur",
      description: "Nom non autorisé.",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }
}


    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (mode === "signup" && !isPasswordValid(formData.password)) {
      toast({
        title: "Erreur",
        description: "Le mot de passe ne respecte pas tous les critères de sécurité.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Erreur",
              description: "Cet email est déjà utilisé. Essayez de vous connecter.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erreur",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
  toast({
    title: "Compte créé",
    description: "Un email de confirmation t’a été envoyé. Confirme avant de te connecter.",
  });
  setMode("login");
}

      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Erreur",
              description: "Email ou mot de passe incorrect.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erreur",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
  const { data } = await supabase.auth.getUser();

  if (!data.user?.email_confirmed_at) {
    toast({
      title: "Email non confirmé",
      description: "Vérifie ta boîte mail avant de te connecter.",
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Connexion réussie !",
    description: "Redirection vers votre tableau de bord...",
  });
  navigate("/dashboard");
}

      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email envoyé !",
          description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.",
        });
        setMode("login");
        setResetEmail("");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const getTitle = () => {
    switch (mode) {
      case "signup":
        return "Créer un compte";
      case "forgot-password":
        return "Mot de passe oublié";
      default:
        return "Connexion";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "signup":
        return "Rejoignez des milliers d'investisseurs";
      case "forgot-password":
        return "Entrez votre email pour recevoir un lien de réinitialisation";
      default:
        return "Accédez à votre tableau de bord";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Rocket className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Rocket<span className="text-primary">Gain</span>
          </span>
        </Link>

        {/* Auth Card */}
        <div className="rounded-2xl bg-card border border-border p-8 shadow-elevated animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {getTitle()}
            </h1>
            <p className="text-muted-foreground text-sm">
              {getSubtitle()}
            </p>
          </div>

          {mode === "forgot-password" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="pl-10 bg-background"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-foreground text-sm transition-colors mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="pl-10 pr-10 bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {mode === "signup" && formData.password && (
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

                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="pl-10 pr-10 bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgot-password")}
                      className="text-sm text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Chargement..."
                    : mode === "signup"
                    ? "Créer mon compte"
                    : "Se connecter"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {mode === "signup" ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    {mode === "signup" ? "Se connecter" : "S'inscrire"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

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

export default Auth;
