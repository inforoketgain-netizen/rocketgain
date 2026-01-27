import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";

const faqs = [
  {
    category: "Dépôts",
    questions: [
      {
        question: "Quel est le montant minimum pour investir ?",
        answer: "Le montant minimum d'investissement dépend du plan choisi. Le plan Starter commence à $50, le plan Growth à $500 et le plan Premium à $5,000.",
      },
      {
        question: "Quels modes de paiement acceptez-vous ?",
        answer: "Nous acceptons Bitcoin, PayPal, et les virements bancaires. Les dépôts en crypto sont crédités instantanément, tandis que les virements peuvent prendre 1-3 jours ouvrables.",
      },
      {
        question: "Y a-t-il des frais de dépôt ?",
        answer: "Non, RocketGain ne facture aucun frais de dépôt. Cependant, certains processeurs de paiement peuvent appliquer leurs propres frais.",
      },
    ],
  },
  {
    category: "Retraits",
    questions: [
      {
        question: "Comment puis-je retirer mes gains ?",
        answer: "Vous pouvez retirer vos gains depuis votre tableau de bord en choisissant votre méthode de retrait préférée. Les demandes sont traitées dans les 24 heures.",
      },
      {
        question: "Quel est le montant minimum de retrait ?",
        answer: "Le montant minimum de retrait est de $20. Il n'y a pas de limite maximale de retrait.",
      },
      {
        question: "Y a-t-il des frais de retrait ?",
        answer: "Les retraits sont gratuits pour les plans Growth et Premium. Le plan Starter a des frais de 1% sur les retraits.",
      },
    ],
  },
  {
    category: "Délais",
    questions: [
      {
        question: "Combien de temps faut-il pour voir des gains ?",
        answer: "Les gains sont calculés quotidiennement et visibles dans votre tableau de bord. Selon votre plan, la période d'investissement varie de 7 à 30 jours.",
      },
      {
        question: "Puis-je retirer avant la fin de la période d'investissement ?",
        answer: "Oui, vous pouvez retirer à tout moment. Cependant, un retrait anticipé peut réduire vos gains proportionnellement au temps investi.",
      },
    ],
  },
  {
    category: "Sécurité",
    questions: [
      {
        question: "Comment protégez-vous mon argent ?",
        answer: "Nous utilisons un chiffrement SSL de bout en bout, une authentification à deux facteurs, et nos fonds sont stockés dans des portefeuilles sécurisés et assurés.",
      },
      {
        question: "RocketGain est-elle une plateforme légale ?",
        answer: "Oui, RocketGain opère en conformité avec les réglementations financières internationales et est enregistrée dans plusieurs juridictions.",
      },
      {
        question: "Quels sont les risques ?",
        answer: "Comme tout investissement, il existe des risques. Cependant, nous minimisons ces risques grâce à une gestion professionnelle et des stratégies diversifiées. N'investissez que ce que vous pouvez vous permettre.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6 animate-fade-up">
                <HelpCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up animation-delay-100">
                Questions <span className="text-gradient">fréquentes</span>
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-up animation-delay-200">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-12">
              {faqs.map((section, sectionIndex) => (
                <div
                  key={section.category}
                  className="animate-fade-up"
                  style={{ animationDelay: `${sectionIndex * 100}ms` }}
                >
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    {section.category}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-3">
                    {section.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${section.category}-${index}`}
                        className="rounded-xl border border-border bg-card px-6"
                      >
                        <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center rounded-2xl bg-card border border-border p-8 animate-fade-up">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Vous n'avez pas trouvé votre réponse ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Notre équipe de support est disponible 24/7 pour vous aider
              </p>
              <Link to="/contact">
                <Button variant="hero" size="lg">
                  Contactez-nous
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
