import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wallet, TrendingUp, CreditCard, ArrowRight, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    number: "01",
    title: "Créez votre compte",
    description: "Inscrivez-vous gratuitement en quelques secondes. Aucune vérification complexe n'est requise.",
  },
  {
    icon: CreditCard,
    number: "02",
    title: "Faites un dépôt",
    description: "Choisissez votre méthode de paiement préférée: Bitcoin, PayPal, ou virement bancaire.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Investissez",
    description: "Sélectionnez un plan d'investissement adapté à vos objectifs et laissez votre argent travailler.",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Retirez vos gains",
    description: "Récupérez vos gains à tout moment. Les retraits sont traités en moins de 24 heures.",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up">
                Comment ça <span className="text-gradient">marche</span> ?
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-up animation-delay-100">
                En 4 étapes simples, commencez à faire fructifier votre capital avec RocketGain
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className="relative flex gap-6 md:gap-8 animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Line connector */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-7 top-20 w-0.5 h-16 bg-border" />
                    )}
                    
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                        <step.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="text-sm font-bold text-primary mb-2">{step.number}</div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12 animate-fade-up">
                Pourquoi choisir <span className="text-gradient">RocketGain</span> ?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Retours garantis sur tous les plans",
                  "Retraits rapides en moins de 24h",
                  "Support client disponible 24/7",
                  "Plateforme 100% sécurisée",
                  "Aucun frais caché",
                  "Bonus de parrainage généreux",
                ].map((benefit, index) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6 animate-fade-up">
              Prêt à commencer ?
            </h2>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="animate-fade-up animation-delay-100">
                Créer mon compte
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
