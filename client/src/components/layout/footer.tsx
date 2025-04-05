import { Link } from "wouter";
import { APP_NAME, Routes } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold font-sans mb-4 flex items-center">
              <i className="fas fa-map-marked-alt mr-2"></i>
              {APP_NAME.split("AI")[0]}<span className="text-primary">AI</span>
            </h3>
            <p className="text-neutral-400 mb-4">
              Your AI-powered travel companion designed especially for Filipino travelers.
            </p>
            <div className="flex space-x-4">
              <a href="#facebook" className="text-neutral-400 hover:text-primary">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#instagram" className="text-neutral-400 hover:text-primary">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#twitter" className="text-neutral-400 hover:text-primary">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#youtube" className="text-neutral-400 hover:text-primary">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><a href="#about" className="hover:text-primary">About Us</a></li>
              <li><a href="#how-it-works" className="hover:text-primary">How It Works</a></li>
              <li><a href="#features" className="hover:text-primary">Features</a></li>
              <li><a href="#destinations" className="hover:text-primary">Destinations</a></li>
              <li><a href="#contact" className="hover:text-primary">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><Link href={Routes.VISA_HELP} className="hover:text-primary">Visa Information</Link></li>
              <li><a href="#travel-guides" className="hover:text-primary">Travel Guides</a></li>
              <li><a href="#travel-tips" className="hover:text-primary">Travel Tips</a></li>
              <li><a href="#blog" className="hover:text-primary">Blog</a></li>
              <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3"></i>
                <span>123 Bonifacio Global City, Taguig, Philippines</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3"></i>
                <span>hello@mapaai.ph</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-3"></i>
                <span>+63 2 8123 4567</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-neutral-700 my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-neutral-400 text-sm">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#terms" className="hover:text-primary">Terms of Service</a>
            <a href="#privacy" className="hover:text-primary">Privacy Policy</a>
            <a href="#cookies" className="hover:text-primary">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
