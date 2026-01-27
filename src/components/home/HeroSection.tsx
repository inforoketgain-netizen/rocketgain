import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-200" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">+15 000 investisseurs nous font confiance</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up animation-delay-100">
            Propulsez vos{" "}
            <span className="text-gradient">investissements</span>{" "}
            vers de nouveaux sommets
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up animation-delay-200">
            Jusqu'à <span className="text-accent font-bold">25% de retour</span> sur vos investissements. 
            Simple, sécurisé et transparent.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up animation-delay-300">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="glass" size="xl" className="w-full sm:w-auto">
                Comment ça marche
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-up animation-delay-400">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card/50 border border-border">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Jusqu'à 25% de ROI</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card/50 border border-border">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">100% Sécurisé</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card/50 border border-border">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Retraits rapides</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
