import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Transparent Navbar for Landing */}
      <nav className="w-full py-6 px-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-3xl font-bold text-indigo-600 tracking-tighter">
          Peerza<span className="text-yellow-500">.</span>
        </div>
        <div className="space-x-4">
          <Link
            to="/login"
            className="text-gray-600 font-medium hover:text-indigo-600 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text Content */}
          <div className="space-y-8">
            <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-2">
              🚀 The Future of Skill Exchange
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
              Master any skill by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                teaching yours.
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Peerza connects you with students and tutors at your university.
              Swap knowledge, not money.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className="bg-indigo-600 text-white text-center px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Join the Community
              </Link>
              <Link
                to="/login"
                className="bg-white text-indigo-600 border-2 border-indigo-100 text-center px-8 py-4 rounded-xl font-bold text-lg hover:border-indigo-200 hover:bg-indigo-50 transition"
              >
                Log In
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-4 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-red-400 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-white"></div>
              </div>
              <p>Joined by 500+ students today.</p>
            </div>
          </div>

          {/* Right Visual Content (Abstract Representation) */}
          <div className="relative hidden lg:block">
            <div className="absolute top-0 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    👨‍🏫
                  </div>
                  <div>
                    <div className="h-2.5 w-24 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                  Teaching Python
                </span>
              </div>
              <div className="space-y-3">
                <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                <div className="h-2 bg-gray-100 rounded-full w-5/6"></div>
                <div className="h-2 bg-gray-100 rounded-full w-4/6"></div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  10:00 AM • Video Call
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  Join Class
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
