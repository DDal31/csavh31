import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";
import { SUPABASE_URL } from "@/config/supabase";

const Footer = () => {
  const logoUrl = `${SUPABASE_URL}/storage/v1/object/public/club-assets/club-logo.png`;

  return (
    <footer className="bg-gray-800 text-gray-300 border-t border-gray-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl}
                alt="Logo CSAVH31 Toulouse" 
                className="h-12 w-auto object-contain"
                onError={(e) => console.error('Erreur de chargement du logo:', e)}
              />
              <h3 className="text-xl font-bold text-white">CSAVH31 Toulouse</h3>
            </div>
            <p className="text-sm">
              Association dédiée au sport et au bien-être pour les personnes déficientes visuelles.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/presentation" className="hover:text-white transition-colors">Présentation</Link></li>
              <li><Link to="/actualites" className="hover:text-white transition-colors">Actualités</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Informations</h4>
            <ul className="space-y-2">
              <li><Link to="/presentation" className="hover:text-white transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} CSAVH31 Toulouse. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;