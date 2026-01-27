import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Politique de <span className="text-gradient">confidentialité</span>
            </h1>
            
            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Collecte des informations</h2>
                <p className="text-muted-foreground">
                  Nous collectons les informations que vous nous fournissez directement, notamment lors de la création 
                  de votre compte : nom, adresse email et autres informations de profil.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Utilisation des informations</h2>
                <p className="text-muted-foreground">
                  Nous utilisons vos informations pour :
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Fournir et maintenir nos services</li>
                  <li>Traiter vos transactions</li>
                  <li>Vous envoyer des notifications importantes</li>
                  <li>Améliorer notre plateforme</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Protection des données</h2>
                <p className="text-muted-foreground">
                  Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles 
                  contre tout accès non autorisé, modification, divulgation ou destruction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Partage des informations</h2>
                <p className="text-muted-foreground">
                  Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. 
                  Nous pouvons partager des informations avec des prestataires de services de confiance qui nous 
                  aident à exploiter notre plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Cookies</h2>
                <p className="text-muted-foreground">
                  Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez configurer 
                  votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Vos droits</h2>
                <p className="text-muted-foreground">
                  Vous avez le droit d'accéder, de corriger ou de supprimer vos données personnelles. 
                  Contactez-nous pour exercer ces droits.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant cette politique de confidentialité, contactez-nous à{" "}
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

export default Privacy;
