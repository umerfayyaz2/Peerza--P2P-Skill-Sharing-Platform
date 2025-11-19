import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link
              to="/about"
              className="text-gray-400 hover:text-indigo-600 transition"
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-indigo-600 transition"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-indigo-600 transition"
            >
              Terms
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-base leading-6 text-gray-400">
              &copy; 2025 Peerza Project. Built by Umer.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
