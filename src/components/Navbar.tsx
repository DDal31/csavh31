import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/config/supabase";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const logoUrl = `${SUPABASE_URL}/storage/v1/object/public/club-assets/club-logo.png`;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <img 
                src={logoUrl}
                alt="Logo CSAVH31 Toulouse" 
                className="h-10 w-auto object-contain"
                onError={(e) => console.error('Erreur de chargement du logo:', e)}
              />
              <span className="text-xl font-bold text-white">CSAVH31 Toulouse</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Accueil
            </Link>
            <Link to="/presentation" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Présentation
            </Link>
            <Link to="/actualites" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Actualités
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Contact
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;