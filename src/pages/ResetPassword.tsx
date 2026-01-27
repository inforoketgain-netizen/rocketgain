import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rocket, Lock, ArrowRight, Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Password validation rules
const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password),
  };
};

const isPasswordValid = (password: string) => {
  const validation = validatePassword(password);
  return Object.values(validation).every(Boolean);
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const passwordValidation = useMemo(() => validatePassword(formData.password), [formData.password]);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        // Listen for auth state changes (recovery link will trigger this)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === "PASSWORD_RECOVERY" && session) {
              setIsValidSession(true);
            }
          }
        );

        // Cleanup subscription
        return () => subscription.unsubscribe();
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid(formData.password)) {
      toast({
        title: "Erreur",
        description: "Le mot de passe ne respecte pas tous les critères de sécurité.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Mot de passe modifié !",
          description: "Votre mot de passe a été réinitialisé avec succès.",
        });
        navigate("/dashboard");
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

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Rocket className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">
              Rocket<span className="text-primary">Gain</span>
            </span>
          </Link>

          <div className="rounded-2xl bg-card border border-border p-8 shadow-elevated animate-scale-in text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Lien invalide ou expiré
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Ce lien de réinitialisation n'est plus valide. Veuillez demander un nouveau lien.
            </p>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => navigate("/auth")}
            >
              Retour à la connexion
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Reset Password Card */}
        <div className="rounded-2xl bg-card border border-border p-8 shadow-elevated animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Nouveau mot de passe
            </h1>
            <p className="text-muted-foreground text-sm">
              Choisissez un nouveau mot de passe sécurisé
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nouveau mot de passe
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
              {formData.password && (
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

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Modification en cours..." : "Modifier le mot de passe"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
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

export default ResetPassword;
