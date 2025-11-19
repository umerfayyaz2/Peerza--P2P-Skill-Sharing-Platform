import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    // 👇 CHANGE THE CLASS BELOW TO SWITCH THEMES 👇
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      {/* The main content area */}
      <main className="flex-grow pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
