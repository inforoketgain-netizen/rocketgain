import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight, Loader2 } from "lucide-react";
import { useInvestmentPlans } from "@/hooks/useInvestmentPlans";

const PlansPreview = forwardRef<HTMLElement>((_, ref) => {
  const { data: dbPlans, isLoading } = useInvestmentPlans();

  const plans = dbPlans?.slice(0, 3).map((plan, index) => ({
    name: plan.name,
    minInvest: plan.min_amount,
    maxInvest: plan.max_amount,
    duration: `${plan.duration_days} jours`,
    returnRate: plan.daily_rate * plan.duration_days,
    features: [
      `Dépôt minimum: $${plan.min_amount}`,
      index >= 1 ? "Bonus de fidélité" : "Retrait à tout moment",
      index >= 1 ? "Support prioritaire" : "Support 24/7",
    ],
    popular: index === 1,
  })) || [];

  if (isLoading) {
    return (
      <section ref={ref} className="py-24 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-up">
            Plans d'<span className="text-gradient">investissement</span>
          </h2>
          <p className="text-muted-foreground animate-fade-up animation-delay-100">
            Choisissez le plan qui correspond à vos objectifs financiers
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 lg:p-8 animate-fade-up ${
                plan.popular
                  ? "gradient-card border-2 border-primary shadow-glow"
                  : "bg-card border border-border"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-xs font-bold text-primary-foreground flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Populaire
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-display font-bold text-primary">
                    {plan.returnRate.toFixed(0)}%
                  </span>
                  <span className="text-muted-foreground text-sm">de retour</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">
                  Durée: {plan.duration}
                </p>
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

        {/* View All */}
        <div className="text-center mt-12 animate-fade-up animation-delay-400">
          <Link to="/plans">
            <Button variant="ghost" className="group">
              Voir tous les détails
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

PlansPreview.displayName = "PlansPreview";

export default PlansPreview;
