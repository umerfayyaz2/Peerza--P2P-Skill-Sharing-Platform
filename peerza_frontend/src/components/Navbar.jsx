import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
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
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-500 hover:text-indigo-600 font-medium transition duration-150 ease-in-out"
            >
              Dashboard
            </Link>

            <Link
              to="/settings"
              className="text-gray-500 hover:text-indigo-600 font-medium transition duration-150 ease-in-out"
            >
              Settings
            </Link>

            {/* Logout Button */}
            <Link
              to="/logout"
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition"
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
