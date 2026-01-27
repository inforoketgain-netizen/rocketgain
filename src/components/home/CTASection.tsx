import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

const CTASection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-8 animate-float shadow-glow">
            <Rocket className="w-10 h-10 text-primary-foreground" />
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up">
            Prêt à faire décoller vos{" "}
            <span className="text-gradient">gains</span> ?
          </h2>

          <p className="text-lg text-muted-foreground mb-8 animate-fade-up animation-delay-100">
            Rejoignez plus de 15 000 investisseurs qui font confiance à RocketGain 
            pour faire fructifier leur capital.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-200">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl">
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6 animate-fade-up animation-delay-300">
            Inscription gratuite • Aucune carte bancaire requise
          </p>
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;
