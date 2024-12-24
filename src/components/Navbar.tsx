import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-white">Club Sportif AVH</span>
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;