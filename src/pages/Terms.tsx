import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Conditions d'<span className="text-gradient">utilisation</span>
            </h1>
            
            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptation des conditions</h2>
                <p className="text-muted-foreground">
                  En accédant et en utilisant RocketGain, vous acceptez d'être lié par ces conditions d'utilisation. 
                  Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Description du service</h2>
                <p className="text-muted-foreground">
                  RocketGain est une plateforme d'investissement qui permet aux utilisateurs de placer des fonds 
                  et de recevoir des retours sur investissement selon les plans choisis.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Éligibilité</h2>
                <p className="text-muted-foreground">
                  Vous devez avoir au moins 18 ans pour utiliser nos services. En vous inscrivant, 
                  vous confirmez que vous répondez à cette exigence d'âge.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Compte utilisateur</h2>
                <p className="text-muted-foreground">
                  Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe. 
                  Vous acceptez d'être responsable de toutes les activités qui se produisent sous votre compte.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Risques d'investissement</h2>
                <p className="text-muted-foreground">
                  Tout investissement comporte des risques. Les performances passées ne garantissent pas les résultats futurs. 
                  Investissez uniquement ce que vous pouvez vous permettre de perdre.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Modifications des conditions</h2>
                <p className="text-muted-foreground">
                  Nous nous réservons le droit de modifier ces conditions à tout moment. 
                  Les modifications prendront effet dès leur publication sur cette page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant ces conditions, veuillez nous contacter à{" "}
                  <a href="mailto:contact@rocketgain.io" className="text-primary hover:underline">
                    contact@rocketgain.io
                  </a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
