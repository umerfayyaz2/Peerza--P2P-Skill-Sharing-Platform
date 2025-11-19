import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* The Navbar stays fixed at top */}
      <Navbar />

      {/* This 'main' area pushes content down so it's not hidden behind the fixed Navbar */}
      <main className="flex-grow pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
