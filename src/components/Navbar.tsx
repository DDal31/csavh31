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
              <span className="text-xl font-bold text-white">The Journal</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Home
            </Link>
            <Link to="/design" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Design
            </Link>
            <Link to="/research" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Research
            </Link>
            <Link to="/interviews" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Interviews
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;