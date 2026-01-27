import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fonction pour formater le numéro WhatsApp
  const formatWhatsAppNumber = (phoneNumber: string): string => {
    // Supprimer tous les caractères non numériques
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Si le numéro commence par "00", le supprimer
    let finalNumber = cleaned.startsWith('00') ? cleaned.substring(2) : cleaned;
    
    // Si le numéro commence par "+", le supprimer
    finalNumber = finalNumber.replace(/^\+/, '');
    
    return `https://wa.me/${finalNumber}`;
  };

  // Votre numéro WhatsApp formaté correctement
  const whatsappNumber = "447918594512"; // +44 7918 594512 sans espaces ni +
  const whatsappUrl = formatWhatsAppNumber(whatsappNumber);
  const displayNumber = "+44 7918 594512"; // Format d'affichage

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi du message");
      }

      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue";

      toast({
        title: "Échec de l'envoi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up">
                Contactez-<span className="text-gradient">nous</span>
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-up animation-delay-100">
                Notre équipe est disponible 24/7 pour répondre à vos questions
              </p>
            </div>
          </div>
        </section>

        {/* Contact Cards & Form */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Cards */}
                <div className="space-y-4">
                  <a
                    href="mailto:contact@rocketgain.io"
                    className="block p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors animate-fade-up"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                      <Mail className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2">Email</h3>
                    <p className="text-muted-foreground text-sm">contact@rocketgain.io</p>
                  </a>

                  {/* WhatsApp Card - corrigée */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors animate-fade-up animation-delay-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2">WhatsApp</h3>
                    <p className="text-muted-foreground text-sm">{displayNumber}</p>
                  </a>

                  <div className="p-6 rounded-2xl bg-card border border-border animate-fade-up animation-delay-200">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2">Bureau</h3>
                    <p className="text-muted-foreground text-sm">
                      30 N Gould St<br />
                      Sheridan, USA
                    </p>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <form
                    onSubmit={handleSubmit}
                    className="p-8 rounded-2xl bg-card border border-border animate-fade-up animation-delay-100"
                  >
                    <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                      Envoyez-nous un message
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Nom complet
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Sujet
                      </label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Comment puis-je vous aider ?"
                        required
                        className="bg-background"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Message
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Décrivez votre question ou préoccupation..."
                        rows={5}
                        required
                        className="bg-background resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                      {!isSubmitting && <Send className="w-4 h-4" />}
                    </Button>

                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;