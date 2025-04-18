import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { APP_NAME, Routes } from "@/lib/constants";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, refetchUser } = useContext(UserContext);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      refetchUser();
      window.location.href = Routes.HOME;
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Check if we're on the landing page
  const isLandingPage = location === Routes.HOME;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href={user ? Routes.DASHBOARD : Routes.HOME}>
            <h1 className="text-2xl font-bold font-sans text-primary flex items-center cursor-pointer">
              <i className="fas fa-map-marked-alt mr-2"></i>
              {APP_NAME.split("AI")[0]}
              <span className="text-[#EAB308]">AI</span>
            </h1>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        {isLandingPage ? (
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Features</a>
            <a href="#destinations" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Destinations</a>
            <a href="#travel-info" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Travel Info</a>
            <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Contact</a>
            
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={Routes.DASHBOARD}>
                  <Button variant="ghost" className="text-primary">Dashboard</Button>
                </Link>
                <Button variant="outline" className="text-gray-600 dark:text-gray-300" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link href={Routes.LOGIN}>
                <Button className="bg-primary text-white hover:bg-primary/90 btn-hover-effect">
                  <i className="fas fa-user mr-2"></i> Login
                </Button>
              </Link>
            )}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            
            {user && (
              <Button variant="outline" onClick={handleLogout} className="text-gray-600 dark:text-gray-300">
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </Button>
            )}
          </div>
        )}
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button 
            className="text-gray-600 dark:text-gray-300"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu (hidden by default) */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 absolute w-full z-50 transition-colors duration-300">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {isLandingPage ? (
              <>
                <a 
                  href="#features" 
                  className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#destinations" 
                  className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Destinations
                </a>
                <a 
                  href="#travel-info" 
                  className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Travel Info
                </a>
                <a 
                  href="#contact" 
                  className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
                {user ? (
                  <>
                    <Link 
                      href={Routes.DASHBOARD}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    href={Routes.LOGIN}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <i className="fas fa-user mr-2"></i> Login
                  </Link>
                )}
              </>
            ) : (
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
