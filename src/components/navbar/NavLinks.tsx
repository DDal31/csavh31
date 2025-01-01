import { Link } from "react-router-dom";

interface NavLinksProps {
  isAuthenticated: boolean;
}

export const NavLinks = ({ isAuthenticated }: NavLinksProps) => {
  return (
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
  );
};