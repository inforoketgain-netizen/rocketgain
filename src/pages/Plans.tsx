import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Star, Calculator, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useInvestmentPlans } from "@/hooks/useInvestmentPlans";

const Plans = () => {
  const { data: dbPlans, isLoading } = useInvestmentPlans();
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [investAmount, setInvestAmount] = useState(1000);

  const plans = dbPlans?.map((plan, index) => ({
    name: plan.name,
    description: index === 0 ? "Parfait pour découvrir la plateforme" : 
                 index === 1 ? "Le plus populaire parmi nos investisseurs" : 
                 index === 2 ? "Pour les investisseurs sérieux" : 
                 "Pour les investisseurs d'élite",
    minInvest: plan.min_amount,
    maxInvest: plan.max_amount,
    duration: `${plan.duration_days} jours`,
    returnRate: plan.daily_rate * plan.duration_days,
    dailyRate: plan.daily_rate,
    features: [
      `Dépôt minimum: $${plan.min_amount}`,
      "Retrait à tout moment",
      index >= 1 ? "Support prioritaire 24/7" : "Support par email",
      index >= 2 ? "Gestionnaire personnel" : "Pas de frais de retrait",
    ],
    popular: index === 1,
    color: index === 1 ? "border-primary" : index === 2 ? "border-accent" : "border-border",
  })) || [];

  useEffect(() => {
    if (plans.length > 0 && investAmount < plans[selectedPlan]?.minInvest) {
      setInvestAmount(plans[selectedPlan]?.minInvest || 100);
    }
  }, [selectedPlan, plans]);

  const calculateReturn = () => {
    if (!plans[selectedPlan]) return 0;
    const plan = plans[selectedPlan];
    return (investAmount * plan.returnRate) / 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up">
                Plans d'<span className="text-gradient">investissement</span>
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-up animation-delay-100">
                Choisissez le plan qui correspond le mieux à vos objectifs financiers
              </p>
            </div>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-6 lg:p-8 animate-fade-up cursor-pointer transition-all duration-300 ${
                    plan.popular
                      ? "gradient-card border-2 border-primary shadow-glow scale-105"
                      : selectedPlan === index
                      ? "bg-card border-2 border-primary/50"
                      : "bg-card border border-border hover:border-primary/30"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedPlan(index)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-xs font-bold text-primary-foreground flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Populaire
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-display font-bold text-primary">
                        {plan.returnRate.toFixed(0)}%
                      </span>
                      <span className="text-muted-foreground">de retour</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">
                      Durée: {plan.duration}
                    </p>
                  </div>

                  <div className="mb-6 p-4 rounded-xl bg-background/50 border border-border">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Min</span>
                      <span className="text-foreground font-medium">${plan.minInvest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max</span>
                      <span className="text-foreground font-medium">${plan.maxInvest.toLocaleString()}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth?mode=signup">
                    <Button
                      variant={plan.popular ? "hero" : "outline"}
                      className="w-full"
                    >
                      Choisir ce plan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        {plans.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-xl mx-auto">
                <div className="rounded-2xl bg-card border border-border p-8 animate-fade-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      Calculateur de gains
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Montant à investir
                      </label>
                      <input
                        type="range"
                        min={plans[selectedPlan]?.minInvest || 50}
                        max={plans[selectedPlan]?.maxInvest || 50000}
                        value={investAmount}
                        onChange={(e) => setInvestAmount(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-muted-foreground text-sm">
                          ${plans[selectedPlan]?.minInvest || 0}
                        </span>
                        <span className="text-primary font-bold text-lg">
                          ${investAmount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          ${(plans[selectedPlan]?.maxInvest || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="text-sm text-muted-foreground mb-1">Gains estimés</div>
                      <div className="font-display text-3xl font-bold text-primary">
                        +${calculateReturn().toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        après {plans[selectedPlan]?.duration} avec le plan {plans[selectedPlan]?.name}
                      </div>
                    </div>

                    <Link to="/auth?mode=signup">
                      <Button variant="hero" className="w-full" size="lg">
                        Commencer à investir
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Plans;
