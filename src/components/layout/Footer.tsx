import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Rocket, Mail, MessageCircle } from "lucide-react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  // Fonction pour formater le numéro WhatsApp
  const formatWhatsAppNumber = (phoneNumber) => {
    // Supprimer tous les caractères non numériques
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Si le numéro commence par "00", le supprimer
    let finalNumber = cleaned.startsWith('00') ? cleaned.substring(2) : cleaned;
    
    // Si le numéro commence par "+", le supprimer
    finalNumber = finalNumber.replace(/^\+/, '');
    
    // Si le numéro commence par "0", le garder tel quel (pour UK +44)
    // Note: +44 remplace le 0 initial au Royaume-Uni
    
    return `https://wa.me/${finalNumber}`;
  };

  // Votre numéro WhatsApp (sans espaces, avec indicatif pays)
  const whatsappNumber = "447918594512"; // +44 7918 594512 sans espaces ni +
  const whatsappUrl = formatWhatsAppNumber(whatsappNumber);
  
  // Format d'affichage pour l'utilisateur
  const displayNumber = "+44 7918 594512";

  return (
    <footer ref={ref} className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Rocket<span className="text-primary">Gain</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              La plateforme d'investissement qui propulse vos gains vers de nouveaux sommets.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/plans" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Plans d'investissement
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@rocketgain.io"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  contact@rocketgain.io
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  {displayNumber}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2023-{new Date().getFullYear()} RocketGain. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;