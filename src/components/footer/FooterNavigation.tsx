import { Link } from "react-router-dom";

export const FooterNavigation = () => {
  return (
    <>
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
    </>
  );
};