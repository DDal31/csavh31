
import { Link } from "react-router-dom";

interface NavLinksProps {
  isAuthenticated: boolean;
}

export const NavLinks = ({ isAuthenticated }: NavLinksProps) => {
  return (
    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
      {isAuthenticated ? (
        <></>
      ) : (
        <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
          Connexion
        </Link>
      )}
    </div>
  );
};
