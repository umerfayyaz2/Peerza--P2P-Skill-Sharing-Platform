import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    // Added 'shadow-md' for better separation from the page content
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600 tracking-tighter">
                Peerza<span className="text-yellow-500">.</span>
              </span>
            </Link>
          </div>

          {/* Right Side Links */}
          <div className="flex items-center space-x-4">
            {/* Dashboard Link with Active Gradient Effect */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                isActive("/")
                  ? "bg-indigo-50 text-indigo-700 shadow-inner" // Active Style
                  : "text-gray-500 hover:text-indigo-600 hover:bg-gray-50" // Inactive Style
              }`}
            >
              Dashboard
            </Link>

            {/* Settings Link with Active Gradient Effect */}
            <Link
              to="/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                isActive("/settings")
                  ? "bg-indigo-50 text-indigo-700 shadow-inner"
                  : "text-gray-500 hover:text-indigo-600 hover:bg-gray-50"
              }`}
            >
              Settings
            </Link>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {/* Red Logout Button */}
            <Link
              to="/logout"
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
